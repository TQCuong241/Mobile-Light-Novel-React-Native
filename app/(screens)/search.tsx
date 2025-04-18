import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { database_id, databases, getImageUrl, thong_tin_truyen_id } from '@/services/dataAppwrite'
import useThemeStore from '@/config/useThemeStore'

const search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<any[]>([])
    const {theme} = useThemeStore()

    useEffect(() => {
        const fetchData = async () => {
            try{
                const result = await databases.listDocuments(
                    database_id,
                    thong_tin_truyen_id,
                )
                setData(result.documents)
            }catch(error){console.log(error)}
        }

        fetchData()
    }, [searchQuery])

    const back = () => {
        router.back()
    }

    const click_item = async (id: string) => {
        router.push({
            pathname: '/(screens)/mota',
            params: {
                mota: id
            }
        })
    }

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <Stack.Screen
        options={{
        headerShown: false,
        }}
    />
    <View style={[styles.container, theme === 'dark' ? {backgroundColor: '#282828'} : {backgroundColor: '#fff'}]}>
        <View style={styles.viewTop}>
        <TouchableOpacity style={styles.btnBack} onPress={back}>
            <Ionicons name='arrow-back' size={30} color={theme === 'light'? 'black' : 'white'}/>
        </TouchableOpacity>
        {/* Ô nhập tìm kiếm */}
        <TextInput
            style={[styles.searchInput, {backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff', color: theme === 'dark' ? 'white' : 'black'}]}
            placeholder="Nhập từ khóa..."
            placeholderTextColor= {theme === 'dark' ? '#a9a9a9' : 'gray'}
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
        </View>

      {/* Danh sách kết quả tìm kiếm */}
      {
        searchQuery === '' ? ( 
            <Text style={styles.noResult}>Nhập từ khóa để tìm kiếm</Text> 
        ):( 
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => click_item(item.$id)}>
                    <Image source={{ uri : getImageUrl(item.id_Image)}} style={styles.img}/>
                    <Text style={[styles.itemText, {color: theme === 'dark' ? 'white' : 'black'}]}>{item.name}</Text>
                </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noResult}>Không có kết quả</Text>}
                showsVerticalScrollIndicator={false} />
            )
      }
    </View>
    </>
  );
};

export default search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewTop: {
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  btnBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    flex: 8,
    paddingHorizontal: 15,
    fontFamily: 'serif',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    padding: 9,
    gap: 10,
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'serif',
  },
  noResult: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  img: {
    height: 100,
    width: 70,
    borderRadius: 7,
  },
});
