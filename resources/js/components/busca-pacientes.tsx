import { router } from '@inertiajs/react';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { pacientes as buscaPacientes } from '@/routes/busca';
import { show } from '@/routes/pacientes';

interface Resultado {
    id: number;
    nome_completo: string;
    nome_social: string | null;
    cpf: string | null;
    idade: number | null;
}

export function BuscaPacientes() {
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState<Resultado[]>([]);
    const [aberto, setAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [destacado, setDestacado] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    // Guarda a busca em voo pra descartar respostas atrasadas (race condition:
    // uma busca antiga pode chegar depois de uma nova e sobrescrever a lista).
    const abortRef = useRef<AbortController | null>(null);

    // Debounce de 250ms — evita uma requisição por tecla digitada.
    useEffect(() => {
        const query = termo.trim();

        if (query.length < 2) {
            setResultados([]);
            setCarregando(false);
            return;
        }

        setCarregando(true);
        const timer = setTimeout(() => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            fetch(`${buscaPacientes.url()}?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: controller.signal,
            })
                .then((r) => (r.ok ? r.json() : []))
                .then((dados: Resultado[]) => {
                    setResultados(dados);
                    setDestacado(0);
                    setAberto(true);
                })
                .catch(() => {
                    /* abortada ou falha de rede: ignora silenciosamente */
                })
                .finally(() => setCarregando(false));
        }, 250);

        return () => clearTimeout(timer);
    }, [termo]);

    // Fecha ao clicar fora.
    useEffect(() => {
        function aoClicarFora(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) {
                setAberto(false);
            }
        }
        document.addEventListener('mousedown', aoClicarFora);
        return () => document.removeEventListener('mousedown', aoClicarFora);
    }, []);

    function irPara(id: number) {
        setAberto(false);
        setTermo('');
        setResultados([]);
        router.visit(show(id));
    }

    function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!aberto || resultados.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setDestacado((i) => (i + 1) % resultados.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setDestacado((i) => (i - 1 + resultados.length) % resultados.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            irPara(resultados[destacado].id);
        } else if (e.key === 'Escape') {
            setAberto(false);
        }
    }

    const semResultado = aberto && !carregando && termo.trim().length >= 2 && resultados.length === 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                onKeyDown={aoTeclar}
                onFocus={() => resultados.length > 0 && setAberto(true)}
                placeholder="Buscar paciente..."
                className="pl-9"
                aria-label="Buscar paciente por nome ou CPF"
                autoComplete="off"
            />
            {carregando && (
                <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}

            {(aberto && resultados.length > 0) || semResultado ? (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-popover shadow-md">
                    {semResultado ? (
                        <p className="px-3 py-3 text-sm text-muted-foreground">
                            Nenhum paciente encontrado.
                        </p>
                    ) : (
                        resultados.map((paciente, i) => (
                            <button
                                key={paciente.id}
                                type="button"
                                onClick={() => irPara(paciente.id)}
                                onMouseEnter={() => setDestacado(i)}
                                className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors ${
                                    i === destacado ? 'bg-muted' : ''
                                }`}
                            >
                                <span className="text-sm font-medium">
                                    {paciente.nome_completo}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {[
                                        paciente.nome_social && `Social: ${paciente.nome_social}`,
                                        paciente.cpf,
                                        paciente.idade !== null && `${paciente.idade} anos`,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    );
}