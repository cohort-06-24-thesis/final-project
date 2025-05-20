import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

export default function FullScreenMap({ route }) {
  const { latitude, longitude, title, location, selectMode, onSelectLocation } = route.params;
  const navigation = useNavigation();
  const [selectedCoords, setSelectedCoords] = useState({ latitude, longitude });

  const handleMapPress = (e) => {
    if (!selectMode) return;
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    if (onSelectLocation) {
      onSelectLocation(coords);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedCoords.latitude,
          longitude: selectedCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={selectMode ? handleMapPress : undefined}
      >
        <Marker
          coordinate={selectedCoords}
          title={title}
          description={location}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});