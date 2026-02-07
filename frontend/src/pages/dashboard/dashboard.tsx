import { useEffect, useState } from "react"
import { format, startOfWeek, endOfWeek, startOfDay, isSameDay, setHours, setMinutes, addMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DollarSign, Users, Clock, Check, X, Share2, AlertTriangle, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-hot-toast"

interface Appointment {
    id: string
    cliente_id: string
    service_id: string
    data_hora_inicio: string
    data_hora_fim: string
    status: 'agendado' | 'concluido' | 'cancelado'
    profiles: { nome: string }
    services: { nome: string; preco: number }
}

interface DashboardStats {
    weeklyEarnings: number
    todayAppointments: number
    nextClient: Appointment | null
}

interface Service {
    id: string
    nome: string
    preco: number
    duracao: number
}

interface Client {
    id: string
    nome: string
}

export function DashboardPage() {
    const { establishment, user } = useAuth()
    const [stats, setStats] = useState<DashboardStats>({
        weeklyEarnings: 0,
        todayAppointments: 0,
        nextClient: null
    })
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [scheduleSettings, setScheduleSettings] = useState({
        openingTime: "08:00",
        closingTime: "20:00",
        lunchStart: "12:00",
        lunchEnd: "13:00"
    })
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // Booking State
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [bookingData, setBookingData] = useState({
        clientId: "",
        serviceId: ""
    })

    useEffect(() => {
        if (establishment) {
            fetchDashboardData()
            fetchServicesAndClients()
            if (establishment.opening_time) {
                setScheduleSettings({
                    openingTime: establishment.opening_time,
                    closingTime: establishment.closing_time || "20:00",
                    lunchStart: establishment.lunch_start || "12:00",
                    lunchEnd: establishment.lunch_end || "13:00"
                })
            }
        }
    }, [establishment])

    const fetchServicesAndClients = async () => {
        try {
            // Fetch Services
            const { data: servicesData } = await supabase
                .from('services')
                .select('*')
                .eq('establishment_id', establishment?.id)

            if (servicesData) setServices(servicesData)

            // Fetch Clients (Profiles)
            // For now fetching all profiles, ideally filter by role or relationship
            const { data: clientsData } = await supabase
                .from('profiles')
                .select('id, nome')

            if (clientsData) setClients(clientsData)

        } catch (error) {
            console.error("Error fetching auxiliary data:", error)
        }
    }

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const today = new Date()
            const startWeek = startOfWeek(today)
            const endWeek = endOfWeek(today)

            const { data: weekData, error: weekError } = await supabase
                .from('appointments')
                .select('*, profiles:cliente_id(nome), services(nome, preco)')
                .eq('establishment_id', establishment?.id)
                .gte('data_hora_inicio', startWeek.toISOString())
                .lte('data_hora_inicio', endWeek.toISOString())

            if (weekError) throw weekError

            let earnings = 0
            let todayCount = 0
            let next: Appointment | null = null
            let closestTime = Infinity

            const todayAppointmentsList: Appointment[] = []

            weekData?.forEach((app: any) => {
                const appDate = new Date(app.data_hora_inicio)

                if (app.status === 'concluido') {
                    earnings += app.services.preco
                }

                if (isSameDay(appDate, today) && app.status !== 'cancelado') {
                    todayCount++
                    todayAppointmentsList.push(app)
                }

                if (app.status === 'agendado' && appDate > today) {
                    const diff = appDate.getTime() - today.getTime()
                    if (diff < closestTime) {
                        closestTime = diff
                        next = app
                    }
                }
            })

            todayAppointmentsList.sort((a, b) => new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime())

            setStats({
                weeklyEarnings: earnings,
                todayAppointments: todayCount,
                nextClient: next
            })
            setAppointments(todayAppointmentsList)

        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            toast.error("Erro ao carregar dados do dashboard")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: 'concluido' | 'cancelado') => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            toast.success(`Agendamento ${newStatus === 'concluido' ? 'concluído' : 'cancelado'}!`)
            fetchDashboardData()
        } catch (error) {
            toast.error("Erro ao atualizar status")
        }
    }

    const handleBookSlot = (slot: Date) => {
        setSelectedSlot(slot)
        setBookingData({ clientId: "", serviceId: "" })
        setIsBookingOpen(true)
    }

    const handleCreateAppointment = async () => {
        if (!bookingData.clientId || !bookingData.serviceId || !selectedSlot) {
            toast.error("Preencha todos os campos")
            return
        }

        const selectedService = services.find(s => s.id === bookingData.serviceId)
        if (!selectedService) return

        const endTime = addMinutes(selectedSlot, selectedService.duracao)

        try {
            const { error } = await supabase
                .from('appointments')
                .insert({
                    establishment_id: establishment?.id,
                    cliente_id: bookingData.clientId,
                    barbeiro_id: user?.id, // Assuming logged in user is the barber
                    service_id: bookingData.serviceId,
                    data_hora_inicio: selectedSlot.toISOString(),
                    data_hora_fim: endTime.toISOString(),
                    status: 'agendado'
                })

            if (error) {
                // Check for exclusion constraint violation (Postgres code 23P01)
                if (error.code === '23P01') {
                    toast.error("Conflito de horário! Já existe um agendamento neste período.")
                } else {
                    throw error
                }
                return
            }

            toast.success("Agendamento realizado com sucesso!")
            setIsBookingOpen(false)
            fetchDashboardData()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao criar agendamento")
        }
    }

    const saveSettings = async () => {
        try {
            const { error } = await supabase
                .from('establishments')
                .update({
                    opening_time: scheduleSettings.openingTime,
                    closing_time: scheduleSettings.closingTime,
                    lunch_start: scheduleSettings.lunchStart,
                    lunch_end: scheduleSettings.lunchEnd
                })
                .eq('id', establishment?.id)

            if (error) throw error

            toast.success("Configurações salvas!")
            setIsSettingsOpen(false)
        } catch (error) {
            toast.error("Erro ao salvar configurações")
        }
    }

    const copyShareLink = () => {
        const link = `${window.location.origin}/b/${establishment?.slug}`
        navigator.clipboard.writeText(link)
        toast.success("Link copiado para a área de transferência!")
    }

    const timeSlots = []
    const startHour = parseInt(scheduleSettings.openingTime.split(':')[0])
    const endHour = parseInt(scheduleSettings.closingTime.split(':')[0])

    for (let i = startHour; i <= endHour; i++) {
        timeSlots.push(setHours(startOfDay(new Date()), i))
    }

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ganhos da Semana</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.weeklyEarnings.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% em relação à semana passada</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                        <p className="text-xs text-muted-foreground">4 vagas restantes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Cliente</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.nextClient ? format(new Date(stats.nextClient.data_hora_inicio), 'HH:mm') : '--:--'}</div>
                        <p className="text-xs text-muted-foreground">{stats.nextClient ? stats.nextClient.profiles.nome : 'Nenhum agendamento'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={copyShareLink} className="w-full">
                            Copiar Link de Agendamento
                        </Button>
                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-start px-2">
                                    <Settings className="mr-2 h-4 w-4" /> Configurar Horários
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Configurações de Horário</DialogTitle>
                                    <DialogDescription>
                                        Defina o horário de funcionamento e intervalo de almoço.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="opening" className="text-right">Abertura</Label>
                                        <Input
                                            id="opening"
                                            type="time"
                                            value={scheduleSettings.openingTime}
                                            onChange={(e) => setScheduleSettings({ ...scheduleSettings, openingTime: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="closing" className="text-right">Fechamento</Label>
                                        <Input
                                            id="closing"
                                            type="time"
                                            value={scheduleSettings.closingTime}
                                            onChange={(e) => setScheduleSettings({ ...scheduleSettings, closingTime: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lunchStart" className="text-right">Início Almoço</Label>
                                        <Input
                                            id="lunchStart"
                                            type="time"
                                            value={scheduleSettings.lunchStart}
                                            onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchStart: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lunchEnd" className="text-right">Fim Almoço</Label>
                                        <Input
                                            id="lunchEnd"
                                            type="time"
                                            value={scheduleSettings.lunchEnd}
                                            onChange={(e) => setScheduleSettings({ ...scheduleSettings, lunchEnd: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={saveSettings}>Salvar alterações</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline & Actions */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-5">
                    <CardHeader>
                        <CardTitle>Agenda de Hoje</CardTitle>
                        <CardDescription>
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-center text-muted-foreground">Carregando agenda...</p>
                            ) : (
                                timeSlots.map((slot, index) => {
                                    const slotEnd = setMinutes(setHours(slot, slot.getHours() + 1), 0)

                                    const slotAppointments = appointments.filter(app => {
                                        const appStart = new Date(app.data_hora_inicio)
                                        return appStart >= slot && appStart < slotEnd && app.status !== 'cancelado'
                                    })

                                    const isLunchTime = (
                                        format(slot, 'HH:mm') >= scheduleSettings.lunchStart &&
                                        format(slot, 'HH:mm') < scheduleSettings.lunchEnd
                                    )

                                    return (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4 last:border-0 relative">
                                            <div className="w-16 text-sm font-medium text-muted-foreground">
                                                {format(slot, 'HH:mm')}
                                            </div>
                                            <div className="flex-1 w-full">
                                                {isLunchTime ? (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-medium">Horário de Almoço</span>
                                                    </div>
                                                ) : slotAppointments.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {slotAppointments.map(app => (
                                                            <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-accent">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                                        {app.profiles.nome ? app.profiles.nome.charAt(0) : '?'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{app.profiles.nome}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {app.services.nome} • {format(new Date(app.data_hora_inicio), 'HH:mm')} - {format(new Date(app.data_hora_fim), 'HH:mm')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {app.status === 'agendado' && (
                                                                        <>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleStatusChange(app.id, 'concluido')}>
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleStatusChange(app.id, 'cancelado')}>
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    {app.status === 'concluido' && <span className="text-xs font-medium text-green-500 px-2 py-1 bg-green-500/10 rounded-full">Concluído</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {slotAppointments.length > 1 && (
                                                            <div className="flex items-center gap-2 text-xs text-red-500 font-medium mt-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Conflito de horários detectado!
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary/50 justify-start"
                                                        size="sm"
                                                        onClick={() => handleBookSlot(slot)}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> Reservar horário
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Histórico Recente</CardTitle>
                        <CardDescription>
                            Últimos cortes finalizados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Booking Dialog */}
                            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Novo Agendamento</DialogTitle>
                                        <DialogDescription>
                                            Agendar para {selectedSlot ? format(selectedSlot, "eeee, d 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ''}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="client">Cliente</Label>
                                            <Select onValueChange={(v: string) => setBookingData({ ...bookingData, clientId: v })} value={bookingData.clientId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um cliente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients.map(client => (
                                                        <SelectItem key={client.id} value={client.id}>{client.nome}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="service">Serviço</Label>
                                            <Select onValueChange={(v: string) => setBookingData({ ...bookingData, serviceId: v })} value={bookingData.serviceId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um serviço" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services.map(service => (
                                                        <SelectItem key={service.id} value={service.id}>{service.nome} (R$ {service.preco})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateAppointment}>Confirmar Agendamento</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <div className="space-y-4 text-sm">
                                {appointments.filter(a => a.status === 'concluido').slice(0, 5).length > 0 ? (
                                    appointments.filter(a => a.status === 'concluido').slice(0, 5).map(app => (
                                        <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{app.profiles.nome}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(app.data_hora_inicio), "dd/MM 'às' HH:mm")}</p>
                                            </div>
                                            <div className="font-medium text-green-600">
                                                R$ {app.services.preco}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Nenhum histórico recente.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
