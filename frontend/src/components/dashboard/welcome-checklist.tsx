import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

export function WelcomeChecklist() {
    const steps = [
        { title: "Definir horários de funcionamento", completed: false },
        { title: "Cadastrar novos serviços", completed: true },
        { title: "Ver seu link de agendamento", completed: false },
        { title: "Convidar equipe", completed: false },
    ]

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Bem-vindo ao BarberManager! 🚀</CardTitle>
                <CardDescription>Complete a configuração da sua barbearia</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-background p-3 shadow-sm">
                            {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span className={step.completed ? "line-through text-muted-foreground" : "font-medium"}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
