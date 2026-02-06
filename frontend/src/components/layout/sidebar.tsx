import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, DollarSign, Settings, LogOut, Scissors } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const items = [
        { title: "Agenda", icon: Calendar, href: "/dashboard" }, // Agenda is the default dashboard view
        { title: "Clientes", icon: Users, href: "/dashboard/clients" },
        { title: "Financeiro", icon: DollarSign, href: "/dashboard/financial" },
        { title: "Configurações", icon: Settings, href: "/dashboard/settings" },
    ]

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-6">
                <Link className="flex items-center gap-2 font-semibold" to="/">
                    <Scissors className="h-6 w-6" />
                    <span>BarberManager</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                location.pathname === item.href && "bg-muted text-primary"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">Equipe</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Convide barbeiros para sua barbearia.</p>
                        <Button size="sm" className="w-full" variant="outline">
                            Convidar
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-auto p-4 pt-0">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div >
    )
}
