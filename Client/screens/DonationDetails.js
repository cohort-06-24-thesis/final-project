import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DonationDetails({ route, navigation }) {
  const { item } = route.params;

  const handleFavorite = () => {
    // Handle adding to favorites
    console.log('Added to favorites');
  };

  const handleReport = () => {
    // Handle reporting item
    console.log('Report item');
  };


  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image?.[0] || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={[
            styles.status,
            { color: item.status === 'available' ? '#4CAF50' : '#666' }
          ]}>
            {item.status}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
            <Ionicons name="heart-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>Favoris</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>Signaler</Text>
          </TouchableOpacity>
        </View>


        {item.status === 'available' && (
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Claim Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});