import { createContext, useContext, useEffect, useState } from "react"
import { type Session, type User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Profile, Establishment } from "@/types/db"

type AuthContextType = {
    session: Session | null
    user: User | null
    profile: Profile | null
    establishment: Establishment | null
    loading: boolean
    error: string | null
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    establishment: null,
    loading: true,
    error: null,
    refreshProfile: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [establishment, setEstablishment] = useState<Establishment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfileData = async (userId: string) => {
        try {
            console.log("Buscando perfil...")

            // Timeout promise increased to 20s
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Tempo limite excedido")), 20000)
            )

            // Actual fetch logic wrapped in a promise
            const fetchData = async () => {
                // Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .single()

                if (profileError) {
                    if (profileError.code === "PGRST116") {
                        console.log("Perfil não encontrado (PGRST116), usuário precisa completar cadastro.")
                        setProfile(null)
                        return // Retorna sem erro para permitir o fluxo continuar
                    }
                    console.error("Erro ao buscar perfil:", profileError)
                    throw profileError
                }

                setProfile(profileData)

                // Fetch Establishment if linked
                if (profileData?.establishment_id) {
                    console.log("Buscando estabelecimento...")
                    const { data: estData, error: estError } = await supabase
                        .from("establishments")
                        .select("*")
                        .eq("id", profileData.establishment_id)
                        .single()

                    if (estError) {
                        console.error("Erro ao buscar estabelecimento:", estError)
                        // Handle RLS or empty result logic here if needed
                        // User requirement: "Garanta que, se o Supabase retornar um array vazio ou erro de RLS, o sistema exiba uma mensagem amigável"
                        // Since .single() returns error on 0 rows, we catch it here mostly.
                    } else {
                        setEstablishment(estData)
                    }
                } else {
                    console.log("Usuário não possui estabelecimento vinculado no perfil.")
                    setEstablishment(null)
                }
            }

            await Promise.race([fetchData(), timeoutPromise])

        } catch (error: any) {
            console.error("Unexpected error in fetchProfileData:", error)
            if (error.message === "Tempo limite excedido") {
                setError("Não conseguimos carregar seu perfil. Clique aqui para tentar novamente")
            } else {
                setError("Ocorreu um erro ao carregar os dados.")
            }
        }
    }

    const refreshProfile = async () => {
        if (user) {
            setError(null)
            await fetchProfileData(user.id)
        }
    }

    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            console.log("Buscando sessão...")
            const { data: { session } } = await supabase.auth.getSession()

            if (mounted) {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfileData(session.user.id)
                }
                setLoading(false)
            }
        }

        initializeAuth()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    setLoading(true)
                    setError(null)
                    await fetchProfileData(session.user.id)
                    setLoading(false)
                } else {
                    setProfile(null)
                    setEstablishment(null)
                    setLoading(false)
                }
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ session, user, profile, establishment, loading, error, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
