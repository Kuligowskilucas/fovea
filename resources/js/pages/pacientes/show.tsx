import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { edit, index, show as pacienteShow } from '@/routes/pacientes';
import { create as novaConsulta } from '@/routes/pacientes/consultas';
import { show as consultaShow } from '@/routes/consultas';
import { useConfirm } from '@/hooks/use-confirm';

interface Consulta {
    id: number;
    atendido_em: string | null;
    procedimento: string | null;
    retorno_em: string | null;
    observacoes: string | null;
}

interface MedidaRefracao {
    esferico: string | null;
    cilindrico: string | null;
    eixo: number | null;
    av: string | null;
}

interface Refracao {
    prescricao_id: number;
    consulta_id: number;
    atendido_em: string | null;
    tipo_visao: 'longe' | 'longe_perto' | null;
    adicao: string | null;
    od: MedidaRefracao | null;
    oe: MedidaRefracao | null;
}

interface Paciente {
    id: number;
    nome_completo: string;
    nome_social: string | null;
    data_nascimento: string | null;
    idade: number | null;
    sexo: string | null;
    cpf: string | null;
    rg: string | null;
    ocupacao: string | null;
    celular_whatsapp: string | null;
    telefone_2: string | null;
    email: string | null;
    origem: string | null;
    responsavel_nome: string | null;
    responsavel_cpf: string | null;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    observacoes: string | null;
    consultas: Consulta[];
}

interface Props {
    paciente: Paciente;
    ultima_refracao: Refracao | null;
    refracoes: Refracao[];
}


const SEXO_LABEL: Record<string, string> = {
    feminino: 'Feminino',
    masculino: 'Masculino',
    outro: 'Outro',
};

