import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useCSVStore } from "@/lib/store/csvStore"

export default function CostClosing() {
  const { csvData } = useCSVStore()
  const [selectedCostType, setSelectedCostType] = useState("전체")

  // 환율 상수
  const CAD_TO_KRW_RATE = 1006.51

  // 통화 포맷팅 함수
  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return value
    
    const formatted = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(numValue))
    
    return `${numValue < 0 ? '-' : ''}CAD$ ${formatted}`
  }

  // KRW 포맷팅 함수
  const formatKRW = (cadValue: number) => {
    const krwValue = cadValue * CAD_TO_KRW_RATE
    const formatted = new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(krwValue))
    
    return `${krwValue < 0 ? '-' : ''}${formatted}`
  }

  // CAD 숫자만 포맷팅 함수 (요약 테이블용)
  const formatCADNumber = (value: number) => {
    const formatted = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value))
    
    return `${value < 0 ? '-' : ''}${formatted}`
  }

  // CSV 데이터가 없는 경우
  if (!csvData) {
  return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">비용 마감</h2>
          </div>
      </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                비용 마감을 위한 CSV 데이터가 없습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                먼저 데이터 관리 페이지에서 CSV 파일을 업로드해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 필요한 컬럼들의 인덱스 찾기
  const findColumnIndex = (keywords: string[]) => {
    return csvData.headers.findIndex(header => 
      keywords.some(keyword => 
        header.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  }

  const dateTimeIndex = findColumnIndex(['date/time', 'datetime', 'date'])
  const typeIndex = findColumnIndex(['type'])
  const descriptionIndex = findColumnIndex(['description'])
  const totalIndex = findColumnIndex(['total'])

  // 데이터 추출
  const extractedData = csvData.rows.map((row, index) => ({
    rowIndex: index + 1,
    dateTime: dateTimeIndex !== -1 ? row[dateTimeIndex] : '-',
    type: typeIndex !== -1 ? row[typeIndex] : '-',
    description: descriptionIndex !== -1 ? row[descriptionIndex] : '-',
    total: totalIndex !== -1 ? row[totalIndex] : '-'
  }))

  // 선택된 비용 유형에 따른 필터링
  const getFilteredDataByCostType = (data: typeof extractedData, costType: string) => {
    if (costType === "전체") {
      return data
    }

    return data.filter(item => {
      const type = item.type.toLowerCase()
      const description = item.description.toLowerCase()

      switch (costType) {
        case "쿠폰발급수수료":
          return type === 'service fee' && description.includes('coupon redemption')
        
        case "광고비":
          return type === 'service fee' && description.includes('cost of advertising')
        
        case "창고비":
          return type === 'fba inventory fee' && 
                 (description.includes('fba storage fee') || description.includes('fba long-term storage fee'))
        
        case "폐기비용":
          return type === 'fba inventory fee' && 
                 description.includes('fulfilment by amazon removal order: disposal fee')
        
        case "기타비용":
          return type === 'service fee' && description.includes('subscription')
        
        default:
          return true
      }
    })
  }

  // 최종 필터링된 데이터
  const finalFilteredData = getFilteredDataByCostType(extractedData, selectedCostType)

  // 각 비용 유형별 합계 계산
  const costTypeSummary = {
    쿠폰발급수수료: 0,
    광고비: 0,
    창고비: 0,
    폐기비용: 0,
    기타비용: 0
  }

  Object.keys(costTypeSummary).forEach(costType => {
    const typeData = getFilteredDataByCostType(extractedData, costType)
    costTypeSummary[costType as keyof typeof costTypeSummary] = typeData.reduce((sum, item) => {
      const numValue = parseFloat(item.total)
      return sum + (isNaN(numValue) ? 0 : numValue)
    }, 0)
  })

  // 전체 합계 계산
  const grandTotal = Object.values(costTypeSummary).reduce((sum, value) => sum + value, 0)

  // 총 금액 계산
  const totalAmount = finalFilteredData.reduce((sum, item) => {
    const numValue = parseFloat(item.total)
    return sum + (isNaN(numValue) ? 0 : numValue)
  }, 0)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">비용 마감</h2>
          </div>
        </div>

        {/* 비용 유형별 요약 표 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">비용 유형별 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground w-20"></TableHead>
                    <TableHead className="font-semibold text-foreground text-center">쿠폰발급수수료</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">광고비</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">창고비</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">폐기비용</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">기타비용</TableHead>
                    <TableHead className="font-semibold text-foreground text-center bg-primary/10">합계</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">CAD</TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.쿠폰발급수수료 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatCADNumber(costTypeSummary.쿠폰발급수수료)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.광고비 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatCADNumber(costTypeSummary.광고비)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.창고비 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatCADNumber(costTypeSummary.창고비)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.폐기비용 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatCADNumber(costTypeSummary.폐기비용)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.기타비용 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatCADNumber(costTypeSummary.기타비용)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold bg-primary/10">
                      <span className={`px-3 py-2 rounded-md text-base font-bold ${
                        grandTotal < 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}>
                        {formatCADNumber(grandTotal)}
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">KRW</TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.쿠폰발급수수료 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatKRW(costTypeSummary.쿠폰발급수수료)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.광고비 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatKRW(costTypeSummary.광고비)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.창고비 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatKRW(costTypeSummary.창고비)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.폐기비용 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatKRW(costTypeSummary.폐기비용)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <span className={`px-2 py-1 rounded-md text-sm ${
                        costTypeSummary.기타비용 < 0 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {formatKRW(costTypeSummary.기타비용)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold bg-primary/10">
                      <span className={`px-3 py-2 rounded-md text-base font-bold ${
                        grandTotal < 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}>
                        {formatKRW(grandTotal)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 비용 유형 선택 드롭다운 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">비용 유형:</label>
          <Select value={selectedCostType} onValueChange={setSelectedCostType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="비용 유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="쿠폰발급수수료">쿠폰발급수수료</SelectItem>
              <SelectItem value="광고비">광고비</SelectItem>
              <SelectItem value="창고비">창고비</SelectItem>
              <SelectItem value="폐기비용">폐기비용</SelectItem>
              <SelectItem value="기타비용">기타비용</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 필터링 결과 요약 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>전체 데이터: {extractedData.length}개</span>
            <span>→</span>
            <span className="font-medium text-foreground">{selectedCostType}: {finalFilteredData.length}개</span>
          </div>
          {finalFilteredData.length > 0 && (
            <div className="text-sm font-medium text-foreground">
              총 금액: <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount.toString())}</span>
            </div>
          )}
        </div>
      </div>

      {/* 추출된 데이터 테이블 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            {selectedCostType} 데이터 ({finalFilteredData.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="font-semibold text-foreground w-20 text-center">No.</TableHead>
                  <TableHead className="font-semibold text-foreground min-w-32">Date/Time</TableHead>
                  <TableHead className="font-semibold text-foreground max-w-md">Description</TableHead>
                  <TableHead className="font-semibold text-foreground text-right min-w-36">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalFilteredData.length > 0 ? (
                  finalFilteredData.map((item, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-muted/30 transition-colors border-b border-border/50"
                    >
                      <TableCell className="font-medium text-muted-foreground text-center text-sm">
                        {item.rowIndex}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.dateTime}
                      </TableCell>
                      <TableCell className="text-sm leading-relaxed">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={`px-2 py-1 rounded-md text-sm ${
                          parseFloat(item.total) < 0 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {formatCurrency(item.total)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      <div className="space-y-2">
                        <div className="text-4xl">📊</div>
                        <div className="font-medium">데이터가 없습니다</div>
                        <div className="text-sm">선택한 비용 유형 "{selectedCostType}"에 해당하는 데이터가 없습니다.</div>
                </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 테이블 하단 요약 */}
          {finalFilteredData.length > 0 && (
            <div className="border-t bg-muted/20 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  총 {finalFilteredData.length}개 항목
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">합계:</span>
                  <span className={`px-3 py-1 rounded-md font-bold text-base ${
                    totalAmount < 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {formatCurrency(totalAmount.toString())}
                  </span>
                </div>
              </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
