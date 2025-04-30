
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; // Make sure axios is imported

export default function DonationItems({ navigation }) {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://192.168.1.163:3000/api/donationItems/getAllItems');
      console.log(response.data);
      setItems(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Donation Items</Text>
        {items.map((item, index) => (
          <View
            key={index}
            style={{
              padding: 15,
              marginVertical: 8,
              backgroundColor: '#f0f0f0',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text style={{ color: '#555' }}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#4CAF50',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
        onPress={() => navigation.navigate('AddDonation')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
