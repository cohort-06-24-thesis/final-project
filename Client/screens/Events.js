import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const calculateTimeLeft = (eventDate) => {
  const difference = new Date(eventDate) - new Date();
  if (difference <= 0) return 'Event ended';

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  // Calculate months if more than 30 days
  if (days > 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return remainingDays > 0 
       ? `Still ${months}m ${remainingDays}d`
      : `Still ${months} month${months > 1 ? 's' : ''}`;
  }
  
  if (days > 0) return `Still ${days}d`;
  if (hours > 0) return `Still ${hours}h`;
  return `Still ${minutes}m`;
};

const EventCard = ({ event, onPress }) => (
  <TouchableOpacity 
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.imageContainer}>
      {event.images && event.images.length > 0 ? (
        <Image
          style={styles.eventImage}
          source={{ uri: event.images[0] }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.eventImage, styles.noImage]}>
          <Ionicons name="calendar-outline" size={40} color="#666" />
        </View>
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.gradientOverlay}
      >
        <View style={styles.dateInfo}>
          <Text style={styles.date}>
            {new Date(event.date).toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <View style={styles.timeLeftBadge}>
            <Text style={styles.timeLeftText}>
              {calculateTimeLeft(event.date)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.location}>📍 {event.location}</Text>
      <Text style={styles.participators}>👥 {event.participators}</Text>
      <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#4CAF50" style={styles.viewDetailsIcon} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/event/getAllEvents`);
      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const approvedEvents = events.filter(event => event.isApproved);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {approvedEvents.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>
            No approved upcoming events
          </Text>
        ) : (
          approvedEvents.map(event => (
            <EventCard
              key={event.id || event.title}
              event={event}
              onPress={() => navigation.navigate('EventDetails', { event })}
            />
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEvent')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    padding: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeLeftBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLeftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  participators: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewDetailsText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 4,
  },
  viewDetailsIcon: {
    marginLeft: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
});

export default EventsScreen;
