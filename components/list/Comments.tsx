// components/list/Comments.tsx
import { FlatList, StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import BorderAvatar from '../common/BorderAvatar'
import { timeAgo } from '@/Utils/dateUtils'
import { Ionicons } from '@expo/vector-icons'
import { comment_id, database_id, databases, thong_tin_nguoi_dung_id, tra_loi_comment_id } from '@/services/dataAppwrite'
import { ID, Query } from 'react-native-appwrite'
import useUser from '@/hooks/useUser'

type Props = {
    theme: string,
    truyenID: string
}

const Comments = ({ theme, truyenID }: Props) => {
    const { user } = useUser()
    const [noiDung, setNoiDung] = useState('')
    const [comments, setComments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPosting, setIsPosting] = useState(false)

    const loadComments = async () => {
        try {
            setIsLoading(true)
            const result = await databases.listDocuments(
                database_id,
                comment_id,
                [Query.equal('truyen_id', truyenID), Query.orderDesc('$createdAt')]
            )
            
            // Lấy thông tin user cho từng comment
            const commentsWithUser = await Promise.all(result.documents.map(async (comment) => {
                try {
                    const userDoc = await databases.getDocument(
                        database_id,
                        thong_tin_nguoi_dung_id,
                        comment.user_id
                    )
                    return {
                        ...comment,
                        userName: userDoc.name,
                        userAvatar: userDoc.id_image,
                        userAvatarVien: userDoc.id_image_vien
                    }
                } catch (error) {
                    return {
                        ...comment,
                        userName: "Ẩn danh",
                        userAvatar: null,
                        userAvatarVien: null
                    }
                }
            }))
            
            setComments(commentsWithUser)
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const addComment = async () => {
        if (!noiDung.trim()) return
        
        try {
            setIsPosting(true)
            await databases.createDocument(
                database_id,
                comment_id,
                ID.unique(),
                {
                    user_id: user.$id,
                    noi_dung: noiDung.trim(),
                    truyen_id: truyenID
                }
            )
            setNoiDung('')
            // Load lại comments sau khi post thành công
            await loadComments()
        } catch (error) {
            console.error('Lỗi khi đăng bình luận:', error)
        } finally {
            setIsPosting(false)
        }
    }

    useEffect(() => {
        if (truyenID) {
            loadComments()
        }
    }, [truyenID])

    const renderCommentItem = ({ item }: { item: any }) => (
        <View style={[
            styles.commentContainer,
            theme === 'dark' && styles.darkCommentContainer
        ]}>
            <BorderAvatar
                avatarSource={item.userAvatar}
                frameSource={item.userAvatarVien}
                size={50}
                avatarSizeRatio={0.65}
            />
            <View style={styles.mainComment}>
                <View style={[
                    styles.mainCommentBorder,
                    theme === 'dark' && styles.darkMainCommentBorder
                ]}>
                    <Text style={theme === 'dark' && styles.darkText}>{item.userName}</Text>
                    <Text style={theme === 'dark' && styles.darkText}>{item.noi_dung}</Text>
                </View>
                <View style={styles.commentActions}>
                    <Text style={theme === 'dark' && styles.darkText}>{timeAgo(item.$createdAt)}</Text>
                    <Text style={theme === 'dark' && styles.darkText}>Thích</Text>
                    <Text style={theme === 'dark' && styles.darkText}>Phản hồi</Text>
                </View>
            </View>
        </View>
    )

    return (
        <KeyboardAvoidingView 
            style={[
                styles.container,
                theme === 'dark' && styles.darkContainer
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.innerContainer}>
                <Text style={[
                    styles.sectionTitle, 
                    theme === 'light' ? styles.lightSectionTitle : styles.darkSectionTitle
                ]}>
                    Bình luận ({comments.length})
                </Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme === 'light' ? '#000' : '#fff'} />
                    </View>
                ) : comments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons 
                            name="chatbox-ellipses-outline" 
                            size={48} 
                            color={theme === 'light' ? '#999' : '#666'} 
                        />
                        <Text style={[
                            styles.emptyText, 
                            theme === 'light' ? styles.lightEmptyText : styles.darkEmptyText
                        ]}>
                            Không có bình luận nào
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        renderItem={renderCommentItem}
                        keyExtractor={(item) => item.$id}
                        contentContainerStyle={styles.commentList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <View style={[
                styles.commentInputContainer,
                theme === 'dark' && styles.darkCommentInputContainer
            ]}>
                <TextInput
                    style={[
                        styles.commentInput,
                        theme === 'dark' && styles.darkCommentInput
                    ]}
                    placeholder="Nhập bình luận..."
                    placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
                    onChangeText={setNoiDung}
                    value={noiDung}
                    multiline
                />
                <TouchableOpacity 
                    style={[
                        styles.sendButton, 
                        (!noiDung.trim() || isPosting) && styles.disabledButton,
                        theme === 'dark' && styles.darkSendButton
                    ]}
                    onPress={addComment}
                    disabled={!noiDung.trim() || isPosting}
                >
                    {isPosting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.sendText}>Gửi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    // Light theme styles
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 9
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    lightSectionTitle: {
        color: 'black',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    commentList: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
    },
    lightEmptyText: {
        color: '#888',
    },
    commentContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginVertical: 5
    },
    mainComment: {
        flex: 1,
        marginBottom: 10
    },
    mainCommentBorder: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9'
    },
    commentActions: {
        flexDirection: 'row',
        gap: 25,
        marginLeft: 10,
        marginTop: 5
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
    },
    commentInput: {
        flex: 1,
        minHeight: 45,
        maxHeight: 100,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        color: '#000',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    sendText: {
        color: 'white',
        fontWeight: 'bold'
    },

    // Dark theme styles
    darkContainer: {
        backgroundColor: '#121212',
    },
    darkSectionTitle: {
        color: 'white',
    },
    darkCommentContainer: {
        backgroundColor: '#121212',
    },
    darkMainCommentBorder: {
        borderColor: '#333',
        backgroundColor: '#1e1e1e',
    },
    darkText: {
        color: '#e0e0e0',
    },
    darkEmptyText: {
        color: '#666',
    },
    darkCommentInputContainer: {
        borderColor: '#333',
        backgroundColor: '#1e1e1e',
    },
    darkCommentInput: {
        borderColor: '#333',
        backgroundColor: '#2d2d2d',
        color: '#e0e0e0',
    },
    darkSendButton: {
        backgroundColor: '#1a73e8',
    },
})

export default Comments