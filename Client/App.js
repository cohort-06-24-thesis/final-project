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
    <View style={styles.container}>
      <Text>Hi m3ana rabbi</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
