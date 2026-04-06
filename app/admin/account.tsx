import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const user = auth.currentUser;
  
  const [name, setName] = useState(user?.displayName || 'Administrator');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let updatedSomething = false;

      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
        updatedSomething = true;
      }
      if (email !== user.email && email.includes('@')) {
        await updateEmail(user, email);
        updatedSomething = true;
      }
      if (password && password.length >= 6) {
        await updatePassword(user, password);
        updatedSomething = true;
      }

      if (updatedSomething) {
        Alert.alert("Success", "Profile updated successfully!");
        setPassword('');
      } else {
        Alert.alert("No Changes", "No new profile info was submitted.");
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          "Security Verification Needed", 
          "Firebase requires you to log out and log back in before changing sensitive data like an email or password."
        );
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container}>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={50} color="#0B0F19" />
            </View>
            <Text style={styles.roleText}>Super Admin</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Profile Management</Text>
            
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                 placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.label}>Account Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                secureTextEntry={!showPassword}
                placeholder="Leave blank to keep current"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.visibilityToggle}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#0B0F19" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#1E293B',
  },
  roleText: {
    color: '#94A3B8',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1A2235',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E7FF',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    paddingBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
  },
  visibilityToggle: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
