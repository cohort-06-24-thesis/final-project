import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

const LandingPage = ({ onFinish }) => {
  const swiperRef = useRef(null);

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(1);
    }
  };

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      showsPagination={true}
      paginationStyle={styles.pagination}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    >
      <View style={styles.slide}>
        <Image source={require('../assets/logo.png')} style={styles.image} />
        <Text style={styles.text}>Welcome to Sadaꓘa</Text>
        <Text style={styles.subText}>For charity, please come to Sadaꓘa!</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.slide}>
        <Image source={require('../assets/philanthropists.png')} style={styles.image} />
        <Text style={styles.text}>Endorsed by over 10k Philanthropists</Text>
        <Text style={styles.subText}>Flexible and convenient charity platform.</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.slide}>
        <Image source={require('../assets/donate.png')} style={styles.image} />
        <Text style={styles.text}>Donate to charity anytime, anywhere.</Text>
        <Text style={styles.subText}>Convenient for activists and advocates.</Text>
        <TouchableOpacity style={styles.nextButton} onPress={onFinish}>
          <Text style={styles.nextButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FFF5',
    paddingHorizontal: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#00C44F',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 50,
  },
  dot: {
    backgroundColor: '#B2FFB2', // Light green for inactive dots
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#00C44F', // Bright green for active dot
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
});

export default LandingPage;
