import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { database_id, databases, storage_id, storage, thong_tin_truyen_id, noi_dung_truyen_id, lich_su_id, comment_id, truyen_yeu_thich_id, tra_loi_comment_id } from '@/services/dataAppwrite'
import { Query, ID } from 'react-native-appwrite'
import Toast from 'react-native-toast-message'
import useThemeStore from '@/config/useThemeStore'

const dsTruyen = () => {
  const { dsTruyen }: { dsTruyen?: string } = useLocalSearchParams()
  const { theme } = useThemeStore()
  const styles = getStyles(theme)
  const [truyen, setTruyen] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      try{
        setLoading(true)
        if(dsTruyen){
          const result = await databases.listDocuments(
            database_id,
            thong_tin_truyen_id,
            [Query.equal('user_id', dsTruyen), Query.orderDesc('$createdAt')]
          )
          setTruyen(result.documents)
        }
      }catch(error){
        console.log(error)
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải danh sách truyện',
          position: 'top'
        })
      }finally{
        setLoading(false)
      }
    }
  
    fetchData()
  },[dsTruyen])
  
  const searchData = truyen.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )
  
  
  const toggleTrangThai = async (truyenId: string, currentStatus: number) => {
    setIsUpdatingStatus(truyenId)
    try {
      const newStatus = currentStatus === 1 ? 0 : 1
      await databases.updateDocument(
        database_id,
        thong_tin_truyen_id,
        truyenId,
        { trang_thai: newStatus }
      )
      
      setTruyen(prev => prev.map(item => 
        item.$id === truyenId ? {...item, trang_thai: newStatus} : item
      ))
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã cập nhật trạng thái thành ${newStatus === 1 ? 'Hoàn thành' : 'Đang tiến hành'}`,
        position: 'top'
      })
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error)
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể cập nhật trạng thái',
        position: 'top'
      })
    } finally {
      setIsUpdatingStatus(null)
    }
  }
  
  const dang_chapter = async (id: string) => {
    router.push({
      pathname: '/(admins)/(upChuong)/upChuong',
      params: {
        upChuong: id
      }
    })
  }
  
  const xoa_truyen = async (truyenId: string, idImage: string, bgrImage: string) => {
    setIsDeleting(truyenId)
    
    try {
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa truyện này? Toàn bộ chương, ảnh và lịch sử đọc sẽ bị xóa vĩnh viễn.',
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => setIsDeleting(null)
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                // 1. Xóa lịch sử đọc liên quan
                await xoa_lich_su_doc(truyenId)
                
                // 2. Xóa tất cả các chương của truyện
                await xoa_tat_ca_chuong(truyenId)

                await xoa_tat_ca_truyen_yeu_thich(truyenId)

                await xoa_tat_ca_binh_luan(truyenId)
                
                // 3. Xóa ảnh từ storage
                await xoa_anh(idImage)
                if (bgrImage) {
                  await xoa_anh(bgrImage)
                }
                
                // 4. Xóa thông tin truyện
                await databases.deleteDocument(
                  database_id,
                  thong_tin_truyen_id,
                  truyenId
                )
                
                setTruyen(prev => prev.filter(item => item.$id !== truyenId))
                
                Toast.show({
                  type: 'success',
                  text1: 'Thành công',
                  text2: 'Đã xóa truyện và toàn bộ dữ liệu liên quan',
                  position: 'top'
                })
              } catch (error) {
                console.error('Lỗi khi xóa truyện:', error)
                Toast.show({
                  type: 'error',
                  text1: 'Lỗi',
                  text2: 'Không thể xóa truyện hoàn toàn',
                  position: 'top'
                })
              } finally {
                setIsDeleting(null)
              }
            }
          }
        ]
      )
    } catch (error) {
      console.error('Lỗi khi hiển thị cảnh báo:', error)
      setIsDeleting(null)
    }
  }
  
  const xoa_lich_su_doc = async (truyenId: string) => {
    try {
      const histories = await databases.listDocuments(
        database_id,
        lich_su_id,
        [Query.equal('truyen_id', truyenId)]
      )
      
      for (const history of histories.documents) {
        await databases.deleteDocument(
          database_id,
          lich_su_id,
          history.$id
        )
      }
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử đọc:', error)
    }
  }
  
  const xoa_tat_ca_chuong = async (truyenId: string) => {
    try {
      const chapters = await databases.listDocuments(
        database_id,
        noi_dung_truyen_id,
        [Query.equal('id_truyen', truyenId)]
      )
      
      for (const chapter of chapters.documents) {
        await databases.deleteDocument(
          database_id,
          noi_dung_truyen_id,
          chapter.$id
        )
      }
    } catch (error) {
      console.error('Lỗi khi xóa chương:', error)
      throw error
    }
  }

  const xoa_tat_ca_binh_luan = async (truyenId: string) => {
    try {
      const comments = await databases.listDocuments(
        database_id,
        comment_id,
        [Query.equal('truyen_id', truyenId)]
      )

      for (const tra_loi of comments.documents) {
        await xoa_tra_loi(tra_loi.$id)
      }

      for (const comment of comments.documents) {
        await databases.deleteDocument(
          database_id,
          comment_id,
          comment.$id
        )
      }
    } catch (error) {
      console.error('Lỗi khi xóa Comment:', error)
      throw error
    }
  }

  const xoa_tra_loi = async (id: string) => {
      try{
        const tra_loi = await databases.listDocuments(
          database_id,
          tra_loi_comment_id,
          [Query.equal('comment_id', id)]
        )
        for (const i of tra_loi.documents) {
          await databases.deleteDocument(
            database_id,
            tra_loi_comment_id,
            i.$id
          )
        }
      }catch{}
  }

  const xoa_tat_ca_truyen_yeu_thich = async (truyenId: string) => {
    try {
      const truyenLove = await databases.listDocuments(
        database_id,
        truyen_yeu_thich_id,
        [Query.equal('truyen_id', truyenId)]
      )
      
      for (const truyen of truyenLove.documents) {
        await databases.deleteDocument(
          database_id,
          truyen_yeu_thich_id,
          truyen.$id
        )
      }
    } catch (error) {
      console.error('Lỗi khi xóa Comment:', error)
      throw error
    }
  }
  
  const xoa_anh = async (fileId: string) => {
    try {
      await storage.deleteFile(storage_id, fileId)
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error)
    }
  }
  
  const chinh_sua_truyen = (id: string) => {
    router.push({
      pathname: '/(admins)/upTruyen',
      params: {
        upTruyen: id
      }
    })
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          item.trang_thai === 1 ? styles.completedBadge : styles.inProgressBadge
        ]}>
          <Text style={styles.statusText}>
            {item.trang_thai === 1 ? 'Hoàn thành' : 'Đang tiến hành'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => toggleTrangThai(item.$id, item.trang_thai)}
          disabled={isUpdatingStatus === item.$id}
        >
          {isUpdatingStatus === item.$id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {item.trang_thai === 1 ? 'Chưa HT' : 'Hoàn thành'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => dang_chapter(item.$id)}
        >
          <Text style={styles.buttonText}>Thêm chương</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => chinh_sua_truyen(item.$id)}
        >
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => xoa_truyen(item.$id, item.id_Image, item.bgr_image)}
          disabled={isDeleting === item.$id}
        >
          {isDeleting === item.$id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Xóa</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <TouchableOpacity 
          style={[styles.backButton, theme === 'light' ? {backgroundColor: 'white'} : {backgroundColor: '#121212'}]}
          onPress={() => router.back()}
      >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
        />
        <Text style={styles.backText}>Trở lại</Text>
      </TouchableOpacity>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm truyện..."
          placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme === 'dark' ? '#bb86fc' : '#673ab7'} />
            <Text style={styles.loadingText}>Đang tải danh sách truyện...</Text>
          </View>
        ) : searchData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="book-outline" 
              size={48} 
              color={theme === 'dark' ? '#666' : '#999'} 
            />
            <Text style={styles.emptyText}>
              {search ? 'Không tìm thấy truyện phù hợp' : 'Chưa có truyện nào'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={searchData}
            keyExtractor={(item) => item.$id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <Toast />
    </>
  )
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    padding: 16
  },
  searchInput: {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    color: theme === 'dark' ? 'white' : 'black',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ddd'
  },
  itemContainer: {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: theme === 'dark' ? '#000' : '#888',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? 'white' : '#333',
    flex: 1
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  completedBadge: {
    backgroundColor: theme === 'dark' ? '#2e7d32' : '#4caf50'
  },
  inProgressBadge: {
    backgroundColor: theme === 'dark' ? '#ff8f00' : '#ff9800'
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  actionButton: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusButton: {
    backgroundColor: theme === 'dark' ? '#bb86fc' : '#673ab7'
  },
  addButton: {
    backgroundColor: theme === 'dark' ? '#03dac6' : '#2196f3'
  },
  editButton: {
    backgroundColor: theme === 'dark' ? '#ffb74d' : '#ff9800'
  },
  deleteButton: {
    backgroundColor: theme === 'dark' ? '#cf6679' : '#f44336'
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: theme === 'dark' ? '#aaa' : '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme === 'dark' ? '#aaa' : '#666'
  },
  listContainer: {
    paddingBottom: 20
  },
  backButton:{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 20, 
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: theme === 'dark' ? '#bb86fc' : '#673ab7',
  }
})

export default dsTruyen
