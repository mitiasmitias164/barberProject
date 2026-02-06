import { Link } from "react-router-dom"
import { Moon, Sun, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"


export function Header() {
    const { setTheme, theme } = useTheme()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <Scissors className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            BarberManager
                        </span>
                    </a>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <a
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#features"
                        >
                            Funcionalidades
                        </a>
                        <a
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#pricing"
                        >
                            Planos
                        </a>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Command menu or search could go here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" asChild>
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Alternar tema</span>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
