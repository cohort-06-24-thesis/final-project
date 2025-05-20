import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";

import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  NotificationProvider,
  NotificationContext,
} from "./src/context/NotificationContext";
import Toast from "react-native-toast-message";

import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
import SplashScreen from "./screens/SplashScreen";
import LandingPage from "./screens/LandingPage";
import Home from "./screens/Home";
import DonationItems from "./screens/DonationItems";
import InNeed from "./screens/InNeed";
import Campaign from "./screens/Campaign";
import Events from "./screens/Events";
import AddEvent from "./screens/AddEvent";
import Chat from "./screens/Chat";
import AddCampaign from "./screens/AddCampaign";
import AddInNeed from "./screens/AddInNeed";
import AddDonation from "./screens/AddDonation";
import EventDetails from "./screens/EventDetails";
import CampaignDetails from "./screens/CampaignDetails";
import Payment from "./screens/Payment";
import InNeedDetails from "./screens/InNeedDetails";
import DonationDetails from "./screens/DonationDetails";
import FullScreenMap from "./screens/FullScreenMap";
import UserProfile from "./screens/UserProfile";
import EditProfile from "./screens/EditProfile";
import Settings from "./screens/Settings";
import Conversation from "./screens/Conversation";
import OtherUser from "./screens/OtherUser";
import NotificationScreen from "./screens/notification";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  // const { unreadCount } = useContext(NotificationContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Donations") {
            iconName = focused ? "gift" : "gift-outline";
          } else if (route.name === "InNeed") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Campaign") {
            iconName = focused ? "megaphone" : "megaphone-outline";
          } else if (route.name === "Events") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: "Home" }} />
      <Tab.Screen
        name="Donations"
        component={DonationItems}
        options={{ title: "Donations" }}
      />
      <Tab.Screen
        name="InNeed"
        component={InNeed}
        options={{ title: "In Need" }}
      />
      <Tab.Screen
        name="Campaign"
        component={Campaign}
        options={{ title: "Campaign" }}
      />
      <Tab.Screen
        name="Events"
        component={Events}
        options={{ title: "Events" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onGetStarted={() => setShowSplash(false)} />;
  }

  if (isFirstTime) {
    return <LandingPage onFinish={() => setIsFirstTime(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NotificationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: "#fff" },
              headerTintColor: "#4CAF50",
              headerBackTitle: " ",
              headerLeftContainerStyle: { paddingLeft: 10 },
            }}
          >
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{ title: "Create Account" }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ title: "Reset Password" }}
            />
            <Stack.Screen
              name="MainApp"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddEvent"
              component={AddEvent}
              options={{ title: "Add Event" }}
            />
            <Stack.Screen
              name="AddCampaign"
              component={AddCampaign}
              options={{ title: "Add Campaign", headerShown: true }}
            />
            <Stack.Screen
              name="CampaignDetails"
              component={CampaignDetails}
              options={{
                title: "Campaign Details",
                headerShown: true,
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor: "#4CAF50",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />
            <Stack.Screen
              name="Payment"
              component={Payment}
              options={{ title: "payment" }}
            />
            <Stack.Screen
              name="AddInNeed"
              component={AddInNeed}
              options={{ title: "Add In Need", headerShown: true }}
            />
            <Stack.Screen
              name="AddDonation"
              component={AddDonation}
              options={{ title: "Add Donation" }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InNeedDetails"
              component={InNeedDetails}
              options={{ title: "Need Details" }}
            />

            <Stack.Screen
              name="DonationDetails"
              component={DonationDetails}
              options={{
                title: "Donation Details",
              }}
            />
            <Stack.Screen
              name="FullScreenMap"
              component={FullScreenMap}
              options={{ title: "Map", headerShown: true }}
            />
            <Stack.Screen
              name="Chat"
              component={Chat}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor: "#4CAF50",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{
                title: "Profile",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{
                title: "Edit Profile",
                headerShown: true,
                headerTintColor: "#fff",
                headerStyle: {
                  backgroundColor: "#4CAF50",
                },
              }}
            />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{
                title: "Edit Profile",
                headerShown: true,
                headerTintColor: "#fff",
                headerStyle: {
                  backgroundColor: "#4CAF50",
                },
              }}
            />
            <Stack.Screen
              name="Conversation"
              component={Conversation}
              options={{
                title: "Chat",
                headerShown: true,
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor: "#4CAF50",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            />
            <Stack.Screen
              name="OtherUser"
              component={OtherUser}
              options={{
                headerTitle: "Profile",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationScreen}
              options={{ title: "Notifications", headerShown: true }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NotificationProvider>
      <Toast />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
