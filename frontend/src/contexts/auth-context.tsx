import { createContext, useContext, useEffect, useState, useRef } from "react"
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
    refreshProfile: (userId?: string) => Promise<void>
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

    // Cache to prevent duplicate/parallel fetches for the same user
    const lastFetchedUserId = useRef<string | null>(null)

    const fetchProfileData = async (userId: string, force = false) => {
        // Prevent duplicate fetches if not forced
        if (!force && lastFetchedUserId.current === userId) {
            console.log("[Auth] Profile fetch skipped (cached/deduplicated).")
            return
        }

        // Mark as fetched/fetching immediately
        lastFetchedUserId.current = userId

        try {
            console.log("Buscando perfil...")

            // Timeout promise increased to 20s
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Tempo limite excedido")), 20000)
            )

            // Actual fetch logic wrapped in a promise
            const fetchData = async () => {
                // Fetch Profile and Establishment in one go
                const { data, error: profileError } = await supabase
                    .from("profiles")
                    .select("*, establishment:establishments(*)")
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

                // Desestruturar para separar perfil e estabelecimento
                const { establishment: establishmentData, ...profileData } = data

                setProfile(profileData)

                // Supabase returns the joined data as a single object if the relation is Many-to-One
                // or null if no relation exists.
                if (establishmentData) {
                    // Ensure it matches Establishment type (it might be an array if relation is One-to-Many but standard FK on profile->establishment implies Many-to-One)
                    // If it is an array, take the first one? No, profiles.establishment_id -> establishments.id means it is One-to-One or Many-to-One (Profile belongs to Establishment)
                    // So it should be an object.
                    setEstablishment(establishmentData as any)
                } else {
                    setEstablishment(null)
                }
            }

            await Promise.race([fetchData(), timeoutPromise])

        } catch (error: any) {
            console.error("Unexpected error in fetchProfileData:", error)
            // Reset cache on error to allow retry
            lastFetchedUserId.current = null

            if (error.message === "Tempo limite excedido") {
                setError("Não conseguimos carregar seu perfil. Clique aqui para tentar novamente")
            } else {
                setError("Ocorreu um erro ao carregar os dados.")
            }
        }
    }

    const refreshProfile = async (userId?: string) => {
        const targetId = userId || user?.id
        if (targetId) {
            setError(null)
            // Force refresh ignores cache
            await fetchProfileData(targetId, true)
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
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (mounted) {
                // Ignore token refresh events
                if (event === "TOKEN_REFRESHED") {
                    return
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Only show loading on critical events
                    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
                        setLoading(true)
                    }

                    setError(null)
                    // Normal fetch (cached)
                    await fetchProfileData(session.user.id)
                    setLoading(false)
                } else {
                    setProfile(null)
                    setEstablishment(null)
                    setLoading(false)
                    lastFetchedUserId.current = null // Clear cache on logout
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
