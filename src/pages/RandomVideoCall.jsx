import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const RandomVideoCall = () => {
  const [callState, setCallState] = useState('idle'); // idle, searching, ringing, connected, ended
  const [partner, setPartner] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null); // { from, fromName, fromPhoto, offer }
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showDisconnectedModal, setShowDisconnectedModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [lastPartnerId, setLastPartnerId] = useState(null); // Track last partner to avoid immediate rematch
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamRef = useRef(null); // Keep ref to current stream
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Fetch online users count
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const data = await api.get('/video/online-users');
        setOnlineCount(data.length);
      } catch (error) {
        console.error('Failed to fetch online users:', error);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  // Update local video when stream changes
  useEffect(() => {
    if (stream && localVideoRef.current) {
      console.log('📹 Updating local video ref with stream');
      console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      localVideoRef.current.srcObject = stream;
      
      // Force video to play
      localVideoRef.current.play().catch(err => {
        console.error('Error playing local video:', err);
      });
    }
  }, [stream]);
  
  // Also update when callState changes to connected
  useEffect(() => {
    if (callState === 'connected' && streamRef.current && localVideoRef.current) {
      console.log('📹 Call connected - ensuring local video is set');
      localVideoRef.current.srcObject = streamRef.current;
      localVideoRef.current.play().catch(err => {
        console.error('Error playing local video:', err);
      });
    }
  }, [callState]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallRejected = () => {
      console.log('📵 Call was rejected by the other user');
      setShowRejectedModal(true);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setCallState('idle');
      setPartner(null);
      setStream(null);
      
      // Auto-hide modal after 3 seconds
      setTimeout(() => {
        setShowRejectedModal(false);
      }, 3000);
    };

    const handleOffer = async (data) => {
      console.log('📞 INCOMING CALL RECEIVED!');
      console.log('From:', data.fromName, '(ID:', data.from, ')');
      console.log('Current call state:', callState);
      
      // Reject if already in a call or searching
      if (callState !== 'idle') {
        console.log('⚠️ Already in a call, auto-rejecting');
        socket.emit('call_rejected', { to: data.from });
        return;
      }
      
      console.log('Offer type:', data.offer?.type);
      console.log('Offer SDP length:', data.offer?.sdp?.length);
      
      try {
        setIncomingCall({
          from: data.from,
          fromName: data.fromName,
          fromPhoto: data.fromPhoto,
          offer: data.offer
        });
        setCallState('ringing');
        console.log('✅ Call state set to RINGING');
        console.log('🔔 Incoming call modal should now be visible');
      } catch (error) {
        console.error('❌ Error handling call offer:', error);
      }
    };

    const handleAnswer = (data) => {
      console.log('🎉 Received answer from receiver!');
      console.log('Answer data:', data);
      if (peerConnectionRef.current) {
        console.log('Setting remote description on caller side...');
        peerConnectionRef.current.setRemoteDescription(data.answer)
          .then(() => {
            console.log('✅ Answer set successfully on caller side');
          })
          .catch(error => {
            console.error('❌ Error setting answer:', error);
          });
        
        // Move to connected immediately (non-blocking)
        console.log('Moving caller to connected state...');
        setCallState('connected');
        console.log('✅ Caller is now in connected state!');
        
        // Ensure local video is still showing for caller
        console.log('🎥 Setting caller local video in small box...');
        if (localVideoRef.current && streamRef.current) {
          console.log('Local video ref exists:', !!localVideoRef.current);
          console.log('Stream ref exists:', !!streamRef.current);
          console.log('Stream tracks:', streamRef.current.getTracks().map(t => `${t.kind}: ${t.enabled}`));
          
          localVideoRef.current.srcObject = streamRef.current;
          
          // Force play
          localVideoRef.current.play()
            .then(() => {
              console.log('✅ Caller local video playing successfully');
            })
            .catch(err => {
              console.error('❌ Error playing caller local video:', err);
            });
        } else {
          console.error('❌ Local video ref or stream missing for caller!', {
            hasRef: !!localVideoRef.current,
            hasStream: !!streamRef.current
          });
        }
      } else {
        console.error('❌ No peer connection ref!');
      }
    };

    const handleIce = async (data) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handleEnded = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setCallState('ended');
      setPartner(null);
      setStream(null);
    };

    console.log('🔌 Setting up socket listeners...');
    console.log('Socket available:', !!socket);
    
    socket.on('video_call_offer', handleOffer);
    socket.on('video_call_answer', handleAnswer);
    socket.on('ice_candidate', handleIce);
    socket.on('call_ended', handleEnded);
    socket.on('call_rejected', handleCallRejected);

    console.log('✅ Socket listeners registered');

    return () => {
      console.log('🔌 Cleaning up socket listeners...');
      socket.off('video_call_offer', handleOffer);
      socket.off('video_call_answer', handleAnswer);
      socket.off('ice_candidate', handleIce);
      socket.off('call_ended', handleEnded);
      socket.off('call_rejected', handleCallRejected);
    };
  }, [socket]);

  const checkPermissions = async () => {
    try {
      // Check if permissions API is supported
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
        
        return {
          camera: cameraPermission.state,
          microphone: microphonePermission.state
        };
      }
      return null;
    } catch (error) {
      console.log('Permissions API not supported or error:', error);
      return null;
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('🔐 Requesting camera and microphone permissions...');
      setPermissionError('Please allow camera and microphone access when prompted by your browser.');
      setShowPermissionModal(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream immediately - we just wanted to get permission
      mediaStream.getTracks().forEach(track => track.stop());
      
      setShowPermissionModal(false);
      console.log('✅ Permissions granted successfully');
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      
      let errorMessage = 'Failed to get camera/microphone permissions. ';
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage += 'Please click "Allow" when your browser asks for camera and microphone access.';
          break;
        case 'NotFoundError':
          errorMessage += 'No camera or microphone found on your device.';
          break;
        default:
          errorMessage += 'Please check your camera and microphone are working.';
      }
      
      setPermissionError(errorMessage);
      setShowPermissionModal(true);
      return false;
    }
  };

  const startLocalStream = async () => {
    try {
      // First check current permissions
      const permissions = await checkPermissions();
      console.log('📋 Current permissions:', permissions);

      // Show user-friendly message before requesting access
      if (permissions && (permissions.camera === 'denied' || permissions.microphone === 'denied')) {
        setPermissionError('Camera or microphone access was previously denied. Please click the camera icon in your browser\'s address bar to allow access, then try again.');
        setShowPermissionModal(true);
        return null;
      }

      console.log('📹 Requesting camera and microphone access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('✅ Media access granted successfully');
      setStream(mediaStream);
      streamRef.current = mediaStream; // Keep ref for closures
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Handle different types of errors with specific messages
      let errorMessage = 'Failed to access camera/microphone. ';
      
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage += 'Please allow camera and microphone access when prompted, or click the camera icon in your browser\'s address bar to grant permissions.';
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMessage += 'No camera or microphone found. Please connect a camera and microphone and try again.';
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          errorMessage += 'Camera or microphone is already in use by another application. Please close other apps using your camera/microphone and try again.';
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          errorMessage += 'Camera settings not supported. Trying with basic settings...';
          // Try again with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            console.log('✅ Media access granted with basic settings');
            setStream(basicStream);
            streamRef.current = basicStream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = basicStream;
            }
            return basicStream;
          } catch (basicError) {
            console.error('Basic media access also failed:', basicError);
            errorMessage = 'Failed to access camera/microphone even with basic settings. Please check your device permissions.';
          }
          break;
        case 'SecurityError':
          errorMessage += 'Access denied due to security restrictions. Please ensure you\'re using HTTPS and try again.';
          break;
        default:
          errorMessage += 'Unknown error occurred. Please check your camera and microphone are working and try again.';
      }
      
      setPermissionError(errorMessage);
      setShowPermissionModal(true);
      return null;
    }
  };

  const handleStartCall = async () => {
    if (!socket) {
      alert('Connection not established. Please refresh the page.');
      return;
    }

    // Check permissions first
    const permissions = await checkPermissions();
    if (permissions && (permissions.camera === 'denied' || permissions.microphone === 'denied')) {
      setPermissionError('Camera or microphone access is required for video calls. Please grant permissions to continue.');
      setShowPermissionModal(true);
      return;
    }

    setCallState('searching');

    // Start local stream
    const mediaStream = await startLocalStream();
    if (!mediaStream) {
      setCallState('idle');
      return;
    }
    
    // Ensure local video is displayed for caller
    console.log('📹 Setting caller local video...');
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
      console.log('✅ Caller local video set');
    } else {
      console.error('❌ Local video ref is null for caller!');
    }

    try {
      // Get online users
      const data = await api.get('/video/online-users');
      let availableUsers = data;
      
      console.log('📊 Available users:', availableUsers.length);
      console.log('🔄 Last partner ID:', lastPartnerId);
      
      // Filter out the last partner to avoid immediate rematch (if there are other users)
      if (lastPartnerId && availableUsers.length > 1) {
        availableUsers = availableUsers.filter(u => u.id !== lastPartnerId);
        console.log('✅ Filtered out last partner, remaining:', availableUsers.length);
      }
      
      if (availableUsers.length === 0) {
        alert('No users online right now. Please try again later.');
        setCallState('idle');
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        return;
      }

      // Pick random user
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      console.log('🎲 Randomly selected user:', randomUser.full_name, '(ID:', randomUser.id, ')');
      
      setPartner(randomUser);
      setLastPartnerId(randomUser.id); // Remember this partner
      
      // Send call offer without creating peer connection yet
      // Wait for receiver to accept first
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Monitor connection state for disconnections
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed' ||
            peerConnection.iceConnectionState === 'closed') {
          console.log('⚠️ Partner disconnected!');
          handlePartnerDisconnect();
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'failed' ||
            peerConnection.connectionState === 'closed') {
          console.log('⚠️ Partner disconnected!');
          handlePartnerDisconnect();
        }
      };

      // Add local stream tracks
      mediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, mediaStream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', {
            candidate: event.candidate,
            to: randomUser.id
          });
        }
      };

      // Create and send offer
      console.log('📞 Creating call offer...');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('✅ Offer created and set as local description');
      
      console.log('📤 Sending offer to receiver...');
      console.log('Receiver ID:', randomUser.id);
      console.log('Caller ID:', user.id);
      console.log('Socket connected:', socket.connected);
      
      socket.emit('video_call_offer', {
        offer,
        to: randomUser.id,
        from: user.id,
        fromName: user.full_name,
        fromPhoto: user.profile_photo
      });

      console.log('✅ Offer sent! Waiting for receiver to accept...');
      console.log('⏳ Caller is in SEARCHING state, waiting for answer...');
    } catch (error) {
      console.error('Error finding partner:', error);
      alert('Failed to find a partner. Please try again.');
      setCallState('idle');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const acceptCall = async () => {
    console.log('🟢 ACCEPT BUTTON CLICKED');
    console.log('Incoming call from:', incomingCall?.from);
    console.log('Socket available:', !!socket);
    
    if (!incomingCall) {
      console.error('❌ No incoming call to accept');
      return;
    }

    if (!socket) {
      console.error('❌ No socket connection');
      alert('No socket connection');
      return;
    }

    // Prevent double-click
    if (callState !== 'ringing') {
      console.log('⚠️ Already processing call acceptance');
      return;
    }

    try {
      console.log('Setting partner info...');
      setPartner({
        id: incomingCall.from,
        full_name: incomingCall.fromName,
        profile_photo: incomingCall.fromPhoto
      });
      setLastPartnerId(incomingCall.from); // Remember this partner to avoid immediate rematch

      console.log('🎥 Starting local media stream...');
      const mediaStream = await startLocalStream();
      if (!mediaStream) {
        console.error('❌ Failed to get media stream');
        rejectCall();
        return;
      }
      console.log('✅ Local stream obtained');
      console.log('Local stream tracks:', mediaStream.getTracks().map(t => t.kind));
      
      // Ensure local video is displayed
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        console.log('✅ Local video ref updated with stream');
      } else {
        console.error('❌ Local video ref is null!');
      }

      console.log('🔗 Creating peer connection...');
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;
      console.log('✅ Peer connection created');

      // Monitor connection state for disconnections
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed' ||
            peerConnection.iceConnectionState === 'closed') {
          console.log('⚠️ Partner disconnected!');
          handlePartnerDisconnect();
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'failed' ||
            peerConnection.connectionState === 'closed') {
          console.log('⚠️ Partner disconnected!');
          handlePartnerDisconnect();
        }
      };

      console.log('📤 Adding local tracks...');
      mediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, mediaStream);
        console.log('Added track:', track.kind);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📥 Received remote track:', event.track.kind);
        console.log('Remote stream tracks:', event.streams[0].getTracks().map(t => t.kind));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          console.log('✅ Remote video stream set to video element');
          console.log('Remote video ref srcObject:', remoteVideoRef.current.srcObject);
        } else {
          console.error('❌ Remote video ref is null!');
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to caller');
          socket.emit('ice_candidate', {
            candidate: event.candidate,
            to: incomingCall.from
          });
        }
      };

      // Save the offer and caller ID before clearing incomingCall
      const offer = incomingCall.offer;
      const callerId = incomingCall.from;

      // Move to connected state FIRST (instant UI)
      console.log('🎬 Moving to connected state...');
      setCallState('connected');
      setIncomingCall(null);
      console.log('✅ UI updated to connected state');

      // Handle WebRTC negotiation in background (non-blocking)
      console.log('🔄 Starting WebRTC negotiation in background...');
      console.log('Peer connection state:', peerConnection.signalingState);
      console.log('Peer connection ICE state:', peerConnection.iceConnectionState);
      
      // Add a timeout
      const negotiationTimeout = setTimeout(() => {
        console.error('⏰ WebRTC negotiation timeout after 5 seconds!');
        console.error('Peer connection state:', peerConnection.signalingState);
        console.error('This might be a browser/network issue');
      }, 5000);
      
      peerConnection.setRemoteDescription(offer)
        .then(() => {
          console.log('✅ Remote description set');
          console.log('New signaling state:', peerConnection.signalingState);
          return peerConnection.createAnswer();
        })
        .then(answer => {
          console.log('✅ Answer created:', answer.type);
          return peerConnection.setLocalDescription(answer).then(() => answer);
        })
        .then(answer => {
          clearTimeout(negotiationTimeout);
          console.log('✅ Local description set');
          console.log('Step 4: Sending answer to caller...');
          console.log('Sending to user ID:', callerId);
          console.log('Answer SDP length:', answer.sdp?.length);
          console.log('Socket connected:', socket.connected);
          
          socket.emit('video_call_answer', {
            answer: answer,
            to: callerId
          });
          
          console.log('✅✅✅ ANSWER SENT SUCCESSFULLY!');
        })
        .catch(err => {
          clearTimeout(negotiationTimeout);
          console.error('❌ WebRTC negotiation error:', err);
          console.error('Error name:', err.name);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        });

    } catch (error) {
      console.error('❌ Error in acceptCall:', error);
      alert('Failed to accept call: ' + error.message);
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('call_rejected', { to: incomingCall.from });
    }
    setIncomingCall(null);
    setCallState('idle');
  };

  const handlePartnerDisconnect = () => {
    console.log('🚪 Partner disconnected or left the call');
    
    // Clean up
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setCallState('idle');
    setPartner(null);
    setStream(null);
    streamRef.current = null;
    
    // Show disconnected modal
    setShowDisconnectedModal(true);
    
    // Auto-hide modal and start new search after 3 seconds
    setTimeout(() => {
      setShowDisconnectedModal(false);
      if (onlineCount > 0) {
        handleStartCall();
      }
    }, 3000);
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socket && partner) {
      socket.emit('end_call', { partnerId: partner.id });
    }

    setCallState('ended');
    setPartner(null);
    setStream(null);
    streamRef.current = null;
  };

  const handleSkip = () => {
    handleEndCall();
    setTimeout(() => {
      setCallState('idle');
      handleStartCall();
    }, 500);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50" style={{ minHeight: '100vh' }}>
      <Header />

      {/* Video Area */}
      <main className="flex-1 relative bg-gradient-to-br from-purple-800 via-pink-700 to-purple-900" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Incoming Call Notification */}
        {callState === 'ringing' && incomingCall && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-800 to-pink-700 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-slide-up">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  {incomingCall.fromPhoto ? (
                    <img 
                      src={incomingCall.fromPhoto} 
                      alt={incomingCall.fromName}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl animate-pulse-slow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-xl animate-pulse-slow">
                      <span className="text-white text-5xl font-bold">{incomingCall.fromName?.[0]}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-1 rounded-full">
                    <span className="text-white text-sm font-semibold">Incoming Call</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{incomingCall.fromName}</h2>
                <p className="text-gray-200 mb-8">wants to video call with you</p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={rejectCall}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-bold text-lg transition transform hover:scale-105 flex items-center gap-2 shadow-xl"
                  >
                    <PhoneOff className="w-6 h-6" />
                    Reject
                  </button>
                  <button
                    onClick={acceptCall}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg transition transform hover:scale-105 flex items-center gap-2 shadow-xl animate-pulse"
                  >
                    <Video className="w-6 h-6" />
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Rejected Modal */}
        {showRejectedModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-slide-up">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                  <PhoneOff className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Call Rejected</h2>
                <p className="text-white/90 mb-6">The user declined your call</p>
                <button
                  onClick={() => setShowRejectedModal(false)}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition transform hover:scale-105 backdrop-blur-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Partner Disconnected Modal */}
        {showDisconnectedModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-slide-up">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                  <PhoneOff className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Partner Left</h2>
                <p className="text-white/90 mb-6">Your partner has disconnected</p>
                <p className="text-white/80 text-sm">Searching for a new partner...</p>
              </div>
            </div>
          </div>
        )}

        {/* Permission Request Modal */}
        {showPermissionModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-slide-up">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Camera & Microphone Access</h2>
                <p className="text-white/90 mb-6 text-lg leading-relaxed">{permissionError}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={requestPermissions}
                    className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition transform hover:scale-105 backdrop-blur-sm"
                  >
                    🎥 Request Permissions
                  </button>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="px-8 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-full font-semibold transition transform hover:scale-105 backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-white/80 text-sm">
                    💡 <strong>Tip:</strong> Look for the camera icon in your browser's address bar and click "Allow" to grant permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Online Users Badge */}
        {callState === 'idle' && (
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 z-10">
            <div className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">{onlineCount} online</span>
          </div>
        )}

        {callState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 animate-fade-in">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce-slow">
                <Video className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 animate-slide-up">Random Video Call</h2>
              <p className="text-gray-200 mb-10 max-w-md mx-auto text-lg animate-slide-up-delay">
                Connect with random people online for video calls. 
                Perfect for making new connections!
              </p>
              <button
                onClick={handleStartCall}
                disabled={onlineCount === 0}
                className="px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-full font-bold text-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl animate-pulse-slow"
              >
                🎥 Start Video Call
              </button>
              {onlineCount === 0 && (
                <p className="text-yellow-300 mt-6 text-base animate-pulse">⚠️ No users online right now</p>
              )}
            </div>
          </div>
        )}

        {callState === 'searching' && (
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Video className="w-16 h-16 text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Searching for partner...</h2>
                <div className="flex justify-center gap-2 mb-8">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-gray-200 mb-8 text-lg">Please wait while we find someone for you</p>
                <button
                  onClick={() => {
                    setCallState('idle');
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                    }
                  }}
                  className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-full font-semibold hover:bg-white/20 transition border border-white/20"
                >
                  Cancel
                </button>
              </div>
          </div>
        )}

        {callState === 'connected' && (
          <>
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-gray-700">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Partner Name */}
            {partner && (
              <div className="absolute bottom-24 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white font-medium">{partner.full_name}</span>
              </div>
            )}
          </>
        )}

        {callState === 'ended' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <PhoneOff className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
              <p className="text-gray-400 mb-8">The call has been disconnected</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition"
                >
                  Go Home
                </button>
                <button
                  onClick={() => {
                    setCallState('idle');
                    handleStartCall();
                  }}
                  className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
                >
                  New Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {callState === 'connected' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-6">
            <div className="max-w-md mx-auto flex items-center justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition ${
                  videoEnabled
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                }`}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition ${
                  audioEnabled
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                }`}
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={handleEndCall}
                className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition"
                title="End call"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={handleSkip}
                className="p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                title="Skip to next person"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RandomVideoCall;
