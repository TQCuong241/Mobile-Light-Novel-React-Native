import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import BodyVip from '@/components/BodyVip'
import useThemeStore from '@/config/useThemeStore'
import { router, useFocusEffect } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import useUser from '@/hooks/useUser'
import { database_id, databases, quyen_dang_truyen_id, thong_tin_nguoi_dung_id } from '@/services/dataAppwrite'
import Toast from 'react-native-toast-message'
import { Query } from 'react-native-appwrite'
import BorderAvatar from '@/components/common/BorderAvatar'

const Setting = () => {
    const { theme, setTheme, loadTheme } = useThemeStore()
    const { user, logout, isLoggedIn } = useUser()
    const [isAdmin, setIsAdmin] = useState<number>(0)
    const [dataUser, setDataUser] = useState<any>(null)
    const [count, setCount] = useState<number>(0)
    const [loading, setLoading] = useState({
        admin: true,
        userInfo: true,
        permission: true
    })

    const resetData = useCallback(() => {
        setIsAdmin(0)
        setDataUser(null)
        setCount(0)
        setLoading({
            admin: true,
            userInfo: true,
            permission: true
        })
    }, [])

    const loadAllData = useCallback(async () => {
        try {
            setLoading({
                admin: true,
                userInfo: true,
                permission: true
            })
            
            await Promise.all([
                loadTheme(),
                isLoggedIn ? loadIsAdmin() : Promise.resolve(),
                isLoggedIn ? load_thong_tin_user() : Promise.resolve(),
                isLoggedIn ? load_quyen() : Promise.resolve()
            ])
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error)
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (!isLoggedIn) {
            resetData()
        }
        loadAllData()
    }, [isLoggedIn])

    useFocusEffect(
        useCallback(() => {
            loadAllData()
        }, [isLoggedIn])
    )

    useEffect(() => {
        const interval = setInterval(load_quyen, 5000)
        return () => clearInterval(interval)
    },[])

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    const load_quyen = async () => {
        try {
            const result = await databases.listDocuments(
                database_id,
                quyen_dang_truyen_id,
                [Query.select(['$id'])]
            )
            setCount(result.documents.length)
        } catch (error) {
            console.error('Lỗi khi tải quyền:', error)
        } finally {
            setLoading(prev => ({...prev, permission: false}))
        }
    }

    const load_thong_tin_user = async () => {
        try {
            if (user) {
                const result = await databases.listDocuments(
                    database_id,
                    thong_tin_nguoi_dung_id,
                    [Query.equal('$id', user.$id)]
                )
                setDataUser(result.documents)
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin user:', error)
        } finally {
            setLoading(prev => ({...prev, userInfo: false}))
        }
    }

    const loadIsAdmin = async () => {
        try {
            if (user) {
                const isAdmin = await databases.getDocument(
                    database_id,
                    thong_tin_nguoi_dung_id,
                    user.$id
                )
                setIsAdmin(isAdmin.is_admin)
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra admin:', error)
        } finally {
            setLoading(prev => ({...prev, admin: false}))
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            Toast.show({
                type: 'success',
                text1: 'Đăng xuất thành công',
                position: 'top'
            })
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Đăng xuất thất bại',
                text2: 'Vui lòng thử lại',
                position: 'top'
            })
        }
    }

    const dang_truyen = async () => {
        if (isAdmin === 1 || isAdmin === 2) {
            router.push({
                pathname: '/(admins)/upTruyen',
                params: {
                    upTruyen: user?.$id || ''
                }
            })
        } else {
            Toast.show({
                type: 'error',
                text1: 'Bạn không có quyền đăng truyện',
                text2: 'Vui lòng xin cấp quyền đăng truyện',
                position: 'top'
            })
        }
    }

    const dang_chuong = async () => {
        if (isAdmin === 1 || isAdmin === 2) {
            router.push({
                pathname: '/(admins)/(upChuong)/dsTruyen',
                params: {
                    dsTruyen: user?.$id || ''
                }
            })
        } else {
            Toast.show({
                type: 'error',
                text1: 'Bạn không có quyền đăng chương',
                text2: 'Vui lòng xin cấp quyền đăng chương',
                position: 'top'
            })
        }
    }

    const dataButton = [
        {name: 'Thông tin tài khoản', onPress: () => router.push('/(screens)/profile'), is_ad: 0},
        {name: 'Lịch sử giao dịch', onPress: () => router.push('/(screens)/lsnaptien'), is_ad: 0},
        {name: 'Đăng truyện', onPress: dang_truyen, is_ad: 1},
        {name: 'Quản lý truyện', onPress: dang_chuong, is_ad: 1},
        {name: 'Duyệt quyền đăng truyện', onPress: () => router.push('/(admins)/duyetQuyen'), is_ad: 2},
        {name: 'Nạp tiền', onPress: () => router.push('/(screens)/naptien'), is_ad: 0},
        {name: 'Chế độ sáng tối', onPress: toggleTheme, is_ad: 0},
        {name: 'Hướng dẫn sử dụng', onPress: () => {}, is_ad: 0},
        {name: 'Đăng xuất', onPress: handleLogout, is_ad: 0},
    ]

    return (
        <BodyVip theme={theme}>
            <View style={styles.topContainer}>
                <TouchableOpacity 
                    style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}} 
                    onPress={() => router.push('/(screens)/profile')}
                >
                    <BorderAvatar 
                        avatarSource={dataUser ? dataUser[0]?.id_image : 'imageUser'}
                        frameSource={dataUser ? dataUser[0]?.id_image_vien : ''}
                        size={60}
                        avatarSizeRatio={0.65}
                    />
                    <Text style={[styles.textName, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                        {user ? user.name : 'Không đăng nhập'}
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.textName, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                    {dataUser ? `${dataUser[0]?.count_money_VND} VND` : '0 VND'}
                </Text>
            </View>

            {isLoggedIn ? (
                <>
                    <View style={[styles.countMonny, theme === 'dark' ? {backgroundColor: '#282828'} : {backgroundColor: '#e3e3e3'}]}>
                        <View style={styles.rowItems}>
                            <View style={styles.items}>
                                <Image style={styles.icon} source={require('@/assets/images/flower.png')}/>
                                <Text style={[styles.textCount, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                                    {dataUser ? dataUser[0]?.count_hoa : '0'}
                                </Text>
                            </View>
                            <View style={styles.items}>
                                <Image style={styles.icon} source={require('@/assets/images/gold-key.png')}/>
                                <Text style={[styles.textCount, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                                    {dataUser ? dataUser[0]?.count_key : '0'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.rowItems}>
                            <View style={styles.items}>
                                <Image style={styles.icon} source={require('@/assets/images/coin.png')}/>
                                <Text style={[styles.textCount, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                                    {dataUser ? dataUser[0]?.count_coin_free : '0'}
                                </Text>
                            </View>
                            <View style={styles.items}>
                                <Image style={styles.icon} source={require('@/assets/images/vacation.png')}/>
                                <Text style={[styles.textCount, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                                    {dataUser ? dataUser[0]?.count_phieu : '0'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {dataButton
                        .filter(item => item.is_ad === 2 && isAdmin >= item.is_ad)
                        .map((item, index) => (
                            <TouchableOpacity 
                                key={`admin-${index}`} 
                                style={[styles.btnEvents, styles.adminButton]} 
                                onPress={item.onPress}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                                    <Text style={[styles.textEvent, styles.adminText, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                                        {item.name}
                                    </Text>
                                    {count > 0 && (
                                        <Text style={[styles.textEvent, styles.adminText, styles.viewTextAdmin]}>
                                            {count}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name='chevron-forward' size={24} color={theme === 'light' ? 'black' : 'white'}/>
                            </TouchableOpacity>
                        ))
                    }

                    {dataButton
                        .filter(item => item.is_ad !== 2 && (item.is_ad === 0 || isAdmin >= item.is_ad))
                        .map((item, index) => (
                            <TouchableOpacity 
                                key={`normal-${index}`} 
                                style={styles.btnEvents}
                                onPress={item.onPress}
                            >
                                <Text style={[styles.textEvent, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                                    {item.name}
                                </Text>
                                <Ionicons name='chevron-forward' size={24} color={theme === 'light' ? 'black' : 'white'}/>
                            </TouchableOpacity>
                        ))
                    }
                </>
            ) : (
                <>
                    <TouchableOpacity 
                        style={styles.btnEvents} 
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={[styles.textEvent, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                            Đăng nhập
                        </Text>
                        <Ionicons name='chevron-forward' size={24} color={theme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.btnEvents} 
                        onPress={() => router.replace('/(auth)/signUp')}
                    >
                        <Text style={[styles.textEvent, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>
                            Đăng ký
                        </Text>
                        <Ionicons name='chevron-forward' size={24} color={theme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                </>
            )}
            <Toast/>
        </BodyVip>
    )
}

export default Setting

const styles = StyleSheet.create({
    textLight: {
        color: 'black'
    },
    textDark: {
        color: 'white'
    },

    imgAvatar: {
        height: 40,
        width: 40,
    },

    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10, 
        paddingHorizontal: 10,
        paddingVertical: 10,
    },

    textName: {
        fontSize: 20,
        fontFamily: 'serif'
    },

    countMonny:{
        maxHeight: 150,
        borderRadius: 31,
        marginHorizontal: 10,
        marginBottom: 5,
        padding: 11,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    items: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100
    },

    rowItems: {
        gap: 20
    },

    icon: {
        height: 35,
        width: 35
    },

    textCount: {
        fontWeight: '700',
        fontSize: 20
    },

    btnEvents: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 7,
        marginVertical: 5,
        alignItems: 'center'
    },

    textEvent: {
        fontSize: 15
    },

    adminButton: {
        borderLeftWidth: 4,
        borderLeftColor: '#ffeb3b'
    },

    adminText: {
        fontWeight: 'bold'
    },

    viewTextAdmin: {
        minWidth: 30,
        minHeight: 30,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 50,
        color: 'red',
        backgroundColor: '#bbff32',
        marginBottom: 20,
    }
})
