import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
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
            const favoritesResponse = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
            const favorite = favoritesResponse.data.find(fav => fav.eventId === event.id);
            
            if (favorite) {
                await axios.delete(`${API_BASE}/favourite/deleteFavourite/${favorite.id}`);
                setIsFavorited(false);
                Alert.alert('Success', 'Event removed from wishlist');
            }
        } else {
            // Make sure we're sending the correct eventId
            console.log('Creating favorite with eventId:', event.id); // Debug log
            
            const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
                userId,
                eventId: event.id, // Make sure event.id exists and is being passed correctly
                type: 'event'
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
            Alert.alert('Error', 'Please login to join this event');
            return;
        }

        if (hasJoined) {
            // Leave the event
            console.log(`Attempting to leave event ${event.id} for user ${userId}`); // Debug log
            const leaveResponse = await axios.delete(`${API_BASE}/event/${event.id}/participants/${userId}`);
            console.log('Leave response:', leaveResponse.data); // Debug log

            setHasJoined(false);
            setJoinedParticipants(prev => prev.filter(p => p.userId !== userId));
            
            // Update event participators count
            setEvent(prev => ({
                ...prev,
                participators: Math.max(0, (prev.participators || 1) - 1)
            }));
            
            Alert.alert('Success', 'You have left the event');
        } else {
            // Join the event
            console.log(`Attempting to join event ${event.id} for user ${userId}`); // Debug log
            const joinResponse = await axios.post(`${API_BASE}/event/${event.id}/participants`, {
                userId,
                eventId: event.id
            });
            console.log('Join response:', joinResponse.data); // Debug log

            setHasJoined(true);
            setJoinedParticipants(prev => [...prev, joinResponse.data]);
            
            // Update event participators count
            setEvent(prev => ({
                ...prev,
                participators: (prev.participators || 0) + 1
            }));
            
            Alert.alert('Success', 'You have joined the event');
        }
    } catch (error) {
        console.error('Error managing event participation:', error);
        console.error('Error details:', {
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
        });
        
        // Show more specific error message
        Alert.alert(
            'Error',
            error.response?.data?.message || 
            error.response?.data || 
            'Failed to update event participation. Please try again.'
        );
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Event',
      'Are you sure you want to report this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Report submitted', 'Thank you for your feedback');
          }
        }
      ]
    );
  };

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
        <Text style={styles.title}>{event.title}</Text>
        
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

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF6B6B" : "#666"} 
            />
            <Text style={[styles.actionButtonText, isFavorited && { color: "#FF6B6B" }]}>
              Favorite
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>Report</Text>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity 
          style={[
            styles.joinButton, 
            hasJoined && styles.joinedButton
          ]} 
          onPress={handleJoin}
        >
          <Text style={styles.joinButtonText}>
            {hasJoined ? 'Leave Event' : 'Join Event'}
          </Text>
          <Text style={styles.participantCount}>
            {joinedParticipants.length} joined
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
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
  joinButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  joinedButton: {
    backgroundColor: '#FF6B6B',
  },
  participantCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  }
});

export default EventDetails;