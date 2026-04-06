import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import i18n from '../../i18n';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MENU = [
  { key: 'students_db',  sub: 'students_db_sub',  icon: 'people',             route: '/admin/students',  color: '#00E5FF', bg: 'rgba(0,229,255,0.1)'   },
  { key: 'register',     sub: 'register_sub',      icon: 'person-add',         route: '/admin/add-student',color:'#A855F7', bg: 'rgba(168,85,247,0.1)'  },
  { key: 'users',        sub: 'users_sub',          icon: 'shield-checkmark',   route: '/admin/users',     color: '#F43F5E', bg: 'rgba(244,63,94,0.1)'   },
  { key: 'attendance',   sub: 'attendance_sub',     icon: 'scan',               route: '/admin/attendance', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)'  },
  { key: 'analytics',   sub: 'analytics_sub',      icon: 'stats-chart',        route: '/admin/analytics', color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
  { key: 'my_account',  sub: 'my_account_sub',     icon: 'person-circle',      route: '/admin/account',   color: '#EAB308', bg: 'rgba(234,179,8,0.1)'   },
  { key: 'settings',    sub: 'settings_sub',       icon: 'settings',           route: '/admin/settings',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
];

export default function AdminHubScreen() {
  const router = useRouter();
  const email = auth.currentUser?.email || 'Admin';
  const firstName = email.split('@')[0];
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, !isDark && styles.safeAreaLight]}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero greeting */}
        <ImageBackground 
          source={require('../../assets/images/obu-logo.jpg')} 
          style={styles.hero} 
          imageStyle={{ opacity: 0.05, resizeMode: 'contain', top: 20 }}
        >
          <Image 
            source={require('../../assets/images/obu-jamaa.jpg')} 
            style={styles.topLogo} 
          />
          <View style={styles.heroBadge}>
            <View style={[styles.heroAvatar, !isDark && styles.heroAvatarLight]}>
              <Text style={styles.heroAvatarText}>{firstName[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[styles.heroWelcome, !isDark && styles.heroWelcomeLight]}>{i18n.t('welcome')}</Text>
              <Text style={[styles.heroEmail, !isDark && styles.heroEmailLight]}>{email}</Text>
            </View>
          </View>

          {/* Quick stats strips */}
          <View style={[styles.heroBanner, !isDark && styles.heroBannerLight]}>
            <Ionicons name="shield-checkmark" size={16} color="#00E5FF" />
            <Text style={styles.heroBannerText}>System Administrator · Full Access</Text>
          </View>
        </ImageBackground>

        <Text style={[styles.sectionLabel, !isDark && styles.sectionLabelLight]}>{i18n.t('dashboard')}</Text>

        {/* 2-column grid */}
        <View style={styles.grid}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.card, !isDark && styles.cardLight]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.cardTitle, !isDark && styles.cardTitleLight]}>{i18n.t(item.key)}</Text>
              <Text style={[styles.cardSub, !isDark && styles.cardSubLight]} numberOfLines={2}>{i18n.t(item.sub)}</Text>
              <View style={[styles.cardArrow, { backgroundColor: item.bg }]}>
                <Ionicons name="arrow-forward" size={12} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080C14' },
  safeAreaLight: { backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  container: { paddingBottom: 40 },
  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  cornerLogo: { position: 'absolute', top: 10, right: 10, width: 70, height: 70, opacity: 0.1, resizeMode: 'contain' },
  topLogo: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 15 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  heroAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center' },
  heroAvatarLight: { backgroundColor: '#2563EB' },
  heroAvatarText: { fontSize: 22, fontWeight: '900', color: '#0B0F19' },
  heroWelcome: { fontSize: 12, color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  heroWelcomeLight: { color: '#6B7280' },
  heroEmail: { fontSize: 17, fontWeight: '800', color: '#F1F5F9', marginTop: 2 },
  heroEmailLight: { color: '#0F172A' },
  heroBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,229,255,0.07)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, gap: 8, borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)' },
  heroBannerLight: { backgroundColor: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)' },
  heroBannerText: { color: '#00E5FF', fontSize: 12, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: 1.5, marginHorizontal: 20, marginBottom: 16 },
  sectionLabelLight: { color: '#94A3B8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  card: { width: '47%', backgroundColor: '#0D1526', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1E293B' },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' },
  iconBox: { width: 52, height: 52, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#F1F5F9', marginBottom: 5 },
  cardTitleLight: { color: '#0F172A' },
  cardSub: { fontSize: 11, color: '#475569', lineHeight: 16, marginBottom: 14 },
  cardSubLight: { color: '#6B7280' },
  cardArrow: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
});
