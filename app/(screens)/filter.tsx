import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Dimensions, FlatList, Image } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { database_id, databases, thong_tin_truyen_id, getImageUrl } from '@/services/dataAppwrite';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Query } from 'react-native-appwrite';
import useThemeStore from '@/config/useThemeStore';
import Body from '@/components/Body';

const { height } = Dimensions.get("window");

const item = () => {
    const { item }: { item?: string } = useLocalSearchParams();
    const [truyen, setTruyen] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const translateY = useRef(new Animated.Value(height / 2)).current;
    const [sapXep, setSapXep] = useState('update_new_chapter');
    const [chuongFilter, setChuongFilter] = useState<{ min: number | null, max: number | null }>({ min: null, max: null });
    const [theLoai, setTheLoai] = useState('');
    const [chuongFilterBtn, setChuongFilterBtn] = useState<{ min: number | null, max: number | null }>({ min: null, max: null });
    const [theLoaiBtn, setTheLoaiBtn] = useState('');
    const [sapXepBtn, setSapXepBtn] = useState('update_new_chapter');
    const { theme } = useThemeStore();

    const fetchData = useCallback(async () => {
        try {
        let queries = [
            Query.orderDesc(sapXepBtn),
            Query.select(['$id', 'name', 'id_Image', 'tac_gia', 'view_truyen', 'tong_so_chuong'])
        ];

        if (chuongFilterBtn.min !== null && chuongFilterBtn.min !== undefined) {
            queries.push(Query.greaterThanEqual('tong_so_chuong', chuongFilterBtn.min));
        }
        if (chuongFilterBtn.max !== null && chuongFilterBtn.max !== undefined) {
            queries.push(Query.lessThanEqual('tong_so_chuong', chuongFilterBtn.max));
        }

        if (theLoaiBtn) {
            queries.push(Query.equal('the_loai', theLoaiBtn));
        }

        const result = await databases.listDocuments(database_id, thong_tin_truyen_id, queries);
        setTruyen(result.documents);
        } catch (error) {
        console.log(error);
        }
    }, [sapXepBtn, chuongFilterBtn, theLoaiBtn]);

    useEffect(() => {
        if (item) {
        setSapXepBtn(item);
        }
        fetchData();
    }, [fetchData, item]);

    const openList = () => {
        setVisible(true);
        setSapXep(sapXepBtn);
        setTheLoai(theLoaiBtn);
        setChuongFilter(chuongFilterBtn);
        Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        }).start();
    };

    const handleSort = useCallback((field: string) => {
        setSapXep(field);
    }, []);

    const theLoaiSort = useCallback((field: string) => {
        setTheLoai(field);
    }, []);

    const chuongSort = useCallback((minChuong: number | null, maxChuong: number | null) => {
        setChuongFilter({ min: minChuong, max: maxChuong });
    }, []);

    const btnTimTruyen = useCallback(() => {
        setSapXepBtn(sapXep);
        setTheLoaiBtn(theLoai);
        setChuongFilterBtn(chuongFilter);
        closeList();
    }, [sapXep, theLoai, chuongFilter]);

    const closeList = useCallback(() => {
        Animated.timing(translateY, {
        toValue: height / 2,
        duration: 300,
        useNativeDriver: true,
        }).start(() => setVisible(false));
    }, [translateY]);

    const back = useCallback(() => {
        router.back();
    }, []);

    const handlePress = async (id: string) => {
        router.push({
            pathname: '/(screens)/mota',
            params: {
                mota: id,
            }
        })
    }

    const sapXepOptions = [
        { label: 'Chương mới', value: 'update_new_chapter' },
        { label: 'Truyện mới', value: '$createdAt' },
        { label: 'Lượt xem', value: 'view_truyen' },
        { label: 'Số chương', value: 'tong_so_chuong' },
        { label: 'Tên truyện', value: 'name' },
    ];

    const chuongOptions = [
        { label: 'Dưới 300', min: 0, max: 300 },
        { label: '300 - 600', min: 300, max: 600 },
        { label: '600 - 1000', min: 600, max: 1000 },
        { label: '1000 - 2000', min: 1000, max: 2000 },
        { label: 'Hơn 2000', min: 2000, max: null },
        { label: 'Không sắp xếp', min: null, max: null },
    ];

    const theLoaiOptions = [
        { label: 'Huyền huyễn', value: 'Huyền huyễn' },
        { label: 'Đô thị', value: 'Đô thị' },
        { label: 'Huyền nghi', value: 'Huyền nghi' },
        { label: 'Hệ thống', value: 'Hệ thống' },
        { label: 'Dã sử', value: 'Dã sử' },
        { label: 'Võng du', value: 'Võng du' },
        { label: 'Đồng nhân', value: 'Đồng nhân' },
        { label: 'Khoa huyễn', value: 'Khoa huyễn' },
    ];

  return (
    <Body theme={theme} >
        <View style={[styles.header]}>
            <TouchableOpacity onPress={back}>
                <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>Danh sách truyện</Text>
            <TouchableOpacity onPress={openList}>
                <Ionicons name="layers-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
        </View>

        {/* <ListTruyen data={truyen} onPress={handlePress} /> */}
        <FlatList
                data={truyen}
                keyExtractor={(item) => item.$id}
                renderItem={({item}) => {
                    return(
                        <TouchableOpacity style={styles.container} onPress={() => handlePress(item.$id)}>
                            <View>
                                <Image source={{uri: getImageUrl(item.id_Image)}} style={styles.img}/>
                            </View>
                            <View style= {styles.viewText}>
                                <Text style={[styles.tac_gia, theme === 'dark' ? {color: '#b4b4b4'} : {color: 'black'}]}> # {item.tac_gia}</Text>
                                <Text style={[styles.name, theme === 'dark' ? {color: 'white'} : {color: 'black', fontWeight: '700'}]}>{item.name}</Text>
                                <View style={[styles.view_truyen]}>
                                    <Ionicons name='eye-outline' size={17} color={theme === 'dark' ? 'white' : 'black'}/>
                                    <Text style={theme === 'dark' ? {color: 'white'} : {color: 'black'}}>{[item.view_truyen]}</Text>
                                </View>
                                <View style={styles.so_chuong}>
                                    <Ionicons name='book-outline' size={17} color={theme === 'dark' ? 'white' : 'black'}/>
                                    <Text style={theme === 'dark' ? {color: 'white'} : {color: 'black'}}>{item.tong_so_chuong}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatList}
            />
        {visible && (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeList} />
        )}

        {visible && (
            <Animated.View style={[styles.listContainer, { transform: [{ translateY }] }, theme === 'dark' ? { backgroundColor: '#1e1e1e' } : { backgroundColor: 'white' }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View>
                <Text style={[{ fontSize: 17, marginBottom: 10, fontWeight: '700' }, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>Sắp Xếp</Text>
                <View style={styles.items}>
                    {sapXepOptions.map((option) => (
                    <TouchableOpacity key={option.value} style={styles.item} onPress={() => handleSort(option.value)}>
                        <Text style={[sapXep === option.value ? styles.selectedText : undefined, theme === 'dark' ? {color: 'white', borderBottomColor: 'white'} : {color: 'black', borderBottomColor: 'black'}]}>  
                        {option.label}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
                </View>
                <View style={{ marginTop: 15 }}>
                <Text style={[{ fontSize: 17, marginBottom: 10, fontWeight: '700' }, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>Xếp theo chương</Text>
                <View style={styles.items}>
                    {chuongOptions.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.item} onPress={() => chuongSort(option.min, option.max)}>
                        <Text style={[(chuongFilter.min === option.min && chuongFilter.max === option.max) ? styles.selectedText : undefined, theme === 'dark' ? {color: 'white', borderBottomColor: 'white'} : {color: 'black', borderBottomColor: 'black'}]}>
                        {option.label}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
                </View>
                <View style={{ marginTop: 15 }}>
                <Text style={[{ fontSize: 17, marginBottom: 10, fontWeight: '700' }, theme === 'dark' ? {color: 'white'} : {color: 'black'}]}>Thể loại</Text>
                <View style={styles.items}>
                    {theLoaiOptions.map((option) => (
                    <TouchableOpacity key={option.value} style={styles.item} onPress={() => theLoaiSort(option.value)}>
                        <Text style={[theLoai === option.value ? styles.selectedText : undefined, theme === 'dark' ? {color: 'white', borderBottomColor: 'white'} : {color: 'black', borderBottomColor: 'black'}]}>
                        {option.label}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center', width: '99%' }}>
                <TouchableOpacity style={[{ padding: 10, borderWidth: 1, borderRadius: 10 }, theme === 'dark' ? {borderColor: 'white'} : {borderColor: 'black'}]} onPress={btnTimTruyen}>
                    <Text style={theme === 'light' ? {color: 'black'} : {color: 'white'}}>Tìm truyện</Text>
                </TouchableOpacity>
            </View>
            </Animated.View>
        )}
    </Body>
    );
};

export default item;

const styles = StyleSheet.create({
    flatList: {
        marginHorizontal: 10,
    },
    container: {
        flexDirection: 'row',
        padding: 5,
        gap: 10,
        alignItems: 'center'
    },
    img: {
        width: 60,
        height: 90,
        borderRadius: 4,
        flex: 1,
    },
    viewText: {
        flex: 10,
    },
    tac_gia: {
        fontSize: 12,
        marginLeft: 10,
    },
    name: {
        fontSize: 14,
        fontFamily: 'serif'
    },
    view_truyen: {
        alignItems: 'center',
        gap: 10,
        flexDirection: 'row',
        paddingLeft: 1
    },
    so_chuong: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        paddingLeft: 1,
    },
    header: {
        justifyContent: 'space-between',
        width: '99%',
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 15,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    listContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        height: '50%',
        maxHeight: '80%',
    },
    scrollView: {
        flexGrow: 1,
    },
    items: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    item: {
        padding: 5,
    },
    selectedText: {
        borderBottomWidth: 2
    },
});