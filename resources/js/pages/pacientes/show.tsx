import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { edit, index } from '@/routes/pacientes';
import { create as novaConsulta } from '@/routes/pacientes/consultas';
import { show as consultaShow } from '@/routes/consultas';

interface Consulta {
    id: number;
    atendido_em: string | null;
    procedimento: string | null;
    retorno_em: string | null;
    observacoes: string | null;
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
}

type PageProps = {
    flash: { success: string | null; error: string | null };
};

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

export default function PacienteShow({ paciente }: Props) {
    const { flash } = usePage<PageProps>().props;

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

    function arquivar() {
        if (
            !confirm(
                'Arquivar este paciente? Ele deixará de aparecer na lista de pacientes ativos, mas o histórico será mantido.',
            )
        ) {
            return;
        }

        router.delete(PacienteController.destroy.url(paciente.id));
    }

    return (
        <>
            <Head title={paciente.nome_completo} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {flash.success && (
                    <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                        {flash.success}
                    </div>
                )}

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

PacienteShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: 'Detalhe', href: index() },
    ],
};