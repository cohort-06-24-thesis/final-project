import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const EventCard = ({ title, description, date, location, participators, images }) => (
  <View style={styles.card}>
    <View style={styles.imageContainer}>
      {images && images.length > 0 ? (
        <Image
          style={styles.eventImage}
          source={{ uri: images[0] }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.eventImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#666' }}>No Image</Text>
        </View>
      )}
      <Text style={styles.dateText}>{new Date(date).toLocaleDateString()}</Text>
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.location}>📍 {location}</Text>
      <Text style={styles.participators}>👥 {participators}</Text>
      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);



const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://192.168.248.168:3000/api/event/getAllEvents');
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      <ScrollView style={styles.scrollView}>
        {events.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>
            No upcoming events
          </Text>
        ) : (
          events.map(event => (
            <EventCard key={event.id || event.title} {...event} />
          ))
        )}
      </ScrollView>
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
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#e0e0e0',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  dateText: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    fontSize: 12,
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
  },
  viewDetailsText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
  }
});

export default EventsScreen;
