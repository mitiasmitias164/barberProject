import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"

export function DashboardLayout() {
    return (
        <div className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex w-full flex-col">
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
