import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { database_id, databases, noi_dung_truyen_id, thong_tin_truyen_id } from '@/services/dataAppwrite';
import { ID, Query } from 'react-native-appwrite';
import Toast from 'react-native-toast-message';
import useThemeStore from '@/config/useThemeStore';

const upChuong = () => {
    const {upChuong} : { upChuong?: string } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [noiDung, setNoiDung] = useState('');
    const [chapNumber, setChapNumber] = useState(1);
    const [reload, setReload] = useState(0);
    const { theme } = useThemeStore();

    const styles = getStyles(theme);

    const validateInputs = () => {
        if (!name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên chapter',
                position: 'top'
            });
            return false;
        }

        if (!noiDung.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập nội dung chapter',
                position: 'top'
            });
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchData = async () => {
            try{
                if(upChuong){
                    const result = await databases.listDocuments(
                        database_id,
                        noi_dung_truyen_id,
                        [Query.equal('id_truyen', upChuong), Query.orderDesc('chapter_number'), Query.limit(1)]
                    );

                    if(result.documents.length > 0){
                        setChapNumber(result.documents[0].chapter_number + 1);
                    } else {
                        setChapNumber(1);
                    }
                }
            }catch(error){
                console.log('Lỗi khi lấy số chapter:', error);
            }
        };
        fetchData();
    },[reload, upChuong]);

    const create_new_chapter = async () => {
        if (!validateInputs()) {
            return;
        }

        try{
            if(!upChuong) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Thiếu ID truyện',
                    position: 'top'
                });
                return;
            }

            const result = await databases.createDocument(
                database_id,
                noi_dung_truyen_id,
                ID.unique(),
                {
                    ten_chuong: name,
                    noi_dung: noiDung,
                    id_truyen: upChuong,
                    chapter_number: chapNumber
                }
            );

            await databases.updateDocument(
                database_id,
                thong_tin_truyen_id,
                upChuong,
                {
                    update_new_chapter: new Date().toISOString(),
                    tong_so_chuong: chapNumber
                }
            );

            setName('');
            setNoiDung('');

            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đăng chapter mới thành công 🎉',
                position: 'top'
            });

            setReload(reload + 1);
                    
        }catch(error: any){
            console.log('Lỗi khi tạo chapter:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || 'Không thể tạo chapter mới',
                position: 'top'
            });
        }
    };

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm chapter</Text>
                <View></View>
            </View>
            <View style={styles.container}>
                <TextInput
                    style={[
                        styles.inputTextName,
                        !name.trim() && styles.inputError
                    ]}
                    placeholder='Tên Chapter'
                    placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                    value={name}
                    onChangeText={setName}
                    multiline
                />
                <TextInput
                    style={[
                        styles.inputTextNoiDung,
                        !noiDung.trim() && styles.inputError
                    ]}
                    placeholder='Nội dung'
                    placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                    value={noiDung}
                    onChangeText={setNoiDung}
                    multiline={true}
                    textAlignVertical="top"
                />
                <Text style={styles.chapterNumber}>Chapter số: {chapNumber}</Text>
                <TouchableOpacity 
                    style={[
                        styles.btn,
                        (!name.trim() || !noiDung.trim()) && styles.disabledBtn
                    ]} 
                    onPress={create_new_chapter}
                    disabled={!name.trim() || !noiDung.trim()}
                >
                    <Text style={styles.textBtn}>Đăng chapter</Text>
                </TouchableOpacity>
                <Toast/>
            </View>
        </>
    );
};

const getStyles = (theme: string) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: theme === 'light' ? '#fff' : '#121212'
    },
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
    inputTextName: {
        borderWidth: 1,
        borderColor: theme === 'light' ? '#ddd' : '#444',
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D',
        color: theme === 'light' ? 'black' : 'white'
    },
    inputTextNoiDung: {
        borderWidth: 1,
        borderColor: theme === 'light' ? '#ddd' : '#444',
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        height: 300,
        fontSize: 16,
        backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D',
        color: theme === 'light' ? 'black' : 'white'
    },
    btn: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 10
    },
    textBtn: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    chapterNumber: {
        marginLeft: 15,
        marginBottom: 10,
        fontSize: 16,
        color: theme === 'light' ? '#666' : '#999'
    },
    inputError: {
        borderColor: 'red',
        backgroundColor: theme === 'light' ? '#FFF0F0' : '#3A1E1E'
    },
    disabledBtn: {
        backgroundColor: theme === 'light' ? '#CCCCCC' : '#444',
        opacity: 0.6
    }
});

export default upChuong;