import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image, FlatList, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import BodyVip from '@/components/BodyVip';
import Ionicons from '@expo/vector-icons/Ionicons';
import { comment_id, database_id, databases, getImageUrl, lich_su_id, noi_dung_truyen_id, thong_tin_nguoi_dung_id, thong_tin_truyen_id, truyen_yeu_thich_id } from '@/services/dataAppwrite';
import ButtonBack from '@/components/common/ButtonBack';
import useThemeStore from '@/config/useThemeStore';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ID, Query } from 'react-native-appwrite';
import ListTruyen from '@/components/list/ListTruyen';
import useUser from '@/hooks/useUser';
import Comments from '@/components/list/Comments';
import Body from '@/components/Body';

const MotaScreen = () => {
    const { theme } = useThemeStore();
    const { mota }: { mota?: string } = useLocalSearchParams();
    const [data, setData] = useState<any | null>(null);
    const [chapNumber, setChapNumber] = useState<number>();
    const [lichSuID, setLichSuID] = useState('');
    const [truyen, setTruyen] = useState<any>([]);
    const [selected, setSelected] = useState<number>(0);
    const [dataChuong, setDataChuong] = useState<any>([]);
    const [arrChuong, setArrChuong] = useState<boolean>(false);
    const { user } = useUser();
    const [name, setName] = useState<string>();
    const [isLoading, setIsLoading] = useState(true)
    const [myLoveId, setMyLoveId] = useState('')
    const [isProcessing, setIsProcessing] = useState(false);
    const [comment, setComment] = useState<any>([])

    // Hàm chỉ load lại lịch sử đọc
    const handleRefresh = useCallback(async () => {
        try {
            if (user?.$id && mota) {
                await load_lich_su();
                await load_id_love()
                await load_comment()
            }
        } catch (error) {
            console.error('Lỗi khi refresh lịch sử:', error);
        }
    }, [user?.$id, mota]);

    // Hàm load tất cả dữ liệu
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const truyenData = await load_data_truyen();
            if (truyenData) {
                await Promise.all([
                    load_truyen(truyenData),
                    load_nguoi_dang(truyenData),
                    load_data_chuong(truyenData),
                    user?.$id && load_lich_su()
                ]);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setIsLoading(false);
        }
    }, [mota, user?.$id]);

    useEffect(() => {
        loadAllData()
    },[])

    useFocusEffect(
        useCallback(() => {
            handleRefresh();
        }, [handleRefresh])
    );

    const load_nguoi_dang = async (truyenData: any) => {
        try {
            if (truyenData?.user_id) {
                const userDoc = await databases.getDocument(
                    database_id,
                    thong_tin_nguoi_dung_id,
                    truyenData.user_id,
                    [Query.select(['name'])]
                );
                setName(userDoc.name);
            }
        } catch (error) {
            console.log('Lỗi khi lấy thông tin người đăng:', error);
        }
    };

    const load_comment = async () => {
        try {
            if (mota) {
                // Lấy danh sách các bình luận với 'truyen_id' là 'mota'
                const result = await databases.listDocuments(
                    database_id,
                    comment_id,
                    [Query.equal('truyen_id', mota)]
                );
    
                const commentsWithUserData = await Promise.all(result.documents.map(async (comment: any) => {
                    try {
                        const userResult = await databases.getDocument(
                            database_id,
                            thong_tin_nguoi_dung_id,
                            comment.user_id
                        );
                        return {
                            ...comment,
                            userName: userResult.name, 
                            userAvatar: userResult.id_image, 
                            userAvatarVien: userResult.id_image_vien, 
                        };
                    } catch (error) {
                        console.error("Lỗi khi lấy thông tin người dùng", error);
                        return {
                            ...comment,
                            userName: "Ẩn danh",
                            userAvatar: null
                        };
                    }
                }));
    
                // Cập nhật state với danh sách bình luận đã có thông tin người dùng
                setComment(commentsWithUserData);
            }
        } catch (error) {
            console.error("Lỗi khi tải bình luận:", error);
        }
    };
    

    const load_data_truyen = async () => {
        try {
            if (mota) {
                const result = await databases.getDocument(
                    database_id,
                    thong_tin_truyen_id,
                    mota
                );
                setData(result);
                return result;
            }
        } catch (error) {
            console.log('Lỗi khi lấy thông tin truyện:', error);
        }
        return null;
    };

    const load_truyen = async (truyenData: any) => {
        try {
            if (truyenData?.user_id) {
                const result = await databases.listDocuments(
                    database_id,
                    thong_tin_truyen_id,
                    [Query.equal('user_id', truyenData.user_id)]
                );
                setTruyen(result.documents);
            }
        } catch (error) {
            console.log('Lỗi khi lấy danh sách truyện:', error);
        }
    };

    const load_lich_su = async () => {
        if (user?.$id && mota) {
            try {
                const result = await databases.listDocuments(
                    database_id,
                    lich_su_id,
                    [Query.equal('user_id', user.$id), Query.equal('truyen_id', mota), Query.limit(1)]
                );
                
                if (result.documents.length > 0) {
                    setChapNumber(result.documents[0].chap_number);
                    setLichSuID(result.documents[0].$id);
                } else {
                    await create_lich_su();
                }
            } catch (error) {
                console.log('Lỗi khi lấy lịch sử:', error);
                await create_lich_su();
            }
        }
    };

    const create_lich_su = async () => {
        try {
            if (user?.$id && mota) {
                const newDoc = await databases.createDocument(
                    database_id,
                    lich_su_id,
                    ID.unique(),
                    {
                        'user_id': user.$id,
                        'truyen_id': mota,
                        'chap_number': 1,
                        'thoi_gian_xem_truyen': new Date().toISOString()
                    }
                );
                setChapNumber(1);
                setLichSuID(newDoc.$id);
            }
        } catch (error) {
            console.log('Lỗi khi tạo lịch sử:', error);
        }
    };

    const load_data_chuong = async (truyenData: any) => {
        try {
            if (truyenData?.$id) {
                const result = await databases.listDocuments(
                    database_id,
                    noi_dung_truyen_id,
                    [
                        Query.equal('id_truyen', truyenData.$id),
                        Query.select(['ten_chuong', 'chapter_number', '$id', 'id_truyen']),
                        Query.orderAsc('chapter_number')
                    ]
                );
                setDataChuong(result.documents);
            }
        } catch (error) {
            console.log('Lỗi khi lấy danh sách chương:', error);
        }
    };

    const doc_truyen = async (id: string) => {
        if (!data) return;
        
        router.push({
            pathname: '/(screens)/read',
            params: {
                read: id,
                userID: user?.$id || '',
                chapNumber: chapNumber || 1,
                tenTruyen: data.name,
                lichSuID: lichSuID
            }
        });
    };

    const chuyen_truyen = async (id: string) => {
        router.replace({
            pathname: '/(screens)/mota',
            params: {
                mota: id
            }
        });
    };

    const click_chuong = async (id: string, chapter: number) => {
        router.push({
            pathname: '/(screens)/read',
            params: {
                read: id,
                userID: user?.$id || '',
                chapNumber: chapter,
                tenTruyen: data?.name || '',
                lichSuID: lichSuID
            }
        });
    };

    const back = async () => {
        router.back();
    };

    const load_id_love = async () => {
        if (isProcessing) return
  
        setIsProcessing(true)
        try{
            if(user.$id && mota){
                const result = await databases.listDocuments(
                    database_id,
                    truyen_yeu_thich_id,
                    [Query.equal('user_id', user.$id), Query.equal('truyen_id', mota)]
                )

                if (result.documents.length > 0){
                    setMyLoveId(result.documents[0].$id)
                }else{
                    setMyLoveId('')
                }
            }
        }catch{
            setMyLoveId('')
        }
        setIsProcessing(false)
    }

    const love = async () => {
        if (isProcessing) return
  
        setIsProcessing(true)
        try{
            if(user.$id && mota){
                const result = await databases.createDocument(
                    database_id,
                    truyen_yeu_thich_id,
                    ID.unique(),
                    {
                        user_id: user.$id,
                        truyen_id: mota
                    }
                )
                await load_id_love()
            }
        }catch{}
        setIsProcessing(false)
    }

    const huy_love = async () => {
        if (isProcessing) return
  
        setIsProcessing(true)
        try{
            if(user.$id && mota && myLoveId){
                const result = await databases.deleteDocument(
                    database_id,
                    truyen_yeu_thich_id,
                    myLoveId
                )
                await load_id_love()
            }
        }catch{}
        setIsProcessing(false)
    }


    const formatViewCount = (viewCount: string) => {
        const count = parseInt(viewCount, 10);
        if (isNaN(count)) return "0";
        if (count >= 1_000_000) {
            return `${(count / 1_000_000).toFixed(1)}M`;
        } else if (count >= 1_000) {
            return `${(count / 1_000).toFixed(1)}K`;
        }
        return count.toString();
    };

    if (isLoading || !data) {
        return (
            <BodyVip theme={theme}>
                <View style={[
                    styles.loadingContainer,
                    theme === 'dark' ? styles.darkBackground : styles.lightBackground
                ]}>
                    {/* Skeleton cho ảnh bìa */}
                    <View style={styles.skeletonImage} />
                    
                    {/* Skeleton cho tiêu đề */}
                    <View style={styles.skeletonTitle} />
                    
                    {/* Skeleton cho tác giả */}
                    <View style={styles.skeletonAuthor} />
                    
                    {/* Animation loading */}
                    <View style={styles.loadingAnimation}>
                        <Ionicons 
                            name="book" 
                            size={40} 
                            color={theme === 'dark' ? '#e06af5' : '#fc597a'} 
                            style={styles.spinningIcon}
                        />
                        <Text style={[
                            styles.loadingText,
                            { color: theme === 'dark' ? 'white' : 'black' }
                        ]}>
                            Đang tải truyện...
                        </Text>
                    </View>
                </View>
            </BodyVip>
        );
    }

    return (
        <Body theme={theme}>
            {/* Phần thông tin truyện */}
            <ImageBackground 
                source={{ uri: getImageUrl(data.id_Image) }} 
                style={styles.container} 
                blurRadius={5}
            >        
                <View style={styles.overlay} />   
                <ButtonBack theme={theme} onPress={back}/>
                <View style={styles.thongtin}>
                    <Image source={{ uri: getImageUrl(data.id_Image) }} style={styles.imgView} />
                    <View style={styles.thongtinText}>
                        <Text style={styles.tenTruyen} numberOfLines={2}>{data.name}</Text>
                        <Text style={styles.tenTacGia} numberOfLines={2}>{data.tac_gia}</Text>

                        <View style = {{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                            <TouchableOpacity 
                                style={styles.button}  
                                onPress={() => doc_truyen(data.$id)}
                                disabled={!chapNumber}
                            >
                                <Text style={styles.textButton}>Đọc truyện</Text>
                            </TouchableOpacity>
                            {!isProcessing && (myLoveId !== '' ? (
                                <TouchableOpacity 
                                    style={styles.buttonLove}  
                                    onPress={() => huy_love()}
                                >
                                    <Ionicons name='heart-dislike' size={24} color={'white'} />
                                </TouchableOpacity>
                                ) : (
                                <TouchableOpacity 
                                    style={styles.buttonLove}  
                                    onPress={() => love()}
                                >
                                    <Ionicons name='heart' size={24} color={'white'} />
                                </TouchableOpacity>
                                ))}

                                {isProcessing && (
                                <ActivityIndicator size="small" color="white" /> // Hoặc bất kỳ indicator loading nào bạn muốn
                                )}
                            </View>
                    </View>
                </View>
            </ImageBackground>

            {/* Tab điều hướng */}
            <View style={[styles.select, theme === 'light' ? {backgroundColor: '#FFFF66'} : {backgroundColor: 'black'}]}>
                {['Nội dung', 'Chương', 'Bình luận', 'Đánh giá'].map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.btnSelect, 
                            selected === index && {
                                borderBottomWidth: 2, 
                                borderBottomColor: theme === 'light' ? 'black' : 'white'
                            }
                        ]}
                        onPress={() => setSelected(index)}
                    >
                        <Text style={{ color: theme === 'light' ? 'black' : 'white' }}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Nội dung theo tab */}
            {selected === 0 && (
                <ScrollView 
                showsVerticalScrollIndicator={false} 
                >   
                    <View style={{height: 55, backgroundColor: theme === 'dark' ? '#292929' : '#B7B7B7', flexDirection: 'row'}}>
                        <View style={styles.trangthai}>
                            <Text style={[styles.textTrangThai1, theme === 'light' ? {color: 'red'} : {color: '#e06af5'}]}>
                                {data.tong_so_chuong}
                            </Text>
                            <Text style={[styles.textTrangThai2, theme === 'light' ? {color: 'black'} : {color: '#a9a9a9'}]}>
                                Chương - {data.trang_thai === 0 ? 'Đang ra' : 'Hoàn thành'}
                            </Text>
                        </View>
                        <View style={styles.trangthai}>
                            <Text style={[styles.textTrangThai1, theme === 'light' ? {color: 'red'} : {color: '#e06af5'}]}>
                                {formatViewCount(data.view_truyen)}
                            </Text>
                            <Text style={[styles.textTrangThai2, theme === 'light' ? {color: 'black'} : {color: '#a9a9a9'}]}>
                                Lượt đọc
                            </Text>
                        </View>
                    </View>             
                    <Text style={[styles.mota, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                        {data.mota_truyen}
                    </Text> 
                    <View style={styles.card}>
                        <Text style={[styles.titleCard, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                            Do <Text style={{color: '#e06af5'}}>{name}</Text> đăng
                        </Text>
                        <TouchableOpacity style={styles.btnRight}>
                            <Ionicons name="chevron-forward" size={25} color={theme === 'light' ? 'black' : 'white'}/>
                        </TouchableOpacity>
                    </View>
                    <ListTruyen data={truyen} onPress={chuyen_truyen} theme={theme}/>
               </ScrollView>
            )}

            {selected === 1 && (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                >
                    <View style={styles.tabsChuong}>
                        <Text style={[styles.textChuong, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                            Số chương: ({data.tong_so_chuong})
                        </Text>
                        <TouchableOpacity onPress={() => setArrChuong(prev => !prev)}>
                            <Ionicons name="swap-vertical" size={25} color={theme === 'light' ? 'black' : 'white'}/>
                        </TouchableOpacity>
                    </View>
                    <View>
                        {(arrChuong ? [...dataChuong].reverse() : dataChuong).map((item: any) => (
                            <TouchableOpacity 
                                key={item.$id} 
                                style={styles.btnChuong}
                                onPress={() => click_chuong(item.id_truyen, Number(item.chapter_number))}
                            >
                                <Text 
                                    style={[
                                        styles.nameChuong, 
                                        chapNumber === item.chapter_number 
                                            ? { color: theme === 'light' ? '#0000ee' : '#e06af5', fontWeight: 'bold' } 
                                            : theme === 'light' ? { color: '#666666' } : { color: '#a9a9a9' }
                                    ]}
                                >
                                    {item.ten_chuong}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            {selected === 2 && (
                <Comments 
                    theme={theme} 
                    truyenID={mota ? mota : ''}
                />            
            )}

            {selected === 3 && (
                <Text style={[styles.mota, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                    Đánh giá
                </Text>
            )}
        </Body>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        width: '100%',
        justifyContent: 'center',
        maxHeight: 230,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    },
    thongtin: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 130,
        width: '100%',
        flexDirection: 'row',
        borderRadius: 15,
    },
    imgView: {
        width: 100,
        height: 135,
        borderRadius: 20,
    },
    thongtinText: {
        paddingLeft: 20,
        gap: 5,
        width: '70%',
    },
    tenTruyen: {
        color: 'white',
        fontSize: 15,
    },
    tenTacGia: {
        color: 'white',
        fontSize: 15,
        fontStyle: 'italic',
    },
    button: {
        padding: 5,
        marginVertical: 15,
        width: 100,
        height: 33,
        backgroundColor: "#fc597a",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
    },
    buttonLove: {
        backgroundColor: "#fc597a",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 35,
        padding: 7
    },
    textButton: {
        color: '#fff',
    },
    mota: {
        marginTop: 10,
        textAlign: 'justify',
        fontSize: 14,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginTop: 20,
    },
    titleCard: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 1,
        fontStyle: 'italic'
    },
    btnRight: {},
    select: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'space-between',
    },
    btnSelect: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trangthai: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textTrangThai1: {
        fontSize: 24,
    },
    textTrangThai2: {
        fontSize: 12,
    },
    tabsChuong: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 10,
    },
    textChuong: {
        fontSize: 17,
        letterSpacing: 1,
        marginBottom: 10,
        fontWeight: '700'
    },
    nameChuong: {
        fontSize: 14,
        fontWeight: '600', 
        letterSpacing: 0.5,
    },
    btnChuong: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },

    loadingContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkBackground: {
        backgroundColor: '#1e1e1e',
    },
    lightBackground: {
        backgroundColor: '#fff',
    },
    skeletonImage: {
        width: 100,
        height: 150,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        marginBottom: 20,
    },
    skeletonTitle: {
        width: 200,
        height: 24,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 10,
    },
    skeletonAuthor: {
        width: 150,
        height: 18,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 30,
    },
    loadingAnimation: {
        alignItems: 'center',
        marginTop: 30,
    },
    spinningIcon: {
        transform: [{ rotate: '0deg' }],
        // animation: 'spin 2s linear infinite',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default MotaScreen;