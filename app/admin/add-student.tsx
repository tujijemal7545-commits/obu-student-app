import { useState } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function AdminAddStudentScreen() {
  const router = useRouter();
  
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
  const [islamicLevelNote, setIslamicLevelNote] = useState("");
  const [studyFocus, setStudyFocus] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    if (!image) return "";
    const response = await fetch(image);
    const blob = await response.blob();
    const storageRef = ref(storage, "students/" + Date.now());
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const saveStudent = async () => {
    if (!fullName || !phone) {
      Alert.alert("Error", "Please fill in at least Name and Phone Number.");
      return;
    }
    
    setLoading(true);
    setSuccessMessage('');
    try {
      const photoUrl = await uploadImage();
      await addDoc(collection(db, "students"), {
        fullName, phone, email, age: Number(age) || 0,
        sex, address, department, batch, semester,
        muslimStatus, islamicLevel,
        islamicLevelNote: islamicLevelNote.trim() || "Not specified",
        studyFocus, photoUrl,
        createdAt: serverTimestamp()
      });
      if (Platform.OS === 'web') {
        const successText = "Success! Student registered successfully.";
        setSuccessMessage(successText);
        window.alert(successText);
        setTimeout(() => router.back(), 700);
      } else {
        const successText = "Student Registered Successfully.";
        setSuccessMessage(successText);
        Alert.alert("Success!", successText, [{ text: "OK", onPress: () => router.back() }]);
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert("Error saving record", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {successMessage ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Admin Registration</Text>
          <Text style={styles.headerSubtitle}>Manually insert a student into DB</Text>
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
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="e.g. John Doe" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="e.g. +1 234 567 890" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="e.g. email@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
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
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="Current address" value={address} onChangeText={setAddress} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Academic Information</Text>

          <Text style={styles.label}>Department</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="e.g. Computer Science" value={department} onChangeText={setDepartment} />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Batch</Text>
              <View style={styles.optionRow}>
                {['Fresh', 'Remedial', '1st', '2nd', '3rd', '4th', '5th', '6th'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setBatch(option)}
                    style={[styles.optionChip, batch === option && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, batch === option && styles.optionTextActive]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Semester</Text>
              <View style={styles.optionRow}>
                {[
                  { label: '1st', value: '1' },
                  { label: '2nd', value: '2' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSemester(option.value)}
                    style={[styles.optionChip, semester === option.value && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, semester === option.value && styles.optionTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <Text style={styles.label}>Study Focus</Text>
          <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="Major areas of study" value={studyFocus} onChangeText={setStudyFocus} />
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

          <Text style={styles.label}>Islamic Knowledge Note</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#6B7280"
            placeholder="Add short note (default: Not specified)"
            value={islamicLevelNote}
            onChangeText={setIslamicLevelNote}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={saveStudent} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0B0F19" />
          ) : (
            <Text style={styles.submitButtonText}>Submit to Database</Text>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
    backgroundColor: 'rgba(74,222,128,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#E0E7FF', letterSpacing: 1 },
  headerSubtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 5 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#00D1FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#00E5FF', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, color: '#F8FAFC', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  pickerContainer: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 16, overflow: 'hidden' },
  picker: { color: '#F8FAFC', height: 50 },
  pickerItem: { color: '#F8FAFC' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  optionChipActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0,229,255,0.18)',
  },
  optionText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  optionTextActive: { color: '#00E5FF' },
  imagePickerContainer: { alignItems: 'center', marginVertical: 10, marginBottom: 20 },
  imagePicker: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#0F172A', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00E5FF', borderStyle: 'dashed' },
  profileImage: { width: '100%', height: '100%' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#00E5FF', fontSize: 12, marginTop: 4, fontWeight: '600' },
  submitButton: { backgroundColor: '#F43F5E', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  submitButtonDisabled: { backgroundColor: '#FB7185', opacity: 0.7 },
  submitButtonText: { color: '#0B0F19', fontSize: 18, fontWeight: 'bold' },
});
