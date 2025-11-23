import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// 1. REMOVED Font.register
// We don't need to register standard fonts like 'Helvetica'. 
// It is built-in to PDF readers.

const styles = StyleSheet.create({
  page: { 
    flexDirection: 'column', 
    backgroundColor: '#FFFFFF', 
    padding: 30 
  },
  headerContainer: { 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  title: { 
    fontSize: 24, 
    color: '#1E90FF', 
    marginBottom: 10, 
    fontWeight: 'bold',
    fontFamily: 'Helvetica' // Use built-in font
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 5,
    fontFamily: 'Helvetica'
  },
  
  winnerBox: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  winnerEmoji: {
    fontSize: 24, 
    marginRight: 10, 
    fontFamily: 'Helvetica'
  },
  winnerText: { 
    fontSize: 18, 
    color: '#FFF', 
    fontWeight: 'bold',
    fontFamily: 'Helvetica' // Use built-in font
  },

  // Table Styles
  table: { 
    display: 'flex', 
    width: 'auto', 
    borderStyle: 'solid', 
    borderColor: '#E0F2FF', 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  tableRow: { 
    margin: 'auto', 
    flexDirection: 'row' 
  },
  tableColHeader: { 
    width: '25%', 
    borderStyle: 'solid', 
    borderColor: '#E0F2FF', 
    borderBottomColor: '#000', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    backgroundColor: '#1E90FF' 
  }, 
  tableCol: { 
    width: '25%', 
    borderStyle: 'solid', 
    borderColor: '#E0F2FF', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0 
  }, 
  tableCellHeader: { 
    margin: 5, 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#FFF',
    fontFamily: 'Helvetica' // Use built-in font
  },
  tableCell: { 
    margin: 5, 
    fontSize: 10, 
    color: '#333',
    fontFamily: 'Helvetica' // Use built-in font
  }
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
          <Text style={styles.winnerText}>Winner: {winner.name}</Text>
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