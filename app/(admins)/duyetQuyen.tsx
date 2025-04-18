import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Body from '@/components/Body'
import useThemeStore from '@/config/useThemeStore'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useUser from '@/hooks/useUser'
import { database_id, databases, getImageUrl, quyen_dang_truyen_id, storage, storage_id, thong_bao_id, thong_tin_nguoi_dung_id } from '@/services/dataAppwrite'
import { ID, Query } from 'react-native-appwrite'
import { Image } from 'react-native'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

const duyetQuyen = () => {
    const { theme } = useThemeStore()
    const { user } = useUser()
    const [isAdmin, setIsAdmin] = useState<number>()
    const [loadding, setLoadding] = useState<boolean>(true)
    const [lyDoTuChoi, setLyDoTuChoi] = useState<string>('')
    const [lyDoLodding, setLyDoLoadding] = useState<boolean>(false)
    const [data, setData] = useState<any>()
    const styles = getStyles(theme)

    useEffect(() => {
        if (user) {
            check_admin()
        }
    }, [user])

    useEffect(() => {
        if (isAdmin !== null) {
            FireWall()
        }
    }, [isAdmin])

    useEffect(() => {
        if (!loadding) {
            load_data()
        }
    },[loadding])

    const check_admin = async () => {
        if(user) {
            const result = await databases.getDocument(
                database_id,
                thong_tin_nguoi_dung_id,
                user.$id
            )
            setIsAdmin(Number(result.is_admin))
        }
    }

    const FireWall = async () => {
        if(isAdmin === 2){
            setLoadding(false)
            return
        }

        if(isAdmin === 1) {
            router.back()
            return
        }

        if(isAdmin === 0) {
            router.back()
            return
        }
    }

    const load_data = async () => {
        const result = await databases.listDocuments(
            database_id,
            quyen_dang_truyen_id,
            [Query.orderDesc('$createdAt')]
        )
        
        setData(result.documents)
    }

    const handleReject = (item: any) => {
        Alert.alert(
            'Xác nhận từ chối',
            'Bạn có chắc chắn muốn từ chối yêu cầu này?',
            [
            {
                text: 'Hủy',
                style: 'cancel',
                onPress: () => console.log('Hủy từ chối')
            },
            {
                text: 'Từ chối',
                style: 'destructive',
                onPress: async () => {
                try{
                    await xoa_anh(item.id_anh_truoc)
                    await xoa_anh(item.id_anh_sau)
                    await xoa_quyen(item.$id)
                    await thong_bao_that_bai(item.user_id)

                    Toast.show({
                        type: 'success',
                        text1: 'Từ chối thành công',
                        position: 'top'
                    });

                    setTimeout(() => load_data(), 1500);
                    
                }catch{}
                }
            }
            ]
        );
    };

    const dong_y = (item: any) => {
        Alert.alert(
            'Xác nhận đồng ý',
            'Bạn có chắc chắn muốn đồng ý yêu cầu này?',
            [
            {
                text: 'Hủy',
                style: 'cancel',
                onPress: () => console.log('Hủy từ chối')
            },
            {
                text: 'Đồng ý',
                style: 'destructive',
                onPress: async () => {
                try{
                    await buff_is_admin(item)
                    await xoa_anh(item.id_anh_truoc)
                    await xoa_anh(item.id_anh_sau)
                    await xoa_quyen(item.$id)
                    await thong_bao_thanh_cong(item.user_id)

                    Toast.show({
                        type: 'success',
                        text1: 'Đồng ý thành công',
                        position: 'top'
                    });
                    
                    setTimeout(() => load_data(), 1500);
                    
                }catch{}
                }
            }
            ]
        );
    };

    const buff_is_admin = async (item: any) => {
        try{
            const result = await databases.updateDocument(
                database_id,
                thong_tin_nguoi_dung_id,
                item.user_id,
                {
                    is_admin: 1,
                    SDT: item.SDT,
                    CCCD: item.CCCD
                }
            )
        }catch(error){console.log(error)}
    }

    const xoa_anh = async (fileId: string) => {
        try {
            await storage.deleteFile(storage_id, fileId)
        } catch (error) {
            console.error('Lỗi khi xóa ảnh:', error)
        }
    }

    const xoa_quyen = async (id: string) => {
        try{
            const result = await databases.deleteDocument(
                database_id,
                quyen_dang_truyen_id,
                id
            )
        }catch{}
    }

    const thong_bao_that_bai = async (user_id: string) => {
        try {
            if (!user) throw new Error('User not found');
            
            await databases.createDocument(
                database_id,
                thong_bao_id,
                ID.unique(),
                {
                    user_id: user_id,
                    tieu_de: 'Yêu cầu quyền đăng truyện',
                    noi_dung_thong_bao: lyDoTuChoi,
                    trang_thai: 0,
                    level: 0,
                }
            );
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const thong_bao_thanh_cong = async (id: string) => {
        try {
            if (!user) throw new Error('User not found');
            
            await databases.createDocument(
                database_id,
                thong_bao_id,
                ID.unique(),
                {
                    user_id: id,
                    tieu_de: 'Yêu cầu quyền đăng truyện',
                    noi_dung_thong_bao: "Yêu cầu cấp quyền của bạn đã được Admin đồng ý, từ bây giờ bạn cũng có thể đăng truyện lên nền tảng này!",
                    trang_thai: 0,
                    level: 2,
                }
            );
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const ly_do = async () => {
        setLyDoLoadding(true)
    }

    if (loadding) {
        return (
            <Body theme={theme}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#bb86fc' : '#673ab7'} />
                    <Text style={styles.loadingText}>
                        Đang xác nhận quyền...
                    </Text>
                </View>
            </Body>
        )
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <View style={styles.userInfoContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color={theme === 'dark' ? '#fff' : '#666'} />
                </View>
                <View style={styles.userTextInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUserId}>ID: {item.user_id}</Text>
                </View>
            </View>

            <View style={styles.detailContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="card" size={16} color={theme === 'dark' ? '#bb86fc' : '#673ab7'} style={{marginTop: 3}}/>
                    <Text style={styles.itemDetail}>CCCD: {item.CCCD}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="call" size={16} color={theme === 'dark' ? '#bb86fc' : '#673ab7'} style={{marginTop: 3}}/>
                    <Text style={styles.itemDetail}>SĐT: {item.SDT}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={16} color={theme === 'dark' ? '#bb86fc' : '#673ab7'} style={{marginTop: 3}}/>
                    <Text style={styles.itemDetail}>Lý do: {item.ly_do}</Text>
                </View>
            </View>

            <View style={styles.imagesContainer}>
                <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>Mặt trước CCCD</Text>
                    <Image 
                        source={{ uri: getImageUrl(item.id_anh_truoc) }} 
                        style={styles.idImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.imageWrapper}>
                    <Text style={styles.imageLabel}>Mặt sau CCCD</Text>
                    <Image 
                        source={{ uri: getImageUrl(item.id_anh_sau) }} 
                        style={styles.idImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => dong_y(item)}>
                    <Text style={styles.buttonText}>Duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={ly_do}>
                    <Text style={styles.buttonText}>Từ chối</Text>
                </TouchableOpacity>
            </View>
            {lyDoLodding &&     
            <>     
                <TextInput
                    style={styles.textArea}
                    placeholder="Mô tả lý do"
                    value={lyDoTuChoi}
                    onChangeText={setLyDoTuChoi}
                    multiline
                    textAlignVertical="top"
                />
                <TouchableOpacity style={[styles.button, {backgroundColor: theme === 'dark' ? '#F44336' : '#FF5722',}]} onPress={() => handleReject(item)}>
                    <Text style={styles.buttonText}>Xác nhận từ chối</Text>
                </TouchableOpacity>
            </>   
            }
        <Toast/>
        </View>
    )

    return (
        <Body theme={theme}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons 
                    name="arrow-back" 
                    size={24} 
                    color={theme === 'dark' ? '#bb86fc' : '#673ab7'} 
                />
                <Text style={styles.backText}>Trở lại</Text>
            </TouchableOpacity>

            <FlatList 
                data={data}
                keyExtractor={(item) => item.$id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
                    </View>
                }
            />
        </Body>
    )
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: theme === 'dark' ? '#fff' : '#000',
        marginTop: 10
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
        color: theme === 'dark' ? '#bb86fc' : '#673ab7'
    },
    listContainer: {
        paddingBottom: 20
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        color: theme === 'dark' ? '#aaa' : '#666',
        fontSize: 16
    },
    itemContainer: {
        backgroundColor: theme === 'dark' ? '#282c35' : '#f0f0f0',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 3,
        shadowColor: theme === 'dark' ? '#000' : '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? '#333' : '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userTextInfo: {
        flex: 1,
    },
    itemName: {
        color: theme === 'dark' ? '#fff' : '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemUserId: {
        color: theme === 'dark' ? '#aaa' : '#666',
        fontSize: 14,
    },
    detailContainer: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    itemDetail: {
        color: theme === 'dark' ? '#ddd' : '#444',
        fontSize: 15,
        marginLeft: 8,
    },
    imagesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    imageWrapper: {
        width: '48%',
    },
    imageLabel: {
        color: theme === 'dark' ? '#aaa' : '#666',
        fontSize: 13,
        marginBottom: 4,
        textAlign: 'center',
    },
    idImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#333' : '#ddd',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: theme === 'dark' ? '#4CAF50' : '#8BC34A',
        marginRight: 8,
    },
    rejectButton: {
        backgroundColor: theme === 'dark' ? '#F44336' : '#FF5722',
        marginLeft: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    textArea: {
        borderWidth: 1,
        borderColor: theme === 'light' ? '#ddd' : '#444',
        padding: 15,
        marginVertical: 15,
        borderRadius: 8,
        height: 100,
        fontSize: 16,
        backgroundColor: theme === 'light' ? '#f9f9f9' : '#2D2D2D',
        textAlignVertical: 'top',
        color: theme === 'light' ? 'black' : 'white'
    }
})

export default duyetQuyen