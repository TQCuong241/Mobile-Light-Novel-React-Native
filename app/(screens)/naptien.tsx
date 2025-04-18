import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import axios from 'axios';
import useUser from '@/hooks/useUser';
import { database_id, databases, lich_su_nap_tien_id, thong_tin_nguoi_dung_id } from '@/services/dataAppwrite';
import { ID, Query } from 'react-native-appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const NapTien = () => {
  const { user } = useUser()
  const [amount, setAmount] = useState('');
  const [paypalUrl, setPaypalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<any>(null);

  const handleNapTien = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ (lớn hơn 0)');
      return;
    }

    if (Number(amount) < 1) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 1 USD');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://192.168.1.254:3000/create-order', {
        amount: amount,
      });

      if (response.data.approveLink) {
        setPaypalUrl(response.data.approveLink);
        setTransactionInfo({
          orderId: response.data.orderID,
          amount: amount,
          date: new Date().toISOString()
        });
      } else {
        throw new Error('Không nhận được link thanh toán từ server');
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      Alert.alert(
        'Lỗi', 
        error.response?.data?.error || error.message || 'Có lỗi xảy ra, vui lòng thử lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    // Xử lý khi thanh toán thành công
    if (navState.url.includes('http://192.168.1.254:3000/success')) {
      nap_thanh_cong(Number(amount))
      Alert.alert(
        'Thành công', 
        `Bạn đã nạp thành công ${amount} USD\nMã giao dịch: ${transactionInfo?.orderId}`,
        [{ text: 'OK', onPress: () => setPaypalUrl(null) }]
      );
      setPaypalUrl(null);
    }
    
    // Xử lý khi hủy thanh toán
    if (navState.url.includes('http://192.168.1.254:3000/cancel-order')) {
      Alert.alert('Thông báo', 'Bạn đã hủy thanh toán');
      setPaypalUrl(null);
    }
  };

  const nap_thanh_cong = async ( amount : number) => {
    try{
      if(user){
        const result = await databases.createDocument(
            database_id,
            lich_su_nap_tien_id,
            ID.unique(),
          {
            user_id: user.$id,
            count_money: amount
          }
        )

        const get_data_user = await databases.getDocument(
          database_id,
          thong_tin_nguoi_dung_id,
          user.$id,
          [Query.select(['count_money_VND', 'count_hoa', 'count_phieu', 'count_key', 'count_coin_free'])]
        )

        const tong_count_money_VND = get_data_user.count_money_VND + (amount * 25000)
        const tong_count_coin_free = get_data_user.count_coin_free + amount
        const tong_count_hoa = get_data_user.count_hoa + amount
        const tong_count_phieu = get_data_user.count_phieu + amount

        const update_money = await databases.updateDocument(
          database_id,
          thong_tin_nguoi_dung_id,
          user.$id,
          {
            count_money_VND: tong_count_money_VND,
            count_hoa: tong_count_hoa,
            count_coin_free: tong_count_coin_free,
            count_phieu: tong_count_phieu
          }
        )
      }else{
        console.log('khong ton tai user')
      }
    }catch(error){
      console.log(error)
    }
  }

  if (paypalUrl) {
    return (
      <View style={styles.container}>
        <WebView 
          source={{ uri: paypalUrl }} 
          onNavigationStateChange={handleNavigationStateChange} 
          style={styles.webview}
          startInLoadingState={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
          />
        </TouchableOpacity>
        <Text style={{fontSize: 20}}>nạp tiền</Text>
        <View style={styles.backButton}/>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số tiền (USD):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Nhập số tiền"
          placeholderTextColor="#999"
        />
        <Text style={styles.note}>Tối thiểu: 1 USD</Text>
      </View>

      <TouchableOpacity
        onPress={handleNapTien}
        style={[styles.button, loading && styles.buttonDisabled]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>TIẾN HÀNH THANH TOÁN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#007bff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    padding: 20,
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: '#99c6ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  containerTop:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  backButton: {
    padding: 15,
  }
});

export default NapTien;