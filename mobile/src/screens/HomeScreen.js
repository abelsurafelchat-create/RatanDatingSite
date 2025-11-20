import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await api.get('/matches/discover');
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action, profileId) => {
    try {
      if (action === 'like') {
        await api.post('/matches/like', { targetUserId: profileId });
        Alert.alert('Match!', 'You liked this profile');
      } else {
        await api.post('/matches/pass', { targetUserId: profileId });
      }
      
      setCurrentIndex(prev => prev + 1);
      
      // Load more profiles if running low
      if (currentIndex >= profiles.length - 2) {
        fetchProfiles();
      }
    } catch (error) {
      console.error('Failed to process swipe:', error);
      Alert.alert('Error', 'Failed to process action');
    }
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Finding matches...</Text>
      </SafeAreaView>
    );
  }

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#DDD" />
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptySubtitle}>Check back later for new matches!</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchProfiles}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>IndiDate</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RandomCall')}>
          <Ionicons name="call" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{
              uri: currentProfile.profile_photo || 'https://via.placeholder.com/400x600?text=No+Photo'
            }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentProfile.name}, {currentProfile.age}
              </Text>
              {currentProfile.location && (
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#FFF" />
                  <Text style={styles.locationText}>{currentProfile.location}</Text>
                </View>
              )}
              {currentProfile.bio && (
                <Text style={styles.bioText} numberOfLines={2}>
                  {currentProfile.bio}
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('pass', currentProfile.id)}
        >
          <Ionicons name="close" size={30} color="#FF4458" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleSwipe('superlike', currentProfile.id)}
        >
          <Ionicons name="star" size={24} color="#00D4FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('like', currentProfile.id)}
        >
          <Ionicons name="heart" size={30} color="#42C767" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
  },
  profileInfo: {
    padding: 20,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  bioText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  superLikeButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#00D4FF',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#42C767',
  },
});
