import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- TYPES ---
interface BusStop {
  time: string;
  loc: string;
}

interface BusData {
  morning: BusStop[];
  evening: BusStop[];
}

const COLORS = {
  primary: '#2c3e50',
  headerStart: '#2c3e50',
  headerEnd: '#c0392b', // Red gradient end
  accent: '#c0392b',   // Red
  success: '#2ecc71',
  warning: '#f1c40f',  // Yellow/Gold for bus
  light: '#f8f9fa',
  white: '#fff',
  text: '#333',
  border: '#e9ecef',
  timelineLine: '#e9ecef',
};

const { width } = Dimensions.get('window');

export default function BusScreen() {
  const navigation = useNavigation<any>();
  const [isArabic, setIsArabic] = useState(false);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [busData, setBusData] = useState<BusData>({ morning: [], evening: [] });
  
  // Animation Values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Constants
  const t = (en: string, ar: string) => isArabic ? ar : en;

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      // 1. Language
      const lang = await AsyncStorage.getItem('viola_language');
      setIsArabic(lang === 'ar');

      // 2. Bus Data
      const json = await AsyncStorage.getItem('viola_bus_data');
      let data: BusData = json ? JSON.parse(json) : { morning: [], evening: [] };

      // Fallback Data
      if (data.morning.length === 0 && data.evening.length === 0) {
        data = {
          morning: [
            { time: "06:30", loc: "Housing Bank Circle" },
            { time: "07:00", loc: "Nuwayjis Intersection" },
            { time: "07:30", loc: "Signal 2 (Bakery)" },
            { time: "07:55", loc: "Viola Academy" }
          ],
          evening: [
            { time: "14:00", loc: "Viola Academy" },
            { time: "14:30", loc: "Signal 2 (Bakery)" },
            { time: "15:00", loc: "Nuwayjis Intersection" },
            { time: "15:30", loc: "Housing Bank Circle" }
          ]
        };
      }
      setBusData(data);

    } catch (e) {
      console.error("Failed to load bus data", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      startAnimations();
    }, [])
  );

  // --- ANIMATIONS ---
  const startAnimations = () => {
    // 1. Pulse Animation (Scale & Opacity)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Float Animation (Y Position)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCallDriver = () => {
    Linking.openURL('tel:+962790000000');
  };

  // --- RENDER HELPERS ---
  const renderTimeline = () => {
    const route = busData[activeTab];
    if (!route || route.length === 0) {
      return <Text style={styles.emptyText}>{t('No stops added.', 'لم تتم إضافة محطات.')}</Text>;
    }

    // Determine completion based on current time
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return route.map((stop, index) => {
      const [h, m] = stop.time.split(':').map(Number);
      const stopMinutes = h * 60 + m;
      const isCompleted = currentMinutes > stopMinutes;
      const isLast = index === route.length - 1;

      return (
        <View key={index} style={[styles.timelineItem, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
           {/* Timeline Graphic */}
           <View style={styles.timelineGraphic}>
              <View style={[
                  styles.dot, 
                  isCompleted ? { backgroundColor: COLORS.success, borderColor: COLORS.success } : { backgroundColor: 'white', borderColor: COLORS.accent }
              ]} />
              {!isLast && <View style={styles.line} />}
           </View>

           {/* Content */}
           <View style={[styles.timelineContent, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
              <View style={styles.timeBadge}>
                 <Text style={styles.timeText}>{stop.time}</Text>
              </View>
              <Text style={styles.locText}>{stop.loc}</Text>
           </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerStart} />

      {/* HEADER */}
      <LinearGradient colors={[COLORS.headerStart, COLORS.headerEnd]} style={styles.header}>
        <View style={[styles.navBar, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>{t('Bus Route #4 (Irbid)', 'مسار الحافلة 4 (إربد)')}</Text>
           <TouchableOpacity onPress={() => setIsArabic(!isArabic)}>
              <FontAwesome5 name="globe" size={20} color="white" />
           </TouchableOpacity>
        </View>
        <Text style={styles.subTitle}>{t('Live GPS Tracking System', 'نظام تتبع مباشر GPS')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* MAP CARD */}
        <View style={styles.card}>
           <View style={[styles.cardHeader, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <FontAwesome5 name="map-marker-alt" color={COLORS.accent} size={16} />
                 <Text style={styles.cardTitle}> {t('Live Location', 'الموقع المباشر')}</Text>
              </View>
              <View style={styles.liveBadge}>
                 <Text style={styles.liveText}>{t('LIVE', 'مباشر')}</Text>
              </View>
           </View>

           <View style={styles.mapContainer}>
              {/* Static Map Background (Placeholder for Google Maps) */}
              <Image 
                source={{ uri: 'https://via.placeholder.com/600x400/e0e0e0/aeaeae?text=Map+View' }} 
                style={styles.mapImage} 
              />
              
              {/* Animated Bus Marker */}
              <View style={styles.markerContainer}>
                 {/* Pulse Ring */}
                 <Animated.View style={[
                    styles.pulseRing, 
                    { transform: [{ scale: pulseAnim }, { perspective: 1000 }] },
                    { opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.6, 0] }) }
                 ]} />
                 
                 {/* Floating Bus Icon */}
                 <Animated.View style={[styles.busMarker, { transform: [{ translateY: floatAnim }] }]}>
                    <View style={styles.busIconCircle}>
                       <FontAwesome5 name="bus" size={20} color="#333" />
                    </View>
                    <View style={styles.busLabel}>
                       <Text style={styles.busLabelText}>{t('Bus #4', 'حافلة 4')}</Text>
                    </View>
                 </Animated.View>
              </View>
           </View>

           <View style={[styles.cardFooter, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
              <View style={styles.statItem}>
                 <FontAwesome5 name="tachometer-alt" size={14} color="#7f8c8d" />
                 <Text style={styles.statText}> {t('Speed: 45 km/h', 'السرعة: 45 كم/س')}</Text>
              </View>
              <View style={styles.statItem}>
                 <FontAwesome5 name="clock" size={14} color="#7f8c8d" />
                 <Text style={styles.statText}> {t('Updated: Just now', 'تحديث: الآن')}</Text>
              </View>
           </View>
        </View>

        {/* DRIVER INFO */}
        <View style={styles.card}>
           <View style={styles.driverContent}>
              <View style={styles.driverAvatar}>
                 <FontAwesome5 name="user-tie" size={40} color="#95a5a6" />
              </View>
              <Text style={styles.driverName}>{t('Mr. Khaled Al-Omari', 'السيد خالد العمري')}</Text>
              <Text style={styles.driverRoute}>{t('Route: Irbid City Center', 'المسار: وسط مدينة إربد')}</Text>
              
              <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
                 <FontAwesome5 name="phone-alt" color="white" size={16} />
                 <Text style={styles.callBtnText}> {t('Call Driver', 'اتصل بالسائق')}</Text>
              </TouchableOpacity>

              <View style={styles.statusAlert}>
                 <FontAwesome5 name="info-circle" color="#31708f" size={14} />
                 <Text style={styles.statusText}> {t('Bus is On Schedule', 'الحافلة في الموعد')}</Text>
              </View>
           </View>
        </View>

        {/* TIMELINE TABS */}
        <View style={styles.card}>
           <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'morning' && styles.activeTabBtn]} 
                onPress={() => setActiveTab('morning')}
              >
                 <Text style={[styles.tabText, activeTab === 'morning' && styles.activeTabText]}>{t('Morning', 'صباحي')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'evening' && styles.activeTabBtn]} 
                onPress={() => setActiveTab('evening')}
              >
                 <Text style={[styles.tabText, activeTab === 'evening' && styles.activeTabText]}>{t('Afternoon', 'مسائي')}</Text>
              </TouchableOpacity>
           </View>
           
           <View style={styles.timelineContainer}>
              <Text style={[styles.sectionTitle, { textAlign: isArabic ? 'right' : 'left' }]}>
                 {activeTab === 'morning' ? t('Pick-up Route', 'مسار الذهاب') : t('Drop-off Route', 'مسار العودة')}
              </Text>
              {renderTimeline()}
           </View>
        </View>

      </ScrollView>
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
    marginBottom: 20,
  },
  navBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  subTitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 12 },

  scrollContent: { padding: 20, paddingBottom: 50 },

  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontWeight: 'bold', color: COLORS.accent, fontSize: 16 },
  liveBadge: { backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  liveText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  mapContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  mapImage: { width: '100%', height: '100%', opacity: 0.8 },
  
  markerContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.warning,
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
  },
  busMarker: { alignItems: 'center' },
  busIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.warning,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  busLabel: {
    marginTop: 5,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  busLabelText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

  cardFooter: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: '#7f8c8d' },

  // Driver Card
  driverContent: { padding: 20, alignItems: 'center' },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  driverRoute: { fontSize: 12, color: 'gray', marginBottom: 15 },
  callBtn: {
    backgroundColor: COLORS.success,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  callBtnText: { color: 'white', fontWeight: 'bold' },
  statusAlert: {
    backgroundColor: '#d9edf7',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  statusText: { color: '#31708f', fontSize: 12 },

  // Tabs & Timeline
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { color: '#7f8c8d', fontWeight: 'bold' },
  activeTabText: { color: COLORS.primary },

  timelineContainer: { padding: 20 },
  sectionTitle: { fontSize: 14, color: '#999', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center' },

  timelineItem: { marginBottom: 20 },
  timelineGraphic: { width: 30, alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    position: 'absolute',
    top: 14,
    bottom: -20, // Extend to next item
    zIndex: 0,
  },
  timelineContent: { flex: 1, marginHorizontal: 10, justifyContent: 'center' },
  timeBadge: { backgroundColor: '#f8f9fa', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: '#eee', marginBottom: 4, alignSelf: 'flex-start' },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  locText: { fontSize: 14, color: COLORS.text },
});