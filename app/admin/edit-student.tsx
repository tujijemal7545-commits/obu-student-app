import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";

export default function EditStudentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("Fresh");
  const [semester, setSemester] = useState("1");
  const [muslimStatus, setMuslimStatus] = useState("Old");
  const [islamicLevel, setIslamicLevel] = useState("Quran");
  const [studyFocus, setStudyFocus] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'students', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAge(data.age ? data.age.toString() : "");
          setSex(data.sex || "Male");
          setAddress(data.address || "");
          setDepartment(data.department || "");
          setBatch(data.batch || "Fresh");
          setSemester(data.semester || "1");
          setMuslimStatus(data.muslimStatus || "Old");
          setIslamicLevel(data.islamicLevel || "Quran");
          setStudyFocus(data.studyFocus || "");
          setImage(data.photoUrl || null);
        } else {
          Alert.alert("Error", "Student not found.");
          router.back();
        }
      } catch (err) {
        Alert.alert("Error", "Failed to fetch student data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || image.startsWith('http')) return image; // Already uploaded
    const response = await fetch(image);
    const blob = await response.blob();
    const storageRef = ref(storage, "students/" + Date.now());
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const updateStudent = async () => {
    if (!fullName || !phone) {
      Alert.alert("Error", "Please fill in Name and Phone Number.");
      return;
    }
    
    setSaving(true);
    try {
      const photoUrl = await uploadImage();
      const docRef = doc(db, 'students', id as string);
      
      await updateDoc(docRef, {
        fullName, phone, email, age: Number(age) || 0,
        sex, address, department, batch, semester,
        muslimStatus, islamicLevel, studyFocus, photoUrl
      });
      
      if (Platform.OS === 'web') {
        window.alert("Success! Student Record Updated Successfully.");
        router.back();
      } else {
        Alert.alert("Success!", "Student Record Updated Successfully.");
        router.back();
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert("Error updating record", error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
           <ActivityIndicator size="large" color="#00E5FF" />
        </View>
     )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Edit Student Info</Text>
          <Text style={styles.headerSubtitle}>Update registry details</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={32} color="#00E5FF" />
                  <Text style={styles.placeholderText}>Change Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} placeholderTextColor="#6B7280" keyboardType="numeric" value={age} onChangeText={setAge} />
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Sex</Text>
              <View style={styles.pickerContainer}>
                <Picker style={styles.picker} selectedValue={sex} onValueChange={setSex} itemStyle={styles.pickerItem}>
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" value={address} onChangeText={setAddress} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Academic Information</Text>

          <Text style={styles.label}>Department</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" value={department} onChangeText={setDepartment} />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Batch Status</Text>
              <View style={styles.pickerContainer}>
                <Picker style={styles.picker} selectedValue={batch} onValueChange={setBatch} itemStyle={styles.pickerItem}>
                  <Picker.Item label="Fresh" value="Fresh" />
                  <Picker.Item label="Remedial" value="Remedial" />
                  <Picker.Item label="1st" value="1st" />
                  <Picker.Item label="2nd" value="2nd" />
                  <Picker.Item label="3rd" value="3rd" />
                  <Picker.Item label="4th" value="4th" />
                  <Picker.Item label="5th" value="5th" />
                  <Picker.Item label="6th" value="6th" />
                  <Picker.Item label="GRADUATED" value="Graduated" />
                  <Picker.Item label="DROPPED OUT" value="Dropped Out" />
                </Picker>
              </View>
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Semester</Text>
              <View style={styles.pickerContainer}>
                <Picker style={styles.picker} selectedValue={semester} onValueChange={setSemester} itemStyle={styles.pickerItem}>
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                </Picker>
              </View>
            </View>
          </View>
          
          <Text style={styles.label}>Study Focus</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" value={studyFocus} onChangeText={setStudyFocus} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Islamic Profile</Text>

          <Text style={styles.label}>Muslim Status</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.picker} selectedValue={muslimStatus} onValueChange={setMuslimStatus} itemStyle={styles.pickerItem}>
              <Picker.Item label="New Muslim" value="New" />
              <Picker.Item label="Old Muslim" value="Old" />
            </Picker>
          </View>

          <Text style={styles.label}>Islamic Level</Text>
          <View style={styles.pickerContainer}>
            <Picker style={styles.picker} selectedValue={islamicLevel} onValueChange={setIslamicLevel} itemStyle={styles.pickerItem}>
              <Picker.Item label="Quran" value="Quran" />
              <Picker.Item label="Hadith" value="Hadith" />
              <Picker.Item label="Fiqh" value="Fiqh" />
              <Picker.Item label="Tafsir" value="Tafsir" />
              <Picker.Item label="Aqeedah" value="Aqeedah" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, saving && styles.submitButtonDisabled]} 
          onPress={updateStudent} 
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#0B0F19" />
          ) : (
            <Text style={styles.submitButtonText}>Commit Changes</Text>
          )}
        </TouchableOpacity>
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0F19' },
  container: { padding: 20 },
  headerContainer: { marginVertical: 25, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#E0E7FF', letterSpacing: 1 },
  headerSubtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 5 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#00E5FF', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  pickerContainer: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 16, overflow: 'hidden' },
  picker: { color: '#F8FAFC', height: 50 },
  pickerItem: { color: '#F8FAFC' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  imagePickerContainer: { alignItems: 'center', marginVertical: 10, marginBottom: 20 },
  imagePicker: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#0F172A', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00E5FF', borderStyle: 'dashed' },
  profileImage: { width: '100%', height: '100%' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00E5FF', fontSize: 12, marginTop: 4, fontWeight: '600' },
  submitButton: { backgroundColor: '#00E5FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#38BDF8', opacity: 0.7 },
  submitButtonText: { color: '#0B0F19', fontSize: 18, fontWeight: 'bold' }
});
