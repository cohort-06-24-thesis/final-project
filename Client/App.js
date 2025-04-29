import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';
import SplashScreen from './screens/SplashScreen';
import LandingPage from './screens/LandingPage';
import Home from './screens/Home'; // ✅ Import Home screen

const Stack = createStackNavigator();

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
            name="Home" 
            component={Home} 
            options={{ 
              title: 'Welcome',
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

