import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { mes as financeiroMes } from '@/routes/financeiro';
import { index as contasIndex } from '@/routes/financeiro/contas';
import { SheetConta } from './sheet-conta';

interface Conta {
    id: number;
    nome: string;
    saldo_inicial: string;
    data_inicial: string;
}

interface Props {
    contas: Conta[];
}

function moeda(v: string): string {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function FinanceiroContas({ contas }: Props) {
    const [editando, setEditando] = useState<Conta | 'nova' | null>(null);

    return (
        <>
            <Head title="Contas" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Contas"
                        description="Saldos iniciais das suas contas"
                    />
                    <Button onClick={() => setEditando('nova')}>Nova conta</Button>
                </div>

                {contas.length === 0 && (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nenhuma conta cadastrada. Crie a primeira (ex.: Nubank PJ).
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {contas.map((conta) => (
                        <button
                            key={conta.id}
                            type="button"
                            onClick={() => setEditando(conta)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
                        >
                            <div>
                                <p className="font-medium">{conta.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                    desde {formatarData(conta.data_inicial)}
                                </p>
                            </div>
                            <p className="font-medium">{moeda(conta.saldo_inicial)}</p>
                        </button>
                    ))}
                </div>

                <SheetConta alvo={editando} onClose={() => setEditando(null)} />
            </div>
        </>
    );
}

FinanceiroContas.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Financeiro', href: financeiroMes() },
        { title: 'Contas', href: contasIndex() },
    ],
};