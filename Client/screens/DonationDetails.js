import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

export default function DonationDetails({ route, navigation }) {
  const { item } = route.params;

  const handleFavorite = () => {
    console.log('Added to favorites');
  };

  const handleReport = () => {
    console.log('Report item');
  };

  const handleContact = () => {
    console.log('Contact user');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
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
              <Text style={styles.actionButtonText}>Favorite</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Report</Text>
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude || 48.8566, // Default to Paris if no latitude
                longitude: item.longitude || 2.3522, // Default to Paris if no longitude
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: item.latitude || 48.8566,
                  longitude: item.longitude || 2.3522,
                }}
                title={item.title}
                description={item.location}
              />
            </MapView>
          </View>

          {/* {item.status === 'available' && (
            <TouchableOpacity style={styles.claimButton}>
              <Text style={styles.claimButtonText}>Claim Now</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </ScrollView>

      {/* Fixed User Details Section */}
      <View style={styles.userContainer}>
        <Image 
          source={{ uri: item.user?.profilePic || 'https://via.placeholder.com/100' }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.userRating}>⭐ {item.user?.rating || '0.0'}</Text>
        </View>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80, // Leave space for the fixed user bar
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
  // claimButton: {
  //   backgroundColor: '#4CAF50',
  //   padding: 16,
  //   borderRadius: 8,
  //   alignItems: 'center',
  // },
  // claimButtonText: {
  //   color: '#fff',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
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
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
  userContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRating: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#EFD13D',
    paddingVertical: 20,
    paddingHorizontal: 38,
    right: 8,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});