import { create } from 'zustand';

export interface CSVData {
  headers: string[];
  rows: string[][];
}

interface CSVStore {
  csvData: CSVData | null;
  fileName: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCSVData: (data: CSVData) => void;
  setFileName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
  
  // Computed values
  getRowCount: () => number;
  getColumnCount: () => number;
  getColumnData: (columnIndex: number) => string[];
  getColumnDataByName: (columnName: string) => string[];
}

export const useCSVStore = create<CSVStore>((set, get) => ({
  csvData: null,
  fileName: '',
  isLoading: false,
  error: null,
  
  setCSVData: (data) => set({ csvData: data, error: null }),
  setFileName: (name) => set({ fileName: name }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearData: () => set({ csvData: null, fileName: '', error: null }),
  
  getRowCount: () => {
    const { csvData } = get();
    return csvData?.rows.length || 0;
  },
  
  getColumnCount: () => {
    const { csvData } = get();
    return csvData?.headers.length || 0;
  },
  
  getColumnData: (columnIndex: number) => {
    const { csvData } = get();
    if (!csvData || columnIndex < 0 || columnIndex >= csvData.headers.length) {
      return [];
    }
    return csvData.rows.map(row => row[columnIndex] || '');
  },
  
  getColumnDataByName: (columnName: string) => {
    const { csvData } = get();
    if (!csvData) return [];
    
    const columnIndex = csvData.headers.findIndex(header => 
      header.toLowerCase() === columnName.toLowerCase()
    );
    
    if (columnIndex === -1) return [];
    return get().getColumnData(columnIndex);
  },
})); 