import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { SocialProof } from "@/components/sections/social-proof"
import { Login } from "@/pages/login"
import { Register } from "@/pages/register"
import { PublicProfile } from "@/pages/public-profile"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { AgendaPage } from "@/pages/dashboard/agenda"
import { ClientsPage } from "@/pages/dashboard/clients"
import { FinancialPage } from "@/pages/dashboard/financial"
import { SettingsPage } from "@/pages/dashboard/settings"

function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <SocialProof />
      </main>
      <Footer />
    </div>
  )
}


function ProtectedRoute() {
  const { user, loading, error, profile, establishment } = useAuth()
  const isGuest = localStorage.getItem('barber-guest')

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
        >
          Sair
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <p className="text-red-500 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />
  }

  // Verificação de Perfil
  if (user && !profile) {
    console.log("Perfil não encontrado, redirecionando para cadastro...")
    return <Navigate to="/register" replace />
  }

  // Verificação de Estabelecimento (Barbearia)
  if (user && !establishment && !isGuest) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center bg-background">
        <h2 className="text-2xl font-bold tracking-tight">Nenhuma barbearia encontrada</h2>
        <p className="text-muted-foreground">Parece que você ainda não tem uma barbearia cadastrada.</p>
        <Button onClick={() => window.location.href = '/register'}>
          Deseja cadastrar uma?
        </Button>
      </div>
    )
  }

  return <Outlet />
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/b/:slug" element={<PublicProfile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<AgendaPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="financial" element={<FinancialPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
