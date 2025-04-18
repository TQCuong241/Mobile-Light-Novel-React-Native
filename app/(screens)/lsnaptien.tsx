import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import useThemeStore from '@/config/useThemeStore'
import { database_id, databases, lich_su_nap_tien_id } from '@/services/dataAppwrite'
import moment from 'moment'
import { router } from 'expo-router'
import Body from '@/components/Body'
import { Query } from 'react-native-appwrite'
import useUser from '@/hooks/useUser'

const LichSuNapTien = () => {
  const { theme } = useThemeStore();
  const [tableData, setTableData] = useState<any[]>([])
  const { user } = useUser()

  useEffect(() => {
    loadData()
  },[user])

  const loadData = async () => {
    try{
        if(user){
            const result = await databases.listDocuments(
                database_id,
                lich_su_nap_tien_id,
                [Query.equal('user_id', user.$id), Query.orderDesc('$createdAt')]
            )
            setTableData(result.documents)
        }
    }catch{}
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#333' : '#ddd',
      paddingVertical: 10,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
    },
    headerText: {
      fontWeight: 'bold',
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#333' : '#eee',
      paddingVertical: 12,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    cellText: {
      fontSize: 13,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    amountText: {
      fontSize: 13,
      color: '#4CAF50',
    },
  });

  return (
    <Body theme={theme}>
      {/* Header with back button */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme === 'dark' ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Lịch sử nạp tiền</Text>
      </View>

      {/* Table */}
      <ScrollView style={styles.tableContainer}>
        {/* Table Header */}
        <View style={dynamicStyles.tableHeader}>
          <View style={[styles.headerCell, { flex: 0.5 }]}>
            <Text style={dynamicStyles.headerText}>STT</Text>
          </View>
          <View style={[styles.headerCell, { flex: 2 }]}>
            <Text style={dynamicStyles.headerText}>Thời gian</Text>
          </View>
          <View style={[styles.headerCell, { flex: 1.5 }]}>
            <Text style={dynamicStyles.headerText}>Số lượng</Text>
          </View>
        </View>

        {/* Table Rows */}
        {tableData.map((item, index) => (
          <View key={item.$id} style={dynamicStyles.tableRow}>
            <View style={[styles.rowCell, { flex: 0.5 }]}>
              <Text style={dynamicStyles.cellText}>{index + 1}</Text>
            </View>
            <View style={[styles.rowCell, { flex: 2 }]}>
              <Text style={dynamicStyles.cellText}>{moment(item.$createdAt).format('HH:mm DD/MM/YYYY')}</Text>
            </View>
            <View style={[styles.rowCell, { flex: 1.5 }]}>
              <Text style={dynamicStyles.amountText}>{item.count_money} USD</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Body>
  );
};

export default LichSuNapTien;

// Static styles that don't change with theme
const styles = StyleSheet.create({
  backButton: {
    padding: 15,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  rowCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
});