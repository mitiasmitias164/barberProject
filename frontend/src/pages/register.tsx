import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Scissors, Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { z } from "zod"

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

export function Register() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
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

    const handleNext = () => {
        try {
            if (step === 1) {
                step1Schema.parse({ name: formData.name, email: formData.email, password: formData.password })
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
            // Validate last step
            step3Schema.parse({ serviceName: formData.serviceName, servicePrice: formData.servicePrice })

            console.log("Iniciando cadastro...")

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
                    toast.success("Conta pronta!")
                    navigate("/login")
                    return
                }
                throw authError
            }

            if (!authData.user) throw new Error("Erro ao criar usuário")

            const userId = authData.user.id

            // 2. Verificação de ID de Estabelecimento (se já existe)
            const { data: existingEst } = await supabase
                .from("establishments")
                .select("id")
                .eq("owner_id", userId)
                .single()

            let establishmentId = existingEst?.id

            if (!establishmentId) {
                console.log("Criando novo estabelecimento...")
                // Create Establishment
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
                    if (estError.code === '23505') throw new Error("Esta URL já está em uso. Escolha outra.")
                    throw estError
                }

                establishmentId = estData.id
            } else {
                console.log("Estabelecimento já existe, pulando criação.")
            }

            // 3. Sincronização de Perfil (Profile)
            // Verificar se o perfil já existe antes de tentar criar
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", userId)
                .single()

            if (!existingProfile) {
                console.log("Criando perfil...")
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: userId,
                        nome: formData.name,
                        role: 'owner',
                        establishment_id: establishmentId
                    })

                if (profileError) throw profileError
            } else {
                console.log("Perfil já existe, pulando criação.")
            }

            // 4. Create Initial Service (apenas se for um novo estabelecimento)
            if (!existingEst) {
                console.log("Criando serviço inicial...")
                const { error: serviceError } = await supabase
                    .from("services")
                    .insert({
                        establishment_id: establishmentId,
                        nome: formData.serviceName,
                        preco: parseFloat(formData.servicePrice),
                        duracao: 30
                    })

                if (serviceError) throw serviceError
            }

            // Sucesso total
            toast.success("Conta pronta!")
            navigate("/login")

        } catch (error: any) {
            console.error("Erro detalhado no cadastro:", error)

            // Fallback para caso o erro de usuário já registrado caia aqui
            if (error?.message?.includes("already registered") || error?.message?.includes("User already registered")) {
                toast.success("Conta pronta!")
                navigate("/login")
                return
            }

            toast.error(error.message || "Ocorreu um erro ao cadastrar.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Toaster position="top-center" />
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Criar Nova Barbearia</CardTitle>
                    <CardDescription>
                        Passo {step} de 3
                    </CardDescription>
                    {/* Progress Bar */}
                    <div className="mt-2 h-1 w-full rounded-full bg-secondary">
                        <div
                            className="h-1 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 py-4">
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

                    {step === 2 && (
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

                    {step === 3 && (
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
                    {step > 1 ? (
                        <Button variant="outline" onClick={handleBack} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => navigate('/login')} disabled={loading}>
                            Já tenho conta
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button onClick={handleNext}>
                            Próximo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Check className="mr-2 h-4 w-4" />
                            Finalizar Cadastro
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
