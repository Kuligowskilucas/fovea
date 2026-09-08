import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

/**
 * Layout da vitrine pública.
 *
 * Deliberadamente isolado do AppLayout: sem sidebar, sem navegação
 * administrativa, sem link pro sistema e sem nada que leia auth.user — a rota
 * catalogo.* não recebe props autenticadas (ver HandleInertiaRequests::share).
 */
export default function CatalogoLayout({ children }: { children: ReactNode }) {
    // `name` é a única prop compartilhada que sobra nas rotas públicas.
    const { name } = usePage().props;

    return (
        <div className="flex min-h-svh flex-col bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
                <div className="mx-auto w-full max-w-5xl px-4 py-4">
                    <p className="text-lg font-semibold tracking-tight">{name}</p>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

            <footer className="border-t">
                <div className="mx-auto w-full max-w-5xl px-4 py-6">
                    <p className="text-xs text-muted-foreground">
                        {name} · Consulte disponibilidade das armações.
                    </p>
                </div>
            </footer>
        </div>
    );
}
