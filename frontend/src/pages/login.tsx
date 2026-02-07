import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Scissors, AlertCircle, Loader2, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Login() {
    const [isSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        if (isSignUp) {
            // Redirect to the dedicated register page
            navigate("/register")
            return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            // Clear guest flag
            localStorage.removeItem('barber-guest')

            // Fetch profile to check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profile?.role === 'client') {
                navigate("/client/home")
            } else {
                navigate("/dashboard")
            }
        }
        setLoading(false)
    }

    const handleGuestLogin = () => {
        localStorage.setItem('barber-guest', 'true')
        navigate("/dashboard")
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 relative">
            {/* Theme toggle in top-right corner */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                        {isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}
                    </CardTitle>
                    <CardDescription>
                        Acesse sua conta para gerenciar sua barbearia
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <p>{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600">
                                <p>{successMessage}</p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                required={!isSignUp}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">

                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                required={!isSignUp}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full"
                            onClick={handleGuestLogin}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Entrar como Convidado
                        </Button>

                        <Button
                            variant="link"
                            type="button"
                            className="w-full"
                            onClick={() => navigate("/register")}
                        >
                            Não tem uma conta? Crie sua barbearia
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}


