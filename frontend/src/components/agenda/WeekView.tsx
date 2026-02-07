import { format, startOfWeek, endOfWeek, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Appointment } from "@/types/db"

interface WeekViewProps {
    date: Date
    appointments: Appointment[]
    onSlotClick: (date: Date) => void
}

export function WeekView({ date, appointments, onSlotClick }: WeekViewProps) {
    const startDate = startOfWeek(date, { weekStartsOn: 0 })
    const endDate = endOfWeek(date, { weekStartsOn: 0 })

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-4">
            <h2 className="text-center font-semibold mb-4">
                Semana de {format(startDate, "dd 'de' MMMM", { locale: ptBR })} a {format(endDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <div className="grid grid-cols-7 gap-2 flex-1">
                {Array.from({ length: 7 }).map((_, index) => {
                    const day = addDays(startDate, index)
                    const dayAppointments = appointments.filter(a => new Date(a.data_hora_inicio).getDate() === day.getDate())

                    return (
                        <div key={index} className="border rounded-md p-2 min-h-[200px]" onClick={() => onSlotClick(day)}>
                            <div className="text-center font-medium mb-2">{format(day, "EEE", { locale: ptBR })}</div>
                            <div className="text-center text-sm text-muted-foreground mb-4">{format(day, "dd")}</div>
                            <div className="text-xs text-muted-foreground text-center">
                                {dayAppointments.length > 0 ? `${dayAppointments.length} agendamentos` : 'Nenhum agendamento'}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
