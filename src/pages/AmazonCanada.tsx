import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { useCSVStore } from "@/lib/store/csvStore";
import { parseCSV } from "@/lib/utils/csvParser";
import CostClosing from "@/pages/CostClosing";
import RevenueClosing from "@/pages/RevenueClosing";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CSVDataDisplay from "@/components/CSVDataDisplay";

export default function AmazonCanada() {
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [selectedView, setSelectedView] = useState<"cost" | "revenue">("cost");
  const {
    csvData,
    fileName,
    isLoading,
    error,
    setCSVData,
    setFileName,
    setLoading,
    setError,
  } = useCSVStore();

  // 업로드 이후에는 자동으로 마감 화면으로 전환
  const [showClosing, setShowClosing] = useState(() => !!csvData);

  useEffect(() => {
    if (showUploadSuccess) {
      const timer = setTimeout(() => setShowUploadSuccess(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showUploadSuccess]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsedData = parseCSV(text);

          setCSVData(parsedData);
          setLoading(false);
          toast.success(`CSV 파일이 성공적으로 로드되었습니다. (${parsedData.rows.length}행)`);
          setShowUploadSuccess(true);
          setShowClosing(true); // 같은 화면에서 프레임 전환
          setSelectedView("cost"); // 기본은 비용마감
        } catch (error) {
          console.error("CSV 파싱 에러:", error);
          setError(
            error instanceof Error ? error.message : "CSV 파일을 파싱하는 중 오류가 발생했습니다."
          );
          setLoading(false);
          toast.error("CSV 파일을 파싱하는 중 오류가 발생했습니다.");
        }
      };

      reader.onerror = (error) => {
        console.error("파일 읽기 에러:", error);
        setError("파일을 읽는 중 오류가 발생했습니다.");
        setLoading(false);
        toast.error("파일을 읽는 중 오류가 발생했습니다.");
      };

      reader.readAsText(file, "UTF-8");
    }
  }, [setCSVData, setFileName, setLoading, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  if (showClosing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="container mx-auto py-8 space-y-6 relative">
          {/* 업로드 성공 오버레이 */}
          {showUploadSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
              <div className="relative z-10 bg-white dark:bg-slate-800 rounded-full p-4 shadow-2xl border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}

          {/* 헤더 영역 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">아마존 캐나다 정산</h1>
                </div>
              </div>
            </div>
          </div>

          {/* 상단 토글 + 데이터 원본 버튼 */}
          <div className="flex items-center justify-between">
            <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "cost" | "revenue")}
              className="w-full">
              <TabsList className="grid w-fit grid-cols-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                <TabsTrigger 
                  value="cost" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-gray-100 transition-all duration-200"
                >
                  💰 비용마감
                </TabsTrigger>
                <TabsTrigger 
                  value="revenue" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-gray-100 transition-all duration-200"
                >
                  📊 매출마감
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4">
                  데이터 원본
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-[90vw]">
                <DialogHeader>
                  <DialogTitle>데이터 원본</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-auto">
                  <CSVDataDisplay maxRows={50} showStats={true} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 프레임 전환 영역 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              {selectedView === "cost" ? <CostClosing /> : <RevenueClosing />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 업로드 성공 오버레이 */}
        {showUploadSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
            <div className="relative z-10 bg-white dark:bg-slate-800 rounded-full p-4 shadow-2xl border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">아마존 캐나다</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">CSV 파일을 업로드하여 데이터 분석을 시작하세요</p>
        </div>

        {/* 업로드 카드 */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              CSV 파일 업로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                ${isDragActive 
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-lg" 
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            >
              <input {...getInputProps()} disabled={isLoading} />
              <div className="space-y-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300
                  ${isDragActive 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                  <Upload className={`w-10 h-10 transition-colors duration-300
                    ${isDragActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400"
                    }`} />
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">파일을 처리하는 중...</p>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : fileName ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{fileName}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">다른 파일을 업로드하려면 클릭하거나 드래그하세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {isDragActive ? "파일을 여기에 놓으세요" : "CSV 파일을 업로드하세요"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      파일을 드래그하거나 클릭하여 선택하세요
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <Badge variant="outline" className="text-xs">CSV</Badge>
                      <Badge variant="outline" className="text-xs">최대 50MB</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
