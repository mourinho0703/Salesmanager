import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCSVStore } from "@/lib/store/csvStore"

export default function RevenueClosing() {
  const { csvData } = useCSVStore()

  // 환율 상수
  const CAD_TO_KRW_RATE = 1006.11

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
            <h2 className="text-2xl font-bold text-foreground mb-2">매출 마감</h2>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                매출 마감을 위한 CSV 데이터가 없습니다.
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
  const skuIndex = findColumnIndex(['sku'])
  const orderIdIndex = findColumnIndex(['order id', 'order-id', 'orderid', 'order_id'])

  // 데이터 추출
  const extractedData = csvData.rows.map((row, index) => ({
    rowIndex: index + 1,
    dateTime: dateTimeIndex !== -1 ? row[dateTimeIndex] : '-',
    type: typeIndex !== -1 ? row[typeIndex] : '-',
    description: descriptionIndex !== -1 ? row[descriptionIndex] : '-',
    total: totalIndex !== -1 ? row[totalIndex] : '-',
    sku: skuIndex !== -1 ? row[skuIndex] : '-',
    orderId: orderIdIndex !== -1 ? row[orderIdIndex] : '-',
    quantity: 1 // 수량은 모두 1로 고정
  }))

  // 매출 관련 데이터만 필터링 (order, refund, adjustment)
  const revenueFilteredData = extractedData.filter(item => {
    const type = item.type.toLowerCase()
    return type === 'order' || type === 'refund' || type === 'adjustment'
  })

  // SKU별 요약 데이터 생성
  const skuSummaryMap = new Map<string, { count: number, totalCAD: number }>()
  
  revenueFilteredData.forEach(item => {
    const sku = item.sku
    const total = parseFloat(item.total)
    
    if (sku !== '-' && !isNaN(total)) {
      if (skuSummaryMap.has(sku)) {
        const existing = skuSummaryMap.get(sku)!
        skuSummaryMap.set(sku, {
          count: existing.count + 1,
          totalCAD: existing.totalCAD + total
        })
      } else {
        skuSummaryMap.set(sku, {
          count: 1,
          totalCAD: total
        })
      }
    }
  })

  // SKU 요약 데이터를 배열로 변환
  const skuSummaryData = Array.from(skuSummaryMap.entries()).map(([sku, data]) => ({
    sku,
    count: data.count,
    totalCAD: data.totalCAD,
    totalKRW: data.totalCAD * CAD_TO_KRW_RATE
  }))

  // SKU별 총합 계산
  const skuTotalCAD = skuSummaryData.reduce((sum, item) => sum + item.totalCAD, 0)
  const skuTotalKRW = skuTotalCAD * CAD_TO_KRW_RATE
  const skuTotalCount = skuSummaryData.reduce((sum, item) => sum + item.count, 0)

  // 지역별 매출 데이터 생성 (description에서 지역 정보 추출)
  const regionSummaryMap = new Map<string, { count: number, totalCAD: number }>()
  
  revenueFilteredData.forEach(item => {
    const description = item.description.toLowerCase()
    const total = parseFloat(item.total)
    
    if (!isNaN(total)) {
      let region = '기타'
      
      // description에서 지역 정보 추출 (간단한 패턴 매칭)
      if (description.includes('canada') || description.includes('캐나다') || description.includes('ca')) {
        region = '캐나다'
      } else if (description.includes('usa') || description.includes('us') || description.includes('미국') || description.includes('america')) {
        region = '미국'
      } else if (description.includes('europe') || description.includes('유럽') || description.includes('eu')) {
        region = '유럽'
      } else if (description.includes('asia') || description.includes('아시아') || description.includes('korea') || description.includes('한국')) {
        region = '아시아'
      } else if (description.includes('australia') || description.includes('호주') || description.includes('au')) {
        region = '호주'
      }
      
      if (regionSummaryMap.has(region)) {
        const existing = regionSummaryMap.get(region)!
        regionSummaryMap.set(region, {
          count: existing.count + 1,
          totalCAD: existing.totalCAD + total
        })
      } else {
        regionSummaryMap.set(region, {
          count: 1,
          totalCAD: total
        })
      }
    }
  })

  // 지역별 요약 데이터를 배열로 변환
  const regionSummaryData = Array.from(regionSummaryMap.entries()).map(([region, data]) => ({
    region,
    count: data.count,
    totalCAD: data.totalCAD,
    totalKRW: data.totalCAD * CAD_TO_KRW_RATE,
    percentage: skuTotalCAD !== 0 ? (data.totalCAD / skuTotalCAD * 100) : 0
  })).sort((a, b) => b.totalCAD - a.totalCAD) // 매출 순으로 정렬

  // 총 금액 계산
  const totalAmount = extractedData.reduce((sum, item) => {
    const numValue = parseFloat(item.total)
    return sum + (isNaN(numValue) ? 0 : numValue)
  }, 0)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">매출 마감</h2>
          </div>
        </div>

        {/* SKU별 매출 요약 표 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">SKU별 매출 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">SKU</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">수량</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">매출(CAD)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">매출(KRW)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skuSummaryData.length > 0 ? (
                    <>
                      {skuSummaryData.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.count}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={`px-2 py-1 rounded-md text-sm ${
                              item.totalCAD < 0 
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {formatCADNumber(item.totalCAD)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={`px-2 py-1 rounded-md text-sm ${
                              item.totalKRW < 0 
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {formatKRW(item.totalCAD)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 bg-muted/20">
                        <TableCell className="font-bold text-foreground">합계</TableCell>
                        <TableCell className="text-center font-bold text-foreground">
                          {skuTotalCount}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={`px-3 py-2 rounded-md text-base font-bold ${
                            skuTotalCAD < 0 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          }`}>
                            {formatCADNumber(skuTotalCAD)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={`px-3 py-2 rounded-md text-base font-bold ${
                            skuTotalKRW < 0 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          }`}>
                            {formatKRW(skuTotalCAD)}
                          </span>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                        <div className="space-y-2">
                          <div className="text-4xl">📦</div>
                          <div className="font-medium">SKU 데이터가 없습니다</div>
                          <div className="text-sm">order, refund, adjustment 타입의 SKU 데이터가 없습니다.</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 지역별 매출 현황 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">지역별 매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">지역</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">건수</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">매출(CAD)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">매출(KRW)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">비율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionSummaryData.length > 0 ? (
                    regionSummaryData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary"></span>
                            {item.region}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.count}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            item.totalCAD < 0 
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {formatCADNumber(item.totalCAD)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            item.totalKRW < 0 
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {formatKRW(item.totalCAD)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className="px-2 py-1 rounded-md text-sm bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                        <div className="space-y-2">
                          <div className="text-4xl">🌍</div>
                          <div className="font-medium">지역 데이터가 없습니다</div>
                          <div className="text-sm">매출 데이터에서 지역 정보를 찾을 수 없습니다.</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 필터링 결과 요약 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">매출 데이터: {revenueFilteredData.length}개</span>
            <span className="text-xs text-muted-foreground">(order, refund, adjustment)</span>
          </div>
          {revenueFilteredData.length > 0 && (
            <div className="text-sm font-medium text-foreground">
              총 금액: <span className="text-lg font-bold text-primary">{formatCurrency(skuTotalCAD.toString())}</span>
            </div>
          )}
        </div>
      </div>

      {/* 추출된 데이터 테이블 */}
              <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              매출 데이터 ({revenueFilteredData.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b">
                    <TableHead className="font-semibold text-foreground min-w-32">Date/Time</TableHead>
                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Order ID</TableHead>
                    <TableHead className="font-semibold text-foreground">SKU</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">수량</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueFilteredData.length > 0 ? (
                    revenueFilteredData.map((item, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-muted/30 transition-colors border-b border-border/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {item.dateTime}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.orderId}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <div className="space-y-2">
                        <div className="text-4xl">📊</div>
                        <div className="font-medium">데이터가 없습니다</div>
                        <div className="text-sm">매출 데이터가 없습니다.</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
                        {/* 테이블 하단 요약 */}
              {revenueFilteredData.length > 0 && (
                <div className="border-t bg-muted/20 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      총 {revenueFilteredData.length}개 항목
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">합계:</span>
                      <span className={`px-3 py-1 rounded-md font-bold text-base ${
                        skuTotalCAD < 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {formatCurrency(skuTotalCAD.toString())}
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