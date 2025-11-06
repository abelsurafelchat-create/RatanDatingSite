import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import SimplePeer from 'simple-peer';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const RandomCall = () => {
  const [callState, setCallState] = useState('idle'); // idle, searching, connected, ended
  const [partner, setPartner] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
    };
  }, [stream, peer]);

  useEffect(() => {
    if (socket) {
      socket.on('waiting_for_partner', () => {
        setCallState('searching');
      });

      socket.on('call_matched', ({ roomId, partnerId }) => {
        setCallState('connected');
        setPartner({ id: partnerId });
        initializePeer(true, roomId);
      });

      socket.on('call_signal', ({ from, signal }) => {
        if (peer) {
          peer.signal(signal);
        }
      });

      socket.on('call_ended', () => {
        handleEndCall();
      });

      return () => {
        socket.off('waiting_for_partner');
        socket.off('call_matched');
        socket.off('call_signal');
        socket.off('call_ended');
      };
    }
  }, [socket, peer]);

  const initializePeer = (initiator, roomId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        const newPeer = new SimplePeer({
          initiator,
          trickle: false,
          stream: mediaStream,
        });

        newPeer.on('signal', (signal) => {
          socket.emit('call_signal', {
            to: partner?.id,
            signal,
          });
        });

        newPeer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);
        });

        setPeer(newPeer);
      })
      .catch((err) => {
        console.error('Failed to get media:', err);
        alert('Failed to access camera/microphone. Please check permissions.');
      });
  };

  const handleStartCall = () => {
    if (!socket) {
      alert('Connection not established. Please refresh the page.');
      return;
    }

    setCallState('searching');
    socket.emit('join_random_call', {
      userId: user.id,
      gender: user.gender,
      registrationType: user.registration_type,
    });
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (socket && partner) {
      socket.emit('end_call', { partnerId: partner.id });
    }

    setCallState('ended');
    setPartner(null);
    setStream(null);
    setPeer(null);
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
    <div className="flex flex-col bg-gray-900" style={{ minHeight: '100vh' }}>
      <Header />

      {/* Video Area */}
      <main className="flex-1 relative" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {callState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Random Video Call</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Connect with random people of opposite gender for video calls. 
                Perfect for making new connections!
              </p>
              <button
                onClick={handleStartCall}
                className="px-8 py-4 bg-primary-600 text-white rounded-full font-semibold text-lg hover:bg-primary-700 transition"
              >
                Start Call
              </button>
            </div>
          </div>
        )}

        {callState === 'searching' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Video className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Searching for partner...</h2>
              <p className="text-gray-400 mb-8">Please wait while we find someone for you</p>
              <button
                onClick={() => {
                  setCallState('idle');
                  if (socket) {
                    socket.emit('cancel_search', { userId: user.id });
                  }
                }}
                className="px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition"
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
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
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
        <div className="bg-gray-800 border-t border-gray-700 p-6">
          <div className="max-w-md mx-auto flex items-center justify-center gap-4">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition ${
                videoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
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
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {audioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handleSkip}
              className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"
              title="Skip to next person"
            >
              <SkipForward className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RandomCall;
