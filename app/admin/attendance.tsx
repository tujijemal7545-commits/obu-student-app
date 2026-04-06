import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, ScrollView
} from 'react-native';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// --- Web Fallback Component ---
function WebAttendanceEntry() {
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');

  const logAttendance = async () => {
    const id = studentId.trim();
    if (!id) { setMessage('Please paste or type a Student ID.'); setStatus('error'); return; }

    setStatus('loading');
    setMessage('');
    try {
      const studentRef = doc(db, 'students', id);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        setStatus('error');
        setMessage('No student found with this ID. Check the QR code and try again.');
        return;
      }

      const data = studentSnap.data();
      await addDoc(collection(db, 'attendance'), {
        studentId: id,
        fullName: data.fullName,
        department: data.department,
        timestamp: serverTimestamp()
      });

      setStudentName(data.fullName);
      setStatus('success');
      setMessage(`${data.fullName} has been marked as present!`);
      setStudentId('');
      // Auto-reset after 5 seconds
      setTimeout(() => { setStatus('idle'); setMessage(''); setStudentName(''); }, 5000);
    } catch (e: any) {
      setStatus('error');
      setMessage(e.message || 'Failed to connect to database. Check your connection.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.webContainer} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.webHeader}>
          <View style={styles.webIconRing}>
            <Ionicons name="scan" size={36} color="#00E5FF" />
          </View>
          <Text style={styles.webTitle}>Attendance Scanner</Text>
          <Text style={styles.webSubtitle}>Web Mode — Enter Student ID manually</Text>
        </View>

        {/* Alert Banner */}
        <View style={styles.webAlertBox}>
          <Ionicons name="information-circle" size={18} color="#F97316" />
          <Text style={styles.webAlertText}>
            Camera scanning requires the <Text style={{ color: '#00E5FF', fontWeight: '800' }}>Expo Go app</Text> on your phone.
            On web, paste the Student's Firestore ID below.
          </Text>
        </View>

        {/* Input */}
        <View style={styles.webInputSection}>
          <Text style={styles.webInputLabel}>STUDENT FIRESTORE ID</Text>
          <View style={styles.webInputRow}>
            <TextInput
              style={styles.webInput}
              placeholder="Paste student Firestore document ID..."
              placeholderTextColor="#334155"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {studentId.length > 0 && (
              <TouchableOpacity onPress={() => setStudentId('')} style={styles.clearBtn}>
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.webSubmitBtn, status === 'loading' && styles.webSubmitBtnDisabled]}
            onPress={logAttendance}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#0B0F19" />
                <Text style={styles.webSubmitText}>Mark Present</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {status === 'success' && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={44} color="#4ADE80" />
            <Text style={styles.successName}>{studentName}</Text>
            <Text style={styles.successMsg}>Marked as Present ✅</Text>
            <Text style={styles.successTime}>Logged at {new Date().toLocaleTimeString()}</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={32} color="#F43F5E" />
            <Text style={styles.errorMsg}>{message}</Text>
            <TouchableOpacity onPress={() => { setStatus('idle'); setMessage(''); }}>
              <Text style={styles.errorRetry}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* How to find ID instructions */}
        <View style={styles.howToCard}>
          <Text style={styles.howToTitle}>📋 How to get a Student ID?</Text>
          <View style={styles.howToStep}>
            <View style={styles.howToNum}><Text style={styles.howToNumText}>1</Text></View>
            <Text style={styles.howToText}>Go to <Text style={{ color: '#00E5FF' }}>Students Database</Text> → tap <Text style={{ color: '#A855F7' }}>ID Card</Text></Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToNum}><Text style={styles.howToNumText}>2</Text></View>
            <Text style={styles.howToText}>Copy the ID shown below the QR code</Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToNum}><Text style={styles.howToNumText}>3</Text></View>
            <Text style={styles.howToText}>Paste it above and tap <Text style={{ color: '#4ADE80' }}>Mark Present</Text></Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToNum}><Text style={styles.howToNumText}>4</Text></View>
            <Text style={styles.howToText}>For live QR scanning, use <Text style={{ color: '#F97316' }}>Expo Go</Text> on your phone</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Native Camera Component (phones only) ---
