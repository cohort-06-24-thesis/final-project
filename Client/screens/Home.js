import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE } from '../config'



export default function Home({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [inNeeds, setInNeeds] = useState([]);
  const [donationItems, setDonationItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [campaignRes, inNeedRes, donationRes, eventsRes] =
        await Promise.all([
          axios.get(`${API_BASE}/campaignDonation`),
          axios.get(`${API_BASE}/inNeed/all`),
          axios.get(`${API_BASE}/donationItems/getAllItems`),
          axios.get(`${API_BASE}/event/getAllEvents`),
        ]);
      setCampaigns(campaignRes.data || []);
      setInNeeds(inNeedRes.data || []);
      setDonationItems(donationRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setCampaigns([]);
      setInNeeds([]);
      setDonationItems([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const featuredItems = [
    {
      id: 1,
      title: "Campaigns",
      data: campaigns,
      icon: "volunteer-activism",
      screen: "Campaign",
    },
    {
      id: 2,
      title: "In Need",
      data: inNeeds,
      icon: "people",
      screen: "InNeed",
    },
    {
      id: 3,
      title: "Donations",
      data: donationItems,
      icon: "favorite",
      screen: "Donations",
    },
    { id: 4, title: "Events", data: events, icon: "event", screen: "Events" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>SADAKA</Text>
        <Text style={styles.subtitle}>Making a difference together</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={{ marginTop: 30 }}
        />
      ) : (
        <>
          <Text style={styles.sectionIntro}>Explore Our Impact</Text>
          <View style={styles.featuredGrid}>
            {featuredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.featuredItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <MaterialIcons name={item.icon} size={36} color="#4CAF50" />
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>
                  {Array.isArray(item.data)
                    ? `${item.data.length} items`
                    : "No data"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Campaigns</Text>
            {Array.isArray(campaigns) &&
              campaigns.slice(0, 3).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate("Campaign")}
                >
                  <Text style={styles.activityText}>
                    {c.title || "Untitled Campaign"}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent In-Needs</Text>
            {Array.isArray(inNeeds) &&
              inNeeds.slice(0, 3).map((i) => (
                <TouchableOpacity
                  key={i.id}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate("InNeed")}
                >
                  <Text style={styles.activityText}>
                    {i.title || "Untitled In-Need"}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  header: {
    padding: 25,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: "#666",
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
  sectionIntro: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  featuredGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  featuredItem: {
    backgroundColor: "#fff",
    width: "45%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  itemDescription: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 3,
  },
  activityText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});
