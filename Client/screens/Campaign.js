import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../config';

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [refreshing, setRefreshing] = useState(false); 
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCampaigns();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_BASE}/campaignDonation`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  const handleViewDetails = (campaign) => {
    navigation.navigate('CampaignDetails', { campaign });
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Feature Campaign</Text>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {campaigns
          .filter(campaign => campaign.isApproved === true)
          .map((campaign, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.imageContainer}>
                {campaign.images && campaign.images.length > 0 && (
                  <Image
                    source={{ uri: campaign.images[0] }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>{campaign.title}</Text>
                
                <Text style={styles.description} numberOfLines={3}>
                  {campaign.description}
                </Text>

                {campaign.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.locationText}>{campaign.location}</Text>
                  </View>
                )}

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${campaign.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>Raised {campaign.progress}%</Text>
                  
                  {campaign.totalDonors > 0 && (
                    <Text style={styles.donorsText}>
                      {campaign.totalDonors} {campaign.totalDonors === 1 ? 'person' : 'people'} donated
                    </Text>
                  )}
                </View>

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
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  donorsText: {
    fontSize: 14,
    color: '#666',
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
