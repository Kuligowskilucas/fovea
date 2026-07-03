import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { create, index, show } from '@/routes/pacientes';

interface Paciente {
    id: number;
    nome_completo: string;
    nome_social: string | null;
    cpf: string | null;
    cidade: string | null;
    data_nascimento: string | null;
    idade: number | null;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    pacientes: Paginated<Paciente>;
    filters: { q: string };
}

function formatarData(iso: string): string {
    // data pura (cast 'date') vem como ISO em UTC; forçamos UTC pra não pular um dia
    return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function PacientesIndex({ pacientes, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');

    function buscar(e: FormEvent) {
        e.preventDefault();
        router.get(index.url(), { q }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Pacientes" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Pacientes"
                        description="Cadastro e busca de pacientes"
                    />
                    <Button asChild>
                        <Link href={create()}>Novo paciente</Link>
                    </Button>
                </div>

                <form onSubmit={buscar} className="flex gap-2">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por nome, CPF ou cidade"
                        className="max-w-md"
                    />
                    <Button type="submit" variant="secondary">
                        Buscar
                    </Button>
                </form>

                <p className="text-sm text-muted-foreground">
                    {pacientes.total} paciente(s)
                </p>

                <div className="flex flex-col gap-2">
                    {pacientes.data.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum paciente encontrado.
                        </p>
                    )}

                    {pacientes.data.map((paciente) => (
                        <Link
                            key={paciente.id}
                            href={show(paciente.id)}
                            className="flex flex-col gap-1 rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                        >
                            <div>
                                <p className="font-medium">{paciente.nome_completo}</p>
                                {paciente.nome_social && (
                                    <p className="text-sm text-muted-foreground">
                                        Nome social: {paciente.nome_social}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                {paciente.cidade && <span>{paciente.cidade}</span>}
                                {paciente.data_nascimento && (
                                    <span>
                                        {formatarData(paciente.data_nascimento)}
                                        {paciente.idade !== null && ` · ${paciente.idade} anos`}
                                    </span>
                                )}
                                {paciente.cpf && <span>{paciente.cpf}</span>}
                            </div>
                        </Link>
                    ))}
                </div>

                {pacientes.links.length > 3 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {pacientes.links.map((link, i) => (
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

PacientesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
    ],
};