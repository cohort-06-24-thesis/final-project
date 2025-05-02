import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Map category names to Ionicons icon names
const categoryIcons = {
  Furniture: 'bed-outline',
  Home: 'home-outline',
  Garden: 'leaf-outline',
  DIY: 'construct-outline',
  Appliances: 'tv-outline',
  Electronics: 'phone-portrait-outline',
  Clothes: 'shirt-outline',
  Toys: 'game-controller-outline',
  Books: 'book-outline',
  Leisure: 'bicycle-outline',
  // Add more mappings as needed
};

export default function DonationItems({ navigation }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://172.20.10.6:3000/api/donationItems/getAllItems');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://172.20.10.6:3000/api/category/getAll');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    console.log('Selected category:', category.name);
    // Filter items based on the selected category
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>SADAKA</Text>

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

      {/* Main ScrollView for categories and items */}
      <ScrollView
        style={styles.itemsContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Categories - horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={{ marginBottom: 10 }}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(item)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={categoryIcons[item.name] || 'cube-outline'}
                  size={30}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Items Grid */}
        <View style={styles.itemsGrid}>
          {items
            .filter((item) =>
              item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.location?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.itemCard}
                onPress={() => navigation.navigate('DonationDetails', { item })}
              >
                <Image 
                  source={{ uri: item.image?.[0] || 'https://via.placeholder.com/150' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.itemLocation}>{item.location}</Text>
                    <Text
                      style={[
                        styles.itemStatusBadge,
                        {
                          backgroundColor:
                            item.status === 'available'
                              ? '#E6F4EA'
                              : item.status === 'reserved'
                              ? '#F3DE78'
                              : '#eee',
                          color: item.status === 'available' ? '#2E7D32' : '#666',
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  {/* Spacer to push the button to the bottom */}
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    style={[
                      styles.claimButtonLarge,
                      { backgroundColor: item.status === 'claimed' ? '#666' : '#00C44F' }
                    ]}
                    disabled={item.status !== 'available'}
                    onPress={() => {
                      // Add your claim logic here
                      console.log('Claiming item:', item.id);
                    }}
                  >
                    <Text style={styles.claimButtonText}>
                      {item.status === 'claimed' ? 'Claimed' : 'Claim'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
  categoriesContainer: {
    paddingVertical: 5, // Reduce padding
    paddingHorizontal: 5,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 8, // Reduce margin
    width: 90, // Increased width for longer names
  },
  categoryIcon: {
    backgroundColor: '#C7F9CC',
    padding: 11, // Slightly larger for better appearance
    borderRadius: 50,
    marginBottom: 4, // Reduce margin
  },
  categoryText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    flexWrap: 'wrap', // Allow wrapping
    width: '100%',    // Take full width of card
    minHeight: 32,    // Ensure space for 2 lines
  },
  itemsContainer: {
    marginTop: 5, // Add small margin top
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
    flex: 1,
    justifyContent: 'flex-start',
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  claimButtonSmall: {
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
  },
  claimButtonLarge: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 28, // Adjust for button width
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'flex-start', // Left align the button
    marginLeft: 0,           // Add a little left margin
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};