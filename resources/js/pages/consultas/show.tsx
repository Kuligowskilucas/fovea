import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ConsultaController from '@/actions/App/Http/Controllers/ConsultaController';
import PrescricaoController from '@/actions/App/Http/Controllers/PrescricaoController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index, show as pacienteShow } from '@/routes/pacientes';
import { edit } from '@/routes/consultas';
import { imprimir } from '@/routes/prescricoes';
import { PrescricaoForm } from './prescricao-form';
import { ExamesForm } from './exames-form';

interface Medida {
    olho: 'OD' | 'OE';
    esferico: string | null;
    cilindrico: string | null;
    eixo: number | null;
    av: string | null;
    prisma: string | null;
    dnp: string | null;
}

interface Prescricao {
    id: number;
    tipo: 'oculos' | 'lente_contato';
    tipo_visao: 'longe' | 'longe_perto' | null;
    adicao: string | null;
    lente: string | null;
    retorno_em: string | null;
    observacoes: string | null;
    medidas: Medida[];
}

interface Consulta {
    id: number;
    atendido_em: string | null;
    procedimento: string | null;
    retorno_em: string | null;
    observacoes: string | null;
    paciente: { id: number; nome_completo: string };
    profissional: { id: number; name: string } | null;
    prescricoes: Prescricao[];
    exame: { dados: unknown } | null;
}

interface Props {
    consulta: Consulta;
}

type PageProps = {
    flash: { success: string | null; error: string | null };
};

const TIPO_LABEL: Record<Prescricao['tipo'], string> = {
    oculos: 'Óculos',
    lente_contato: 'Lente de contato',
};

const VISAO_LABEL: Record<string, string> = {
    longe: 'Longe',
    longe_perto: 'Longe e perto',
};

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

function Dado({ label, valor, full }: { label: string; valor: ReactNode; full?: boolean }) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    return (
        <div className={`grid gap-0.5 ${full ? 'sm:col-span-2' : ''}`}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm">{valor}</span>
        </div>
    );
}

/** Tabela compacta de medidas OD/OE. */
function GradeMedidas({ prescricao }: { prescricao: Prescricao }) {
    const isOculos = prescricao.tipo === 'oculos';
    const od = prescricao.medidas.find((m) => m.olho === 'OD');
    const oe = prescricao.medidas.find((m) => m.olho === 'OE');

    if (!od && !oe) {
        return null;
    }

    const cel = (v: string | number | null | undefined) =>
        v === null || v === undefined || v === '' ? '—' : String(v);

    const linha = (label: string, m?: Medida) => (
        <tr className="border-t border-sidebar-border/70 dark:border-sidebar-border">
            <th className="py-1.5 pr-3 text-left font-medium">{label}</th>
            <td className="px-2 py-1.5 text-center">{cel(m?.esferico)}</td>
            <td className="px-2 py-1.5 text-center">{cel(m?.cilindrico)}</td>
            <td className="px-2 py-1.5 text-center">{cel(m?.eixo)}</td>
            <td className="px-2 py-1.5 text-center">{cel(m?.av)}</td>
            {isOculos && <td className="px-2 py-1.5 text-center">{cel(m?.prisma)}</td>}
            {isOculos && <td className="px-2 py-1.5 text-center">{cel(m?.dnp)}</td>}
        </tr>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem] text-sm">
                <thead>
                    <tr className="text-xs text-muted-foreground">
                        <th className="py-1.5 pr-3 text-left"> </th>
                        <th className="px-2 py-1.5 text-center font-medium">Esf.</th>
                        <th className="px-2 py-1.5 text-center font-medium">Cil.</th>
                        <th className="px-2 py-1.5 text-center font-medium">Eixo</th>
                        <th className="px-2 py-1.5 text-center font-medium">AV</th>
                        {isOculos && (
                            <th className="px-2 py-1.5 text-center font-medium">Prisma</th>
                        )}
                        {isOculos && <th className="px-2 py-1.5 text-center font-medium">DNP</th>}
                    </tr>
                </thead>
                <tbody>
                    {linha('OD', od)}
                    {linha('OE', oe)}
                </tbody>
            </table>
        </div>
    );
}

