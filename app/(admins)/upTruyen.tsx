import { StyleSheet, Text, TouchableOpacity, View, TextInput, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import { database_id, databases, storage, storage_id, thong_tin_nguoi_dung_id, thong_tin_truyen_id } from '@/services/dataAppwrite'
import { ID } from 'react-native-appwrite'
import Toast from 'react-native-toast-message'
import useThemeStore from '@/config/useThemeStore'

const DangTruyen = () => {
  const { upTruyen }:{ upTruyen? : string} = useLocalSearchParams()
  const [tenTruyen, setTenTruyen] = useState<string>('')
  const [tacGia, setTacGia] = useState<string>('')
  const [moTa, setMoTa] = useState<string>('')
  const [theLoai, setTheLoai] = useState<string>('Huyền huyễn')
  const [anhTruyen, setAnhTruyen] = useState<string | null>(null)
  const [backgrAnh, setBackgrAnh] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useThemeStore()
  const styles = getStyles(theme)

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
    if (!tenTruyen.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập tên truyện',
        position: 'top'
      });
      return false;
    }

    if (!tacGia.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập tác giả',
        position: 'top'
      });
      return false;
    }

    if (!moTa.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mô tả truyện',
        position: 'top'
      });
      return false;
    }

    if (!anhTruyen) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn ảnh truyện',
        position: 'top'
      });
      return false;
    }

    if (!backgrAnh) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn background',
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
      const anhTruyenId = await uploadImage(anhTruyen);
      const backgrAnhId = await uploadImage(backgrAnh);

      if (!anhTruyenId || !backgrAnhId) {
        throw new Error('Lỗi khi upload ảnh');
      }

      const result = await databases.createDocument(
        database_id,
        thong_tin_truyen_id,
        ID.unique(),
        {
          name: tenTruyen,
          id_Image: anhTruyenId,
          tac_gia: tacGia,
          view_truyen: 0,
          mota_truyen: moTa,
          bgr_image: backgrAnhId,
          update_new_chapter: new Date().toISOString(),
          tong_so_chuong: 0,
          trang_thai: 0,
          the_loai: theLoai,
          user_id: upTruyen
        }
      )

      // Reset form sau khi đăng thành công
      setTenTruyen('')
      setTacGia('')
      setMoTa('')
      setBackgrAnh(null)
      setAnhTruyen(null)

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Đăng truyện thành công 🎉',
        position: 'top'
      });

      // Tự động quay lại sau 1.5 giây
      setTimeout(() => router.back(), 1500);
      
    } catch(error) {
      console.log('Lỗi', error)
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đăng truyện thất bại. Vui lòng thử lại!',
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng truyện</Text>
        <View></View>
      </View>

      <View style={styles.container}>
        <TextInput
          style={[
            styles.input,
            !tenTruyen.trim() && styles.inputError
          ]}
          placeholder="Tên truyện"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={tenTruyen}
          onChangeText={setTenTruyen}
        />
        <TextInput
          style={[
            styles.input,
            !tacGia.trim() && styles.inputError
          ]}
          placeholder="Tác giả"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={tacGia}
          onChangeText={setTacGia}
        />
        <TextInput
          style={[
            styles.textArea,
            !moTa.trim() && styles.inputError
          ]}
          placeholder="Mô tả truyện"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          value={moTa}
          onChangeText={setMoTa}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={[
            styles.imagePicker,
            !anhTruyen && styles.imagePickerError
          ]} 
          onPress={() => pickImage(setAnhTruyen)}
        >
          {anhTruyen ? (
            <Image source={{ uri: anhTruyen }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>Chọn ảnh truyện</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.imagePicker,
            !backgrAnh && styles.imagePickerError
          ]} 
          onPress={() => pickImage(setBackgrAnh)}
        >
          {backgrAnh ? (
            <Image source={{ uri: backgrAnh }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>Chọn background ảnh</Text>
          )}
        </TouchableOpacity>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={theLoai}
            onValueChange={(itemValue) => setTheLoai(itemValue)}
            style={styles.picker}
            dropdownIconColor={theme === 'light' ? '#000' : '#fff'}
          >
            <Picker.Item label="Huyền huyễn" value="Huyền huyễn" />
            <Picker.Item label="Hệ thống" value="Hệ thống" />
            <Picker.Item label="Đô thị" value="Đô thị" />
            <Picker.Item label="Xuyên không" value="Xuyên không" />
            <Picker.Item label="Huyền nghi" value="Huyền nghi" />
            <Picker.Item label="Võng du" value="Võng du" />
            <Picker.Item label="Dã sử" value="Dã sử" />
            <Picker.Item label="Khoa huyễn" value="Khoa huyễn" />
            <Picker.Item label="Đồng nhân" value="Đồng nhân" />
          </Picker>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]} 
          onPress={dang_truyen}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Đang xử lý...' : 'Đăng truyện'}
          </Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </>
  )
}

const getStyles = (theme: string) => StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: theme === 'light' ? '#fff' : '#121212',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'light' ? 'black' : 'white'
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme === 'light' ? '#fff' : '#121212'
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

export default DangTruyen