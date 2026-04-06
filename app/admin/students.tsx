import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, SafeAreaView, ActivityIndicator, Image, TouchableOpacity, Modal, Platform, StatusBar } from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import { db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function StudentManagerScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredStudents(students); return; }
    const q = searchQuery.toLowerCase();
    setFilteredStudents(students.filter(s =>
      s.fullName?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    ));
  }, [students, searchQuery]);

  const confirmDelete = async (id: string, name: string) => {
    const doDelete = async () => {
      setDeleting(id);
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (e: any) {
        if (Platform.OS === 'web') window.alert(e.message);
      } finally {
        setDeleting(null);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${name}" permanently?`)) doDelete();
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Delete Student', `Remove "${name}" permanently from the database?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const getBatchColor = (batch: string) => {
    const colors: Record<string, string> = { Fresh: '#4ADE80', Remedial: '#F97316', '1st': '#00E5FF', '2nd': '#A855F7', '3rd': '#F43F5E', '4th': '#EAB308', '5th': '#38BDF8', '6th': '#FB923C', Graduated: '#94A3B8' };
    return colors[batch] || '#64748B';
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{(item.fullName || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.batchDot, { backgroundColor: getBatchColor(item.batch) }]} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.fullName || 'Unknown'}</Text>
          <View style={[styles.statusPill, { backgroundColor: `${getBatchColor(item.batch)}18`, borderColor: `${getBatchColor(item.batch)}40` }]}>
            <Text style={[styles.statusText, { color: getBatchColor(item.batch) }]}>{item.batch || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={12} color="#475569" />
          <Text style={styles.metaText}>{item.department || 'No Department'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="call-outline" size={12} color="#475569" />
          <Text style={styles.metaText}>{item.phone || 'No Phone'}</Text>
        </View>

        <View style={styles.tagRow}>
          {item.muslimStatus && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.muslimStatus}</Text>
            </View>
          )}
          {item.islamicLevel && (
            <View style={[styles.tag, styles.tagGold]}>
              <Text style={[styles.tagText, { color: '#EAB308' }]}>{item.islamicLevel}</Text>
            </View>
          )}
          {item.sex && (
            <View style={[styles.tag, styles.tagPurple]}>
              <Text style={[styles.tagText, { color: '#A855F7' }]}>{item.sex}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedStudent(item); setQrModalVisible(true); }}>
            <Ionicons name="qr-code-outline" size={14} color="#A855F7" />
            <Text style={[styles.actionText, { color: '#A855F7' }]}>ID Card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCyan]} onPress={() => router.push(`/admin/edit-student?id=${item.id}` as any)}>
            <Ionicons name="pencil-outline" size={14} color="#00E5FF" />
            <Text style={[styles.actionText, { color: '#00E5FF' }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnRed, deleting === item.id && { opacity: 0.5 }]}
            onPress={() => confirmDelete(item.id, item.fullName)}
            disabled={deleting === item.id}
          >
            {deleting === item.id
              ? <ActivityIndicator size={12} color="#F87171" />
              : <Ionicons name="trash-outline" size={14} color="#F87171" />
            }
            <Text style={[styles.actionText, { color: '#F87171' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Student Database</Text>
          <Text style={styles.headerSub}>{students.length} registered students</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/add-student' as any)}>
          <Ionicons name="person-add" size={18} color="#0B0F19" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#475569" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, department, phone…"
          placeholderTextColor="#475569"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#475569" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      {!loading && (
        <View style={styles.statsBar}>
          <View style={styles.statChip}><Text style={styles.statNum}>{students.filter(s => s.sex === 'Male').length}</Text><Text style={styles.statLabel}>Male</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statChip}><Text style={styles.statNum}>{students.filter(s => s.sex === 'Female').length}</Text><Text style={styles.statLabel}>Female</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statChip}><Text style={[styles.statNum, { color: '#4ADE80' }]}>{students.filter(s => s.batch !== 'Graduated').length}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statChip}><Text style={[styles.statNum, { color: '#94A3B8' }]}>{students.filter(s => s.batch === 'Graduated').length}</Text><Text style={styles.statLabel}>Alumni</Text></View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Syncing database…</Text>
        </View>
      ) : filteredStudents.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}><Ionicons name="people-outline" size={40} color="#1E293B" /></View>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptyHint}>Try a different search or add a new student.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* QR Modal */}
      <Modal animationType="slide" transparent visible={qrModalVisible} onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.qrCard}>
            <View style={styles.qrCardHeader}>
              <Text style={styles.qrSchool}>OBU Muslim Students</Text>
              <Text style={styles.qrIdLabel}>DIGITAL STUDENT ID</Text>
            </View>
            {selectedStudent && (
              <>
                <View style={styles.qrAvatarRow}>
                  {selectedStudent.photoUrl ? (
                    <Image source={{ uri: selectedStudent.photoUrl }} style={styles.qrAvatar} />
                  ) : (
                    <View style={[styles.qrAvatar, styles.qrAvatarPlaceholder]}>
                      <Text style={styles.qrAvatarInitial}>{(selectedStudent.fullName || '?')[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.qrStudentInfo}>
                    <Text style={styles.qrStudentName}>{selectedStudent.fullName}</Text>
                    <Text style={styles.qrStudentDept}>{selectedStudent.department}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${getBatchColor(selectedStudent.batch)}18`, borderColor: `${getBatchColor(selectedStudent.batch)}40`, alignSelf: 'flex-start', marginTop: 6 }]}>
                      <Text style={[styles.statusText, { color: getBatchColor(selectedStudent.batch) }]}>{selectedStudent.batch}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.qrCodeBox}>
                  <QRCode value={selectedStudent.id} size={180} />
                </View>
                <Text style={styles.qrIdNum}>ID: {selectedStudent.id.slice(0, 16).toUpperCase()}</Text>
                <Text style={styles.qrHint}>Present this QR at the Attendance Scanner</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#080C14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#F1F5F9' },
  headerSub: { fontSize: 13, color: '#475569', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1526', marginHorizontal: 20, marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, color: '#F1F5F9', paddingVertical: 13, fontSize: 15 },
  statsBar: { flexDirection: 'row', backgroundColor: '#0D1526', marginHorizontal: 20, marginBottom: 16, borderRadius: 14, borderWidth: 1, borderColor: '#1E293B', paddingVertical: 12, justifyContent: 'space-around', alignItems: 'center' },
  statChip: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#00E5FF' },
  statLabel: { fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#1E293B' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#0D1526', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  cardLeft: { alignItems: 'center', marginRight: 14 },
  avatar: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#1E293B' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A2235' },
  avatarInitial: { fontSize: 22, fontWeight: '800', color: '#00E5FF' },
  batchDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', flex: 1, marginRight: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  metaText: { fontSize: 12, color: '#475569' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: 'rgba(0,229,255,0.08)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(0,229,255,0.2)' },
  tagGold: { backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.2)' },
  tagPurple: { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' },
  tagText: { fontSize: 10, fontWeight: '700', color: '#00E5FF', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', marginTop: 10, gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(168,85,247,0.08)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', gap: 4 },
  actionBtnCyan: { backgroundColor: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.2)' },
  actionBtnRed: { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' },
  actionText: { fontSize: 11, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { color: '#475569', marginTop: 12, fontSize: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#0D1526', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#1E293B' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#334155', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#1E293B', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(8,12,20,0.92)', justifyContent: 'flex-end' },
  qrCard: { backgroundColor: '#0D1526', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, borderTopWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  qrCardHeader: { alignItems: 'center', marginBottom: 20 },
  qrSchool: { fontSize: 12, color: '#475569', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  qrIdLabel: { fontSize: 20, fontWeight: '900', color: '#00E5FF', marginTop: 2 },
  qrAvatarRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24, backgroundColor: '#080C14', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1E293B' },
  qrAvatar: { width: 60, height: 60, borderRadius: 16, marginRight: 14 },
  qrAvatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A2235' },
  qrAvatarInitial: { fontSize: 24, fontWeight: '800', color: '#00E5FF' },
  qrStudentInfo: { flex: 1 },
  qrStudentName: { fontSize: 17, fontWeight: '800', color: '#F1F5F9' },
  qrStudentDept: { fontSize: 13, color: '#64748B', marginTop: 2 },
  qrCodeBox: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 16, shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  qrIdNum: { fontSize: 11, color: '#334155', fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  qrHint: { fontSize: 12, color: '#475569', marginBottom: 24, textAlign: 'center' },
  closeBtn: { width: '100%', backgroundColor: '#1E293B', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  closeBtnText: { color: '#F1F5F9', fontSize: 16, fontWeight: '700' },
});
