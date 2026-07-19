import { Sidebar } from "@/components/trimly/sidebar"
import { DynamicHeader } from "@/components/trimly/dynamic-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DynamicHeader />
        {children}
      </div>
    </div>
  )
}
