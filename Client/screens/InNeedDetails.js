import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const InNeedDetails = ({ route }) => {
  const { item } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.images && item.images.length > 0 ? (
        <ScrollView horizontal contentContainerStyle={styles.imageContainer}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
        </ScrollView>
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
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  image: {
    width: Dimensions.get('window').width - 32, // Adjust the width for margins
    height: 240,
    borderRadius: 16,
    marginRight: 10, // Space between images
    resizeMode: 'cover',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  noImageText: {
    color: '#777',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  location: {
    fontSize: 15,
    color: '#616161',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  descriptionContainer: {
    marginTop: 10,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#DDD',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2C2C2C',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});

export default InNeedDetails;
