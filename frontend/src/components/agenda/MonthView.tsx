import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Appointment } from "@/types/db"

interface MonthViewProps {
    date: Date
    appointments: Appointment[]
    onSlotClick: (date: Date) => void
}

export function MonthView({ date, appointments, onSlotClick }: MonthViewProps) {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-4">
            <h2 className="text-center font-semibold mb-4 capitalize">
                {format(date, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="grid grid-cols-7 gap-1 flex-1">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                    <div key={day} className="text-center font-bold text-sm py-2">{day}</div>
                ))}
                {calendarDays.map((day, index) => {
                    const dayAppointments = appointments.filter(a => new Date(a.data_hora_inicio).getDate() === day.getDate() && new Date(a.data_hora_inicio).getMonth() === day.getMonth())
                    return (
                        <div key={index} className={`border p-1 min-h-[80px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 ${format(day, 'MM') !== format(date, 'MM') ? 'opacity-30' : ''}`} onClick={() => onSlotClick(day)}>
                            <div className="text-right text-xs font-medium">{format(day, "d")}</div>
                            <div className="text-[10px] text-center mt-1 text-muted-foreground">
                                {dayAppointments.length > 0 && `${dayAppointments.length} agd.`}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
