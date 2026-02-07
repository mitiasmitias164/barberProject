import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Scissors, Loader2, Check, ArrowRight, ArrowLeft, User, Store } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { z } from "zod"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

// Schemas for validation
const step1Schema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

const step2Schema = z.object({
    barbershopName: z.string().min(3, "Nome da barbearia é obrigatório"),
    slug: z.string().min(3, "URL única é obrigatória").regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
    address: z.string().optional(),
})

const step3Schema = z.object({
    serviceName: z.string().min(2, "Nome do serviço é obrigatório"),
    servicePrice: z.string().min(1, "Preço é obrigatório"), // handling as string in input
})

type UserRole = 'owner' | 'client' | null

export function Register() {
    const navigate = useNavigate()
    const { refreshProfile } = useAuth()
    const [step, setStep] = useState(0) // 0 = Role Selection
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(false)

    // Form Data State
    const [formData, setFormData] = useState({
        // Step 1
        name: "",
        email: "",
        password: "",
        // Step 2
        barbershopName: "",
        slug: "",
        address: "",
        // Step 3
        serviceName: "Corte de Cabelo",
        servicePrice: "35.00",
    })

    const handleRoleSelection = (selectedRole: UserRole) => {
        setRole(selectedRole)
        setStep(1)
    }

    const handleNext = () => {
        try {
            if (step === 1) {
                step1Schema.parse({ name: formData.name, email: formData.email, password: formData.password })
                // If client, skip to submit
                if (role === 'client') {
                    handleSubmit()
                    return
                }
            } else if (step === 2) {
                step2Schema.parse({ barbershopName: formData.barbershopName, slug: formData.slug, address: formData.address })
            }
            setStep(step + 1)
        } catch (e) {
            if (e instanceof z.ZodError) {
                toast.error((e as any).errors[0].message)
            }
        }
    }

    const handleBack = () => setStep(step - 1)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Validate last step only if owner
            if (role === 'owner') {
                step3Schema.parse({ serviceName: formData.serviceName, servicePrice: formData.servicePrice })
            }

            console.log("Iniciando cadastro otimizado como:", role)

            // 1. Create User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    }
                }
            })

            // Tratamento específico para usuário já existente
            if (authError) {
                if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
                    toast.success("Conta já existe! Redirecionando para login...")
                    navigate("/login")
                    return
                }
                throw authError
            }

            if (!authData.user) throw new Error("Erro ao criar usuário")

            const userId = authData.user.id
            let establishmentId = null

            // Logic for Owners (Barbers)
            if (role === 'owner') {
                // 2. Create Establishment directly (Optimistic Insert)
                const { data: estData, error: estError } = await supabase
                    .from("establishments")
                    .insert({
                        name: formData.barbershopName,
                        slug: formData.slug,
                        address: formData.address,
                        owner_id: userId
                    })
                    .select()
                    .single()

                if (estError) {
                    // If conflict on slug (assuming unique constraint pkey or something)
                    if (estError.code === '23505') throw new Error("Esta URL/Barbearia já está em uso.")
                    throw estError
                }

                establishmentId = estData.id

                // Parallelize creating Profile and Initial Service
                await Promise.all([
                    // Create Profile linked to establishment
                    supabase.from("profiles").upsert({
                        id: userId,
                        nome: formData.name,
                        role: 'owner',
                        establishment_id: establishmentId
                    }),
                    // Create Initial Service
                    supabase.from("services").insert({
                        establishment_id: establishmentId,
                        nome: formData.serviceName,
                        preco: parseFloat(formData.servicePrice),
                        duracao: 30
                    })
                ])

            } else {
                // Logic for Clients (Parallel with nothing else, but just insert)
                await supabase.from("profiles").upsert({
                    id: userId,
                    nome: formData.name,
                    role: 'client',
                    establishment_id: null
                })
            }

            toast.success("Conta criada com sucesso!")

            // Auto-Login Optimization
            if (authData.session) {
                // If we have a session, we can skip login screen
                // But first, ensure context is up to date passing the userId
                if (authData.user?.id) {
                    await refreshProfile(authData.user.id)
                }

                if (role === 'client') {
                    navigate("/client/home")
                } else {
                    navigate("/dashboard")
                }
            } else {
                // Fallback if email confirmation is required
                navigate("/login")
            }

        } catch (error: any) {
            console.error("Erro detalhado no cadastro:", error)

            // Fallback for user already registered
            if (error?.message?.includes("already registered") || error?.message?.includes("User already registered")) {
                toast.success("Conta já existe! Redirecionando para login...")
                navigate("/login")
                return
            }

            toast.error(error.message || "Ocorreu um erro ao cadastrar.")
        } finally {
            setLoading(false)
        }
    }

    // Calculate total steps based on role
    const totalSteps = role === 'client' ? 1 : 3

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 relative">
            {/* Theme toggle in top-right corner */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Toaster position="top-center" />
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 0 ? "Criar Conta" : role === 'owner' ? "Nova Barbearia" : "Novo Cliente"}
                    </CardTitle>
                    <CardDescription>
                        {step === 0 ? "Escolha como deseja se cadastrar" : `Passo ${step} de ${totalSteps}`}
                    </CardDescription>

                    {/* Progress Bar (Only visible after role selection) */}
                    {step > 0 && (
                        <div className="mt-2 h-1 w-full rounded-full bg-secondary">
                            <div
                                className="h-1 rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="grid gap-4 py-4">
                    {step === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div
                                className="flex flex-col items-center justify-center p-6 border-2 border-muted rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all gap-4 text-center group"
                                onClick={() => handleRoleSelection('client')}
                            >
                                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Sou Cliente</h3>
                                    <p className="text-sm text-muted-foreground">Quero agendar horários e encontrar barbearias.</p>
                                </div>
                            </div>

                            <div
                                className="flex flex-col items-center justify-center p-6 border-2 border-muted rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all gap-4 text-center group"
                                onClick={() => handleRoleSelection('owner')}
                            >
                                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Store className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Sou Barbeiro</h3>
                                    <p className="text-sm text-muted-foreground">Quero gerenciar minha barbearia e agenda.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-medium">Seus Dados</h3>
                            <div className="grid gap-2">
                                <Label>Nome Completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="joao@exemplo.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Senha</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && role === 'owner' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-medium">Sobre o Negócio</h3>
                            <div className="grid gap-2">
                                <Label>Nome da Barbearia</Label>
                                <Input
                                    value={formData.barbershopName}
                                    onChange={e => {
                                        const name = e.target.value
                                        // Auto-generate slug
                                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                        setFormData({ ...formData, barbershopName: name, slug })
                                    }}
                                    placeholder="Ex: Barbearia do João"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Link Personalizado (URL)</Label>
                                <div className="flex items-center">
                                    <span className="rounded-l-md border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                        barbermanager.com/
                                    </span>
                                    <Input
                                        className="rounded-l-none"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="barbearia-do-joao"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Endereço</Label>
                                <Input
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua das Flores, 123"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && role === 'owner' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-medium">Primeiro Serviço</h3>
                            <p className="text-sm text-muted-foreground">Adicione um serviço para começar (você pode adicionar mais depois).</p>
                            <div className="grid gap-2">
                                <Label>Nome do Serviço</Label>
                                <Input
                                    value={formData.serviceName}
                                    onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                                    placeholder="Ex: Corte Degrasé"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Preço (R$)</Label>
                                <Input
                                    type="number"
                                    value={formData.servicePrice}
                                    onChange={e => setFormData({ ...formData, servicePrice: e.target.value })}
                                    placeholder="35.00"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 0 ? (
                        <Button variant="outline" onClick={handleBack} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => navigate('/login')} disabled={loading}>
                            Já tenho conta
                        </Button>
                    )}

                    {step > 0 && (step < 3 && role === 'owner') ? (
                        <Button onClick={handleNext}>
                            Próximo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (step === 1 && role === 'client') || (step === 3 && role === 'owner') ? (
                        <Button onClick={role === 'client' ? handleNext : handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Check className="mr-2 h-4 w-4" />
                            Finalizar Cadastro
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>
        </div>
    )
}
