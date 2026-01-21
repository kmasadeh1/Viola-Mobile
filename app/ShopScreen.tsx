import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- TYPES ---
interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  image: string; // URL or local require path
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  type: string;
}

interface Order {
  id: number;
  date: string;
  parentName: string;
  phone: string;
  studentDetails: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: string;
}

const COLORS = {
  primary: '#27ae60', // Shop Green
  secondary: '#2ecc71',
  dark: '#2c3e50',
  light: '#f4f6f9',
  white: '#fff',
  danger: '#e74c3c',
  blue: '#3498db',
};

const { width } = Dimensions.get('window');

export default function ShopScreen() {
  const navigation = useNavigation<any>();
  const [isArabic, setIsArabic] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  // Products Data
  const products: Product[] = [
    {
      id: 'summer',
      nameEn: 'Summer Uniform',
      nameAr: 'الزي الصيفي',
      descEn: 'Lightweight cotton polo shirt with school logo.',
      descAr: 'قميص قطني خفيف مع شعار المدرسة.',
      price: 15,
      image: 'https://via.placeholder.com/300x300/27ae60/ffffff?text=Summer+Uniform', // Replace with require('../assets/summer.jpg')
    },
    {
      id: 'winter',
      nameEn: 'Winter Uniform',
      nameAr: 'الزي الشتوي',
      descEn: 'Warm wool sweater and heavy trousers.',
      descAr: 'سترة صوفية دافئة وبنطال ثقيل.',
      price: 25,
      image: 'https://via.placeholder.com/300x300/34495e/ffffff?text=Winter+Uniform', // Replace with require('../assets/winter.jpg')
    },
  ];

  // Checkout Form State
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentDetails, setStudentDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Wallet'>('Cash');
  const [walletBalance, setWalletBalance] = useState(0);

  // Constants
  const t = (en: string, ar: string) => isArabic ? ar : en;

  // --- LOADING DATA ---
  const loadData = async () => {
    try {
      // 1. Language
      const lang = await AsyncStorage.getItem('viola_language');
      setIsArabic(lang === 'ar');

      // 2. Load Cart
      const cartJson = await AsyncStorage.getItem('viola_cart');
      if (cartJson) setCart(JSON.parse(cartJson));

      // 3. Load Student Info (for pre-filling)
      const currentId = await AsyncStorage.getItem('viola_current_student_id');
      const studentsJson = await AsyncStorage.getItem('viola_students');
      if (currentId && studentsJson) {
        const students = JSON.parse(studentsJson);
        const student = students.find((s: any) => s.id == currentId);
        if (student) {
          setStudentDetails(`${student.name} (${student.id})`);
          setWalletBalance(parseFloat(student.credit || '0'));
          // Attempt to find parent info if stored, otherwise leave blank
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // --- ACTIONS ---
  const addToCart = async (product: Product) => {
    const newItem: CartItem = {
      id: Date.now(),
      name: isArabic ? product.nameAr : product.nameEn,
      price: product.price,
      type: product.id
    };

    const newCart = [...cart, newItem];
    setCart(newCart);
    await AsyncStorage.setItem('viola_cart', JSON.stringify(newCart));
    
    Alert.alert(t('Success', 'نجاح'), t('Added to cart', 'تمت الإضافة للسلة'));
  };

  const removeFromCart = async (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    await AsyncStorage.setItem('viola_cart', JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const processOrder = async () => {
    if (!parentName || !phone || !studentDetails) {
      Alert.alert(t('Error', 'خطأ'), t('Please fill all fields', 'يرجى ملء جميع الحقول'));
      return;
    }

    const total = calculateTotal();

    if (paymentMethod === 'Wallet') {
      if (walletBalance < total) {
        Alert.alert(t('Error', 'خطأ'), t('Insufficient wallet balance', 'رصيد المحفظة غير كافٍ'));
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Deduct Balance if Wallet
      if (paymentMethod === 'Wallet') {
        const currentId = await AsyncStorage.getItem('viola_current_student_id');
        const studentsJson = await AsyncStorage.getItem('viola_students');
        let students = studentsJson ? JSON.parse(studentsJson) : [];
        
        const idx = students.findIndex((s: any) => s.id == currentId);
        if (idx !== -1) {
          students[idx].credit = parseFloat(students[idx].credit || '0') - total;
          await AsyncStorage.setItem('viola_students', JSON.stringify(students));
          setWalletBalance(students[idx].credit);
        }
      }

      // 2. Save Order
      const newOrder: Order = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        parentName,
        phone,
        studentDetails,
        items: cart,
        total,
        paymentMethod,
        status: 'Pending'
      };

      const ordersJson = await AsyncStorage.getItem('viola_orders');
      const orders = ordersJson ? JSON.parse(ordersJson) : [];
      orders.push(newOrder);
      await AsyncStorage.setItem('viola_orders', JSON.stringify(orders));

      // 3. Clear Cart & Reset
      await AsyncStorage.setItem('viola_cart', JSON.stringify([]));
      setCart([]);
      setShowCheckout(false);
      setParentName('');
      setPhone('');
      
      Alert.alert(t('Success', 'نجاح'), t('Order placed successfully!', 'تم استلام طلبك بنجاح!'));

    } catch (e) {
      Alert.alert('Error', 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* HEADER */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={[styles.navBar, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>{t('Uniform Shop', 'متجر الزي المدرسي')}</Text>
           <TouchableOpacity onPress={() => setIsArabic(!isArabic)}>
              <FontAwesome5 name="globe" size={20} color="white" />
           </TouchableOpacity>
        </View>
        <Text style={styles.subTitle}>{t('High quality uniforms for your children', 'زي مدرسي عالي الجودة لأطفالكم')}</Text>
      </LinearGradient>

      {/* PRODUCT GRID */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productBody}>
              <View style={[styles.productHeader, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                <Text style={styles.productTitle}>{t(product.nameEn, product.nameAr)}</Text>
                <Text style={styles.productPrice}>{product.price} JOD</Text>
              </View>
              <Text style={[styles.productDesc, { textAlign: isArabic ? 'right' : 'left' }]}>
                {t(product.descEn, product.descAr)}
              </Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)}>
                <FontAwesome5 name="cart-plus" size={16} color="white" />
                <Text style={styles.addBtnText}>{t('Add to Cart', 'إضافة للسلة')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FLOATING CART BUTTON */}
      <TouchableOpacity style={styles.fabCart} onPress={() => setShowCheckout(true)}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cart.length}</Text>
        </View>
        <FontAwesome5 name="shopping-cart" size={24} color="white" />
      </TouchableOpacity>

      {/* CHECKOUT MODAL */}
      <Modal visible={showCheckout} animationType="slide" onRequestClose={() => setShowCheckout(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            
            {/* Modal Header */}
            <View style={[styles.modalHeader, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
              <Text style={styles.modalTitle}>{t('Checkout', 'إتمام الشراء')}</Text>
              <TouchableOpacity onPress={() => setShowCheckout(false)}>
                <FontAwesome5 name="times" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
              
              {/* Cart Summary */}
              <View style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {t('Order Summary', 'ملخص الطلب')}
                </Text>
                {cart.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    {t('Your cart is empty', 'سلتك فارغة')}
                  </Text>
                ) : (
                  cart.map((item, index) => (
                    <View key={index} style={[styles.cartItem, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                      <View>
                        <Text style={styles.cartItemName}>{item.name}</Text>
                        <Text style={styles.cartItemPrice}>{item.price} JOD</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromCart(index)}>
                        <FontAwesome5 name="trash-alt" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
                {cart.length > 0 && (
                  <View style={[styles.totalRow, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.totalLabel}>{t('Total', 'المجموع')}</Text>
                    <Text style={styles.totalValue}>{calculateTotal()} JOD</Text>
                  </View>
                )}
              </View>

              {/* Checkout Form */}
              {cart.length > 0 && (
                <>
                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                      {t('Contact Details', 'معلومات الاتصال')}
                    </Text>
                    
                    <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>{t('Parent Name', 'اسم ولي الأمر')}</Text>
                    <TextInput
                      style={[styles.input, { textAlign: isArabic ? 'right' : 'left' }]}
                      value={parentName}
                      onChangeText={setParentName}
                      placeholder={t('Enter name', 'أدخل الاسم')}
                    />

                    <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>{t('Phone', 'رقم الهاتف')}</Text>
                    <TextInput
                      style={[styles.input, { textAlign: isArabic ? 'right' : 'left' }]}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder={t('Enter phone', 'أدخل رقم الهاتف')}
                    />

                    <Text style={[styles.label, { textAlign: isArabic ? 'right' : 'left' }]}>{t('Student Details', 'بيانات الطالب')}</Text>
                    <TextInput
                      style={[styles.input, { textAlign: isArabic ? 'right' : 'left' }]}
                      value={studentDetails}
                      onChangeText={setStudentDetails}
                      placeholder={t('Name or ID', 'الاسم أو الرقم')}
                    />
                  </View>

                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                      {t('Payment Method', 'طريقة الدفع')}
                    </Text>
                    
                    <TouchableOpacity 
                      style={[styles.paymentOption, paymentMethod === 'Cash' && styles.paymentActive, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}
                      onPress={() => setPaymentMethod('Cash')}
                    >
                      <FontAwesome5 name="money-bill-wave" size={20} color={paymentMethod === 'Cash' ? COLORS.primary : '#999'} />
                      <Text style={[styles.paymentText, paymentMethod === 'Cash' && { color: COLORS.primary }]}>{t('Cash on Delivery', 'الدفع عند الاستلام')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.paymentOption, paymentMethod === 'Wallet' && styles.paymentActive, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}
                      onPress={() => setPaymentMethod('Wallet')}
                    >
                      <FontAwesome5 name="wallet" size={20} color={paymentMethod === 'Wallet' ? COLORS.primary : '#999'} />
                      <View>
                        <Text style={[styles.paymentText, paymentMethod === 'Wallet' && { color: COLORS.primary }]}>{t('Student Wallet', 'محفظة الطالب')}</Text>
                        <Text style={styles.balanceText}>{t(`Balance: ${walletBalance} JOD`, `الرصيد: ${walletBalance} دينار`)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={[styles.checkoutBtn, loading && { opacity: 0.7 }]} 
                    onPress={processOrder}
                    disabled={loading}
                  >
                    <Text style={styles.checkoutBtnText}>{loading ? t('Processing...', 'جار المعالجة...') : t('Place Order', 'إتمام الطلب')}</Text>
                  </TouchableOpacity>
                </>
              )}

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  navBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subTitle: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: 14 },

  scrollContent: { padding: 20, paddingBottom: 100 },

  productCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: { width: '100%', height: 200, resizeMode: 'cover' },
  productBody: { padding: 20 },
  productHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  productTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  productDesc: { color: '#7f8c8d', marginBottom: 20, lineHeight: 20 },
  addBtn: {
    backgroundColor: COLORS.dark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  addBtnText: { color: 'white', fontWeight: 'bold' },

  fabCart: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  badgeText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 12 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  modalHeader: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },

  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: COLORS.dark },
  
  cartItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  cartItemName: { fontWeight: '600', fontSize: 14, color: COLORS.dark },
  cartItemPrice: { color: COLORS.primary, fontWeight: 'bold' },

  totalRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },

  label: { fontSize: 12, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 10,
    gap: 15,
  },
  paymentActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(39, 174, 96, 0.05)',
  },
  paymentText: { fontWeight: 'bold', color: '#555' },
  balanceText: { fontSize: 10, color: COLORS.primary },

  checkoutBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});