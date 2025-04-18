import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useThemeStore from '@/config/useThemeStore'
import { router } from 'expo-router'
import useUser from '@/hooks/useUser'
import { useEffect, useState } from 'react'
import { database_id, databases, getImageUrl, quyen_dang_truyen_id, thong_tin_nguoi_dung_id, thong_tin_truyen_id } from '@/services/dataAppwrite'
import { ID, Query } from 'react-native-appwrite'
import moment from 'moment'
import Toast from 'react-native-toast-message'
import BorderAvatar from '@/components/common/BorderAvatar'

const ProfileScreen = () => {
  const { theme } = useThemeStore()
  const { user } = useUser()
  const [data, setData] = useState<any>([])
  const [countTruyen, setCountTruyen] = useState(0)

  useEffect(() => {
    
    if (user && user.$id) {
        load_User();
        load_truyen()
    }
  },[user])
  

  const load_User = async () => {
    try{
        if(user){
            const result = await databases.listDocuments(
                database_id,
                thong_tin_nguoi_dung_id,
                [Query.equal('$id', user.$id)]
            )
            setData(result.documents)
        }
    }catch{}
  }

  const load_truyen = async () => {
    try{
        const result = await databases.listDocuments(
            database_id,
            thong_tin_truyen_id,
            [Query.equal('user_id', user.$id), Query.select(['$id'])]
        )
        setCountTruyen(result.documents.length)
    }catch{}
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    header: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      margin: 10,
      borderRadius: 20
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#bb86fc' : '#673ab7',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 15,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    section: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      margin: 10,
      padding: 15,
      borderRadius: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: theme === 'dark' ? '#bb86fc' : '#673ab7',
    },
    text: {
      fontSize: 16,
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      lineHeight: 24,
    },
    hobbyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingTop: 20, 
      },
      backText: {
        fontSize: 16,
        marginLeft: 5,
        color: theme === 'dark' ? '#bb86fc' : '#673ab7',
      },
      highlightText: {
        color: theme === 'dark' ? '#4CAF50' : '#2E7D32', // Màu xanh lá đậm
        fontWeight: 'bold',
        fontSize: 18,
      },
      btn: {
        flexDirection: 'row',
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
      },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
        <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={() => router.back()}
        >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
        />
        <Text style={dynamicStyles.backText}>Trở lại</Text>
      </TouchableOpacity>

      {/* Phần header với avatar */}
      <View style={dynamicStyles.header}>
        <BorderAvatar 
          avatarSource= {data[0]?.id_image ? data[0].id_image : 'imageUser'}
          frameSource={data[0]?.id_image_vien ? data[0].id_image_vien : ''}
          size={200}
          avatarSizeRatio={0.65}
        />
        {/* <Image 
          source={{ uri: data[0]?.id_image ? getImageUrl(data[0].id_image) : 'imageUser' }}
          style={dynamicStyles.avatar}
        /> */}
        <Text style={dynamicStyles.name}>{data[0]? data[0].name : 'Chua co ten'}</Text>
      </View>

      {/* Phần thông tin email */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>
          <Ionicons 
            name="mail" 
            size={18} 
            color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
          /> Thông tin liên hệ
        </Text>
        <Text style={dynamicStyles.text}>{data[0] ? data[0].email : 'undefned'}</Text>
      </View>

      {/* Phần giới thiệu bản thân */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>
          <Ionicons 
            name="information-circle" 
            size={18} 
            color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
          /> Giới thiệu
        </Text>
        <Text style={dynamicStyles.text}>{data[0] ? data[0].so_thich : 'undefned'}</Text>
      </View>

      {/* Phần sở thích */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>
          <Ionicons 
            name="heart" 
            size={18} 
            color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
          /> Một số thông tin khác
        </Text>
            <View style={dynamicStyles.hobbyItem}>
                <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
                    style={{ marginRight: 8 }}
                />
                <Text style={dynamicStyles.text}>
                    Số Truyện đã đăng:   <Text style={dynamicStyles.highlightText}>{countTruyen ? countTruyen : 0}</Text>
                </Text>
            </View>
            <View style={dynamicStyles.hobbyItem}>
                <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
                style={{ marginRight: 8 }}
                />
                <Text style={dynamicStyles.text}>
                    Số hoa đã tặng:   <Text style={dynamicStyles.highlightText}>{data[0] ? data[0].count_hoa_da_tang : 0}</Text>
                </Text>
            </View>
            <View style={dynamicStyles.hobbyItem}>
                <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
                style={{ marginRight: 8 }}
                />
                <Text style={dynamicStyles.text}>
                    Tham gia cộng đồng:   <Text style={dynamicStyles.highlightText}>{moment(data[0]?.$createdAt || new Date()).format('DD/MM/YYYY')}</Text>
                </Text>
            </View>
        </View>
        {data[0]?.is_admin === 0 && (
            <>
                <TouchableOpacity 
                    style={dynamicStyles.btn} 
                    onPress={() => router.push('/(admins)/xinQuyen')}
                >
                    <Text style={{ color: theme === 'light' ? 'black' : 'white' }}>
                        Xin quyền đăng truyện
                    </Text>
                    <Ionicons 
                        name='chevron-forward' 
                        size={24} 
                        color={theme === 'light' ? 'black' : 'white'}
                    />
                </TouchableOpacity>
                <Toast />
            </>
        )}

    </ScrollView>
  );
};

export default ProfileScreen;