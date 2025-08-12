import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";
import { useCSVStore } from "@/lib/store/csvStore";
import { parseCSV } from "@/lib/utils/csvParser";
import CSVDataDisplay from "@/components/CSVDataDisplay";

export default function DataManagement() {
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
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

  // 업로드 성공 표시 자동 숨김
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
        } catch (error) {
          console.error('CSV 파싱 에러:', error);
          setError(error instanceof Error ? error.message : "CSV 파일을 파싱하는 중 오류가 발생했습니다.");
          setLoading(false);
          toast.error("CSV 파일을 파싱하는 중 오류가 발생했습니다.");
        }
      };

      reader.onerror = (error) => {
        console.error('파일 읽기 에러:', error);
        setError("파일을 읽는 중 오류가 발생했습니다.");
        setLoading(false);
        toast.error("파일을 읽는 중 오류가 발생했습니다.");
      };

      reader.readAsText(file, 'UTF-8');
    }
  }, [setCSVData, setFileName, setLoading, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="container mx-auto py-8 space-y-6 relative">
      {/* 중앙 임시 업로드 성공 표시 (아이콘만) */}
      {showUploadSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <CheckCircle2 className="relative z-10 w-16 h-16 text-green-600 drop-shadow-lg" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 업로드 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>CSV 파일 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} disabled={isLoading} />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              {isLoading ? (
                <p className="text-muted-foreground">파일을 처리하는 중...</p>
              ) : fileName ? (
                <div className="space-y-2">
                  <p className="font-medium">선택된 파일: {fileName}</p>
                  <p className="text-sm text-muted-foreground">다른 파일을 업로드하려면 클릭하거나 드래그하세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragActive ? "파일을 여기에 놓으세요" : "CSV 파일을 업로드하세요"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    파일을 드래그하거나 클릭하여 선택하세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 데이터 미리보기 */}
      {csvData && (
        <div className="pt-2">
          <CSVDataDisplay maxRows={20} showStats={false} />
        </div>
      )}
    </div>
  );
} 