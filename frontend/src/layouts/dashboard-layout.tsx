import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardLayout() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex w-full flex-col h-full overflow-hidden">
                {/* Header bar with theme toggle - aligned with sidebar */}
                <div className="flex h-14 items-center justify-end px-6 border-b border-border/40 bg-card">
                    <ThemeToggle />
                </div>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-y-auto bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
