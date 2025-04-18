import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import useThemeStore from '@/config/useThemeStore'
import BodyVip from '@/components/BodyVip'
import Ionicons from '@expo/vector-icons/Ionicons'
import {database_id, databases, thong_tin_nguoi_dung_id, thong_tin_truyen_id } from '@/services/dataAppwrite'
import { Query } from 'react-native-appwrite'
import ListTruyen from '@/components/list/ListTruyen'
import ListTruyen2 from '@/components/list/ListTruyen2'
import { router } from 'expo-router'
import useUser from '@/hooks/useUser'
import MoiNhat from '@/components/list/MoiNhat'
import { useFocusEffect } from '@react-navigation/native'
import BorderAvatar from '@/components/common/BorderAvatar'
import CarouselSlider from '@/components/header/CarouselSlider'

const HomeScreen = () => {
  const {theme, loadTheme} = useThemeStore()
  const [data, setData] = useState<any[]>([])
  const [moihoanthanh, setMoihoanthanh] = useState<any[]>([])
  const [dataUser, setDataUser] = useState<any>()
  const [moidang, setMoidang] = useState<any[]>([])
  const [xemnhieu, setXemnhieu] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState({
    moiNhat: true,
    xemNhieu: true,
    moiDang: true,
    moiHoanThanh: true
  })
  const { user, isLoggedIn } = useUser()


  // Hàm reset dữ liệu khi logout
  const resetData = useCallback(() => {
    setData([])
    setMoihoanthanh([])
    setDataUser(null)
    setMoidang([])
    setXemnhieu([])
    setLoading({
      moiNhat: true,
      xemNhieu: true,
      moiDang: true,
      moiHoanThanh: true
    })
  }, [])

  // Hàm load dữ liệu
  const loadAllData = useCallback(async () => {
    try {
      setRefreshing(true)
      setLoading({
        moiNhat: true,
        xemNhieu: true,
        moiDang: true,
        moiHoanThanh: true
      })
      
      await Promise.all([
        load_truyen_moi(),
        load_truyen_moi_hoan_thanh(),
        load_truyen_moi_dang(),
        load_truyen_xem_nhieu(),
        isLoggedIn ? load_thong_tin_user() : Promise.resolve()
      ])
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setRefreshing(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    loadTheme()
    loadAllData()
  }, [])
  
  
  useFocusEffect(useCallback(() => { 
    if (!isLoggedIn) {
      resetData()
    }
    loadAllData() 
  }, [isLoggedIn]))

  // Các hàm load dữ liệu cụ thể
  const load_truyen_moi = async () => {
    try {
      const result = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [Query.orderDesc('update_new_chapter'), Query.limit(20)]
      )
      setData(result.documents)
    } catch(error) {
      console.log(error)
    } finally {
      setLoading(prev => ({...prev, moiNhat: false}))
    }
  }

  const load_thong_tin_user = async () => {
    try{
        if(user){
            const result = await databases.listDocuments(
                database_id,
                thong_tin_nguoi_dung_id,
                [Query.equal('$id', user.$id)]
            )
            setDataUser(result.documents)
        }
    }catch{}
  }

  const load_truyen_moi_hoan_thanh = async () => {
    try {
      const result = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [Query.equal('trang_thai', 1), Query.orderDesc('update_new_chapter'), Query.limit(12)]
      )
      setMoihoanthanh(result.documents)
    } catch(error) {
      console.log(error)
    } finally {
      setLoading(prev => ({...prev, moiHoanThanh: false}))
    }
  }

  const load_truyen_moi_dang = async () => {
    try {
      const result = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [Query.orderDesc('$createdAt'), Query.limit(12)]
      )
      setMoidang(result.documents)
    } catch(error) {
      console.log(error)
    } finally {
      setLoading(prev => ({...prev, moiDang: false}))
    }
  }

  const load_truyen_xem_nhieu = async () => {
    try {
      const result = await databases.listDocuments(
        database_id,
        thong_tin_truyen_id,
        [Query.orderDesc('view_truyen'), Query.limit(15)]
      )
      setXemnhieu(result.documents)
    } catch(error) {
      console.log(error)
    } finally {
      setLoading(prev => ({...prev, xemNhieu: false}))
    }
  }

  // Component loading cho carousel
  const LoadingCarousel = () => (
    <View style={[styles.sliderContainer, styles.loadingContainer]}>
      <ActivityIndicator size="large" color={theme === 'dark' ? '#e06af5' : '#fc597a'} />
    </View>
  )


  // Memo các component
  const MemoXemNhieu = React.memo(ListTruyen2)
  const MenoMoiDang = React.memo(ListTruyen)
  const MenoMoiHoanThanh = React.memo(ListTruyen2)

  return (
    <BodyVip 
      theme={theme}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadAllData}
          colors={theme === 'dark' ? ['#fc597a'] : ['#000000']}
          progressBackgroundColor={theme === 'dark' ? '#bbff32' : '#ffffff'}
          tintColor={theme === 'dark' ? '#ffffff' : '#000000'}
        />
      }
    >
      {/* Header */}
      <View style={styles.container}>
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}} onPress={() => router.push('/(screens)/profile')}>
          <BorderAvatar 
            avatarSource={dataUser ? dataUser[0]?.id_image : 'imageUser'}
            frameSource={dataUser ? dataUser[0]?.id_image_vien : ''}
            size={60}
            avatarSizeRatio={0.65}
          />
          <Text style={[styles.textName, theme === 'light' ? styles.textNameLight : styles.textNameDark]}>
            {user ? user.name : 'Không đăng nhập'}
          </Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity style={styles.btnIcon} onPress={() => router.push('/(screens)/search')}>
            <Ionicons name="search" size={23} color={theme === 'light' ? 'black' : 'white'}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnIcon} onPress={() => router.push('/(screens)/filter')}>
            <Ionicons name="list" size={23} color={theme === 'light' ? 'black' : 'white'}/>
          </TouchableOpacity>
        </View>
      </View>
      
      <CarouselSlider loading={loading} data={data} />

      <MoiNhat data={data} theme={theme} loading={{ moiNhat: loading.moiNhat }} />

      {/* Xem nhiều */}
      {loading.xemNhieu ? <Text></Text> : (
        <MemoXemNhieu title='Xem nhiều' data={xemnhieu} onPress={(id) => router.push(`/(screens)/mota?mota=${id}`)} theme={theme} />
      )}

      {/* Mới đăng */}
      {loading.moiDang ? <Text></Text> : (
        <>
          <View style={styles.card}>
            <Text style={[styles.titleCard, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Mới đăng</Text>
            <TouchableOpacity style={styles.btnRight}>
              <Ionicons name="chevron-forward" size={25} color={theme === 'light' ? 'black' : 'white'}/>
            </TouchableOpacity>
          </View>
          <MenoMoiDang data={moidang} onPress={(id) => router.push(`/(screens)/mota?mota=${id}`)} theme={theme}/>
        </>
      )}

      {/* Mới hoàn thành */}
      {loading.moiHoanThanh ? <Text></Text> : (
        <MenoMoiHoanThanh 
          title='Mới hoàn thành' 
          data={moihoanthanh} 
          onPress={(id) => router.push(`/(screens)/mota?mota=${id}`)} 
          theme={theme} 
        />
      )}
    </BodyVip>
  )
}

const styles = StyleSheet.create({
  // Header styles
  btnIcon: {
    padding: 10,
    borderRadius: 8,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  textName: {
    fontSize: 20,
    fontFamily: 'serif'
  },
  textNameLight: {},
  textNameDark: {
    color: 'white'
  },

  // Carousel styles
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    height: 200,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#a9a9a9'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section styles
  sectionContainer: {
    marginVertical: 5
  },
  sectionTitle: {
    paddingHorizontal: 10,
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '900',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  titleCard: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnRight: {},

  // Skeleton styles
  horizontalSkeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  horizontalSkeletonItem: {
    width: '100%',
    marginRight: 15,
  },
  horizontalSkeletonImage: {
    width: '100%',
    height: 70,
    marginTop: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  horizontalSkeletonText: {
    height: 190,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },

  verticalSkeletonContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  verticalSkeletonItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  verticalSkeletonImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
  },
  verticalSkeletonTextContainer: {
    flex: 1,
  },
  verticalSkeletonText: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
    width: '100%',
  },

  // Theme
  darkSkeleton: {
    backgroundColor: '#2a2a2a',
  },
  lightSkeleton: {
    backgroundColor: '#f5f5f5',
  },
})

export default HomeScreen