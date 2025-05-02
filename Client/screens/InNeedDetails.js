import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const InNeedDetails = ({ route }) => {
  const { item } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>No Image Available</Text>
        </View>
      )}

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>📍 {item.location}</Text>

      {/* Map Section */}
      {item.latitude && item.longitude && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: item.latitude,
            longitude: item.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.title}
            description={item.location}
          />
        </MapView>
      )}

      {/* Description at the bottom */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  noImageText: {
    color: '#888',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  descriptionContainer: {
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});

export default InNeedDetails;
