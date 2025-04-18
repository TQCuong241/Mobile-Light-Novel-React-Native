import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getImageUrl } from '@/services/dataAppwrite';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

interface Truyen {
  $id: string;
  name: string;
  mota_truyen: string;
  id_Image: string;
}

interface MoiNhatProps {
  data: Truyen[];
  theme: string;
  loading: { moiNhat: boolean };
}

const MoiNhat: React.FC<MoiNhatProps> = ({ data, theme, loading }) => {
  const [select, setSelect] = useState<Truyen | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelect(data[0]);
    }
  }, [data]);

  const handleSelectImage = (item: Truyen) => {
    setSelect(item);
  };

  const click = (id: string) => {
    router.push({
      pathname: '/(screens)/mota',
      params: { mota: id }
    });
  };

  // **Nếu đang loading, hiển thị hiệu ứng bộ xương (Skeleton Loading)**
  if (loading.moiNhat) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={[styles.titleCard, theme === 'light' ? styles.textNameLight : styles.textNameDark]}>
          Mới nhất
        </Text>
        <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(500)}
            style={[styles.animatedContainer, { height: 270 }]}
        >
          <View style={{width: '100%', height: 70}}>

          </View>
          <View>

          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.card}>
        <Text style={[styles.titleCard, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Mới nhất</Text>
        <TouchableOpacity style={styles.btnRight}>
          <Ionicons name="chevron-forward" size={25} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          const isSelected = select?.$id === item.$id;
          return (
            <TouchableOpacity
              style={[styles.cardTruyen, isSelected && styles.selectedImageBorder]}
              onPress={() => handleSelectImage(item)}
            >
              <Image source={{ uri: getImageUrl(item.id_Image) }} style={styles.imgView} transition={300}/>
            </TouchableOpacity>
          );
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        extraData={select}
        nestedScrollEnabled={true}
        removeClippedSubviews={true}
      />

      {select && (
        <View style={styles.selectedTruyenContainer}>
          <View style={{ flex: 33, paddingRight: 10, gap: 10 }}>
            <Text style={[styles.selectedTruyenTitle, theme === 'light' ? {color: 'black'} : {color: 'white'}]} 
                  numberOfLines={2} ellipsizeMode="tail">
              {select.name || 'Tên truyện'}
            </Text>
            <Text style={[styles.selectedMotaTruyen, theme === 'light' ? {color: 'black'} : {color: '#a9a9a9'}]} 
                  numberOfLines={5} ellipsizeMode="tail">
              {select.mota_truyen || 'Chưa có mô tả'}
            </Text>
            <TouchableOpacity style={styles.btnDoc} onPress={() => click(select.$id)}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Đọc</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 18 }}>
            <Image source={{ uri: getImageUrl(select.id_Image) }} 
                   style={styles.selectedTruyenImage} transition={300}/>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "white", // Hoặc đổi màu theo theme
    borderRadius: 10,
    padding: 10,
  },
  sectionContainer: {
    marginTop: 5,
    paddingHorizontal: 10,
  },
  titleCard: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '900',
    letterSpacing: 1,
  },
  textNameLight: {
    color: 'black',
  },
  textNameDark: {
    color: 'white',
  },
  horizontalSkeletonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  horizontalSkeletonItem: {
    width: 270,
    height: 100,
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalSkeletonImage: {
    width: '90%',
    height: '70%',
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  horizontalSkeletonText: {
    width: '60%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
  },
  darkSkeleton: {
    backgroundColor: '#444',
  },
  lightSkeleton: {
    backgroundColor: '#eee',
  },
  card: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  btnRight: {},
  cardTruyen: {
    marginTop: 13,
    height: 70,
    width: 55,
    marginHorizontal: 3,
    alignItems: 'center',
  },  
  flatListContainer: {
    paddingHorizontal: 7
  },
  imgView: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
  },
  selectedTruyenContainer: {
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    height: 200,
  },
  selectedTruyenTitle: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  selectedMotaTruyen: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'serif',
  },
  selectedTruyenImage: {
    width: 130,
    height: 170,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedImageBorder: {
    borderWidth: 2,
    borderColor: 'red', 
    borderRadius: 7,
  },
  btnDoc: {
    width: 100,
    height: 33,
    backgroundColor: "#fc597a",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    position: "absolute",
    bottom: 10,
  }
});

export default React.memo(MoiNhat);
