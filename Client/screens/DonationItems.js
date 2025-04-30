import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function DonationItems({ navigation }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://192.168.248.252:3000/api/donationItems/getAllItems');
      console.log('Fetched items:', response.data);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>SADAQAH</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Items Grid */}
      <ScrollView style={styles.itemsContainer}>
        <View style={styles.itemsGrid}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image 
                source={{ uri: item.image?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemLocation}>{item.location}</Text>
                <Text style={[
                  styles.itemStatus,
                  { color: item.status === 'available' ? '#4CAF50' : '#666' }
                ]}>
                  {item.status}
                </Text>
                <TouchableOpacity 
                  style={styles.claimButton}
                  onPress={() => {
                    if (item.status === 'claimed') {
                      navigation.navigate('ItemDetails', { item });
                    } else {
                      // Handle claim action
                    }
                  }}
                >
                  <Text style={styles.claimButtonText}>
                    {item.status === 'claimed' ? 'View' : 'Claim'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDonation')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  itemsContainer: {
    flex: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 14,
    marginBottom: 8,
  },
  claimButton: {
    backgroundColor: '#00C44F',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
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
};