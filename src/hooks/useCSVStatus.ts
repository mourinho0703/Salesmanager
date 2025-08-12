import { useCSVStore } from "@/lib/store/csvStore";

export const useCSVStatus = () => {
  const { csvData, fileName, isLoading, error, getRowCount, getColumnCount } = useCSVStore();

  return {
    hasData: !!csvData,
    fileName,
    isLoading,
    error,
    rowCount: getRowCount(),
    columnCount: getColumnCount(),
    totalCells: getRowCount() * getColumnCount(),
    isEmpty: !csvData || getRowCount() === 0,
  };
}; 