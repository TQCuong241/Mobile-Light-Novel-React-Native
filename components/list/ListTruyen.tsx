import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { getImageUrl } from '@/services/dataAppwrite'
import { Image } from 'expo-image'

type Props = {
    data: { $id: string, name: string, id_Image: string }[],
    onPress: (id: string) => void,
    theme: string
}

const ListTruyen = ({ data, onPress, theme }: Props) => {
    return (
        <>
        <View style={{paddingVertical: 10}}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            style={styles.cardTruyen}
                            onPress={() => {
                                onPress(item.$id);
                            }}
                        >
                            <Image source={{ uri: getImageUrl(item.id_Image) }} style={styles.imgView} transition={300}/>
                            <Text style={[styles.nameTruyen, theme === 'light' ? {color: 'black'} : {color: 'white'}]} ellipsizeMode="tail" numberOfLines={2}>
                            {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                />
            </View>
        </>
    );
    
  };  

export default ListTruyen

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },

    titleCard: {
        fontSize: 20,
        fontFamily: 'serif',
    },

    btnRight: {},

    cardTruyen: {
        marginTop: 5,
        height: 190,
        width: 100,
        marginHorizontal: 8,
        alignItems: 'center',
    },

    nameTruyen: {
        fontFamily: 'serif',
        textAlign: 'center',
        fontSize: 13,
        marginTop: 3,
    },

    flatListContainer: {
        height: 200
    },

    imgView: {
        height: 150,
        width: 100,
        borderRadius: 10,
    },
})