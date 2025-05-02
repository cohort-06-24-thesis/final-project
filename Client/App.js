import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';

import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';


import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';
import SplashScreen from './screens/SplashScreen';
import LandingPage from './screens/LandingPage';
import Home from './screens/Home';
import DonationItems from './screens/DonationItems';
import InNeed from './screens/InNeed';
import Campaign from './screens/Campaign';
import Events from './screens/Events';
import AddEvent from './screens/AddEvent';
import	AddCampaign from './screens/AddCampaign'
import AddInNeed from './screens/AddInNeed'
import AddDonation from './screens/AddDonation'
import EventDetails from './screens/EventDetails';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Donations') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'InNeed') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Campaign') {
            iconName = focused ? 'megaphone' : 'megaphone-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Donations" component={DonationItems} />
      <Tab.Screen name="InNeed" component={InNeed} options={{ title: 'In Need' }} />
      <Tab.Screen name="Campaign" component={Campaign} />
      <Tab.Screen name="Events" component={Events} />
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
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#4CAF50',
            headerBackTitle: ' ',
            headerLeftContainerStyle: {
              paddingLeft: 10,
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ 
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="Signup" 
            component={Signup}
            options={{ 
              title: 'Create Account',
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPassword}
            options={{ 
              title: 'Reset Password',
            }}
          />
          <Stack.Screen 
            name="MainApp" 
            component={TabNavigator} 
            options={{ 
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="AddEvent" 
            component={AddEvent} 
            options={{ 
              title: 'Add Event',
            }}
          />
          <Stack.Screen 
            name="AddCampaign" 
            component={AddCampaign} 
            options={{ 
              title: 'Add Campaign',
            }}
          />
           <Stack.Screen 
            name="AddInNeed" 
            component={AddInNeed} 
            options={{ 
              title: 'AddInNeed',
            }}
          />
           <Stack.Screen 
            name="AddDonation" 
            component={AddDonation} 
            options={{ 
              title: 'AddDonation',
            }}
          />
          <Stack.Screen 
  name="EventDetails" 
  component={EventDetails}
  options={{
    headerShown: false
  }}
/>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

