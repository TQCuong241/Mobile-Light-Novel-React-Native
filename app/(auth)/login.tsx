import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Body from '@/components/Body'
import { router } from 'expo-router'
import InputPassword from '@/components/common/InputPassword'
import ButtonStart from '@/components/common/ButtonStart'
import InputUser from '@/components/common/InputUser'
import { account, database_id, databases, thong_tin_nguoi_dung_id } from '@/services/dataAppwrite'
import { Query } from 'react-native-appwrite'
import useThemeStore from '@/config/useThemeStore'

const login = () => {
  const {theme} = useThemeStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [thongbao, setThongbao] = useState('')

  useEffect(() => {
  }, [])

  const click_login = async () => {
    setLoading(true)
    try{
      await account.createEmailPasswordSession(email, password)
      router.replace('/')
    }
    catch(error){
      console.log(error)
      check_mail(email)
    }
  }

  const check_mail = async (email: string) => {
    try{
      const result = await databases.listDocuments(
        database_id,
        thong_tin_nguoi_dung_id,
        [Query.equal('email', email)]
      )
      if(result.documents.length > 0){
        setThongbao('Sai mật khẩu!')
      }else{
        setThongbao('Email không tồn tại')
      }
      setLoading(false)
    }catch{
      setThongbao('Email không tồn tại')
      setLoading(false)
    }
  }

  return (
    <Body theme={theme} styles={styles.container}>
      <View style={styles.containerBody}>
        {theme === 'dark' ? (
          <Image 
            source={require("../../assets/images/loginDark.png")}
            style={{ width: '90%', height: '90%' }} 
            resizeMode="contain"          
          />
        ) : (
          <Image 
            source={require("../../assets/images/loginLight.png")}
            style={{ width: '90%', height: '90%'}} 
            resizeMode="contain"
          />
        )}
        <Text style={[styles.welcome, theme === 'dark' ? styles.welcomeDark : styles.welcomeLight]}>Đăng nhập!</Text>
        <Text style={{color: 'red'}}>{thongbao}</Text>
      </View>
      <View style={styles.containerForm}>
          <InputUser 
            value={email}
            onChangeText={setEmail}
            placeholder='Email'
          />
          <InputPassword
            value={password}
            onChangeText={setPassword}
            placeholder='Password'
          />

          <ButtonStart name={loading? 'loading.....' : 'Đăng nhập' } onPress={click_login} theme={theme} styles={{marginVertical: 20}}/>
          <View style={styles.screenSignUp}>
            <Text style={{color: '#a9a9a9', letterSpacing: 1, fontSize: 16}}>Bạn chưa có tài khoản?</Text>
            <Text onPress={() => router.replace('/(auth)/signUp')} style={[theme === 'dark' ? styles.signUpDark : styles.signUpLight]}>Đăng ký</Text>
          </View>
      </View>
    </Body>
  )
}

export default login

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerBody: {
    width: '100%',
    height: '55%',
    alignItems: 'center',
  },
  containerForm: {
    alignItems: 'center',
    marginTop: 30,
  },
  welcome: {
    fontWeight: '900',
    fontSize: 30,
    letterSpacing: 1,
    fontFamily: 'serif',
  },
  welcomeDark: {
    color: 'white'
  },
  welcomeLight: {

  },
  screenSignUp: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  signUpDark: {
    color: '#FCAFB7',
    marginLeft: 10,
    letterSpacing: 1, 
    fontSize: 16
  },
  signUpLight: {
    color: 'black',
    marginLeft: 10,
    letterSpacing: 1, 
    fontSize: 16
  }
})