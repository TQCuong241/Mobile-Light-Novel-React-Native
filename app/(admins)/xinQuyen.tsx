import { StyleSheet, Text, TouchableOpacity, View, TextInput, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import { database_id, databases, noi_dung_truyen_id, quyen_dang_truyen_id, storage, storage_id, thong_bao_id, thong_tin_nguoi_dung_id, thong_tin_truyen_id } from '@/services/dataAppwrite'
import { ID, Query } from 'react-native-appwrite'
import Toast from 'react-native-toast-message'
import useThemeStore from '@/config/useThemeStore'
import useUser from '@/hooks/useUser'
import BodyVip from '@/components/BodyVip'

const xinQuyen = () => {
    const [name, setName] = useState('')
    const [lyDo, setLyDo] = useState('')
    const [CCCD, setCCCD] = useState('')
    const [SDT, setSDT] = useState('')
    const [anhTruoc, setAnhTruoc] = useState<string | null>(null)
    const [anhSau, setAnhSau] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { theme } = useThemeStore()
    const styles = getStyles(theme)
    const {user} = useUser()

    type SetImageFunction = React.Dispatch<React.SetStateAction<string | null>>

    const pickImage = async (setImage: SetImageFunction) => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        })
        if (!result.canceled) {
        setImage(result.assets[0].uri)
        }
  }

    const validateForm = () => {
        if (!name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên',
                position: 'top'
            });
            return false;
        }

        if (!lyDo.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập lý do',
                position: 'top'
            });
            return false;
        }

        if (!CCCD.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập Căn cước công dân',
                position: 'top'
            });
            return false;
        }

        if (!SDT.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập SDT',
                position: 'top'
            });
            return false;
        }

        if (!anhTruoc) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng chọn ảnh trước',
                position: 'top'
            });
            return false;
        }

        if (!anhSau) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng chọn ảnh sau',
                position: 'top'
            });
            return false;
        }

        return true;
    };

  const dang_truyen = async () => {
    if (!validateForm()) return;
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
        if(user){
            const result = await databases.listDocuments(
                database_id,
                quyen_dang_truyen_id,
                [Query.equal('user_id', user.$id)]
            )
            if(result.documents.length > 0){
                Toast.show({
                    type: 'error',
                    text1: 'Bạn đã xin quyền đăng truyện rồi',
                    position: 'top'
                })
            }else{
                const anhTruocId = await uploadImage(anhTruoc);
                const anhSauId = await uploadImage(anhSau);
          
                if (!anhTruocId || !anhSauId) {
                  throw new Error('Lỗi khi upload ảnh');
                }

                const create = await databases.createDocument(
                    database_id,
                    quyen_dang_truyen_id,
                    ID.unique(),
                    {
                        user_id: user.$id,
                        name: name,
                        ly_do: lyDo,
                        CCCD: CCCD,
                        SDT: SDT,
                        id_anh_truoc: anhTruocId,
                        id_anh_sau: anhSauId
                    }
                )

                await createNotification()

                Toast.show({
                    type: 'success',
                    text1: 'Xin quyền thành công!',
                    text2: 'Vui lòng đợi admin xét duyệt',
                    position: 'top'
                })
                setTimeout(() => router.back(), 1000);
            }
        }
      
    } catch(error) {
      console.log('Lỗi', error)
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Xin quyền. Vui lòng thử lại!',
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

    const createNotification = async () => {
        try {
        if (!user) throw new Error('User not found');
        
        await databases.createDocument(
            database_id,
            thong_bao_id,
            ID.unique(),
            {
                user_id: user.$id,
                tieu_de: 'Yêu cầu quyền đăng truyện',
                noi_dung_thong_bao: `Bạn đã gửi yêu cầu quyền đăng truyện thành công vào ${new Date().toLocaleString()}. Mã yêu cầu: ${ID.unique()}`,
                trang_thai: 0,
                level: 1,
            }
        );
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const uploadImage = async (imageUri: string | null) => {
        if (!imageUri) return null;
        
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            // Tạo tên file từ timestamp
            const fileName = `image_${Date.now()}.jpg`;
            
            const fileId = ID.unique();
            
            // Tạo object file đúng định dạng yêu cầu
            const file = {
            name: fileName,
            type: blob.type || 'image/jpeg',
            size: blob.size,
            uri: imageUri,
            blob: blob // Thêm blob vào object
            };
            
            await storage.createFile(
            storage_id, 
            fileId, 
            file // Truyền object file thay vì chỉ blob
            );
        
            return fileId;
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Không thể upload ảnh',
              position: 'top'
            });
            return null;
        }
    };

  return (
    <BodyVip theme={theme}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điền thông tin</Text>
        <View></View>
      </View>

      <View style={styles.container}>
        <TextInput
          style={[
            styles.input,
            !name.trim() && styles.inputError
          ]}
          placeholder="Họ và tên"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[
            styles.textArea,
            !lyDo.trim() && styles.inputError
          ]}
          placeholder="Lý do"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={lyDo}
          onChangeText={setLyDo}
        />
        <TextInput
          style={[
            styles.input,
            !CCCD.trim() && styles.inputError
          ]}
          placeholder="Căng cước công dân"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={CCCD}
          onChangeText={setCCCD}
        />
        <TextInput
          style={[
            styles.input,
            !SDT.trim() && styles.inputError
          ]}
          placeholder="Số điện thoại"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={SDT}
          onChangeText={setSDT}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={[
            styles.imagePicker,
            !anhTruoc && styles.imagePickerError
          ]} 
          onPress={() => pickImage(setAnhTruoc)}
        >
          {anhTruoc ? (
            <Image source={{ uri: anhTruoc }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>Chọn ảnh căn cước phía trước</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.imagePicker,
            !anhSau && styles.imagePickerError
          ]} 
          onPress={() => pickImage(setAnhSau)}
        >
          {anhSau ? (
            <Image source={{ uri: anhSau }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>Chọn ảnh căn cước phía sau</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]} 
          onPress={dang_truyen}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </BodyVip>
  )
}

const getStyles = (theme: string) => StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: theme === 'light' ? '#fff' : '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: theme === 'light' ? '#eee' : '#333'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'light' ? 'black' : 'white'
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e'
  },
  input: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D',
    color: theme === 'light' ? 'black' : 'white'
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: theme === 'light' ? '#FFF0F0' : '#3A1E1E'
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    height: 150,
    fontSize: 16,
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D',
    textAlignVertical: 'top',
    color: theme === 'light' ? 'black' : 'white'
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D'
  },
  imagePickerError: {
    borderColor: 'red',
    backgroundColor: theme === 'light' ? '#FFF0F0' : '#3A1E1E'
  },
  imagePickerText: {
    color: theme === 'light' ? '#666' : '#999'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D'
  },
  picker: {
    width: '100%',
    height: 50,
    color: theme === 'light' ? 'black' : 'white'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonDisabled: {
    backgroundColor: theme === 'light' ? '#CCCCCC' : '#444',
    opacity: 0.7
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
})

export default xinQuyen