import React, { useEffect, useState } from 'react';
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

const InNeedCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <View style={styles.imageContainer}>
      {item.images && item.images.length > 0 ? (
        <Image
          style={styles.image}
          source={{ uri: item.images[0] }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={{ color: '#666' }}>No Image</Text>
        </View>
      )}
      <Text style={styles.dateText}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.description}>
        {item.description}
      </Text>
      <Text style={styles.location}>📍 {item.location}</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onPress}>
        <Text style={styles.viewText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const InNeedScreen = ({ navigation }) => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInNeedData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>People In Need</Text>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {needs.filter(item => item.isApproved && !item.isDone).length === 0 ? (
          <Text style={styles.noData}>No active requests at the moment.</Text>
        ) : (
          needs
            .filter(item => item.isApproved && !item.isDone)
            .map(item => (
              <InNeedCard
                key={item.id || item.title}
                item={item}
                onPress={() => navigation.navigate('InNeedDetails', { item })}
              />
            ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddInNeed')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  scroll: { padding: 16 },
  noData: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
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
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  dateText: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: '#666',
    marginBottom: 10,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  viewText: {
    color: '#4CAF50',
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
