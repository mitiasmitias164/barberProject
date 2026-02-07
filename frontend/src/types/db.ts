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
}

export type Service = {
    id: string
    establishment_id: string
    nome: string
    preco: number
    duracao: number
}
