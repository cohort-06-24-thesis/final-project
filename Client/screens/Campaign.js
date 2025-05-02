import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCampaigns(); // fetch every time screen is focused
    });

    return unsubscribe; // cleanup
  }, [navigation]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://192.168.50.252:3000/api/campaignDonation');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleViewDetails = (campaign) => {
    navigation.navigate('CampaignDetails', { campaign });
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Feature Campaign</Text>
      <ScrollView style={styles.scrollView}>
        {campaigns.map((campaign, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.imageContainer}>
              {campaign.images && campaign.images.length > 0 && (
                <Image
                  source={{ uri: campaign.images[0] }}
                  style={styles.eventImage}
                />
              )}
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{campaign.title}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${campaign.progress}%` }]}
                />
              </View>
              <Text style={styles.description}>Raised {campaign.progress}%</Text>
              <Text style={styles.participators}>
                {campaign.totalDonors} people donated
              </Text>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => handleViewDetails(campaign)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCampaign')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 16,
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
  eventImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  participators: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  viewDetailsText: {
    color: '#4CAF50',
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
});
