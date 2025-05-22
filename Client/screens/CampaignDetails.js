import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CampaignDetails({ route, navigation }) {
  const { campaign } = route.params;

  const handleSupport = () => {
    navigation.navigate('Payment', { campaign });
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: campaign.images[0] }} 
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{campaign.title}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.amount}>TND {campaign.totalRaised} raised</Text>
          <Text style={styles.goal}>of TND {campaign.goal} goal</Text>
        </View>

        <View style={styles.batteryContainer}>
          <View style={styles.batteryBody}>
            <View style={[styles.batteryLevel, { width: `${campaign.progress}%` }]} />
          </View>
          <View style={styles.batteryCap} />
          <Text style={styles.batteryPercentage}>{campaign.progress}%</Text>
        </View>

        <TouchableOpacity style={styles.donateButton} onPress={handleSupport}>
          <Text style={styles.donateButtonText}>I support</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  goal: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  batteryBody: {
    flex: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  batteryLevel: {
    height: '100%',
    backgroundColor: '#00C44F',
    borderRadius: 4,
  },
  batteryCap: {
    width: 4,
    height: 15,
    backgroundColor: '#ddd',
    marginLeft: 2,
    borderRadius: 2,
  },
  batteryPercentage: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  donateButton: {
    backgroundColor: '#00C44F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
});