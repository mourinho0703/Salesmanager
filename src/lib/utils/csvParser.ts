export interface CSVData {
  headers: string[];
  rows: string[][];
}

export const parseCSV = (text: string): CSVData => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // 이스케이프된 따옴표 처리
        currentCell += '"';
        i++; // 다음 따옴표 건너뛰기
      } else {
        // 따옴표 시작/끝 토글
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // 셀 구분자
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // 행 구분자
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      }
      // \r\n 처리
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentCell += char;
    }
  }
  
  // 마지막 셀과 행 처리
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  
  if (rows.length === 0) {
    throw new Error('CSV 파일이 비어있습니다.');
  }

  const headers = rows[0];
  const data = rows.slice(1).filter(row => row.length === headers.length);
  
  return {
    headers,
    rows: data
  };
}; 