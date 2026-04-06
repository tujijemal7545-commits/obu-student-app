import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import i18n from '../../i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeController } from '../../hooks/theme-context';

export default function SettingsScreen() {
  const [language, setLanguage] = useState(i18n.locale);
  const colorScheme = useColorScheme();
  const { setColorScheme } = useThemeController();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const safeAreaStyle = isDark ? styles.safeArea : styles.safeAreaLight;
  const cardStyle = isDark ? styles.card : styles.cardLight;
  const sectionHeaderStyle = isDark ? styles.sectionHeader : styles.sectionHeaderLight;
  const settingTitleStyle = isDark ? styles.settingTitle : styles.settingTitleLight;
  const settingDescStyle = isDark ? styles.settingDesc : styles.settingDescLight;
  const sysLabelStyle = isDark ? styles.sysLabel : styles.sysLabelLight;
  const sysValueStyle = isDark ? styles.sysValue : styles.sysValueLight;

  return (
    <SafeAreaView style={safeAreaStyle}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={sectionHeaderStyle}>Preferences</Text>

        <View style={cardStyle}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={22}
                color={isDark ? "#00E5FF" : "#F97316"}
                style={styles.icon}
              />
              <View>
                <Text style={settingTitleStyle}>{isDark ? "Dark Theme" : "Light Theme"}</Text>
                <Text style={settingDescStyle}>Toggle between dark and light appearance</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#334155', true: '#00E5FF' }}
              thumbColor={isDark ? '#0B0F19' : '#F8FAFC'}
              onValueChange={toggleTheme}
              value={isDark}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.languageRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={22} color="#00E5FF" style={styles.icon} />
              <View>
                <Text style={settingTitleStyle}>Language</Text>
                <Text style={settingDescStyle}>System display language</Text>
              </View>
            </View>
            <View style={styles.pickerWrapper}>
               <Picker 
                 selectedValue={language} 
                 onValueChange={(val) => {
                    setLanguage(val);
                    i18n.locale = val;
                 }} 
                 style={styles.picker}
                 itemStyle={{color: '#fff'}}
               >
                 <Picker.Item label="English" value="English" />
                 <Picker.Item label="Afaan Oromo" value="Oromo" />
                 <Picker.Item label="Arabic" value="Arabic" />
               </Picker>
            </View>
          </View>
        </View>

        <Text style={sectionHeaderStyle}>System Information</Text>

        <View style={cardStyle}>
           <View style={styles.sysRow}>
              <Text style={sysLabelStyle}>Version</Text>
              <Text style={sysValueStyle}>1.0.0 (Production build)</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.sysRow}>
              <Text style={sysLabelStyle}>Firebase Status</Text>
              <Text style={styles.sysValueConnected}>Connected</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.sysRow}>
              <Text style={sysLabelStyle}>Database Region</Text>
              <Text style={sysValueStyle}>us-central</Text>
           </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#F87171" style={{marginRight: 10}} />
          <Text style={styles.logoutBtnText}>Logout Completely</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  safeAreaLight: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionHeaderLight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#1A2235',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  languageRow: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  settingTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  settingDesc: {
    color: '#64748B',
    fontSize: 12,
  },
  settingTitleLight: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  settingDescLight: {
    color: '#6B7280',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginLeft: 55,
  },
  pickerWrapper: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  picker: {
    color: '#F8FAFC',
  },
  sysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sysLabel: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  sysValue: {
    color: '#94A3B8',
    fontSize: 15,
  },
  sysLabelLight: {
    color: '#111827',
    fontSize: 15,
  },
  sysValueLight: {
    color: '#6B7280',
    fontSize: 15,
  },
  sysValueConnected: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
