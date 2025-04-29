import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import * as Progress from 'react-native-progress';

const EventCard = ({ title, description, date, progress, onViewDetails }) => (
  <View style={styles.card}>
    <View style={styles.imageContainer}>
      <Image
        style={styles.eventImage}
        source={require('../assets/placeholder.png')}
      />
      <Text style={styles.dateText}>{date}</Text>
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Progress.Bar 
          progress={progress} 
          width={null} 
          color="#4CAF50" 
          unfilledColor="#E8E8E8"
        />
        <Text style={styles.progressPercentage}>{`${progress * 100}%`}</Text>
      </View>
      <TouchableOpacity 
        style={styles.viewDetailsButton}
        onPress={onViewDetails}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const EventsScreen = ({ navigation }) => {
  const events = [
    {
      id: 1,
      title: 'Ramadhan Donations',
      description: 'Help provide Iftar meals for families in need during the holy month',
      date: 'March 10, 2025',
      progress: 0.65,
    },
    {
      id: 2,
      title: 'Aid al-Fitr Support',
      description: 'Support families with essential supplies for Eid celebrations',
      date: 'April 15, 2025',
      progress: 0.42,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      <ScrollView style={styles.scrollView}>
        {events.map(event => (
          <EventCard
            key={event.id}
            {...event}
            onViewDetails={() => navigation.navigate('EventDetails', { eventId: event.id })}
          />
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Text style={styles.addButtonText}>+</Text>
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
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'right',
    marginTop: 4,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default EventsScreen;