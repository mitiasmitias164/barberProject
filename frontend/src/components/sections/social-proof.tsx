export function SocialProof() {
    return (
        <section className="container py-12 md:py-24 lg:py-32">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    Confiam no BarberManager
                </p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                    <div className="flex items-center justify-center text-xl font-bold">Barba's Club</div>
                    <div className="flex items-center justify-center text-xl font-bold">Retrô Cut</div>
                    <div className="flex items-center justify-center text-xl font-bold">Mustache</div>
                    <div className="flex items-center justify-center text-xl font-bold">Navalha de Ouro</div>
                    <div className="flex items-center justify-center text-xl font-bold md:col-span-4 lg:col-span-1">Viking Style</div>
                </div>
            </div>
        </section>
    )
}
