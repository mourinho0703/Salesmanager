import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCSVStore } from "@/lib/store/csvStore";

export default function CSVAnalysis() {
  const { csvData, getColumnDataByName } = useCSVStore();

  if (!csvData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            분석할 CSV 데이터가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 각 컬럼의 데이터 타입과 통계 분석
  const analyzeColumn = (columnName: string, columnData: string[]) => {
    const nonEmptyData = columnData.filter(cell => cell.trim() !== '');
    
    if (nonEmptyData.length === 0) {
      return {
        type: 'empty',
        uniqueCount: 0,
        mostCommon: null,
        numericStats: null
      };
    }

    // 숫자 데이터인지 확인
    const numericData = nonEmptyData.filter(cell => !isNaN(Number(cell)) && cell.trim() !== '');
    const isNumeric = numericData.length > nonEmptyData.length * 0.8; // 80% 이상이 숫자면 숫자형

    if (isNumeric) {
      const numbers = numericData.map(Number);
      const sum = numbers.reduce((a, b) => a + b, 0);
      const avg = sum / numbers.length;
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      
      return {
        type: 'numeric',
        uniqueCount: new Set(numericData).size,
        mostCommon: null,
        numericStats: { min, max, avg, sum, count: numbers.length }
      };
    } else {
      // 텍스트 데이터 분석
      const frequency: Record<string, number> = {};
      nonEmptyData.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
      });
      
      const mostCommon = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)[0];
      
      return {
        type: 'text',
        uniqueCount: Object.keys(frequency).length,
        mostCommon: mostCommon ? { value: mostCommon[0], count: mostCommon[1] } : null,
        numericStats: null
      };
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>컬럼 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {csvData.headers.map((header, index) => {
              const columnData = getColumnDataByName(header);
              const analysis = analyzeColumn(header, columnData);
              
              return (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{header}</h4>
                      <Badge variant={analysis.type === 'numeric' ? 'default' : 'secondary'}>
                        {analysis.type === 'numeric' ? '숫자' : analysis.type === 'text' ? '텍스트' : '빈값'}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>고유값: {analysis.uniqueCount}개</p>
                      
                      {analysis.type === 'numeric' && analysis.numericStats && (
                        <div className="space-y-1">
                          <p>최소값: {analysis.numericStats.min}</p>
                          <p>최대값: {analysis.numericStats.max}</p>
                          <p>평균값: {analysis.numericStats.avg.toFixed(2)}</p>
                          <p>합계: {analysis.numericStats.sum.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {analysis.type === 'text' && analysis.mostCommon && (
                        <div>
                          <p>가장 빈번한 값:</p>
                          <p className="font-medium">{analysis.mostCommon.value}</p>
                          <p>({analysis.mostCommon.count}회)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 