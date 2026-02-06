import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors, MapPin } from "lucide-react"

export function PublicProfile() {
    const { slug } = useParams()

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Scissors className="h-6 w-6" />
                        <span>BarberManager</span>
                    </div>
                </div>
            </header>

            <main className="container py-8 grid gap-8 md:grid-cols-[1fr_300px]">
                {/* Main Content */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl capitalize">
                            {slug?.replace(/-/g, ' ')}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Rua Exemplo, 123 - Centro</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Serviços</h2>
                        <div className="grid gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium">
                                            Corte de Cabelo {i}
                                        </CardTitle>
                                        <span className="font-bold">R$ 35,00</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            30 minutos • Corte completo com tesoura e máquina.
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Agendar</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horários</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Segunda - Sexta</span>
                                <span className="font-medium">09:00 - 18:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sábado</span>
                                <span className="font-medium">09:00 - 14:00</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Domingo</span>
                                <span>Fechado</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
