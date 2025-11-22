import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font (optional, but good for consistency)
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://fonts.gstatic.com/s/helveticaneue/5.13.0/HelveticaNeue-Bold.ttf',
});

// Styles for the PDF
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
  headerContainer: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, color: '#1E90FF', marginBottom: 10, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  winnerBox: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    alignItems: 'center',
  },
  winnerText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderColor: '#E0F2FF', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderColor: '#E0F2FF', borderBottomColor: '#000', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#1E90FF' }, 
  tableCol: { width: '25%', borderStyle: 'solid', borderColor: '#E0F2FF', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 }, 
  tableCellHeader: { margin: 5, fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  tableCell: { margin: 5, fontSize: 10, color: '#333' }
});

interface PdfProps {
  students: any[];
  winner: any;
  concept: string;
}

export const GameReportPdf: React.FC<PdfProps> = ({ students, winner, concept }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Game Session Report</Text>
        <Text style={styles.subtitle}>Secret Concept: {concept}</Text>
        <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Winner Highlight */}
      {winner && (
        <View style={styles.winnerBox}>
          <Text style={styles.winnerText}>🏆 Winner: {winner.name}</Text>
        </View>
      )}

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Rank</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Name</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Questions</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Time</Text></View>
        </View>

        {/* Table Rows */}
        {students.map((student, index) => (
          <View style={styles.tableRow} key={student.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>#{index + 1}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{student.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{student.questionsUsed}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                 {Math.floor(student.timeElapsed / 60)}:{(student.timeElapsed % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);