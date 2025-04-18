import { Client, Account, ID, Databases, Storage } from 'react-native-appwrite'

const client = new Client()
    .setProject('67585414002a0abafe96')
    .setPlatform('com.example.truyenbro');

const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

const database_id = '675876ce0032205606c8'
const thong_tin_truyen_id = '675876dc000467d50ea8'
const noi_dung_truyen_id = '675a245d0015e8a3be22'
const storage_id = '67587b7a002803be8747'
const lich_su_id = '675a348800351c884c7e'
const projectId = '67585414002a0abafe96'
const thong_tin_nguoi_dung_id = '67bc8d44002f19aa8f58'
const lich_su_nap_tien_id = '67e5515b0008aff936a6'
const quyen_dang_truyen_id = '67e5a0a40036edd5f737'
const thong_bao_id = '67e5b3c7002d7fe6a234'
const truyen_yeu_thich_id = '67e64e6000062a0c9c3a'
const shop_vien_avatar_id = '67e9ea8a002da776394f'
const vien_of_user_id = '67e9f53f001af296008a'
const comment_id = '67ead901001a39ae8aff'
const tra_loi_comment_id = '67eae728000171a9b83f'

const getImageUrl = (imageId : string): string => {
    return `https://cloud.appwrite.io/v1/storage/buckets/${storage_id}/files/${imageId}/view?project=${projectId}&mode=admin`
}

export { tra_loi_comment_id, comment_id, client, vien_of_user_id, shop_vien_avatar_id, truyen_yeu_thich_id, thong_bao_id, quyen_dang_truyen_id, lich_su_nap_tien_id, storage_id, storage, account, database_id, thong_tin_truyen_id, databases, getImageUrl, noi_dung_truyen_id, lich_su_id, thong_tin_nguoi_dung_id }

