import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/consultas';

interface Consulta {
    id: number;
    atendido_em: string | null;
    procedimento: string | null;
    retorno_em: string | null;
    observacoes: string | null;
    paciente: { id: number; nome_completo: string } | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    consultas: Paginated<Consulta>;
    filters: { q: string; de: string | null; ate: string | null };
}

function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarDataHora(iso: string): string {
    // atendido_em é wall-clock; forçamos UTC pra mostrar exatamente o que foi gravado
    return new Date(iso).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    });
}

export default function ConsultasIndex({ consultas, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [de, setDe] = useState(filters.de ?? '');
    const [ate, setAte] = useState(filters.ate ?? '');

    function buscar(e: FormEvent) {
        e.preventDefault();
        router.get(index.url(), { q, de, ate }, { preserveState: true, replace: true });
    }

    function limpar() {
        setQ('');
        setDe('');
        setAte('');
        router.get(index.url(), {}, { preserveState: true, replace: true });
    }

    const temFiltro = Boolean(q || de || ate);

    return (
        <>
            <Head title="Consultas" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Heading
                    variant="small"
                    title="Consultas"
                    description="Histórico de atendimentos"
                />

                <form onSubmit={buscar} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                    <div className="grid gap-1.5">
                        <Label htmlFor="q">Paciente</Label>
                        <Input
                            id="q"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nome do paciente"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="de">De</Label>
                        <Input
                            id="de"
                            type="date"
                            value={de}
                            onChange={(e) => setDe(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="ate">Até</Label>
                        <Input
                            id="ate"
                            type="date"
                            value={ate}
                            onChange={(e) => setAte(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="secondary">
                            Filtrar
                        </Button>
                        {temFiltro && (
                            <Button type="button" variant="ghost" onClick={limpar}>
                                Limpar
                            </Button>
                        )}
                    </div>
                </form>

                <p className="text-sm text-muted-foreground">{consultas.total} consulta(s)</p>

                <div className="flex flex-col gap-2">
                    {consultas.data.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhuma consulta encontrada.
                        </p>
                    )}

                    {consultas.data.map((consulta) => (
                        <Link
                            key={consulta.id}
                            href={show(consulta.id)}
                            className="flex flex-col gap-1 rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                        >
                            <div className="grid gap-0.5">
                                <p className="font-medium">
                                    {consulta.paciente?.nome_completo ?? 'Paciente arquivado'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {consulta.procedimento ?? 'Consulta'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                {consulta.atendido_em && (
                                    <span>{formatarDataHora(consulta.atendido_em)}</span>
                                )}
                                {consulta.retorno_em && (
                                    <span>Retorno: {formatarData(consulta.retorno_em)}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {consultas.links.length > 3 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {consultas.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={[
                                    'rounded-md px-3 py-1 text-sm',
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                    !link.url ? 'pointer-events-none opacity-50' : '',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ConsultasIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Consultas', href: index() },
    ],
};