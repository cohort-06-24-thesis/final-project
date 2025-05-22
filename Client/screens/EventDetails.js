import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from '../config';

const EventDetails = ({ route, navigation }) => {
  const { event: initialEvent } = route.params;
  const [event, setEvent] = useState(initialEvent);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinedParticipants, setJoinedParticipants] = useState([]);
  const [isJoining, setIsJoining] = useState(false);

  // Check if event is in favorites
  useEffect(() => {
    const checkIfFavorited = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const response = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        const favorites = response.data;
        setIsFavorited(favorites.some(fav => fav.eventId === event.id));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkIfFavorited();
  }, [event.id]);

  // Check if current user has joined
  useEffect(() => {
    const checkIfJoined = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const response = await axios.get(`${API_BASE}/event/${event.id}/participants`);
        const participants = response.data;
        setJoinedParticipants(participants);
        setHasJoined(participants.some(p => p.userId === userId));
      } catch (error) {
        console.error('Error checking join status:', error);
      }
    };

    checkIfJoined();
  }, [event.id]);

  // Handle favorite toggle
  const handleFavorite = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Error', 'Please login to manage favorites');
        return;
      }

      if (isFavorited) {
        // Find and remove from favorites
        const favoritesResponse = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        const favorite = favoritesResponse.data.find(fav => fav.eventId === event.id);

        if (favorite) {
          await axios.delete(`${API_BASE}/favourite/deleteFavourite/${favorite.id}`);
          setIsFavorited(false);
          Alert.alert('Success', 'Event removed from wishlist');
        }
      } else {
        // Add to favorites
        const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
          userId,
          eventId: event.id,
          type: 'event',
          Event: {
            id: event.id,
            title: event.title,
            description: event.description,
            images: event.images,
            location: event.location,
            date: event.date,
            participators: event.participators
          }
        });

        if (response.data) {
          setIsFavorited(true);
          Alert.alert('Success', 'Event added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error managing favorites:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleJoin = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Login Required', 'Please login to join this event', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]);
        return;
      }

      setIsJoining(true);

      if (hasJoined) {
        Alert.alert(
          'Leave Event',
          'Are you sure you want to leave this event?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: async () => {
                try {
                  const leaveResponse = await axios.delete(`${API_BASE}/event/${event.id}/participants/${userId}`);

                  setHasJoined(false);
                  setJoinedParticipants(prev => prev.filter(p => p.userId !== userId));
                  setEvent(prev => ({
                    ...prev,
                    participators: Math.max(0, (prev.participators || 1) - 1)
                  }));

                  Alert.alert('Success', 'You have left the event');
                } catch (error) {
                  Alert.alert('Error', 'Failed to leave the event. Please try again.');
                }
              }
            }
          ]
        );
      } else {
        const joinResponse = await axios.post(`${API_BASE}/event/${event.id}/participants`, {
          userId,
          eventId: event.id
        });

        setHasJoined(true);
        setJoinedParticipants(prev => [...prev, joinResponse.data]);
        setEvent(prev => ({
          ...prev,
          participators: (prev.participators || 0) + 1
        }));

        Alert.alert('Welcome!', 'You have successfully joined the event');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update event participation'
      );
    } finally {
      setIsJoining(false);
    }
  };

  const renderJoinButton = () => (
    <View style={styles.joinSection}>
      <View style={styles.participantsInfo}>
        <Ionicons name="people" size={24} color="#666" />
        <Text style={styles.participantsCount}>
          {joinedParticipants.length} {joinedParticipants.length === 1 ? 'person' : 'people'} joined
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          hasJoined && styles.joinedButton,
          isJoining && styles.joiningButton
        ]}
        onPress={handleJoin}
        disabled={isJoining}
      >
        {isJoining ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name={hasJoined ? "exit-outline" : "enter-outline"}
              size={24}
              color="#fff"
              style={styles.joinIcon}
            />
            <Text style={styles.joinButtonText}>
              {hasJoined ? 'Leave Event' : 'Join Event'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {event.images && event.images.length > 0 ? (
          <Image
            style={styles.eventImage}
            source={{ uri: event.images[0] }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.eventImage, styles.noImage]}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{event.title}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={28}
              color={isFavorited ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.infoText}>
            {new Date(event.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people" size={20} color="#666" />
          <Text style={styles.infoText}>{event.participators}</Text>
        </View>

        <Text style={styles.descriptionTitle}>About Event</Text>
        <Text style={styles.description}>{event.description}</Text>

        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={() => navigation.navigate('FullScreenMap', {
            latitude: event.latitude,
            longitude: event.longitude,
            title: event.title,
            location: event.location,
          })}
        >
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: event.latitude || 36.8065,
              longitude: event.longitude || 10.1815,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: event.latitude || 36.8065,
                longitude: event.longitude || 10.1815,
              }}
              title={event.title}
              description={event.location}
            />
          </MapView>
        </TouchableOpacity>

        {renderJoinButton()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 10,
  },
  favoriteButton: {
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  joinSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    elevation: 2,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  joinedButton: {
    backgroundColor: '#FF6B6B',
  },
  joiningButton: {
    backgroundColor: '#999',
  },
  joinIcon: {
    marginRight: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventDetails;