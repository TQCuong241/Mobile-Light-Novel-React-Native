import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Modal, Pressable, TextInput, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '@/config/useThemeStore';
import { database_id, databases, getImageUrl, shop_vien_avatar_id, thong_tin_nguoi_dung_id, vien_of_user_id } from '@/services/dataAppwrite';
import { Query } from 'react-native-appwrite';
import BorderAvatar from '@/components/common/BorderAvatar';
import { router } from 'expo-router';
import useUser from '@/hooks/useUser'

const ShopScreen = () => {
  const { theme } = useThemeStore();
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  const [allProducts, setAllProducts] = useState<any>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [filtering, setFiltering] = useState(true); // Thêm trạng thái filtering
  const { user } = useUser();
  const [dataUser, setDataUser] = useState<any>();
  const [ownedFrames, setOwnedFrames] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setUserLoading(true);
        setFiltering(true); // Bắt đầu quá trình lọc
        await load_thong_tin_user();
        await load_vien_of_user();
        await load_shop();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    if (allProducts.length > 0 && ownedFrames.length >= 0) {
      filterProducts();
    }
  }, [allProducts, ownedFrames, searchText, sortOption]);

  const filterProducts = () => {
    setFiltering(true); // Bắt đầu quá trình lọc
    
    // Lọc ra các sản phẩm mà user chưa sở hữu
    const availableProducts = allProducts.filter((product: any) => 
      !ownedFrames.includes(product.$id)
    );
    setDisplayedProducts(availableProducts);
    
    // Áp dụng bộ lọc tìm kiếm
    const filtered = availableProducts.filter((item: any) => 
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(filtered);
    
    setFiltering(false);
    setLoading(false);
  };

  const load_shop = async (sortOption: string = 'default') => {
    try {
      let queries = [];
  
      switch (sortOption) {
        case 'priceHighToLow':
          queries.push(Query.orderDesc('price'));
          break;
        case 'priceLowToHigh':
          queries.push(Query.orderAsc('price'));
          break;
        case 'name':
          queries.push(Query.orderAsc('name'));
          break;
        default:
          queries.push(Query.orderAsc('$id'));
      }
  
      const result = await databases.listDocuments(
        database_id,
        shop_vien_avatar_id,
        queries
      );
      
      setAllProducts(result.documents);
    } catch (error) {
      console.error('Lỗi tải shop:', error);
      setLoading(false);
      setFiltering(false);
    }
  };

  const load_vien_of_user = async () => {
    try {
      if (user) {
        const result = await databases.listDocuments(
          database_id,
          vien_of_user_id,
          [Query.equal('user_id', user.$id)]
        );
        
        // Lấy danh sách các frame_id mà user đã sở hữu
        const frameIds = result.documents.map((doc: any) => doc.vien_id);
        setOwnedFrames(frameIds);
      } else {
        setOwnedFrames([]); // Nếu không có user, coi như chưa sở hữu gì
      }
    } catch (error) {
      console.error('Lỗi tải viền của user:', error);
      setOwnedFrames([]); // Nếu có lỗi, coi như chưa sở hữu gì
    }
  };

  const load_thong_tin_user = async () => {
    try {
      if (user) {
        const result = await databases.listDocuments(
          database_id,
          thong_tin_nguoi_dung_id,
          [Query.equal('$id', user.$id)]
        );
        setDataUser(result.documents);
      }
    } catch (error) {
      console.error('Lỗi tải thông tin user:', error);
    }
  };
  
  const sortProducts = (option: string) => {
    setSortOption(option);
    setShowSortModal(false);
    load_shop(option);
  };

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity style={[styles.productCard, { backgroundColor: theme === 'dark' ? '#2D3748' : 'white' }]}>
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme === 'dark' ? 'white' : '#2D3748' }]}>{item.name}</Text>
        <View style={styles.priceRatingContainer}>
          <Text style={[styles.productPrice, { color: theme === 'dark' ? '#A78BFA' : '#6C63FF' }]}>{Number(item.price).toLocaleString('vi-VN')} VND</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (userLoading || loading || filtering) {
    return (
      <LinearGradient 
        colors={theme === 'dark' ? ['#1e1e1e', '#1e1e1e'] : ['#f8f9fa', '#e9ecef']} 
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator 
          size="large" 
          color={theme === 'dark' ? '#A78BFA' : '#6C63FF'} 
        />
        <Text style={[styles.loadingText, { color: theme === 'dark' ? 'white' : '#2D3748' }]}>
          {userLoading ? 'Đang tải thông tin người dùng...' : 
           filtering ? 'Đang lọc sản phẩm...' : 'Đang tải sản phẩm...'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={theme === 'dark' ? ['#1e1e1e', '#1e1e1e'] : ['#f8f9fa', '#e9ecef']} 
      style={styles.container}
    >      
      <View style={{paddingVertical: 6}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity 
            style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10}} 
            onPress={() => router.push('/(screens)/profile')}
          >
            <BorderAvatar 
              avatarSource={dataUser ? dataUser[0]?.id_image : 'imageUser'}
              frameSource={dataUser ? dataUser[0]?.id_image_vien : ''}
              size={60}
              avatarSizeRatio={0.65}
            />
            <Text style={[styles.textName, theme === 'light' ? styles.textNameLight : styles.textNameDark]}>
              {user ? user.name : 'Không đăng nhập'}
            </Text>
          </TouchableOpacity>
          <View></View>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#2D3748' : 'white' }]}>
          <MaterialIcons name="search" size={24} color={theme === 'dark' ? '#A78BFA' : '#6C63FF'} />
          <TextInput 
            style={[styles.searchInput, { color: theme === 'dark' ? 'white' : 'black' }]} 
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={theme === 'dark' ? '#CBD5E0' : '#A0AEC0'}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Sorting Section */}
        <View style={styles.featuredHeader}>
          <Text style={[styles.sectionTitle, { color: theme === 'dark' ? 'white' : '#2D3748' }]}>Sản phẩm của chúng tôi</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <MaterialIcons 
              name="sort" 
              size={24} 
              color={theme === 'dark' ? '#A78BFA' : '#6C63FF'} 
            />
          </TouchableOpacity>
        </View>

        {/* Products List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.$id}
          scrollEnabled={false}
          contentContainerStyle={styles.productsContainer}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme === 'dark' ? 'white' : '#2D3748' }]}>
              {searchText ? 'Không tìm thấy sản phẩm phù hợp' : 'Bạn đã sở hữu tất cả sản phẩm hoặc không có sản phẩm nào'}
            </Text>
          }
        />

        {/* Sort Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showSortModal}
          onRequestClose={() => setShowSortModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowSortModal(false)}
          >
            <View 
              style={[
                styles.modalContent, 
                { backgroundColor: theme === 'dark' ? '#2D3748' : 'white' }
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme === 'dark' ? 'white' : '#2D3748' }]}>
                Sắp xếp theo
              </Text>
              
              <SortOption 
                icon="swap-vert"
                title="Giá cao đến thấp"
                active={sortOption === 'priceHighToLow'}
                onPress={() => sortProducts('priceHighToLow')}
                theme={theme}
              />
              
              <SortOption 
                icon="swap-vert"
                title="Giá thấp đến cao"
                active={sortOption === 'priceLowToHigh'}
                onPress={() => sortProducts('priceLowToHigh')}
                theme={theme}
              />
              
              <SortOption 
                icon="sort-by-alpha"
                title="Tên sản phẩm"
                active={sortOption === 'name'}
                onPress={() => sortProducts('name')}
                theme={theme}
              />
              
              <SortOption 
                icon="restore"
                title="Mặc định"
                active={sortOption === 'default'}
                onPress={() => sortProducts('default')}
                theme={theme}
              />
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const SortOption = ({ icon, title, active, onPress, theme }: any) => (
  <TouchableOpacity 
    style={[
      styles.sortOption, 
      active && { backgroundColor: theme === 'dark' ? '#4A5568' : '#EDF2F7' }
    ]}
    onPress={onPress}
  >
    <MaterialIcons 
      name={icon} 
      size={20} 
      color={active ? (theme === 'dark' ? '#A78BFA' : '#6C63FF') : (theme === 'dark' ? '#CBD5E0' : '#4A5568')} 
    />
    <Text style={[
      styles.sortOptionText, 
      { 
        color: active ? (theme === 'dark' ? '#A78BFA' : '#6C63FF') : (theme === 'dark' ? '#CBD5E0' : '#4A5568') 
      }
    ]}>
      {title}
    </Text>
    {active && (
      <MaterialIcons 
        name="check" 
        size={20} 
        color={theme === 'dark' ? '#A78BFA' : '#6C63FF'} 
        style={styles.checkIcon}
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  textName: {
    fontSize: 20,
    fontFamily: 'serif'
  },
  textNameLight: {},
  textNameDark: {
    color: 'white'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 13,
  },
  sortButton: {
    padding: 8,
    alignItems: 'center',
  },
  productsContainer: {
    paddingBottom: 16,
  },
  productCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  addToCartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});

export default ShopScreen;