import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenter({ navigation }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const helpSections = [
    {
      title: "Getting Started",
      icon: "rocket-outline",
      items: [
        { 
          title: "Create an Account",
          content: "To create an account:\n\n1. Open the app and tap 'Sign Up'\n2. Enter your email and create a password\n3. Fill in your personal information\n4. Verify your email address\n5. Complete your profile setup",
          steps: [
            "Open the app and tap 'Sign Up'",
            "Enter your email and create a password",
            "Fill in your personal information",
            "Verify your email address",
            "Complete your profile setup"
          ]
        },
        { 
          title: "Complete Your Profile",
          content: "To complete your profile:\n\n1. Go to Profile settings\n2. Add a profile picture\n3. Fill in your bio\n4. Add your location\n5. Set your preferences",
          steps: [
            "Go to Profile settings",
            "Add a profile picture",
            "Fill in your bio",
            "Add your location",
            "Set your preferences"
          ]
        },
        { 
          title: "Navigation Guide",
          content: "Main app sections:\n\n• Home: Browse donations and events\n• Donations: View and create donation listings\n• Events: Find and create charity events\n• Profile: Manage your account\n• Messages: Chat with other users",
          steps: [
            "Home: Browse donations and events",
            "Donations: View and create donation listings",
            "Events: Find and create charity events",
            "Profile: Manage your account",
            "Messages: Chat with other users"
          ]
        }
      ]
    },
    {
      title: "Making Donations",
      icon: "gift-outline",
      items: [
        { 
          title: "How to Donate",
          content: "Making a donation is easy and straightforward",
          steps: [
            "Click the '+' button on the Donations tab",
            "Select donation category (Food, Clothes, Money, etc.)",
            "Upload clear photos of items (if applicable)",
            "Add description and condition details",
            "Set pickup/delivery preferences",
            "Submit your donation listing"
          ]
        },
        { 
          title: "Donation Categories",
          content: "Explore different types of donations you can make",
          steps: [
            "Food & Groceries: Non-perishable items, fresh produce",
            "Clothing & Accessories: New or gently used items",
            "Household Items: Furniture, appliances, electronics",
            "Educational Materials: Books, school supplies",
            "Medical Supplies: Unopened medical items",
            "Monetary Donations: Direct financial support"
          ]
        },
        { 
          title: "Track Your Donations",
          content: "Monitor the status of your donations",
          steps: [
            "Go to your Profile and select 'My Donations'",
            "View all your active donation listings",
            "Check status: Pending, Accepted, In Transit, Completed",
            "Communicate with recipients through chat",
            "Get notifications for updates and completion"
          ]
        }
      ]
    },
    {
      title: "Campaigns & Events",
      icon: "megaphone-outline",
      items: [
        { 
          title: "Join a Campaign",
          content: "Participate in ongoing charity campaigns",
          steps: [
            "Browse active campaigns on the Campaigns tab",
            "Read campaign details and requirements",
            "Click 'Join Campaign' to participate",
            "Complete required verification (if needed)",
            "Share campaign with others to increase impact"
          ]
        },
        { 
          title: "Create an Event",
          content: "Organize your own charity event",
          steps: [
            "Go to Events tab and click 'Create Event'",
            "Fill in event details (date, time, location)",
            "Add event description and requirements",
            "Upload event banner or photos",
            "Set participant capacity and registration deadline",
            "Submit for approval"
          ]
        },
        { 
          title: "Find Local Events",
          content: "Discover charity events in your area",
          steps: [
            "Open Events tab and enable location services",
            "Browse events sorted by distance",
            "Use filters for date, category, or type",
            "Register for events that interest you",
            "Get reminders and updates for registered events"
          ]
        }
      ]
    },
    {
      title: "In-Need Support",
      icon: "people-outline",
      items: [
        { 
          title: "Request Help",
          content: "Create an assistance request",
          steps: [
            "Go to the Support tab and select 'Request Help'",
            "Choose support category",
            "Describe your situation and needs",
            "Provide required documentation",
            "Submit request for review",
            "Wait for verification and approval"
          ]
        },
        { 
          title: "Verification Process",
          content: "Understanding how verification works",
          steps: [
            "Submit valid ID and supporting documents",
            "Complete background verification form",
            "Wait for admin review (2-3 business days)",
            "Respond to any additional information requests",
            "Receive verification badge once approved"
          ]
        },
        { 
          title: "Support Guidelines",
          content: "Important guidelines for receiving support",
          steps: [
            "Maintain honest and accurate information",
            "Respond to messages within 48 hours",
            "Update request status regularly",
            "Follow community guidelines",
            "Report any issues to support team",
            "Complete feedback after receiving help"
          ]
        }
      ]
    }
  ];

  const HelpItemModal = ({ item, visible, onClose }) => {
    if (!item) return null;
    
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{item.title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {item.steps?.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const HelpSection = ({ section }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={section.icon} size={24} color="#4CAF50" />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      {section.items.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.helpItem}
          onPress={() => setSelectedItem(item)}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemContent}>{item.content.split('\n')[0]}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {helpSections.map((section, index) => (
          <HelpSection key={index} section={section} />
        ))}
      </ScrollView>

      <HelpItemModal 
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  helpItem: {
    flexDirection: 'column',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  }
});