import { getImageUrl } from '@/services/dataAppwrite';
import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet, Animated, Text } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

interface CarouselSliderProps {
  loading: { moiNhat: boolean }; 
  data: { $id: string; bgr_image: string }[];
}

const CarouselSlider: React.FC<CarouselSliderProps> = ({ loading, data }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  if (loading.moiNhat) {
    return (
      <Animated.View style={[styles.loadingContainer, { opacity }]}>
        <View style={styles.skeletonBox}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.sliderContainer}>
      <Carousel
        loop
        width={width} 
        height={200}
        autoPlay={true}
        autoPlayInterval={3000}
        data={data}
        scrollAnimationDuration={1000}
        pagingEnabled={true}
        snapEnabled={true}
        renderItem={({ item }: { item: { $id: string; bgr_image: string } }) => (
          <TouchableOpacity key={item.$id} activeOpacity={0.8} style={{ marginHorizontal: 10 }}>
            <Image 
              source={{ uri: getImageUrl(item.bgr_image) }} 
              style={styles.image} 
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  loadingContainer: {
    height: 200,
    width: width - 20,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  skeletonBox: {
    height: 200,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  }
});

export default CarouselSlider;
