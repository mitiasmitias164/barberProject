export type Role = 'owner' | 'barber' | 'admin' | 'cliente'

export type Profile = {
    id: string
    nome: string
    telefone: string | null
    role: Role
    establishment_id: string | null
}

export type Establishment = {
    id: string
    name: string
    slug: string
    address: string | null
    owner_id: string
    created_at: string
    opening_time: string | null
    closing_time: string | null
    lunch_start: string | null
    lunch_end: string | null
    slot_duration: number
}

export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado' | 'bloqueio'

export type Appointment = {
    id: string
    establishment_id: string
    cliente_id: string | null
    barbeiro_id: string
    service_id: string | null
    data_hora_inicio: string
    data_hora_fim: string
    status: AppointmentStatus
    profiles?: { nome: string } // Optional because client might be null for blocked slots
    services?: { nome: string; preco: number } // Optional for blocked slots
}
export type Service = {
    id: string
    establishment_id: string
    nome: string
    preco: number
    duracao: number
}
