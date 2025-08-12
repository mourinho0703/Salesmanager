import { Database, Store, ShoppingCart, Users } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

type MenuChild = { title: string }
type MenuItem = {
  title: string
  icon: any
  children?: MenuChild[]
}

const menuItems: MenuItem[] = [
  {
    title: "아마존",
    icon: Store,
    children: [
      { title: "미국" },
      { title: "캐나다" },
      { title: "독일" },
      { title: "일본" },
    ],
  },
  {
    title: "라쿠텐",
    icon: Database,
    children: [
      { title: "일본" },
    ],
  },
  {
    title: "월마트",
    icon: ShoppingCart,
    children: [
      { title: "미국" },
    ],
  },
  {
    title: "바이어",
    icon: Users,
    children: [
      { title: "베스트홈패션" },
      { title: "드림웨어" },
      { title: "인덱스리빙몰" },
      { title: "테스트라이트" },
      { title: "에이스하드웨어" },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg">
      <SidebarHeader className="border-b border-border/50 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">해외영업부문</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">마감 자동화 플랫폼</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* 상위 카테고리: 클릭 불가 텍스트 */}
                  <div className="w-full text-gray-900 dark:text-gray-100 font-semibold">
                    <div className="flex items-center gap-3 px-3 py-3 cursor-default select-none rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm">{item.title}</span>
                    </div>
                  </div>

                  {item.children && (
                    <SidebarMenuSub className="mt-2 ml-4 space-y-1">
                      {item.children.map((child) => {
                        const isAmazonCanada = item.title === "아마존" && child.title === "캐나다"
                        return (
                          <li key={child.title}>
                            {isAmazonCanada ? (
                              <SidebarMenuSubButton asChild size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                                <Link to="/amazon/canada" className="pl-6 py-2 rounded-md">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-sm">{child.title}</span>
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton size="sm" className="text-gray-500 dark:text-gray-500 pl-6 py-2 cursor-not-allowed" aria-disabled>
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                                  <span className="text-sm">{child.title}</span>
                                </span>
                              </SidebarMenuSubButton>
                            )}
                          </li>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
