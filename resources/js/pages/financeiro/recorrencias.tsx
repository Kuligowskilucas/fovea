import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { mes as financeiroMes } from '@/routes/financeiro';
import { index as recorrenciasIndex } from '@/routes/financeiro/recorrencias';
import { SheetRecorrencia } from './sheet-recorrencia';

interface Categoria {
    id: number;
    natureza: 'receita' | 'despesa';
    nome: string;
}

interface Conta {
    id: number;
    nome: string;
}

interface Recorrencia {
    id: number;
    descricao: string;
    natureza: 'receita' | 'despesa';
    categoria_id: number;
    conta_id: number | null;
    valor_previsto: string;
    dia_vencimento: number;
    data_inicio: string;
    data_fim: string | null;
    categoria: Categoria | null;
    conta: Conta | null;
}

interface Props {
    recorrencias: Recorrencia[];
    categorias: Categoria[];
    contas: Conta[];
}

function moeda(v: string): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinanceiroRecorrencias({ recorrencias, categorias, contas }: Props) {
    const [editando, setEditando] = useState<Recorrencia | 'nova' | null>(null);

    return (
        <>
            <Head title="Recorrências" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Recorrências"
                        description="Modelos que geram os lançamentos de cada mês"
                    />
                    <Button onClick={() => setEditando('nova')}>Nova</Button>
                </div>

                {recorrencias.length === 0 && (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nenhuma recorrência. Crie a primeira (ex.: Salário).
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {recorrencias.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setEditando(r)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
                        >
                            <div>
                                <p className="font-medium">{r.descricao}</p>
                                <p className="text-xs text-muted-foreground">
                                    {r.categoria?.nome}
                                    {r.conta ? ` · ${r.conta.nome}` : ''}
                                    {` · dia ${r.dia_vencimento}`}
                                </p>
                            </div>
                            <p
                                className={`font-medium ${
                                    r.natureza === 'receita' ? 'text-emerald-600' : ''
                                }`}
                            >
                                {moeda(r.valor_previsto)}
                            </p>
                        </button>
                    ))}
                </div>

                <SheetRecorrencia
                    alvo={editando}
                    categorias={categorias}
                    contas={contas}
                    onClose={() => setEditando(null)}
                />
            </div>
        </>
    );
}

FinanceiroRecorrencias.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Financeiro', href: financeiroMes() },
        { title: 'Recorrências', href: recorrenciasIndex() },
    ],
};