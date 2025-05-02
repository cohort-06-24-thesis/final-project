import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config'



const InNeedScreen = ({ navigation }) => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInNeedData();
  }, []);

  const fetchInNeedData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/inNeed/all`);
      setNeeds(response.data);
    } catch (error) {
      console.error('Error fetching in-need data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#80ED99" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>People In Need</Text>
        {needs.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate('InNeedDetails', { item })}
          >
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>No Image</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.location}>📍 {item.location}</Text>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Help Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddInNeed')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f2f2f',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#00C44F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default InNeedScreen;
