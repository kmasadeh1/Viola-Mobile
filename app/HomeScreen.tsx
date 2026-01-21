import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ImageBackground, 
  Linking, 
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- TYPES ---
interface HomeData {
  about: {
    title: string;
    desc: string;
    quote: string;
    author: string;
    image: string;
  };
  features: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
    avatar: string;
  }>;
  footer: {
    desc: string;
    address: string;
    phone: string;
    email: string;
    social: {
      fb: string;
      insta: string;
      twitter: string;
      linkedin: string;
    };
  };
}

// --- CONSTANTS ---
const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#6a1b9a',   // Viola Purple
  secondary: '#ffb300', // Playful Yellow
  accent: '#00bcd4',
  light: '#f3e5f5',
  dark: '#2c3e50',
  white: '#fff',
  grey: '#f4f6f9',
  overlay: 'rgba(106, 27, 154, 0.85)',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [isArabic, setIsArabic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Default Data
  const defaultData: HomeData = {
    about: {
      title: "About Us",
      desc: "Viola Academy is a premier kindergarten dedicated to fostering creativity, independence, and academic excellence in early childhood.",
      quote: "We combine Montessori independence with Mental Math rigor.",
      author: "- Mr. Kareem, Principal",
      image: "https://ui-avatars.com/api/?name=Viola+Admin&size=512&background=random" 
    },
    features: [
      { icon: "brain", title: "Mental Math", desc: "Developing speed and accuracy in calculation." },
      { icon: "hands-helping", title: "Montessori", desc: "Hands-on learning that fosters independence." },
      { icon: "language", title: "Bilingual", desc: "Immersive English and Arabic curriculum." },
      { icon: "palette", title: "Creativity", desc: "Arts, crafts, and music integration." }
    ],
    testimonials: [
      { name: "Mrs. Layla", role: "Mother of Sarah", quote: "Viola Academy has been a blessing. My daughter loves the Montessori activities!", avatar: "" },
      { name: "Mr. Ahmad", role: "Father of Omar", quote: "The focus on mental math is impressive.", avatar: "" }
    ],
    footer: {
      desc: "Empowering the next generation in Irbid.",
      address: "University St., Irbid, Jordan",
      phone: "+962 79 000 0000",
      email: "info@viola.edu.jo",
      social: { fb: "#", insta: "#", twitter: "#", linkedin: "#" }
    }
  };

  const [homeData, setHomeData] = useState<HomeData>(defaultData);

  // Load Data
  const loadData = async () => {
    try {
      // 1. Load Language Preference
      const lang = await AsyncStorage.getItem('viola_language');
      if (lang === 'ar') setIsArabic(true);

      // 2. Load Dynamic Content (simulating fetching from Admin changes)
      const jsonValue = await AsyncStorage.getItem('viola_home_data');
      if (jsonValue != null) {
        setHomeData({ ...defaultData, ...JSON.parse(jsonValue) });
      }
    } catch (e) {
      console.error("Failed to load home data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleLanguage = async () => {
    const newLangState = !isArabic;
    setIsArabic(newLangState);
    await AsyncStorage.setItem('viola_language', newLangState ? 'ar' : 'en');
  };

  const t = (en: string, ar: string) => isArabic ? ar : en;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* FLOATING ACTION BUTTONS */}
      <View style={[styles.fabContainer, isArabic ? { left: 20 } : { right: 20 }]}>
        <TouchableOpacity style={[styles.fabBtn, { backgroundColor: COLORS.white }]} onPress={toggleLanguage}>
          <FontAwesome5 name="globe" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fabBtn, { backgroundColor: '#25D366' }]} 
          onPress={() => Linking.openURL('https://wa.me/962776302410')}
        >
          <FontAwesome5 name="whatsapp" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.fabBtn, { backgroundColor: COLORS.primary }]} 
          onPress={() => navigation.navigate('Login')}
        >
          <FontAwesome5 name="user-lock" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        
        {/* NAV BAR */}
        <View style={[styles.nav, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150/6a1b9a/ffffff?text=V' }} // Placeholder for logo.jpg
              style={styles.navLogo} 
            />
            <Text style={styles.brandName}>{t('Viola Academy', 'أكاديمية فيولا')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
             <Text style={styles.navLink}>{t('Gallery', 'المعرض')}</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <ImageBackground 
          source={{ uri: 'https://via.placeholder.com/800x600/4a148c/ffffff' }} // Placeholder for hero-bg.jpg
          style={styles.hero}
          imageStyle={{ opacity: 0.6 }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('Welcome to Viola Academy', 'مرحباً بكم في روضة أكاديمية فيولا النموذجية')}</Text>
            <Text style={styles.heroSubtitle}>{t('Where future leaders bloom.', 'حيث يزهر قادة المستقبل.')}</Text>
            
            <View style={[styles.heroBtnContainer, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => {/* scroll logic */}}>
                <Text style={styles.btnText}>{t('Read More', 'اقرأ المزيد')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSecondary, styles.btnOutline]} onPress={() => {/* scroll logic */}}>
                <Text style={[styles.btnText, { color: COLORS.white }]}>{t('Contact Us', 'تواصل معنا')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t(homeData.about.title, 'من نحن')}</Text>
          
          <View style={styles.aboutCard}>
             <Image 
                source={{ uri: homeData.about.image || 'https://via.placeholder.com/400' }} 
                style={styles.aboutImage} 
             />
             <View style={{ padding: 15 }}>
                <Text style={[styles.bodyText, { textAlign: isArabic ? 'right' : 'left' }]}>
                  {homeData.about.desc}
                </Text>

                <View style={styles.quoteBox}>
                  <Text style={[styles.quoteText, { textAlign: isArabic ? 'right' : 'left' }]}>"{homeData.about.quote}"</Text>
                  <Text style={[styles.quoteAuthor, { textAlign: isArabic ? 'right' : 'left' }]}>{homeData.about.author}</Text>
                </View>
             </View>
          </View>
        </View>

        {/* FEATURES SECTION */}
        <View style={[styles.section, { backgroundColor: COLORS.white }]}>
          <Text style={styles.sectionTitle}>{t('Our Core Functions', 'وظائفنا الأساسية')}</Text>
          
          <View style={styles.featuresGrid}>
            {homeData.features.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.iconCircle}>
                   <FontAwesome5 name={item.icon} size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.featureTitle}>{t(item.title, item.title)}</Text>
                <Text style={styles.featureDesc}>{t(item.desc, item.desc)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TESTIMONIALS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('What Parents Say', 'آراء أولياء الأمور')}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
            {homeData.testimonials.map((item, index) => (
              <View key={index} style={styles.testimonialCard}>
                <Text style={styles.quoteWatermark}>“</Text>
                <Text style={styles.testimonialText}>"{item.quote}"</Text>
                <View style={[styles.authorContainer, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                  <Image 
                    source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random` }} 
                    style={styles.avatar} 
                  />
                  <View style={{ alignItems: isArabic ? 'flex-end' : 'flex-start', marginHorizontal: 10 }}>
                    <Text style={styles.authorName}>{item.name}</Text>
                    <Text style={styles.authorRole}>{item.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>{t('Viola Academy', 'أكاديمية فيولا')}</Text>
          <Text style={styles.footerDesc}>{homeData.footer.desc}</Text>
          
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
                <FontAwesome5 name="map-marker-alt" size={16} color={COLORS.secondary} />
                <Text style={styles.contactText}>{homeData.footer.address}</Text>
            </View>
            <View style={styles.contactItem}>
                <FontAwesome5 name="phone" size={16} color={COLORS.secondary} />
                <Text style={styles.contactText}>{homeData.footer.phone}</Text>
            </View>
            <View style={styles.contactItem}>
                <FontAwesome5 name="envelope" size={16} color={COLORS.secondary} />
                <Text style={styles.contactText}>{homeData.footer.email}</Text>
            </View>
          </View>

          <View style={styles.socialRow}>
            {/* These are dummy buttons since mapping actual URLs requires more complex logic */}
            <TouchableOpacity style={styles.socialIcon}><FontAwesome5 name="facebook-f" size={16} color="white" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}><FontAwesome5 name="instagram" size={16} color="white" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}><FontAwesome5 name="twitter" size={16} color="white" /></TouchableOpacity>
          </View>

          <Text style={styles.copyright}>&copy; 2026 Viola Academy. All Rights Reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.grey,
  },
  scrollView: {
    flex: 1,
  },
  nav: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navLogo: {
    width: 35,
    height: 35,
    marginRight: 10,
    borderRadius: 17.5,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  navLink: {
    color: COLORS.dark,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    zIndex: 100,
    gap: 15,
  },
  fabBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  hero: {
    height: 350,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(106, 27, 154, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 30,
  },
  heroBtnContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  btnSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  btnText: {
    color: COLORS.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  aboutImage: {
    width: '100%',
    height: 200,
  },
  bodyText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
  quoteBox: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    borderRadius: 5,
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 5,
  },
  quoteAuthor: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width / 2) - 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderTopWidth: 4,
    borderTopColor: COLORS.primary,
  },
  iconCircle: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: COLORS.dark,
  },
  featureDesc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  testimonialCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteWatermark: {
    position: 'absolute',
    top: -10,
    left: 10,
    fontSize: 80,
    color: 'rgba(106, 27, 154, 0.05)',
    fontFamily: 'serif',
  },
  testimonialText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  authorName: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 14,
  },
  authorRole: {
    fontSize: 11,
    color: '#888',
  },
  footer: {
    backgroundColor: COLORS.dark,
    padding: 30,
    alignItems: 'center',
  },
  footerBrand: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footerDesc: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  contactRow: {
    width: '100%',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  contactText: {
    color: COLORS.white,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  socialIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyright: {
    color: '#777',
    fontSize: 11,
  },
});