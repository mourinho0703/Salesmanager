import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function About() {
  const features = [
    {
      title: "자동화된 데이터 수집",
      description: "해외 각 법인의 비용 및 매출 데이터를 자동으로 수집하고 통합합니다.",
      status: "운영중"
    },
    {
      title: "실시간 마감 현황",
      description: "마감 프로세스의 진행 상황을 실시간으로 모니터링할 수 있습니다.",
      status: "운영중"
    },
    {
      title: "스마트 검증 시스템",
      description: "AI 기반 데이터 검증으로 오류를 사전에 방지합니다.",
      status: "베타"
    },
    {
      title: "통합 보고서 생성",
      description: "다양한 형태의 보고서를 자동으로 생성하고 배포합니다.",
      status: "개발중"
    }
  ]

  const techStack = [
    { name: "Python Django", type: "Backend", description: "API 서버 및 데이터 처리" },
    { name: "React", type: "Frontend", description: "사용자 인터페이스" },
    { name: "PostgreSQL", type: "Database", description: "데이터 저장소" },
    { name: "Redis", type: "Cache", description: "캐싱 및 세션 관리" },
    { name: "Celery", type: "Task Queue", description: "비동기 작업 처리" },
    { name: "Docker", type: "Infrastructure", description: "컨테이너화 배포" }
  ]

  const developers = [
    { name: "박은성", department: "해외영업파트" },
    { name: "조민기", department: "경영지원파트" },
    { name: "김지환", department: "커머스파트" },
    { name: "원예찬", department: "물류지원파트" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">앱 소개</h2>
        <p className="text-muted-foreground">해외영업부문 마감 자동화 플랫폼에 대해 알아보세요</p>
      </div>

      {/* 주요 기능 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 기능</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <Badge 
                    variant={
                      feature.status === "운영중" ? "default" : 
                      feature.status === "베타" ? "secondary" : "outline"
                    }
                  >
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 기술 스택 */}
      <Card>
        <CardHeader>
          <CardTitle>기술 스택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{tech.name}</h3>
                  <Badge variant="outline">{tech.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tech.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 만든 사람 */}
      <Card>
        <CardHeader>
          <CardTitle>만든 사람</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {developers.map((developer, index) => (
              <div key={index} className="p-4 border border-border rounded-lg text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-semibold text-primary">
                    {developer.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{developer.name}</h3>
                <p className="text-sm text-muted-foreground">{developer.department}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
