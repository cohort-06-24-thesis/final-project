
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);


  useEffect(() => {
    // Fetch campaigns from your backend
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/campaignDonation');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleTopUp = () => {
    // Implement top up wallet functionality
    console.log('Top up wallet');
  };

  return (
    <ScrollView style={styles.container}>
     

      {/* Feature Campaign Section */}
      <Text style={styles.sectionTitle}>Feature Campaign</Text>
      
      {campaigns.map((campaign, index) => (
        <View key={index} style={styles.campaignCard}>
          {campaign.images && campaign.images.length > 0 && (
            <Image 
              source={{ uri: campaign.images[0] }} 
              style={styles.campaignImage}
            />
          )}
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            {/* <Text style={styles.organizationName}>By Unesco</Text> */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${campaign.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Raised {campaign.progress}%</Text>
            <View style={styles.donorsContainer}>
              {/* Add donor avatars here */}
              <Text style={styles.donorsText}>{campaign.totalDonors} people donated</Text>
            </View>
            <Text style={styles.location}>Tunisia</Text>
          </View>
        </View>
      ))}
    </ScrollView>
)}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  walletContainer: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  walletLabel: {
    color: 'white',
    fontSize: 16,
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  walletBalance: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  topUpButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  campaignCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  campaignImage: {
    width: '100%',
    height: 200,
  },
  campaignInfo: {
    padding: 16,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  organizationName: {
    color: '#4CAF50',
    marginBottom: 12,
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
  progressText: {
    color: '#666',
    marginBottom: 8,
  },
  donorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  donorsText: {
    color: '#666',
    marginLeft: 8,
  },
  location: {
    color: '#666',
  },
});
