import { Calendar, DollarSign, MessageSquare, Users } from "lucide-react"

export function Features() {
    return (
        <section id="features" className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-sans text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
                    Tudo que você precisa
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Funcionalidades pensadas para otimizar o dia a dia da sua barbearia.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <Calendar className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Agendamento Online</h3>
                            <p className="text-sm text-muted-foreground">
                                Seus clientes agendam pelo celular, 24 horas por dia.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <Users className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Gestão de Clientes</h3>
                            <p className="text-sm text-muted-foreground">
                                Histórico completo e preferências de cada cliente.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <MessageSquare className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Lembretes WhatsApp</h3>
                            <p className="text-sm text-muted-foreground">
                                Reduza faltas com lembretes automáticos.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border bg-background p-2 sm:col-span-2 md:col-span-3">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <DollarSign className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Controle Financeiro</h3>
                            <p className="text-sm text-muted-foreground">
                                Fluxo de caixa, comissões e relatórios detalhados para você ver o lucro crescer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
