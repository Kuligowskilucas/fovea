import { Head, Link } from '@inertiajs/react';
import { CalendarCheck, CalendarClock, Plus, Stethoscope, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as consultasIndex, show as consultaShow } from '@/routes/consultas';
import { create as novoPaciente, index as pacientesIndex } from '@/routes/pacientes';

type ConsultaHoje = {
    id: number;
    atendido_em: string;
    procedimento: string | null;
    paciente: { id: number; nome_completo: string } | null;
};

type Retorno = {
    id: number;
    retorno_em: string;
    procedimento: string | null;
    paciente: { id: number; nome_completo: string } | null;
};

type DashboardProps = {
    metricas: {
        atendimentos_hoje: number;
        consultas_no_mes: number;
        retornos_previstos: number;
    };
    consultas_hoje: ConsultaHoje[];
    retornos: Retorno[];
};

function formatarHora(iso: string): string {
    // atendido_em é wall-clock; forçamos UTC pra mostrar exatamente o que foi gravado
    return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });
}

function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/** Rótulo relativo pro retorno: hoje / amanhã / em N dias. */
function prazoRetorno(iso: string): string {
    const hoje = new Date();
    const alvo = new Date(iso);
    const dias = Math.round(
        (Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth(), alvo.getUTCDate()) -
            Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) /
            86_400_000,
    );

    if (dias <= 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    return `Em ${dias} dias`;
}

const metricasConfig = [
    { chave: 'atendimentos_hoje', titulo: 'Atendimentos hoje', icone: CalendarCheck },
    { chave: 'consultas_no_mes', titulo: 'Consultas no mês', icone: Stethoscope },
    { chave: 'retornos_previstos', titulo: 'Retornos em 30 dias', icone: CalendarClock },
] as const;

export default function Dashboard({ metricas, consultas_hoje, retornos }: DashboardProps) {
    return (
        <>
            <Head title="Hoje" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                    {metricasConfig.map(({ chave, titulo, icone: Icone }) => (
                        <Card key={chave}>
                            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {titulo}
                                </CardTitle>
                                <Icone className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{metricas[chave]}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href={novoPaciente()}>
                            <Plus className="h-4 w-4" />
                            Novo paciente
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={pacientesIndex()}>
                            <Users className="h-4 w-4" />
                            Ver pacientes
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={consultasIndex()}>
                            <Stethoscope className="h-4 w-4" />
                            Ver consultas
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Atendimentos de hoje</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {consultas_hoje.length === 0 && (
                            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Nenhum atendimento registrado hoje.
                            </p>
                        )}

                        {consultas_hoje.map((consulta) => (
                            <Link
                                key={consulta.id}
                                href={consultaShow(consulta.id)}
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
                                <span className="text-sm text-muted-foreground">
                                    {formatarHora(consulta.atendido_em)}
                                </span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Retornos previstos</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {retornos.length === 0 && (
                            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Nenhum retorno previsto para os próximos 30 dias.
                            </p>
                        )}

                        {retornos.map((retorno) => (
                            <Link
                                key={retorno.id}
                                href={consultaShow(retorno.id)}
                                className="flex flex-col gap-1 rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                            >
                                <div className="grid gap-0.5">
                                    <p className="font-medium">
                                        {retorno.paciente?.nome_completo ?? 'Paciente arquivado'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {retorno.procedimento ?? 'Consulta'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {prazoRetorno(retorno.retorno_em)}
                                    </span>
                                    <span>{formatarData(retorno.retorno_em)}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Hoje', href: dashboard() }],
};