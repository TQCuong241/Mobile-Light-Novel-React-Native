import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import useThemeStore from '@/config/useThemeStore'
import useUser from '@/hooks/useUser'
import { database_id, databases, thong_bao_id } from '@/services/dataAppwrite'
import { Query } from 'react-native-appwrite'
import { timeAgo } from '@/Utils/dateUtils'

const NotificationScreen = () => {
    const { theme } = useThemeStore()
    const styles = getStyles(theme)
    const { user } = useUser()
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        if (user) {
            load_thong_bao()
            const interval = setInterval(load_thong_bao, 5000)
            return () => clearInterval(interval)
        }
    }, [user])

    const load_thong_bao = async () => {
        try {
            if (user) {
                const result = await databases.listDocuments(
                    database_id,
                    thong_bao_id,
                    [
                        Query.equal('user_id', user.$id),
                        Query.orderDesc('$createdAt')
                    ]
                )
                setData(result.documents)
            }
        } catch (error) {
            console.error('Lỗi tải thông báo:', error)
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await databases.updateDocument(
                database_id,
                thong_bao_id,
                notificationId,
                { trang_thai: 1 }
            )
            setData(prevData =>
                prevData.map(item =>
                    item.$id === notificationId ? { ...item, trang_thai: 1 } : item
                )
            )
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = data.filter(item => item.trang_thai === 0)
            if (unreadNotifications.length === 0) return

            // Gửi cập nhật cho tất cả thông báo chưa đọc
            const updatePromises = unreadNotifications.map(item =>
                databases.updateDocument(
                    database_id,
                    thong_bao_id,
                    item.$id,
                    { trang_thai: 1 }
                )
            )

            await Promise.all(updatePromises)

            // Cập nhật state
            setData(prevData =>
                prevData.map(item => ({ ...item, trang_thai: 1 }))
            )
        } catch (error) {
            console.error('Lỗi khi đánh dấu tất cả đã đọc:', error)
        }
    }

    const renderNotificationItem = ({ item }: { item: typeof data[0] }) => (
        <TouchableOpacity
            onPress={() => markAsRead(item.$id)}
            style={[
                styles.notificationItem,
                item.trang_thai === 0 && styles.unreadNotification,
                item.level === 0 && styles.level0,
                item.level === 1 && styles.level1,
                item.level === 2 && styles.level2
            ]}
        >
            <View style={styles.notificationHeader}>
                <Text style={[
                    styles.notificationTitle,
                    item.trang_thai === 0 && styles.unreadTitle
                ]}>
                    {item.tieu_de}
                </Text>
                <Text style={styles.notificationTime}>
                    {timeAgo(item.$createdAt)}
                </Text>
            </View>
            <Text style={styles.notificationContent}>{item.noi_dung_thong_bao}</Text>
            {item.trang_thai === 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>Mới</Text>
                </View>
            )}
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerText, theme === 'light' ? { color: 'black' } : { color: 'white' }]}>
                    Thông báo
                </Text>
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Ionicons name="checkmark-done-outline" size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
            </View>

            {data.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="notifications-off-outline"
                        size={48}
                        color={theme === 'light' ? '#999' : '#666'}
                    />
                    <Text style={styles.emptyText}>Không có thông báo nào</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )
}

const getStyles = (theme: string) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: theme === 'light' ? '#f5f5f5' : '#121212'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    markAllButton: {
        padding: 8,
        borderRadius: 5,
        backgroundColor: theme === 'light' ? '#ddd' : '#333'
    },
    listContainer: {
        paddingBottom: 20
    },
    notificationItem: {
        backgroundColor: theme === 'light' ? '#fff' : '#1E1E1E',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: theme === 'light' ? '#000' : '#fff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        position: 'relative'
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF5722'
    },
    level0: {
        borderLeftWidth: 4,
        borderLeftColor: 'red'
    },
    level1: {
        borderLeftWidth: 0
    },
    level2: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    notificationTitle: {
        fontSize: 16,
        color: theme === 'light' ? '#333' : '#fff',
        flex: 1
    },
    unreadTitle: {
        fontWeight: 'bold'
    },
    notificationTime: {
        fontSize: 12,
        color: theme === 'light' ? '#888' : '#aaa',
        marginLeft: 10
    },
    notificationContent: {
        fontSize: 14,
        color: theme === 'light' ? '#555' : '#ddd',
        lineHeight: 20
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: theme === 'light' ? '#888' : '#666',
        textAlign: 'center'
    },
    unreadBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF5722',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    unreadBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
})

export default NotificationScreen
