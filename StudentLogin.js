import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "./firebaseConfig";

export default function StudentLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginStudent = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("StudentDashboard");
    } catch (error) {
      Alert.alert("Login Failed", "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={52} color="#00E5FF" />
            </View>
            <Text style={styles.title}>Student Portal</Text>
            <Text style={styles.subtitle}>
              Sign in to view your profile and attendance.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Student Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="student@obu.edu.et"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.toggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={loginStudent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0F19" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
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
    backgroundColor: "#0B0F19",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E0E7FF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1A2235",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F8FAFC",
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    fontSize: 16,
  },
  toggle: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: "#00E5FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#38BDF8",
    opacity: 0.8,
  },
  buttonText: {
    color: "#0B0F19",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
