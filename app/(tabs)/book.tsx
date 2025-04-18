import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Body from '@/components/Body'
import useThemeStore from '@/config/useThemeStore'
import { account, database_id, databases, getImageUrl, lich_su_id, thong_tin_truyen_id, truyen_yeu_thich_id } from '@/services/dataAppwrite';
import { Query } from 'react-native-appwrite'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'

const book = () => {
  const {theme} = useThemeStore()
  const [select, setSelect] = useState<number>(0)
  const [tuTruyen, setTuTruyen] = useState<any[]>([])
  const [tuTruyenLove, setTuTruyenLove] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  
  const loadAllData = useCallback(async () => {
    try {
      setRefreshing(true)
      await Promise.all([
        fetchData(),
        data_yeu_thich()
      ])
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  },[])

  useFocusEffect(
    useCallback(() => {
      loadAllData()
    }, [])
  )

  const fetchData = async () => {
    try {
      const user = await account.get();
      if (!user || !user.$id) return;

      const result = await databases.listDocuments(
        database_id,
        lich_su_id,
        [Query.equal('user_id', user.$id), Query.select(['truyen_id', 'chap_number', 'thoi_gian_xem_truyen'])]
      );

      // Lấy thông tin truyện theo danh sách truyen_id
      const truyenIds = result.documents.map(item => item.truyen_id);
      if (truyenIds.length === 0) {
        setTuTruyen([]);
        return;
      }

      const truyenData = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [Query.equal('$id', truyenIds), Query.select(['name', 'id_Image', '$id', 'tac_gia', 'view_truyen', 'tong_so_chuong'])]
      );

      // Gộp thông tin truyện với lịch sử đọc
      const mergedData = truyenData.documents.map(truyen => {
        const historyItem = result.documents.find(item => item.truyen_id === truyen.$id);
        return {
          ...truyen,
          chap_number: historyItem ? historyItem.chap_number : 0,
          thoi_gian_xem_truyen: historyItem ? historyItem.thoi_gian_xem_truyen : 0,
        };
      });

      // Sắp xếp theo thời gian đọc gần nhất
      mergedData.sort((a, b) =>
        new Date(b.thoi_gian_xem_truyen).getTime() - new Date(a.thoi_gian_xem_truyen).getTime()
      );

      setTuTruyen(mergedData);
    } catch{}
  };

  const data_yeu_thich = async () => {
    try {
      const user = await account.get();
      if (!user || !user.$id) return;

      setLoadingFavorite(true);
      const result = await databases.listDocuments(
        database_id,
        truyen_yeu_thich_id,
        [Query.equal('user_id', user.$id), Query.select(['truyen_id'])]
      );
  
      if (result.documents.length === 0) {
        setTuTruyenLove([]);
        return;
      }
  
      const truyenIds = result.documents.map(item => item.truyen_id);
      const truyenData = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [
          Query.equal('$id', truyenIds), 
          Query.select(['name', 'id_Image', '$id', 'tac_gia', 'view_truyen', 'tong_so_chuong']),
          Query.orderDesc('$createdAt')
        ]
      );
  
      setTuTruyenLove(truyenData.documents);
    } catch (error) {
    } finally {
      setLoadingFavorite(false);
    }
  };

  const mota = async (id: string) => {
    router.push({
      pathname: '/(screens)/mota',
      params: {
        mota: id
      }
    })
  } 

  const handleRefresh = () => {
    loadAllData()
  }

  return (
    <Body theme = {theme}
    >
      <Text style = {[styles.title, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Tủ Truyện</Text>
      <View style={styles.containerTop}>
        <TouchableOpacity style={[styles.btnSelect, select === 0 && {borderBottomWidth: 2, borderColor: theme === 'light' ? 'black' : 'white'}]} onPress={() => setSelect(0)}>
          <Text style = {[theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSelect, select === 1 && {borderBottomWidth: 2, borderColor: theme === 'light' ? 'black' : 'white'}]} onPress={() => setSelect(1)}>
          <Text style = {[theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Yêu thích</Text>
        </TouchableOpacity>
      </View>

      {/* show view */}

      {select === 0 ? (
        <FlatList
          data= {tuTruyen}
          keyExtractor = {(item) => item.$id}
          renderItem = {({item}) => {
            return(
              <TouchableOpacity
                  style={styles.cardTruyen}
                  onPress={() => mota(item.$id)}
              >
                  <Image source={{ uri: getImageUrl(item.id_Image) }} style={styles.imgView} transition={300}/>
                  <View style={{gap: 12}}>
                    <Text style={[styles.nameTruyen, {fontSize: 17},theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.nameTruyen, theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={2}>
                      Đang đọc  {item.chap_number} / {item.tong_so_chuong}
                    </Text>
                  </View>
              </TouchableOpacity>
            )
          }}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={theme === 'dark' ? ['#fc597a'] : ['#000000']} // Màu icon loading
              progressBackgroundColor={theme === 'dark' ? '#bbff32' : '#ffffff'} // Màu nền
              tintColor={theme === 'dark' ? '#ffffff' : '#000000'} // Màu icon pull-to-refresh
            />
          }
        />
      ):(
        <FlatList
          data= {tuTruyenLove}
          keyExtractor = {(item) => item.$id}
          renderItem = {({item}) => {
            return(
              <TouchableOpacity
                  style={styles.cardTruyen}
                  onPress={() => mota(item.$id)}
              >
                  <Image source={{ uri: getImageUrl(item.id_Image) }} style={styles.imgView} transition={300}/>
                  <Text style={[styles.nameTruyen, theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={2}>
                    {item.name}
                  </Text>
              </TouchableOpacity>
            )
          }}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={theme === 'dark' ? ['#fc597a'] : ['#000000']} // Màu icon loading
              progressBackgroundColor={theme === 'dark' ? '#bbff32' : '#ffffff'} // Màu nền
              tintColor={theme === 'dark' ? '#ffffff' : '#000000'} // Màu icon pull-to-refresh
            />
          }
        />
      )}
    </Body>
  )
}

export default book

const styles = StyleSheet.create({
  containerTop: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 10
  },

  btnSelect: {
    padding: 10
  },

  cardTruyen: {
    flexDirection: 'row',
    gap: 20,
    margin: 10,
    alignItems: 'center',
    width: '100%',
  },

  imgView: {
    height: 120,
    width: 85,
    borderRadius: 20
  },

  nameTruyen: {
    maxWidth: 270,
  },

  title: {
    marginTop: 20,
    marginHorizontal: 30,
    fontSize: 20
  }
})