function formatarData(iso: string): string {
    // data pura (cast 'date') vem como ISO em UTC; forçamos UTC pra não pular um dia
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

/** Formata dioptria com sinal e vírgula decimal: -1.25 → "−1,25". Vazio → "—". */
function grau(v: string | number | null): string {
    if (v === null || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    const s = n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
    return s.replace('.', ',');
}

/** Monta a notação clínica de um olho: "−3,50 −1,00 180°". */
function notacao(m: MedidaRefracao | null): string {
    if (!m) return '—';
    const partes = [grau(m.esferico), grau(m.cilindrico)];
    if (m.eixo !== null) partes.push(`${m.eixo}°`);
    return partes.join('  ');
}

/** Renderiza um par label/valor; retorna null se o valor for vazio. */
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

/** Seção com título; só aparece se `mostrar` for true. */
function Secao({
    titulo,
    mostrar,
    children,
}: {
    titulo: string;
    mostrar: boolean;
    children: ReactNode;
}) {
    if (!mostrar) {
        return null;
    }

    return (
        <section className="grid gap-3 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <h2 className="text-sm font-medium text-muted-foreground">{titulo}</h2>
            <div className="grid gap-3 sm:grid-cols-2">{children}</div>
        </section>
    );
}

export default function PacienteShow({ paciente, ultima_refracao, refracoes }: Props) {
    const confirm = useConfirm();
    const endereco = [paciente.logradouro, paciente.numero, paciente.complemento]
        .filter(Boolean)
        .join(', ');

    const cidadeUf = [paciente.cidade, paciente.uf].filter(Boolean).join(' / ');

    const temIdentificacao = Boolean(
        paciente.data_nascimento ||
            paciente.sexo ||
            paciente.cpf ||
            paciente.rg ||
            paciente.ocupacao,
    );
    const temContato = Boolean(
        paciente.celular_whatsapp ||
            paciente.telefone_2 ||
            paciente.email ||
            paciente.origem,
    );
    const temResponsavel = Boolean(paciente.responsavel_nome || paciente.responsavel_cpf);
    const temEndereco = Boolean(paciente.cep || paciente.bairro || endereco || cidadeUf);

    async function arquivar() {
        const ok = await confirm({
            title: 'Arquivar paciente?',
            description:
                'Ele deixará de aparecer na lista de pacientes ativos, mas o histórico será mantido.',
            confirmText: 'Arquivar',
            destructive: true,
        });

        if (!ok) return;

        router.delete(PacienteController.destroy.url(paciente.id));
    }

    return (
        <>
            <Head title={paciente.nome_completo} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        variant="small"
                        title={paciente.nome_completo}
                        description={
                            paciente.nome_social
                                ? `Nome social: ${paciente.nome_social}`
                                : 'Detalhe do paciente'
                        }
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={novaConsulta(paciente.id)}>Nova consulta</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={edit(paciente.id)}>Editar</Link>
                        </Button>
                        <Button variant="outline" onClick={arquivar}>
                            Arquivar
                        </Button>
                    </div>
                </div>

                <Secao titulo="Identificação" mostrar={temIdentificacao}>
                    <Dado
                        label="Data de nascimento"
                        valor={
                            paciente.data_nascimento
                                ? `${formatarData(paciente.data_nascimento)}${
                                      paciente.idade !== null ? ` · ${paciente.idade} anos` : ''
                                  }`
                                : null
                        }
                    />
                    <Dado
                        label="Sexo"
                        valor={paciente.sexo ? (SEXO_LABEL[paciente.sexo] ?? paciente.sexo) : null}
                    />
                    <Dado label="CPF" valor={paciente.cpf} />
                    <Dado label="RG" valor={paciente.rg} />
                    <Dado label="Ocupação" valor={paciente.ocupacao} />
                </Secao>

                <Secao titulo="Contato" mostrar={temContato}>
                    <Dado label="Celular / WhatsApp" valor={paciente.celular_whatsapp} />
                    <Dado label="Telefone 2" valor={paciente.telefone_2} />
                    <Dado label="E-mail" valor={paciente.email} />
                    <Dado label="Como conheceu a clínica" valor={paciente.origem} />
                </Secao>

                <Secao titulo="Responsável legal" mostrar={temResponsavel}>
                    <Dado label="Nome do responsável" valor={paciente.responsavel_nome} />
                    <Dado label="CPF do responsável" valor={paciente.responsavel_cpf} />
                </Secao>

                <Secao titulo="Endereço" mostrar={temEndereco}>
                    <Dado label="CEP" valor={paciente.cep} />
                    <Dado label="Bairro" valor={paciente.bairro} />
                    <Dado label="Logradouro" valor={endereco || null} full />
                    <Dado label="Cidade / UF" valor={cidadeUf || null} />
                </Secao>

                <Secao titulo="Observações" mostrar={Boolean(paciente.observacoes)}>
                    <Dado label="Observações" valor={paciente.observacoes} full />
                </Secao>

                {ultima_refracao && (
                    <section className="grid gap-3">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Última refração
                        </h2>
                        <div className="grid gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {ultima_refracao.atendido_em
                                        ? formatarData(ultima_refracao.atendido_em)
                                        : 'Data não informada'}
                                </span>
                                <Link
                                    href={consultaShow(ultima_refracao.consulta_id)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Ver consulta
                                </Link>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">OD</span>
                                    <span className="font-mono text-sm">
                                        {notacao(ultima_refracao.od)}
                                    </span>
                                </div>
                                <div className="grid gap-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">OE</span>
                                    <span className="font-mono text-sm">
                                        {notacao(ultima_refracao.oe)}
                                    </span>
                                </div>
                            </div>
                            {ultima_refracao.adicao && (
                                <span className="text-sm text-muted-foreground">
                                    Adição: {grau(ultima_refracao.adicao)}
                                </span>
                            )}
                        </div>
                    </section>
                )}

                {refracoes.length > 1 && (
                    <section className="grid gap-3">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Evolução do grau
                        </h2>
                        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <table className="w-full min-w-[32rem] text-sm">
                                <thead>
                                    <tr className="text-xs text-muted-foreground">
                                        <th className="p-2 text-left font-medium">Data</th>
                                        <th className="p-2 text-left font-medium">OD</th>
                                        <th className="p-2 text-left font-medium">OE</th>
                                        <th className="p-2 text-left font-medium">Adição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refracoes.map((r) => (
                                        <tr
                                            key={r.prescricao_id}
                                            className="border-t border-sidebar-border/70 dark:border-sidebar-border"
                                        >
                                            <td className="p-2 whitespace-nowrap">
                                                <Link
                                                    href={consultaShow(r.consulta_id)}
                                                    className="text-primary hover:underline"
                                                >
                                                    {r.atendido_em ? formatarData(r.atendido_em) : '—'}
                                                </Link>
                                            </td>
                                            <td className="p-2 font-mono whitespace-nowrap">{notacao(r.od)}</td>
                                            <td className="p-2 font-mono whitespace-nowrap">{notacao(r.oe)}</td>
                                            <td className="p-2 font-mono whitespace-nowrap">
                                                {r.adicao ? grau(r.adicao) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="grid gap-3">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Histórico de consultas
                    </h2>

                    {paciente.consultas.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhuma consulta registrada. Use “Nova consulta” para começar.
                        </p>
                    )}

                    <div className="flex flex-col gap-2">
                        {paciente.consultas.map((consulta) => (
                            <Link
                                key={consulta.id}
                                href={consultaShow(consulta.id)}
                                className="flex flex-col gap-1 rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border"
                            >
                                <div className="grid gap-0.5">
                                    <p className="font-medium">
                                        {consulta.procedimento ?? 'Consulta'}
                                    </p>
                                    {consulta.observacoes && (
                                        <p className="line-clamp-1 text-sm text-muted-foreground">
                                            {consulta.observacoes}
                                        </p>
                                    )}
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
                </section>

                <div>
                    <Button variant="ghost" asChild>
                        <Link href={index()}>← Voltar para a lista</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

PacienteShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: props.paciente.nome_completo, href: pacienteShow(props.paciente.id) },
    ],
});