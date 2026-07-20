import { Head, router } from '@inertiajs/react';
import ConsultaController from '@/actions/App/Http/Controllers/ConsultaController';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as arquivadosIndex } from '@/routes/arquivados';

interface PacienteArquivado {
    id: number;
    nome_completo: string;
    cpf: string | null;
    cidade: string | null;
    uf: string | null;
    deleted_at: string;
}

interface ConsultaArquivada {
    id: number;
    atendido_em: string | null;
    deleted_at: string;
    paciente: { id: number; nome_completo: string } | null;
}

interface Props {
    pacientes: PacienteArquivado[];
    consultas: ConsultaArquivada[];
}

function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
}

function formatarDataHora(iso: string): string {
    // atendido_em é wall-clock; forçamos UTC pra mostrar exatamente o que foi gravado
    return new Date(iso).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    });
}

export default function ArquivadosIndex({ pacientes, consultas }: Props) {
    function restaurarPaciente(id: number) {
        router.put(PacienteController.restaurar.url(id), {}, { preserveScroll: true });
    }

    function restaurarConsulta(id: number) {
        router.put(ConsultaController.restaurar.url(id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Arquivados" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="Arquivados"
                    description="Pacientes e consultas arquivados. Restaure para trazê-los de volta."
                />

                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Pacientes ({pacientes.length})
                    </h2>

                    {pacientes.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum paciente arquivado.
                        </p>
                    )}

                    {pacientes.map((p) => {
                        const local = [p.cidade, p.uf].filter(Boolean).join(' / ');
                        return (
                            <div
                                key={p.id}
                                className="flex flex-col gap-2 rounded-xl border border-sidebar-border/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                            >
                                <div className="grid gap-0.5">
                                    <p className="font-medium">{p.nome_completo}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {[p.cpf, local].filter(Boolean).join(' · ') || '—'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Arquivado em {formatarData(p.deleted_at)}
                                    </p>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => restaurarPaciente(p.id)}
                                >
                                    Restaurar
                                </Button>
                            </div>
                        );
                    })}
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Consultas ({consultas.length})
                    </h2>

                    {consultas.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhuma consulta arquivada.
                        </p>
                    )}

                    {consultas.map((c) => (
                        <div
                            key={c.id}
                            className="flex flex-col gap-2 rounded-xl border border-sidebar-border/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                        >
                            <div className="grid gap-0.5">
                                <p className="font-medium">
                                    {c.paciente?.nome_completo ?? 'Paciente removido'}
                                </p>
                                {c.atendido_em && (
                                    <p className="text-sm text-muted-foreground">
                                        {formatarDataHora(c.atendido_em)}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Arquivada em {formatarData(c.deleted_at)}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => restaurarConsulta(c.id)}
                            >
                                Restaurar
                            </Button>
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
}

ArquivadosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Arquivados', href: arquivadosIndex() },
    ],
};