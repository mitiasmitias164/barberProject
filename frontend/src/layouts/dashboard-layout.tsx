import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"

export function DashboardLayout() {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex w-full flex-col h-full overflow-hidden">
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
