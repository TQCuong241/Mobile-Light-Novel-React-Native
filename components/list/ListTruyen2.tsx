import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { getImageUrl } from '@/services/dataAppwrite'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'

type Props = {
    data: { $id: string; name: string; id_Image: string, tong_so_chuong: string, the_loai: string }[];
    onPress: (item: any) => void;
    theme: string
    onPress1?: () => void
    title: string
};

const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

const ListTruyen2 = ({data, onPress, theme, onPress1, title }: Props) => {
    const groupedData = chunkArray(data, 3);

    return (
        <>
        <View style={theme === 'light' ? {backgroundColor: '#9a9a9a',} : {backgroundColor: '#282c35'}}>
            <View style={styles.card}>
                <Text style={[styles.titleCard, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>{title}</Text>
                <TouchableOpacity style={styles.btnRight} onPress={onPress1}>
                    <Ionicons name="chevron-forward" size={25} color={theme === 'light' ? 'black' : 'white'}/>
                </TouchableOpacity>
            </View>
            <FlatList
                data={groupedData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        {item.map((subItem) => (
                            <TouchableOpacity
                                key={subItem.$id}
                                style={styles.cardTruyen}
                                onPress={() => onPress(subItem.$id)}
                            >
                                <Image
                                    source={{ uri: getImageUrl(subItem.id_Image) }}
                                    style={styles.imgView}
                                    transition={300}
                                />
                                <View style = {{paddingLeft: 10, flex: 45}}>
                                    <Text style={[styles.nameTruyen, theme === 'light' ? {color: 'black'} : {color: '#e06af5'}]} ellipsizeMode="tail" numberOfLines={3}>
                                        {subItem.name}
                                    </Text>
                                    <Text style={[styles.text, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                                        {subItem.the_loai}
                                    </Text>
                                    <Text style={[styles.text, theme === 'light' ? {color: 'black'} : {color: 'white'}]}>
                                        Số chương: {subItem.tong_so_chuong}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.flatListContainer]}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
            />
        </View>
        </>
    );
};

export default ListTruyen2;

const styles = StyleSheet.create({

    row: {
        marginHorizontal: 8,
    },

    card: {
        flexDirection: 'row',
        marginTop: 5,
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },

    cardTruyen: {
        flexDirection: 'row',
        marginVertical: 7,
        height: 90,
        width: 300,
    },

    titleCard: {
        fontSize: 20,
        fontFamily: 'serif',
        fontWeight: '900',
        letterSpacing: 1,
    },

    btnRight: {},

    nameTruyen: {
        fontFamily: 'serif',
        fontSize: 13,
        fontWeight: '900',
        marginTop: 3,
    },

    flatListContainer: {
        paddingVertical: 7
    },

    imgView: {
        height: '100%',
        width: 70,
        borderRadius: 5,
        flex: 14,
    },

    text: {

    }
})
