// PdfDocument.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// 1. Define your Data Interface
export interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

// 2. Define Styles (similar to React Native/CSS)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  columnId: { width: '10%' },
  columnName: { width: '30%' },
  columnEmail: { width: '40%' },
  columnRole: { width: '20%' },
  text: { fontSize: 12 },
});

interface PdfDocumentProps {
  data: UserData[];
}

// 3. Create the Document Component
export const PdfDocument: React.FC<PdfDocumentProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>User List Report</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.columnId, styles.text]}>ID</Text>
        <Text style={[styles.columnName, styles.text]}>Name</Text>
        <Text style={[styles.columnEmail, styles.text]}>Email</Text>
        <Text style={[styles.columnRole, styles.text]}>Role</Text>
      </View>

      {/* Table Rows (Mapping the list) */}
      {data.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={[styles.columnId, styles.text]}>{item.id}</Text>
          <Text style={[styles.columnName, styles.text]}>{item.name}</Text>
          <Text style={[styles.columnEmail, styles.text]}>{item.email}</Text>
          <Text style={[styles.columnRole, styles.text]}>{item.role}</Text>
        </View>
      ))}
    </Page>
  </Document>
);