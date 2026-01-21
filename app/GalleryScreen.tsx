import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    // We try to load dynamic photos first
    const stored = await AsyncStorage.getItem('viola_gallery');
    if (stored) {
      setPhotos(JSON.parse(stored));
    } else {
      // Fallback dummy data if no photos are uploaded yet
      setPhotos([
        { id: 1, url: 'https://placehold.co/600x400/8e44ad/white?text=School+Event', caption: 'Science Fair' },
        { id: 2, url: 'https://placehold.co/600x400/2980b9/white?text=Class+Photo', caption: 'KG1 Class Photo' },
        { id: 3, url: 'https://placehold.co/600x400/27ae60/white?text=Field+Trip', caption: 'Zoo Visit' },
      ]);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => setSelectedImage(item.url || item)} style={styles.card}>
      <Image source={{ uri: item.url || item }} style={styles.image} />
      <Text style={styles.caption}>{item.caption || 'School Photo'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8e44ad', '#9b59b6']} style={styles.header}>
        <Text style={styles.headerTitle}>School Gallery</Text>
        <Text style={styles.headerSub}>Memories & Events</Text>
      </LinearGradient>

      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 30, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  
  list: { padding: 20 },
  card: { backgroundColor: 'white', marginBottom: 20, borderRadius: 15, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 200 },
  caption: { padding: 15, fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: 500 },
  closeBtn: { position: 'absolute', top: 50, right: 30, padding: 10 },
  closeText: { color: 'white', fontSize: 30, fontWeight: 'bold' }
});