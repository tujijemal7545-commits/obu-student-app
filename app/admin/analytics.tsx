import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function AnalyticsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Computed data properties
  const [stats, setStats] = useState({
    total: 0,
    males: 0,
    females: 0,
    graduated: 0,
    active: 0
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
      const dbStudents: any[] = [];
      let m = 0, f = 0, g = 0;
      
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        dbStudents.push(data);
        
        if (data.sex === 'Male') m++;
        if (data.sex === 'Female') f++;
        if (data.batch === 'Graduated') g++;
      });
      
      setStudents(dbStudents);
      setStats({
        total: dbStudents.length,
        males: m,
        females: f,
        graduated: g,
        active: dbStudents.length - g
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generatePDF = async () => {
    if (students.length === 0) {
      Alert.alert("Empty Database", "There are no students to export.");
      return;
    }
    
    setPrinting(true);
    try {
      const today = new Date().toLocaleDateString();
      
      let rows = students.map((s, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${s.fullName || '-'}</td>
          <td>${s.sex || '-'}</td>
          <td>${s.department || '-'}</td>
          <td>${s.batch || '-'}</td>
          <td>${s.phone || '-'}</td>
          <td>${s.muslimStatus || '-'}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00E5FF; padding-bottom: 15px; }
              .header h1 { margin: 0; color: #0F172A; font-size: 28px; }
              .header p { margin: 5px 0 0 0; color: #64748B; font-size: 14px; }
              .stats-container { display: flex; justify-content: space-between; margin-bottom: 30px; background: #F8FAFC; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; }
              .stat-box { text-align: center; }
              .stat-val { font-size: 20px; font-weight: bold; color: #0B0F19; }
              .stat-label { font-size: 12px; color: #64748B; text-transform: uppercase; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; }
              th { background-color: #0F172A; color: white; text-align: left; padding: 12px 10px; font-weight: 600; border: 1px solid #0F172A; }
              td { padding: 10px; border: 1px solid #CBD5E1; color: #1E293B; }
              tr:nth-child(even) { background-color: #F8FAFC; }
              .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94A3B8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OBU Muslim Students Registry</h1>
              <p>Generated Official Report • ${today}</p>
            </div>
            
            <div class="stats-container">
              <div class="stat-box">
                <div class="stat-val">${stats.total}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${stats.active}</div>
                <div class="stat-label">Active</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${stats.graduated}</div>
                <div class="stat-label">Graduated</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${stats.females}</div>
                <div class="stat-label">Female</div>
              </div>
            </div>

            <table>
              <tr>
                <th width="5%">#</th>
                <th width="25%">Full Name</th>
                <th width="10%">Sex</th>
                <th width="20%">Department</th>
                <th width="10%">Status</th>
                <th width="15%">Phone</th>
                <th width="15%">Category</th>
              </tr>
              ${rows}
            </table>

            <div class="footer">
               <p>This is an automated system-generated document from the OBU Muslim Students Administration portal.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (Platform.OS === 'web') {
        Alert.alert("Wait!", "PDF generation on browser will open a print dialog natively.");
      } else {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Download Student Registry PDF'
        });
      }
      
    } catch (e: any) {
      Alert.alert("Export Error", e.message || "Failed to generate PDF document.");
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.sectionTitle}>Overview Dashboard</Text>
        
        <View style={styles.grid}>
          {/* Main Stat Card */}
          <View style={[styles.statCard, styles.mainStat]}>
            <Ionicons name="people" size={40} color="#00E5FF" />
            <Text style={styles.mainStatValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Registrations</Text>
          </View>

          <View style={styles.smallGrid}>
            <View style={styles.smallStatCard}>
              <Text style={[styles.smallStatValue, {color: '#4ADE80'}]}>{stats.active}</Text>
              <Text style={styles.statLabel}>Academically Active</Text>
            </View>
            <View style={styles.smallStatCard}>
              <Text style={[styles.smallStatValue, {color: '#F43F5E'}]}>{stats.graduated}</Text>
              <Text style={styles.statLabel}>Total Graduated</Text>
            </View>
            <View style={styles.smallStatCard}>
              <Text style={[styles.smallStatValue, {color: '#A855F7'}]}>{stats.males}</Text>
              <Text style={styles.statLabel}>Male Students</Text>
            </View>
            <View style={styles.smallStatCard}>
              <Text style={[styles.smallStatValue, {color: '#F472B6'}]}>{stats.females}</Text>
              <Text style={styles.statLabel}>Female Students</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Document Generation</Text>
          <Text style={styles.reportDesc}>Export the entire database consisting of {stats.total} students into an official, cleanly formatted PDF document for local archives.</Text>
          
          <TouchableOpacity 
            style={styles.pdfBtn} 
            onPress={generatePDF}
            disabled={printing}
          >
            {printing ? (
               <ActivityIndicator color="#0B0F19" />
            ) : (
               <>
                 <Ionicons name="document-text" size={24} color="#0B0F19" style={{marginRight: 10}} />
                 <Text style={styles.pdfBtnText}>Export Registry to PDF</Text>
               </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0F19' },
  container: { padding: 20 },
  sectionTitle: { color: '#E0E7FF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  grid: { marginBottom: 30 },
  statCard: { backgroundColor: '#1A2235', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  mainStat: { backgroundColor: '#1A2235', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  mainStatValue: { color: '#F8FAFC', fontSize: 60, fontWeight: 'bold', marginVertical: 10 },
  statLabel: { color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5 },
  smallGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  smallStatCard: { width: '48%', backgroundColor: '#1E293B', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  smallStatValue: { fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  reportSection: { backgroundColor: '#0F172A', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#334155' },
  reportDesc: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  pdfBtn: { flexDirection: 'row', backgroundColor: '#00E5FF', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#00D1FF', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  pdfBtnText: { color: '#0B0F19', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' }
});