function NativeScanner() {
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<{ name: string; success: boolean } | null>(null);
  const [CameraView, setCameraView] = useState<any>(null);
  const [permission, setPermission] = useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const cam = await import('expo-camera');
      setCameraView(() => cam.CameraView);
      const [perm, requestPerm] = cam.useCameraPermissions();
      setPermission({ granted: perm?.granted, request: requestPerm });
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    if (data.length < 15) {
      setResult({ name: 'Invalid QR Code', success: false });
      return;
    }
    try {
      const studentRef = doc(db, 'students', data);
      const snap = await getDoc(studentRef);
      if (!snap.exists()) { setResult({ name: 'Unknown Student', success: false }); return; }
      const studentData = snap.data();
      await addDoc(collection(db, 'attendance'), {
        studentId: data,
        fullName: studentData.fullName,
        department: studentData.department,
        timestamp: serverTimestamp()
      });
      setResult({ name: studentData.fullName, success: true });
      setTimeout(() => { setScanned(false); setResult(null); }, 4000);
    } catch {
      setResult({ name: 'Database error', success: false });
    }
  };

  if (!CameraView) return <View style={styles.safeArea}><ActivityIndicator color="#00E5FF" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {CameraView && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      )}
      <View style={styles.nativeOverlay}>
        <View style={styles.nativeScanBox}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>
      {result && (
        <View style={[styles.nativeResult, result.success ? styles.nativeResultSuccess : styles.nativeResultError]}>
          <Ionicons name={result.success ? 'checkmark-circle' : 'alert-circle'} size={28} color={result.success ? '#4ADE80' : '#F43F5E'} />
          <Text style={styles.nativeResultText}>{result.name}</Text>
          {result.success && <Text style={styles.nativeResultSub}>Marked Present ✅</Text>}
          <TouchableOpacity onPress={() => { setScanned(false); setResult(null); }}>
            <Text style={styles.nativeScanAgain}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
      {!result && (
        <View style={styles.nativeBottom}>
          <View style={styles.nativePulse}>
            <ActivityIndicator color="#00E5FF" />
            <Text style={styles.nativeBottomText}>Point camera at Student QR ID</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function AttendanceScreen() {
  // Web fallback: expo-camera doesn't work in browsers
  return Platform.OS === 'web' ? <WebAttendanceEntry /> : <NativeScanner />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080C14' },
  // Web styles
  webContainer: { padding: 20, paddingBottom: 60 },
  webHeader: { alignItems: 'center', paddingVertical: 32 },
  webIconRing: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(0,229,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,229,255,0.25)' },
  webTitle: { fontSize: 30, fontWeight: '900', color: '#F1F5F9', marginBottom: 6 },
  webSubtitle: { fontSize: 14, color: '#475569' },
  webAlertBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', marginBottom: 24 },
  webAlertText: { flex: 1, color: '#94A3B8', fontSize: 13, lineHeight: 20 },
  webInputSection: { backgroundColor: '#0D1526', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  webInputLabel: { fontSize: 11, fontWeight: '800', color: '#334155', letterSpacing: 1.5, marginBottom: 10 },
  webInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#080C14', borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 14, marginBottom: 14 },
  webInput: { flex: 1, color: '#F1F5F9', paddingVertical: 14, fontSize: 14 },
  clearBtn: { padding: 8 },
  webSubmitBtn: { flexDirection: 'row', backgroundColor: '#00E5FF', borderRadius: 14, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  webSubmitBtnDisabled: { opacity: 0.6 },
  webSubmitText: { color: '#0B0F19', fontSize: 16, fontWeight: '800' },
  successCard: { backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' },
  successName: { fontSize: 22, fontWeight: '900', color: '#F1F5F9', marginTop: 12, marginBottom: 4 },
  successMsg: { fontSize: 15, color: '#4ADE80', fontWeight: '700', marginBottom: 6 },
  successTime: { fontSize: 12, color: '#475569' },
  errorCard: { backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)' },
  errorMsg: { color: '#F43F5E', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 10, marginBottom: 12 },
  errorRetry: { color: '#00E5FF', fontSize: 14, fontWeight: '700' },
  howToCard: { backgroundColor: '#0D1526', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  howToTitle: { fontSize: 15, fontWeight: '800', color: '#F1F5F9', marginBottom: 16 },
  howToStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  howToNum: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(0,229,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)' },
  howToNumText: { color: '#00E5FF', fontSize: 12, fontWeight: '800' },
  howToText: { color: '#64748B', fontSize: 13, lineHeight: 22, flex: 1 },
  // Native camera styles
  nativeOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  nativeScanBox: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#00E5FF', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  nativeResult: { position: 'absolute', bottom: 40, left: 20, right: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1 },
  nativeResultSuccess: { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: 'rgba(74,222,128,0.4)' },
  nativeResultError: { backgroundColor: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.4)' },
  nativeResultText: { color: '#F1F5F9', fontSize: 20, fontWeight: '800', marginTop: 10 },
  nativeResultSub: { color: '#4ADE80', fontSize: 14, marginTop: 4 },
  nativeScanAgain: { color: '#00E5FF', fontSize: 14, fontWeight: '700', marginTop: 14 },
  nativeBottom: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  nativePulse: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)' },
  nativeBottomText: { color: '#00E5FF', fontWeight: '700', fontSize: 14 },
});
