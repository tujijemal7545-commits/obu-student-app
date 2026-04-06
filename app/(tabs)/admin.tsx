import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const loginAdmin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    setStatusMessage('');
    setStatusType('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatusType('success');
      setStatusMessage('Login successful. Redirecting to admin dashboard...');
      setTimeout(() => {
        router.replace('/admin');
      }, 700);
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Login failed: incorrect email or password.');
      Alert.alert("Authentication Failed", "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, !isDark && styles.safeAreaLight]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <View style={[styles.iconCircle, !isDark && styles.iconCircleLight]}>
              <Ionicons name="shield-checkmark" size={60} color="#00E5FF" />
            </View>
            <Text style={[styles.headerTitle, !isDark && styles.headerTitleLight]}>Admin Access</Text>
            <Text style={[styles.headerSubtitle, !isDark && styles.headerSubtitleLight]}>Sign in to manage the registry</Text>
          </View>

          <View style={[styles.card, !isDark && styles.cardLight]}>
            {statusMessage ? (
              <View
                style={[
                  styles.statusBanner,
                  statusType === 'success' ? styles.statusSuccess : styles.statusError,
                ]}
              >
                <Ionicons
                  name={statusType === 'success' ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={statusType === 'success' ? '#4ADE80' : '#F87171'}
                />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            ) : null}
            <Text style={[styles.label, !isDark && styles.labelLight]}>Admin Email</Text>
            <View style={[styles.inputContainer, !isDark && styles.inputContainerLight]}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, !isDark && styles.inputLight]} 
                placeholderTextColor="#6B7280" 
                placeholder="administrator@example.com" 
                keyboardType="email-address" 
                autoCapitalize="none"
                value={email} 
                onChangeText={setEmail} 
              />
            </View>

            <Text style={[styles.label, !isDark && styles.labelLight]}>Password</Text>
            <View style={[styles.inputContainer, !isDark && styles.inputContainerLight]}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, !isDark && styles.inputLight]} 
                placeholderTextColor="#6B7280" 
                placeholder="••••••••" 
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.visibilityToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={loginAdmin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <Text style={styles.loginButtonText}>Login securely</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  safeAreaLight: {
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircleLight: {
    backgroundColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E7FF',
    letterSpacing: 1,
  },
  headerTitleLight: {
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 8,
  },
  headerSubtitleLight: {
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#1A2235',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 14,
  },
  statusSuccess: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.4)',
  },
  statusError: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.4)',
  },
  statusText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelLight: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputContainerLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
  },
  inputLight: {
    color: '#111827',
  },
  visibilityToggle: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  loginButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#38BDF8',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
