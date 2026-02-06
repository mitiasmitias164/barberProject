import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Hero() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <motion.a
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    href="#"
                    className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
                >
                    Siga-nos no Instagram
                </motion.a>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-sans text-3xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    Agendamento inteligente para <br className="hidden sm:inline" />
                    barbearias modernas
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                >
                    Organize sua agenda, fidelize clientes e controle seu financeiro em um só lugar. Simples, rápido e elegante.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-x-4"
                >
                    <Button size="lg" className="h-11 px-8" asChild>
                        <a href="/login">
                            Começar Agora
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                    <Button size="lg" variant="outline" className="h-11 px-8">
                        Ver Demo
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
