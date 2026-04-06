import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Add User Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData: any[] = [];
      snapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userData);
      setFilteredUsers(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lowerText = text.toLowerCase();
    const filtered = users.filter(u => 
      (u.email?.toLowerCase().includes(lowerText)) || 
      (u.role?.toLowerCase().includes(lowerText))
    );
    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    if (!newEmail || !newPassword) {
      Alert.alert("Required", "Email and Password are required.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Registration Error", "Password should be at least 6 characters.");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create in Firebase Auth using the Secondary Instance to protect Admin session
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      
      // 2. Add to Firestore users collection
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: newEmail,
        role: newRole,
        createdAt: serverTimestamp()
      });

      // Cleanup
      setModalVisible(false);
      setNewEmail('');
      setNewPassword('');
      setShowPassword(false);
      const successText = `User ${newEmail} created successfully as ${newRole}!`;
      setSuccessMessage(successText);
      Alert.alert("Success", successText);
      
      // Sign out the secondary auth to keep it clean
      await secondaryAuth.signOut();
      
    } catch (error: any) {
      Alert.alert("Error Creating User", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = (userId: string, email: string) => {
    Alert.alert(
      "DANGER: Delete User",
      `Are you sure you want to permanently delete ${email}? This action removes their access completely.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE", 
          style: "destructive", 
          onPress: () => handleDeleteUser(userId) 
        }
      ]
    );
  };

  const handleDeleteUser = async (firestoreDocId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', firestoreDocId));
      
      Alert.alert("User Revoked", "The user's role has been deleted from the database database. Note: Firebase Client SDK restricts deleting core Auth instances without a backend function, but they are now locked out of access here.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.avatar, item.role === 'admin' ? styles.adminAvatar : {}]}>
        <Ionicons name={item.role === 'admin' ? "shield-checkmark" : "person"} size={24} color="#0B0F19" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.emailText}>{item.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.role}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id, item.email)}>
        <Ionicons name="trash-outline" size={20} color="#F87171" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {successMessage ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
          <Text style={styles.successText}>{successMessage}</Text>
          <TouchableOpacity onPress={() => setSuccessMessage('')}>
            <Ionicons name="close" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.headerToolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search email or role..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#0B0F19" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={60} color="#334155" />
          <Text style={styles.emptyText}>No users found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Account</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="user@example.com" 
              placeholderTextColor="#6B7280"
              value={newEmail} 
              onChangeText={setNewEmail} 
              autoCapitalize="none" 
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password (Min 6 chars)</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={[styles.input, styles.inputNoMargin]} 
                placeholder="••••••••" 
                placeholderTextColor="#6B7280"
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.visibilityToggle}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>System Access Role</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={newRole} onValueChange={setNewRole} style={styles.picker} itemStyle={{color: '#fff'}}>
                <Picker.Item label="Administrator" value="admin" />
                <Picker.Item label="Student" value="student" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddUser} disabled={isCreating}>
              {isCreating ? <ActivityIndicator color="#0B0F19" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  successText: {
    flex: 1,
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
  },
  headerToolbar: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 15,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  addBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2235',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminAvatar: {
    backgroundColor: '#F43F5E',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00E5FF',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    marginTop: 15,
    fontSize: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E7FF',
  },
  label: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  inputNoMargin: {
    marginBottom: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  visibilityToggle: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  pickerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 25,
    overflow: 'hidden',
  },
  picker: {
    color: '#F8FAFC',
    height: 50,
  },
  submitBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
