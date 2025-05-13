import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config';

const categoryIcons = {
  Furniture: 'bed-outline',
  Home: 'home-outline',
  Garden: 'leaf-outline',
  DIY: 'construct-outline',
  Appliances: 'tv-outline',
  Electronics: 'phone-portrait-outline',
  Fashion: 'shirt-outline',
  Beauty: 'rose-outline',
  Kids: 'happy-outline',
  Books: 'book-outline',
  Office: 'briefcase-outline',
  Leisure: 'bicycle-outline',
  Sports: 'football-outline',
  Pets: 'paw-outline',
  Health: 'medkit-outline',
  Automotive: 'car-outline',
  Food: 'fast-food-outline',
};

export default function DonationItems({ navigation }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/donationItems/getAllItems`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/category/getAll`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    await fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>SADAKA</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.itemsContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={{ marginBottom: 10 }}
        >
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === null && styles.categoryCardSelected,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <View
              style={[
                styles.categoryIcon,
                selectedCategory === null && styles.categoryIconSelected,
              ]}
            >
              <Ionicons name="grid-outline" size={30} color={selectedCategory === null ? '#fff' : '#00C44F'} />
            </View>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.categoryTextSelected,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryCard,
                selectedCategory === item.name && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategoryPress(item)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  selectedCategory === item.name && styles.categoryIconSelected,
                ]}
              >
                <Ionicons
                  name={categoryIcons[item.name] ? categoryIcons[item.name] : 'cube-outline'}
                  size={30}
                  color={selectedCategory === item.name ? '#fff' : '#00C44F'}
                />
              </View>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.name && styles.categoryTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.itemsGrid}>
          {items
            .filter((item) => {
              const matchesSearch =
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location?.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesCategory = !selectedCategory || item.Category?.name === selectedCategory;
              const isApproved = item.isApproved === true; // Filter by isApproved field

              return matchesSearch && matchesCategory && isApproved; // Only show approved items
            })
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
                            item.status === 'available' ? '#E6F4EA' : item.status === 'reserved' ? '#F3DE78' : '#eee',
                          color: item.status === 'available' ? '#2E7D32' : '#666',
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Ionicons name="time-outline" size={16} color="#999" style={{ marginRight: 5 }} />
                    <Text style={{ color: '#999', fontSize: 13 }}>
                      {item.createdAt ? `${new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

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
    paddingVertical: 2, // Reduced from 5
    paddingHorizontal: 2, // Reduced from 5
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 85,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 2,
    elevation: 2,
  },
  categoryIcon: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    marginBottom: 2,
    borderWidth: 2,
    borderColor: '#00C44F',
  },
  categoryText: {
    fontSize: 12,
    color: '#00C44F',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
    minHeight: 28,
    fontWeight: 'bold',
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
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // 3D shadow effect:
    elevation: 8, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 6 }, // iOS
    shadowOpacity: 0.18, // iOS
    shadowRadius: 12, // iOS
    backgroundColor: '#fff', // Optional: helps the shadow stand out
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
    // backgroundColor: '#C7F9CC', // Remove or comment out this line if you want no bg for the info section too
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
  categoryCardSelected: {
    borderColor: '#00C44F',
    backgroundColor: '#E9FFF2', // subtle green background for selected
    elevation: 4,
  },
  categoryIconSelected: {
    backgroundColor: '#00C44F',
    borderColor: '#00C44F',
  },
  categoryTextSelected: {
    color: '#00C44F',
    fontWeight: 'bold',
  },
};