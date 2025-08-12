import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCSVStore } from "@/lib/store/csvStore";

interface CSVDataDisplayProps {
  maxRows?: number;
  showStats?: boolean;
}

export default function CSVDataDisplay({ maxRows = 10, showStats = true }: CSVDataDisplayProps) {
  const { csvData, fileName, getRowCount, getColumnCount } = useCSVStore();

  if (!csvData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            CSV 데이터가 없습니다. 먼저 파일을 업로드해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">데이터 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{getRowCount()}</p>
                <p className="text-sm text-muted-foreground">총 행 수</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{getColumnCount()}</p>
                <p className="text-sm text-muted-foreground">총 열 수</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{fileName}</p>
                <p className="text-sm text-muted-foreground">파일명</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {getRowCount() * getColumnCount()}
                </p>
                <p className="text-sm text-muted-foreground">총 셀 수</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>데이터 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvData.headers.map((header, index) => (
                    <TableHead key={index} className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{header}</span>
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.rows.length > 0 ? (
                  csvData.rows.slice(0, maxRows).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="whitespace-nowrap">
                          {cell || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={csvData.headers.length} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {csvData.rows.length > maxRows && (
            <p className="text-sm text-muted-foreground mt-4">
              총 {csvData.rows.length}개의 행 중 {maxRows}개만 표시됩니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 