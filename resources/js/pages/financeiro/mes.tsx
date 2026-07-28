import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { useState } from 'react';
import { SheetEfetivar } from './sheet-efetivar';
import { Button } from '@/components/ui/button';
import { mes as financeiroMes } from '@/routes/financeiro';
import { index as contasIndex } from '@/routes/financeiro/contas';
import { index as recorrenciasIndex } from '@/routes/financeiro/recorrencias';
import { SheetLancamento } from './sheet-lancamento';


interface Categoria {
    id: number;
    natureza: 'receita' | 'despesa';
    nome: string;
}

interface Lancamento {
    id: number;
    descricao: string;
    natureza: 'receita' | 'despesa';
    valor_previsto: string;
    valor_efetivado: string | null;
    data_vencimento: string;
    efetivado_em: string | null;
    categoria: Categoria | null;
}

interface RefMes {
    ano: number;
    mes: number;
    rotulo: string;
    anterior: { ano: number; mes: number };
    proximo: { ano: number; mes: number };
}

interface Totais {
    previsto: number;
    efetivado: number;
}

interface Conta {
    id: number;
    nome: string;
}

interface Props {
    referencia: RefMes;
    lancamentos: Lancamento[];
    resumo: { receita: Totais; despesa: Totais };
    categorias: Categoria[];
    contas: Conta[];
}

function moeda(valor: number | string | null): string {
    if (valor === null || valor === '') return '—';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDia(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC',
    });
}

function linkMes(ref: { ano: number; mes: number }): string {
    return `${financeiroMes.url()}?ano=${ref.ano}&mes=${ref.mes}`;
}

export default function FinanceiroMes({ referencia, lancamentos, resumo, categorias, contas }: Props) {
    const [selecionado, setSelecionado] = useState<Lancamento | null>(null);
    const [novoAberto, setNovoAberto] = useState(false);

    const agora = new Date();
    const ehMesAtual = referencia.ano === agora.getFullYear() && referencia.mes === agora.getMonth() + 1;
    const dataPadrao = ehMesAtual ? new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : `${referencia.ano}-${String(referencia.mes).padStart(2, '0')}-01`;
    const receitas = lancamentos.filter((l) => l.natureza === 'receita');
    const despesas = lancamentos.filter((l) => l.natureza === 'despesa');

    const resultadoPrevisto = resumo.receita.previsto - resumo.despesa.previsto;
    const resultadoEfetivado = resumo.receita.efetivado - resumo.despesa.efetivado;

    return (
        <>
            <Head title={`Financeiro · ${referencia.rotulo}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading variant="small" title="Financeiro" description="Lançamentos do mês" />
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={recorrenciasIndex()}>Recorrências</Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={contasIndex()}>Contas</Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Link
                        href={linkMes(referencia.anterior)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-sm font-medium">{referencia.rotulo}</span>
                    <Link
                        href={linkMes(referencia.proximo)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-3 rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Resultado do mês</span>
                        <div className="text-right">
                            <p
                                className={`text-lg font-semibold ${
                                    resultadoEfetivado >= 0 ? 'text-emerald-600' : 'text-destructive'
                                }`}
                            >
                                {moeda(resultadoEfetivado)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                previsto {moeda(resultadoPrevisto)}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                        <div>
                            <p className="text-muted-foreground">Receitas</p>
                            <p className="font-medium">{moeda(resumo.receita.efetivado)}</p>
                            <p className="text-xs text-muted-foreground">
                                de {moeda(resumo.receita.previsto)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Despesas</p>
                            <p className="font-medium">{moeda(resumo.despesa.efetivado)}</p>
                            <p className="text-xs text-muted-foreground">
                                de {moeda(resumo.despesa.previsto)}
                            </p>
                        </div>
                    </div>
                </div>

                <Button onClick={() => setNovoAberto(true)} className="w-full">
                    Novo lançamento
                </Button>

                {lancamentos.length === 0 && (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nenhum lançamento neste mês.
                    </p>
                )}

                {receitas.length > 0 && (
                    <Secao titulo="Receitas" itens={receitas} onSelecionar={setSelecionado} />
                )}
                {despesas.length > 0 && (
                    <Secao titulo="Despesas" itens={despesas} onSelecionar={setSelecionado} />
                )}
                <SheetEfetivar
                    lancamento={selecionado}
                    onClose={() => setSelecionado(null)}
                />
                <SheetLancamento
                    aberto={novoAberto}
                    dataPadrao={dataPadrao}
                    categorias={categorias}
                    contas={contas}
                    onClose={() => setNovoAberto(false)}
                />
            </div>
        </>
    );
}

function Secao({ titulo, itens, onSelecionar }: { titulo: string; itens: Lancamento[]; onSelecionar: (l: Lancamento) => void; }) {
    return (
        <section className="grid gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{titulo}</h2>
            {itens.map((l) => {
                const efetivado = l.efetivado_em !== null;
                return (
                    <button
                        key={l.id}
                        type="button"
                        onClick={() => onSelecionar(l)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-3">
                            {efetivado ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            ) : (
                                <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                            <div>
                                <p className="font-medium">{l.descricao}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatarDia(l.data_vencimento)}
                                    {l.categoria ? ` · ${l.categoria.nome}` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">
                                {efetivado ? moeda(l.valor_efetivado) : moeda(l.valor_previsto)}
                            </p>
                            {efetivado && l.valor_efetivado !== l.valor_previsto && (
                                <p className="text-xs text-muted-foreground line-through">
                                    {moeda(l.valor_previsto)}
                                </p>
                            )}
                            {!efetivado && (
                                <p className="text-xs text-muted-foreground">previsto</p>
                            )}
                        </div>
                    </button>
                );
            })}
        </section>
    );
}

FinanceiroMes.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Financeiro', href: financeiroMes() },
    ],
};