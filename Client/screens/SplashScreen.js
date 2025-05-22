import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const SplashScreen = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logooo.png')} style={styles.logo} />
      <Text style={styles.title}>Sadaꓘa</Text>
      <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
        <Text style={styles.getStartedButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00C44F',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  getStartedButtonText: {
    color: '#00C44F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
