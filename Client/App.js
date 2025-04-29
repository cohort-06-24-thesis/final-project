
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';

const Stack = createStackNavigator();

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import SplashScreen from './screens/SplashScreen';
import LandingPage from './screens/LandingPage';


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
      </Stack.Navigator>
    </NavigationContainer>

    <View style={styles.container}>
      <Text>Hi m3ana rabbi</Text>
      <StatusBar style="auto" />
    </View>

  );
}
