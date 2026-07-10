import { Head, Link } from '@inertiajs/react';
import { CalendarClock, Plus, Stethoscope, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { show as consultaShow } from '@/routes/consultas';
import { create as novoPaciente, index as pacientesIndex } from '@/routes/pacientes';

type UltimaConsulta = {
    id: number;
    atendido_em: string;
    procedimento: string | null;
    paciente: { id: number; nome_completo: string } | null;
};

type DashboardProps = {
    metricas: {
        total_pacientes: number;
        total_consultas: number;
        consultas_no_mes: number;
    };
    ultimas_consultas: UltimaConsulta[];
};

function formatarDataHora(iso: string): string {
    // atendido_em é wall-clock; forçamos UTC pra mostrar exatamente o que foi gravado
    return new Date(iso).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'UTC',
    });
}

const metricasConfig = [
    { chave: 'total_pacientes', titulo: 'Pacientes', icone: Users },
    { chave: 'consultas_no_mes', titulo: 'Consultas no mês', icone: CalendarClock },
    { chave: 'total_consultas', titulo: 'Consultas no total', icone: Stethoscope },
] as const;

export default function Dashboard({ metricas, ultimas_consultas }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
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
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimas consultas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {ultimas_consultas.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma consulta registrada ainda.
                            </p>
                        )}

                        {ultimas_consultas.map((consulta) => (
                            <Link
                                key={consulta.id}
                                href={consultaShow(consulta.id)}
                                className="flex flex-col gap-1 rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="grid gap-0.5">
                                    <p className="font-medium">
                                        {consulta.paciente?.nome_completo ?? 'Paciente removido'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {consulta.procedimento ?? 'Consulta'}
                                    </p>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatarDataHora(consulta.atendido_em)}
                                </span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};