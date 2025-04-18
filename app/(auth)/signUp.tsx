import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Body from '@/components/Body'
import { router } from 'expo-router'
import InputPassword from '@/components/common/InputPassword'
import InputUser from '@/components/common/InputUser'
import ButtonStart from '@/components/common/ButtonStart'
import useThemeStore from '@/config/useThemeStore'
import Toast from 'react-native-toast-message'
import { account, database_id, databases, thong_tin_nguoi_dung_id } from '@/services/dataAppwrite'
import { ID } from 'react-native-appwrite'

const signUp = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password1, setPassword1] = useState('')
    const {theme} = useThemeStore()

    useEffect(() => {
    },[])

    const dang_ky = async () => {
        const id = ID.unique()
        if(password !== password1 ){
            Toast.show({
                type: 'error',
                text1: 'Nhập lại mật khẩu không giống!',
                position: 'top'
            })
            return
        }

        if(password.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Mật khẩu phải từ 8 ký tự trở lên',
                position: 'top'
            })
            return
        }

        try{
            await account.create(
                id,
                email,
                password,
                username
            )

            await databases.createDocument(
                database_id,
                thong_tin_nguoi_dung_id,
                id,
                {
                    id_image: 'imageUser',
                    so_thich: '',
                    is_admin: 0,
                    email: email,
                    name: username,
                    count_money_VND: 0,
                    count_hoa: 0,
                    count_phieu: 0,
                    count_key: 0,
                    count_coin_free: 0,
                    count_hoa_da_tang: 0
                }
            )
            Toast.show({
                type: 'success',
                text1: 'Đăng ký thành công!',
                position: 'top'
            })
            setUsername('')
            setEmail('')
            setPassword('')
            setPassword1('')
        }catch(error){
            console.error("Lỗi đăng ký:", error)
            Toast.show({
                type: 'error',
                text1: 'Email này đã có trên hệ thống!',
                position: 'top'
            })
        }


    }
  return (
    <Body theme={theme}>
        <View style={styles.containerBody}>
        {theme === 'dark' ? (
            <Image             
                source={require("../../assets/images/signupDark.png")}
                style={{ width: '100%', height: '100%'}} 
                resizeMode="contain" 
            />
        ) : (
            <Image     
                source={require("../../assets/images/signup.png")}        
                style={{ width: '100%', height: '100%'}} 
                resizeMode="contain" 
            />        
        )}
        </View>
        <View style={styles.containerInput}>
            <Text style={[styles.title, theme === 'dark' ? styles.titleDark : styles.titleLight]}>Create Account</Text>
            <InputUser 
                value={username}
                onChangeText={setUsername}
                placeholder='Tên của bạn'
            />
            <InputUser 
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
            />
            <InputPassword
                value={password}
                onChangeText={setPassword}
                placeholder='Nhập mật khẩu'/>
            <InputPassword
                value={password1}
                onChangeText={setPassword1}
                placeholder='Nhập lại mật khẩu'/>
            <ButtonStart name='Đăng ký' onPress={dang_ky} theme={theme} styles={{marginVertical: 20}}/>
            <View style={styles.screenLogin}>
                <Text style={{color: '#a9a9a9', letterSpacing: 1, fontSize: 16}}>Bạn đã có tài khoản?</Text>
                <Text onPress={() => router.replace('/(auth)/login')} style={[theme === 'dark' ? styles.loginDark : styles.loginLight]}>Đăng nhập</Text>
            </View>
        </View>
        <Toast/>
    </Body>
  )
}

export default signUp

const styles = StyleSheet.create({
    containerBody: {
        width: '100%',
        height: '35%',
        alignItems: 'center',
      },
    containerInput: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        letterSpacing: 1,
        fontFamily: 'serif',
        fontSize: 26,
        textAlign: 'center',
        marginBottom: 20,
    },
    titleDark: {
        color: '#fc5679',
    },
    titleLight: {

    },
    screenLogin: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    loginDark: {
        color: '#FCAFB7',
        marginLeft: 10,
        letterSpacing: 1, 
        fontSize: 16
    },
    loginLight: {
        color: 'black',
        marginLeft: 10,
        letterSpacing: 1, 
        fontSize: 16
    }
})