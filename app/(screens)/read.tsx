import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import BodyVip from '@/components/BodyVip'
import useThemeStore from '@/config/useThemeStore'
import { router, useLocalSearchParams } from 'expo-router'
import { database_id, databases, lich_su_id, noi_dung_truyen_id, thong_tin_truyen_id } from '@/services/dataAppwrite'
import { Query } from 'react-native-appwrite'
import useFontStore from '@/config/useFontStore'
import useSizeText from '@/config/useSizeText'
import Toast from "react-native-toast-message"

const { height } = Dimensions.get("window");


const read = () => {
    const {theme, setTheme} = useThemeStore()
    // read là truyện id
    const {read, userID, chapNumber, tenTruyen, lichSuID} : {read?: string, userID?: string, chapNumber?: number, tenTruyen?: string, lichSuID?: string} = useLocalSearchParams()
    const [data, setData] = useState<any | null>(null)
    const [chapterId, setChapterId] = useState<number>(Number(chapNumber) || 1);
    const [chapMax, setChapMax] = useState<number>(100000)
    const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);
    const [view, setView] = useState<number>()

    const translateY = useRef(new Animated.Value(height/2)).current;
    const [visible, setVisible] = useState(false)
    const [selected, setSelected] = useState<number>(0)
    const {font, setFont} = useFontStore()
    const {size, setSize} = useSizeText()
    const [sizeText, setSizeText] = useState<number>(size)

    useEffect(() => {
        load_chuong_max()
    },[])

    useEffect(() => {
        update_lich_su()
        load_noi_dung()
        update_view()
    },[chapterId, view])

    const openList = () => {
        setVisible(true);
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
    };

    const closeList = () => {
    Animated.timing(translateY, {
        toValue: height / 2, 
        duration: 300,
        useNativeDriver: true,
    }).start(() => setVisible(false));
    };

    const load_chuong_max = async () => {
        if(read){
            try{
                const result = await databases.getDocument(
                    database_id,
                    thong_tin_truyen_id,
                    read,
                    [Query.select(['tong_so_chuong', 'view_truyen'])]
                )
                setChapMax(result.tong_so_chuong)
                setView(result.view_truyen)
            }catch(error){
                console.log(error)
            }
        }
    }

    const update_view = async () => {
        try{
            if(view && read){
                const updateView = view + 1
                await databases.updateDocument(
                    database_id,
                    thong_tin_truyen_id,
                    read,
                    {
                        view_truyen: updateView
                    }
                )
            }
        }catch{
            console.log('loi')
        }
    }

    const update_lich_su = async () => {
        try {
            if (read && lichSuID && chapNumber) {
                await databases.updateDocument(
                    database_id,
                    lich_su_id,
                    lichSuID,
                    {
                        chap_number: Number(chapNumber),
                        thoi_gian_xem_truyen: new Date().toISOString()
                    }
                );
            }else{
                console.log('k ton tai read hoac lichSuID hoac chapnumber')
            }
        } catch (error) {
            console.log(error);
        }
    }

    const load_noi_dung = async () => {
        setIsLoadingChapter(true)
        if(read && chapterId){
            try{
                const result = await databases.listDocuments(
                    database_id,
                    noi_dung_truyen_id,
                    [Query.equal('id_truyen', read), Query.equal('chapter_number', chapterId)]
                )
                if(result.documents.length > 0){
                    setData(result.documents[0])   
                }else{
                    if(chapterId <= 0){
                        setChapterId(1)
                    }else if(chapterId > chapMax){
                        setChapterId(chapMax)
                    }
                }
            }catch(error){
                console.log(error)
            }finally{
                setIsLoadingChapter(false)             
            }
        }
    }

    const back = async () => {
        router.back()
    }

    const chuyen_chap = async (chap: number) => {
        try {
            if (read && lichSuID) {
                await databases.updateDocument(
                    database_id,
                    lich_su_id,
                    lichSuID,
                    {
                        chap_number: chap,
                        thoi_gian_xem_truyen: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.log(error);
        }
    
        router.replace({
            pathname: '/(screens)/read', 
            params: { read, userID, chapNumber: chap, tenTruyen, lichSuID }
        });
    };
    

    const dont_chap_next = async () => {
        console.log('Éo có chap')
    }

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    const toggleFont = async ( name: string) => {
        setFont(name)
    }

    const toggleSize = async (size: number) => {
        if(size > 10 && size < 50){
            setSize(size)
        }else{
            Toast.show({
                type: 'error',
                text1: 'Cỡ chữ không hợp lệ',
                text2: 'Cỡ chữ phải lớn hơn 10 và nhỏ hơn 50',
                position: 'top',
                visibilityTime: 3500,
                autoHide: true,
            })
        }
    }

  return (
    <>
        <View style={[{justifyContent: 'space-between', flexDirection: 'row'}, theme === 'light' ? {backgroundColor: 'white'} : {backgroundColor: '#1e1e1e'}]}>
            <View style={styles.container}>
                <TouchableOpacity 
                    onPress={back} 
                    style={{
                        paddingLeft: 10, 
                    }}>
                    <Ionicons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
                <View style={{paddingLeft: 10}}>
                    <Text style={[styles.ten_truyen, theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={1}>{tenTruyen? tenTruyen: 'Loadding ...'}</Text>
                    <Text style={[styles.ten_chuong, theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={2}>{data?.ten_chuong ? data.ten_chuong : 'Loadding ...'}</Text>
                </View>

            </View>
            <View style={styles.viewbtn}>
                <TouchableOpacity style={styles.btn_chuyen_trang} onPress={chapterId <= 1 ? dont_chap_next : () => chuyen_chap(chapterId - 1)}>
                    <Ionicons name="chevron-back-outline" size={24} color={chapterId <= 1 ? '#a9a9a9' : (theme === 'light' ? 'black' : 'white')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn_chuyen_trang} onPress={openList}>
                    <Ionicons name="settings" size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn_chuyen_trang} onPress={chapterId >= chapMax ? dont_chap_next : () => chuyen_chap(chapterId + 1)}>
                    <Ionicons name="chevron-forward-outline" size={24} color={chapterId >= chapMax ? '#a9a9a9' : (theme === 'light' ? 'black' : 'white')} />
                </TouchableOpacity>
            </View>
        </View>

        {/* Body */}
        <BodyVip theme={theme}>
            {/* Nội dung */}
            {isLoadingChapter ? (
                <View style={{minHeight: 400, alignItems: 'center', justifyContent: 'center', marginBottom: 500}}>
                    <ActivityIndicator size="large" color="blue" style={{transform: [{ scale: 1.5 }]}}/>
                </View>
            ) : (
                <Text style={[styles.contentText, theme === 'light' ? {color: 'black'} : {color: 'white'}, font? {fontFamily: font} : {fontFamily: 'serif'}, size? {fontSize: size, lineHeight: size * 1.5} : {fontSize: 14}]}>{data?.noi_dung ? data.noi_dung : 'Loadding ... '}</Text>
            )}
            
            {/* Button tiến và lùi */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.button} onPress={chapterId <= 1 ? dont_chap_next : () => chuyen_chap(chapterId - 1)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="chevron-back-outline" size={24} color={chapterId <= 1 ? '#a9a9a9' : (theme === 'light' ? 'black' : 'white')} />
                        <Text style={[styles.text, chapterId <= 1 ? {color: '#a9a9a9'} : (theme === 'light' ? {color: 'black'} : {color: 'white'})]}> Lùi </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button]} onPress={chapterId >= chapMax ? dont_chap_next : () => chuyen_chap(chapterId + 1)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.text, chapterId >= chapMax ? {color: '#a9a9a9'} : (theme === 'light' ? {color: 'black'} : {color: 'white'})]}> Tiến </Text>
                        <Ionicons name="chevron-forward-outline" size={24} color={chapterId >= chapMax ? '#a9a9a9' : (theme === 'light' ? 'black' : 'white')} />
                    </View>
                </TouchableOpacity>
            </View>
        </BodyVip>
        {visible && (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeList} />
        )}

        {visible && (
            <Animated.View style={[styles.listContainer, { transform: [{ translateY }] }, theme === 'light' ? {backgroundColor: 'white'} : {backgroundColor: '#282828'}]}>  
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={styles.containerAnimationBtn}>
                    <TouchableOpacity style = {[styles.btnScreen, 
                        theme === 'light' ? 
                        (selected === 0 ? {borderBottomWidth: 2, borderBottomColor: 'black'} : {borderBottomColor: 'black'})
                        : 
                        (selected === 0 ? {borderBottomWidth: 2, borderBottomColor: 'white'} : {borderBottomColor: 'white'})]} 
                        onPress={() => setSelected(0)}>
                        <Text style={[theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Thông tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = {[styles.btnScreen, 
                        theme === 'light' ? 
                        (selected === 1 ? {borderBottomWidth: 2, borderBottomColor: 'black'} : {borderBottomColor: 'black'})
                        : 
                        (selected === 1 ? {borderBottomWidth: 2, borderBottomColor: 'white'} : {borderBottomColor: 'white'})]} 
                        onPress={() => setSelected(1)}>
                        <Text style={[theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Cài đặt</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style = {styles.btnScreen} onPress={closeList}>
                    <Ionicons name='chevron-down' size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
            </View>

            {selected === 0 ? (
                <View style={[styles.containerAnimation]}>
                    <Text style={[theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Thông tin</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        justifyContent: 'center',
                        alignItems: 'center',           
                    }}
                    showsVerticalScrollIndicator={false}
                >
                <View style={[styles.containerAnimation]}>
                    {/* Chế độ sáng tối */}
                    <Text style={[styles.title, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Chế độ sáng tối</Text>
                    <TouchableOpacity onPress={toggleTheme} style={[styles.btnTheme]}>
                        {
                            theme === 'light' ? (
                                <>
                                    <Text style={[{color: 'black'}]}>Chuyển sang tối</Text>
                                    <Ionicons name='moon' size={24} color='black' />
                                </>

                            ) : (
                                <>
                                    <Text style={[{color: 'white'}]}>Chuyển sang sáng</Text>
                                    <Ionicons name='sunny' size={24} color='white' />
                                </>
                            )
                        }
                    </TouchableOpacity>

                    {/* Cỡ chữ */}
                    <Text style={[styles.title, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Cỡ chữ</Text>
                    <View style={styles.containerSize}>
                    <TextInput
                        placeholder={String(size)}
                        style={styles.inputSize}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            const numericValue = Number(text.replace(/[^0-9]/g, ""))
                            setSizeText(numericValue)
                        }}
                        value={sizeText ? String(sizeText) : ""} 
                    />

                        <TouchableOpacity style={styles.btnSize} onPress={() => toggleSize(sizeText)}>
                            <Text style={[{textAlign: 'center'}]}>Lưu</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Chọn font chữ */}
                    <Text style={[styles.title, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>Font Chữ</Text>
                    {['serif', 'Playfair', 'frank', 'Waterfall', 'Charm', 'Imperial Script'].map((item, index) => (
                        <TouchableOpacity key={index} onPress = {() => toggleFont(item)} style={[styles.btnFont, font === item ? (theme === 'light' ? {backgroundColor: '#eaeaea'} : {backgroundColor: '#666666'}) : {}]}>
                            <Text style={[styles.btnFontText, {fontFamily: item},theme === 'light' ? {color: 'black'} : {color: 'white'}]}>{item}</Text>
                            {
                                font === item ? (
                                    <Ionicons name='checkmark' size={24} color={theme === 'light' ? 'black' : 'white'} />
                                ) : null
                            }
                        </TouchableOpacity>
                    ))}
                </View>
                </ScrollView>
            )}

            </Animated.View>
        )}
        <Toast/>
    </>
  )
}

export default read

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 1,
        alignItems: 'center',
    },
    ten_truyen: {
        fontSize: 12,
        maxWidth: 260,
        fontWeight: 'bold',
    },
    ten_chuong: {
        fontSize: 10,
    },
    viewbtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginRight: 10,
    },
    btn_chuyen_trang: {
      padding: 5,
    },
    contentText: {
        textAlign: 'justify',
        lineHeight: 20,
        paddingHorizontal: 10,
        // fontFamily: 'serif',
        // letterSpacing: 0.7,
    },
    button: {
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    text: {
        color: 'black',
        fontSize: 16
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
        padding: 12,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        elevation: 5,
        height: '70%',
        maxHeight: '80%',
    },

    containerAnimationBtn: {
        flexDirection: 'row',
        gap: 20,
    },

    btnScreen: {
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    containerAnimation: {
        marginTop: 10,
        gap: 10
    },

    btnFont: {
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 20,
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    btnFontText: {
        fontSize: 16,
        letterSpacing: 1,
        fontWeight: '600',
    },

    title: {
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: 'bold',
    },

    btnTheme: {
        paddingHorizontal: 21,
        paddingVertical: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fc587a',
    },

    containerSize: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 21,
        alignItems: 'center',
        gap: 20
    },

    inputSize: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0000ee',
        textAlign: 'center',
        width: 140,
        color: 'red',
    },

    btnSize: {
        backgroundColor: '#fc587a',
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 31,
    }
})