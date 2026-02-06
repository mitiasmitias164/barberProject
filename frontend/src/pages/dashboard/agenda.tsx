import { WelcomeChecklist } from "@/components/dashboard/welcome-checklist"

export function AgendaPage() {
    return (
        <div className="space-y-6">
            <WelcomeChecklist />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
                    <p className="text-muted-foreground">Gerencie seus agendamentos do dia.</p>
                </div>
            </div>

            <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
                <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-sm text-muted-foreground">
                        Seus agendamentos aparecerão aqui.
                    </p>
                </div>
            </div>
        </div>
    )
}