function CartaoPrescricao({ prescricao }: { prescricao: Prescricao }) {
    const isOculos = prescricao.tipo === 'oculos';

    function remover() {
        if (!confirm('Remover esta prescrição? A ação não pode ser desfeita.')) {
            return;
        }
        router.delete(PrescricaoController.destroy.url(prescricao.id));
    }

    return (
        <div className="grid gap-3 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {TIPO_LABEL[prescricao.tipo]}
                </span>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" asChild>
                        <a href={imprimir(prescricao.id).url} target="_blank" rel="noopener">
                            Imprimir
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={remover}>
                        Remover
                    </Button>
                </div>
            </div>

            <GradeMedidas prescricao={prescricao} />

            <div className="grid gap-3 sm:grid-cols-2">
                {isOculos && (
                    <Dado
                        label="Tipo de visão"
                        valor={
                            prescricao.tipo_visao
                                ? (VISAO_LABEL[prescricao.tipo_visao] ?? prescricao.tipo_visao)
                                : null
                        }
                    />
                )}
                {isOculos && <Dado label="Adição" valor={prescricao.adicao} />}
                <Dado label="Lente" valor={prescricao.lente} />
                <Dado
                    label="Retorno em"
                    valor={prescricao.retorno_em ? formatarData(prescricao.retorno_em) : null}
                />
                <Dado label="Observações" valor={prescricao.observacoes} full />
            </div>
        </div>
    );
}

export default function ConsultaShow({ consulta }: Props) {
    const { flash } = usePage<PageProps>().props;

    function arquivar() {
        if (
            !confirm(
                'Arquivar esta consulta? Ela deixará de aparecer no histórico, mas os dados serão mantidos.',
            )
        ) {
            return;
        }
        router.delete(ConsultaController.destroy.url(consulta.id));
    }

    return (
        <>
            <Head title="Consulta" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {flash.success && (
                    <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title={consulta.procedimento ?? 'Consulta'}
                        description={
                            consulta.atendido_em
                                ? formatarDataHora(consulta.atendido_em)
                                : 'Consulta'
                        }
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" asChild>
                            <Link href={edit(consulta.id)}>Editar</Link>
                        </Button>
                        <Button variant="outline" onClick={arquivar}>
                            Arquivar
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-0.5">
                            <span className="text-xs text-muted-foreground">Paciente</span>
                            <Link
                                href={pacienteShow(consulta.paciente.id)}
                                className="text-sm text-primary hover:underline"
                            >
                                {consulta.paciente.nome_completo}
                            </Link>
                        </div>
                        <Dado label="Profissional" valor={consulta.profissional?.name} />
                        <Dado
                            label="Retorno em"
                            valor={consulta.retorno_em ? formatarData(consulta.retorno_em) : null}
                        />
                        <Dado label="Observações" valor={consulta.observacoes} full />
                    </div>
                </div>

                <section className="grid gap-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Exames</h2>
                    <ExamesForm consultaId={consulta.id} exame={consulta.exame} />
                </section>

                <section className="grid gap-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Prescrições</h2>

                    {consulta.prescricoes.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhuma prescrição registrada nesta consulta.
                        </p>
                    )}

                    {consulta.prescricoes.map((prescricao) => (
                        <CartaoPrescricao key={prescricao.id} prescricao={prescricao} />
                    ))}

                    {/* Formulário de nova receita: toggle óculos/lente + grade OD/OE.
                        Grava via PrescricaoController.store (back() → recarrega a lista). */}
                    <PrescricaoForm consultaId={consulta.id} />
                </section>

                <div>
                    <Button variant="ghost" asChild>
                        <Link href={pacienteShow(consulta.paciente.id)}>
                            ← Voltar para o paciente
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

ConsultaShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: 'Consulta', href: index() },
    ],
};