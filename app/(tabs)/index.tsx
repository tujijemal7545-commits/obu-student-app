import { useState } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform, ImageBackground } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons } from '@expo/vector-icons';

const BG = '#080C14';
const CARD = '#0F1929';
const BORDER = '#1E293B';
const CYAN = '#00E5FF';
const PURPLE = '#A855F7';
const GOLD = '#EAB308';
const RED = '#F43F5E';
const GREEN = '#4ADE80';
const TEXT = '#F1F5F9';
const MUTED = '#64748B';
const INPUT_BG = '#060A10';

export default function RegisterScreen() {
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
  const [successMsg, setSuccessMsg] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitType, setSubmitType] = useState<"success" | "error" | "">("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadImage = async () => {
    if (!image) return "";
    const blob = await (await fetch(image)).blob();
    const storageRef = ref(storage, "students/" + Date.now());
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const saveStudent = async () => {
    if (!fullName.trim() || !phone.trim()) {
      if (Platform.OS === 'web') window.alert("Please fill in Full Name and Phone.");
      setSubmitType("error");
      setSubmitMessage("Please fill in Full Name and Phone.");
      return;
    }
    setLoading(true);
    setSubmitMessage("");
    setSubmitType("");
    try {
      const photoUrl = await uploadImage();
      await addDoc(collection(db, "students"), {
        fullName, phone, email, age: Number(age) || 0, sex, address, department,
        batch, semester, muslimStatus, islamicLevel,
        islamicLevelNote: islamicLevelNote.trim() || "Not specified",
        studyFocus, photoUrl, createdAt: serverTimestamp()
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
      setSubmitType("success");
      setSubmitMessage("Student registered successfully.");
      setFullName(""); setPhone(""); setEmail(""); setAge(""); setAddress(""); setDepartment(""); setStudyFocus(""); setImage(null);
      setBatch("Fresh"); setSemester("1"); setSex("Male"); setMuslimStatus("Old"); setIslamicLevel("Quran"); setIslamicLevelNote("");
    } catch (error: any) {
      const msg = error?.message || "Failed to register student.";
      if (Platform.OS === 'web') window.alert(msg);
      setSubmitType("error");
      setSubmitMessage(msg);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Image 
        source={require('../../assets/images/jama.jpg')} 
        style={s.bgWatermark} 
      />
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <ImageBackground 
          source={require('../../assets/images/jama.jpg')} 
          style={s.hero} 
          imageStyle={{ opacity: 0.35, resizeMode: 'cover', top: 0 }}
        >
          <View style={s.badge}><Ionicons name="moon" size={13} color={CYAN} /><Text style={s.badgeText}>OBU MUSLIM STUDENTS</Text></View>
          <Text style={s.heroTitle}>Student{'\n'}<Text style={{ color: CYAN }}>Registration</Text></Text>
          <Text style={s.heroSub}>Complete all fields to register officially in the university database.</Text>
          <Image 
            source={require('../../assets/images/obu-jamaa.jpg')} 
            style={s.heroLogo} 
          />
        </ImageBackground>

        {/* Success Toast */}
        {successMsg && (
          <View style={[s.toast, { borderColor: `${GREEN}40`, backgroundColor: `${GREEN}12` }]}>
            <Ionicons name="checkmark-circle" size={22} color={GREEN} />
            <Text style={[s.toastText, { color: GREEN }]}>Student registered successfully! 🎉</Text>
          </View>
        )}

        {/* Photo picker */}
        <View style={[s.card, { alignItems: 'center', paddingVertical: 28 }]}>
          <TouchableOpacity onPress={pickImage} style={[s.photoRing, { borderColor: CYAN }]}>
            {image ? <Image source={{ uri: image }} style={s.photo} /> : (
              <View style={{ alignItems: 'center' }}>
                <View style={[s.photoIconBg, { backgroundColor: `${CYAN}15` }]}><Ionicons name="camera" size={30} color={CYAN} /></View>
                <Text style={[s.photoLabel, { color: CYAN }]}>Upload Photo</Text>
                <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>JPG / PNG</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && <TouchableOpacity onPress={() => setImage(null)} style={{ marginTop: 10 }}><Text style={{ color: RED, fontWeight: '700', fontSize: 13 }}>Remove</Text></TouchableOpacity>}
        </View>

        {/* Personal Details */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconBg, { backgroundColor: `${CYAN}15` }]}><Ionicons name="person" size={18} color={CYAN} /></View>
            <Text style={[s.sectionTitle, { color: CYAN }]}>Personal Details</Text>
          </View>
          <Text style={s.label}>Full Name <Text style={{ color: RED }}>*</Text></Text>
          <TextInput style={s.input} placeholder="e.g. Mohammed Ali" placeholderTextColor={MUTED} value={fullName} onChangeText={setFullName} />
          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.label}>Phone <Text style={{ color: RED }}>*</Text></Text>
              <TextInput style={s.input} placeholder="+251 9..." placeholderTextColor={MUTED} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>
            <View style={{ width: 12 }} />
            <View style={s.half}>
              <Text style={s.label}>Age</Text>
              <TextInput style={s.input} placeholder="e.g. 20" placeholderTextColor={MUTED} keyboardType="numeric" value={age} onChangeText={setAge} />
            </View>
          </View>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="email@obu.edu.et" placeholderTextColor={MUTED} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <Text style={s.label}>Gender</Text>
          <View style={s.toggleRow}>
            {['Male', 'Female'].map(opt => (
              <TouchableOpacity key={opt} onPress={() => setSex(opt)} style={[s.toggle, sex === opt && { backgroundColor: CYAN, borderColor: CYAN }]}>
                <Ionicons name={opt === 'Male' ? 'man' : 'woman'} size={16} color={sex === opt ? BG : MUTED} />
                <Text style={{ color: sex === opt ? BG : MUTED, fontWeight: '800', fontSize: 14, marginLeft: 6 }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Address</Text>
          <TextInput style={s.input} placeholder="City / Woreda" placeholderTextColor={MUTED} value={address} onChangeText={setAddress} />
        </View>

        {/* Academic */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconBg, { backgroundColor: `${PURPLE}15` }]}><Ionicons name="school" size={18} color={PURPLE} /></View>
            <Text style={[s.sectionTitle, { color: PURPLE }]}>Academic Information</Text>
          </View>
          <Text style={s.label}>Department / Faculty</Text>
          <TextInput style={s.input} placeholder="e.g. Electrical Engineering" placeholderTextColor={MUTED} value={department} onChangeText={setDepartment} />
          <Text style={s.label}>Year / Batch</Text>
          <View style={s.optionRow}>
            {['Fresh','Remedial','1st','2nd','3rd','4th','5th','6th'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setBatch(option)}
                style={[s.optionChip, batch === option && s.optionChipActive]}
              >
                <Text style={[s.optionText, batch === option && s.optionTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Semester</Text>
          <View style={s.optionRow}>
            {[
              { label: '1st', value: '1' },
              { label: '2nd', value: '2' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSemester(option.value)}
                style={[s.optionChip, semester === option.value && s.optionChipActive]}
              >
                <Text style={[s.optionText, semester === option.value && s.optionTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Study Focus</Text>
          <TextInput style={s.input} placeholder="Areas of academic interest…" placeholderTextColor={MUTED} value={studyFocus} onChangeText={setStudyFocus} />
        </View>

        {/* Islamic Profile */}
        <View style={s.card}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconBg, { backgroundColor: `${GOLD}15` }]}><Ionicons name="moon" size={18} color={GOLD} /></View>
            <Text style={[s.sectionTitle, { color: GOLD }]}>Islamic Profile</Text>
          </View>
          <Text style={s.label}>Muslim Status</Text>
          <View style={s.toggleRow}>
            {[{ l: 'Old Muslim', v: 'Old' }, { l: 'New Muslim', v: 'New' }].map(opt => (
              <TouchableOpacity key={opt.v} onPress={() => setMuslimStatus(opt.v)} style={[s.toggle, muslimStatus === opt.v && { backgroundColor: GOLD, borderColor: GOLD }]}>
                <Text style={{ color: muslimStatus === opt.v ? BG : MUTED, fontWeight: '800', fontSize: 13 }}>{opt.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Islamic Knowledge Level</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Quran', 'Hadith', 'Fiqh', 'Tafsir', 'Aqeedah'].map(lvl => (
              <TouchableOpacity key={lvl} onPress={() => setIslamicLevel(lvl)} style={[s.chip, islamicLevel === lvl && { backgroundColor: `${GOLD}18`, borderColor: `${GOLD}60` }]}>
                <Text style={{ color: islamicLevel === lvl ? GOLD : MUTED, fontWeight: '700', fontSize: 13 }}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>Islamic Knowledge Note</Text>
          <TextInput
            style={s.input}
            placeholder="Add short note (default: Not specified)"
            placeholderTextColor={MUTED}
            value={islamicLevelNote}
            onChangeText={setIslamicLevelNote}
          />
        </View>

        {/* Submit */}
        {submitMessage ? (
          <View style={[s.submitBanner, submitType === 'success' ? s.submitBannerSuccess : s.submitBannerError]}>
            <Ionicons
              name={submitType === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={submitType === 'success' ? GREEN : RED}
            />
            <Text style={s.submitBannerText}>{submitMessage}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={saveStudent} disabled={loading}>
          {loading ? <ActivityIndicator color={BG} /> : (
            <><Ionicons name="cloud-upload" size={20} color={BG} /><Text style={s.submitText}> Submit Registration</Text></>
          )}
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { paddingBottom: 40 },
  bgWatermark: { position: 'absolute', width: '100%', height: '100%', opacity: 0.25, resizeMode: 'cover', zIndex: -1 },
  hero: { paddingHorizontal: 22, paddingTop: 36, paddingBottom: 28, position: 'relative' },
  cornerLogo: { position: 'absolute', top: 15, right: 15, width: 70, height: 70, opacity: 0.1, resizeMode: 'contain' },
  heroLogo: { width: 90, height: 90, resizeMode: 'contain', marginTop: 18, opacity: 1, alignSelf: 'flex-start' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)', gap: 6 },
  badgeText: { color: '#00E5FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { fontSize: 40, fontWeight: '900', color: '#F1F5F9', lineHeight: 50, marginBottom: 10 },
  heroSub: { fontSize: 14, color: '#64748B', lineHeight: 22, maxWidth: 290 },
  toast: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginHorizontal: 18, marginBottom: 14, borderWidth: 1, gap: 10 },
  toastText: { fontWeight: '700', fontSize: 14, flex: 1 },
  card: { backgroundColor: '#0F1929', borderRadius: 22, padding: 20, marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: '#1E293B' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  sectionIconBg: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 11, color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 },
  input: { backgroundColor: '#060A10', borderRadius: 12, color: '#F1F5F9', paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 14 : 12, fontSize: 15, borderWidth: 1, borderColor: '#1E293B', marginBottom: 16 },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#060A10',
  },
  optionChipActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0,229,255,0.16)',
  },
  optionText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  optionTextActive: { color: '#00E5FF' },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, backgroundColor: '#060A10', borderWidth: 1, borderColor: '#1E293B' },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: '#060A10', borderWidth: 1, borderColor: '#1E293B', marginBottom: 4 },
  photoRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#060A10' },
  photo: { width: '100%', height: '100%' },
  photoIconBg: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  photoLabel: { fontSize: 12, fontWeight: '700' },
  submitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  submitBannerSuccess: {
    borderColor: 'rgba(74,222,128,0.4)',
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  submitBannerError: {
    borderColor: 'rgba(244,63,94,0.45)',
    backgroundColor: 'rgba(244,63,94,0.12)',
  },
  submitBannerText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: { flexDirection: 'row', backgroundColor: '#00E5FF', borderRadius: 16, paddingVertical: 18, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginTop: 6, shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  submitText: { color: '#080C14', fontSize: 17, fontWeight: '900' },
});
