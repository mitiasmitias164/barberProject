
import { useMemo, type MouseEvent } from "react"
import { format, setHours, setMinutes, differenceInMinutes, startOfDay, addMinutes, isBefore, isAfter } from "date-fns"
import type { Appointment, AppointmentStatus } from "@/types/db"
import { cn } from "@/lib/utils"

interface DayViewProps {
    date: Date
    appointments: Appointment[]
    openingTime: string
    closingTime: string
    onSlotClick: (date: Date) => void
    onStatusChange: (id: string, status: AppointmentStatus) => void
}

export function DayView({ date, appointments, openingTime, closingTime, onSlotClick, onStatusChange }: DayViewProps) {
    const PIXELS_PER_MINUTE = 2 // Height of 1 minute in pixels

    const openingHour = parseInt(openingTime.split(':')[0])
    const openingMinute = parseInt(openingTime.split(':')[1] || '0')
    const closingHour = parseInt(closingTime.split(':')[0])

    // Generate time slots for guidelines (every hour)
    const hours = useMemo(() => {
        const slots = []
        for (let i = openingHour; i <= closingHour; i++) {
            slots.push(setMinutes(setHours(date, i), 0))
        }
        return slots
    }, [date, openingHour, closingHour])

    const startOfDayMinutes = openingHour * 60 + openingMinute
    const totalMinutes = (closingHour - openingHour) * 60

    // Filter appointments for this day and calculate positions
    const dayAppointments = useMemo(() => {
        return appointments.filter(app => {
            const appDate = new Date(app.data_hora_inicio)
            return isBefore(startOfDay(appDate), addMinutes(startOfDay(date), 24 * 60)) &&
                isAfter(appDate, startOfDay(date))
        }).map(app => {
            const start = new Date(app.data_hora_inicio)
            const end = new Date(app.data_hora_fim)
            const startMinutes = start.getHours() * 60 + start.getMinutes()
            const duration = differenceInMinutes(end, start)

            const top = (startMinutes - startOfDayMinutes) * PIXELS_PER_MINUTE
            const height = duration * PIXELS_PER_MINUTE

            return { ...app, top, height, duration }
        })
    }, [appointments, date, startOfDayMinutes])

    // Background click handler to find slot
    const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top + e.currentTarget.scrollTop
        const minutesClicked = y / PIXELS_PER_MINUTE
        const clickedTime = addMinutes(setMinutes(setHours(date, openingHour), openingMinute), minutesClicked)

        // Round to nearest 15 mins
        const remainder = clickedTime.getMinutes() % 15
        const roundedTime = addMinutes(clickedTime, -remainder)

        onSlotClick(roundedTime)
    }

    return (
        <div className="relative h-full overflow-y-auto bg-white dark:bg-zinc-950">
            {/* Time Grid */}
            <div className="relative" style={{ height: `${totalMinutes * PIXELS_PER_MINUTE}px` }} onClick={handleBackgroundClick}>
                {hours.map((hour, i) => {
                    const top = ((hour.getHours() * 60 + hour.getMinutes()) - startOfDayMinutes) * PIXELS_PER_MINUTE
                    return (
                        <div key={i} className="absolute w-full border-t border-zinc-200 dark:border-zinc-700/40 flex items-center group pointer-events-none" style={{ top: `${top}px` }}>
                            <span className="bg-white dark:bg-zinc-950 px-2 text-xs text-muted-foreground -mt-3 ml-2 font-mono">
                                {format(hour, 'HH:mm')}
                            </span>
                            <div className="flex-1 group-hover:border-zinc-300 transition-colors" />
                        </div>
                    )
                })}

                {/* Appointments */}
                {dayAppointments.map(app => (
                    <div
                        key={app.id}
                        className={cn(
                            "absolute left-16 right-4 rounded-md border p-2 text-xs transition-all hover:brightness-95 cursor-pointer shadow-sm overflow-hidden",
                            app.status === 'agendado' && "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300",
                            app.status === 'concluido' && "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
                            app.status === 'cancelado' && "bg-red-50 border-red-100 text-red-400 dark:bg-red-900/10 dark:border-red-900/30 opacity-60",
                            app.status === 'bloqueio' && "bg-gray-100 border-gray-200 text-gray-500 dark:bg-zinc-800 dark:border-zinc-700 repeating-linear-gradient(45deg,transparent,transparent_10px,#00000005_10px,#00000005_20px)"
                        )}
                        style={{
                            top: `${app.top}px`,
                            height: `${app.height}px`,
                            minHeight: '28px'
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            // Simple toggle for now or prompt
                            if (app.status === 'agendado') {
                                if (window.confirm("Deseja concluir este agendamento?")) {
                                    onStatusChange(app.id, 'concluido')
                                } else if (window.confirm("Deseja cancelar este agendamento?")) {
                                    onStatusChange(app.id, 'cancelado')
                                }
                            }
                        }}
                    >
                        <div className="flex items-center gap-2 h-full">
                            {app.status !== 'bloqueio' && (
                                <div className={cn("w-1 h-full absolute left-0 top-0 bottom-0",
                                    app.status === 'agendado' ? "bg-blue-500" :
                                        app.status === 'concluido' ? "bg-green-500" : "bg-zinc-300"
                                )} />
                            )}

                            <div className="pl-2 flex flex-col justify-center">
                                <div className="font-semibold truncate">
                                    {app.status === 'bloqueio' ? 'Bloqueado' : app.profiles?.nome || 'Cliente sem nome'}
                                </div>
                                {app.height > 30 && (
                                    <div className="opacity-80 truncate">
                                        {app.status === 'bloqueio' ? '' : `${app.services?.nome} • ${format(new Date(app.data_hora_inicio), 'HH:mm')} - ${format(new Date(app.data_hora_fim), 'HH:mm')}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
