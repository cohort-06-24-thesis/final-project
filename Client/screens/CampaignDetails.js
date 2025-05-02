import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CampaignDetails({ route }) {
  const { campaign } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: campaign.images[0] }} 
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{campaign.title}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.amount}>£{campaign.raisedAmount || 0} raised</Text>
          <Text style={styles.goal}>of £{campaign.goal} goal</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${campaign.progress}%` }]} />
        </View>

        <Text style={styles.donorsCount}>{campaign.totalDonors} people donated</Text>

        <TouchableOpacity style={styles.donateButton}>
          <Text style={styles.donateButtonText}>I support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <Text style={styles.description}>{campaign.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  goal: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  donorsCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: '#00c44f',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#ffe97f',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});