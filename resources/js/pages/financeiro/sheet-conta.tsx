import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { InputMoeda } from '@/components/input-moeda';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { store, update } from '@/routes/financeiro/contas';

interface Conta {
    id: number;
    nome: string;
    saldo_inicial: string;
    data_inicial: string;
}

function hojeISO(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function SheetConta({
    alvo,
    onClose,
}: {
    alvo: Conta | 'nova' | null;
    onClose: () => void;
}) {
    return (
        <Sheet open={alvo !== null} onOpenChange={(aberto) => !aberto && onClose()}>
            <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-xl">
                {alvo && (
                    <Formulario
                        key={alvo === 'nova' ? 'nova' : alvo.id}
                        conta={alvo === 'nova' ? null : alvo}
                        onClose={onClose}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

function Formulario({ conta, onClose }: { conta: Conta | null; onClose: () => void }) {
    const editando = conta !== null;

    const form = useForm({
        nome: conta?.nome ?? '',
        saldo_inicial: conta?.saldo_inicial ?? '',
        data_inicial: conta?.data_inicial?.slice(0, 10) ?? hojeISO(),
    });

    function submit() {
        const opts = { preserveScroll: true, onSuccess: onClose };
        if (editando) {
            form.put(update.url(conta!.id), opts);
        } else {
            form.post(store.url(), opts);
        }
    }

    return (
        <>
            <SheetHeader>
                <SheetTitle>{editando ? 'Editar conta' : 'Nova conta'}</SheetTitle>
                <SheetDescription>
                    Saldo inicial e a data a partir da qual ele vale.
                </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                        id="nome"
                        value={form.data.nome}
                        onChange={(e) => form.setData('nome', e.target.value)}
                        placeholder="Nubank PJ"
                        autoComplete="off"
                    />
                    <InputError message={form.errors.nome} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="saldo_inicial">Saldo inicial (R$)</Label>
                    <InputMoeda
                        id="saldo_inicial"
                        value={form.data.saldo_inicial}
                        onChange={(v) => form.setData('saldo_inicial', v)}
                    />
                    <InputError message={form.errors.saldo_inicial} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="data_inicial">Data inicial</Label>
                    <Input
                        id="data_inicial"
                        type="date"
                        value={form.data.data_inicial}
                        onChange={(e) => form.setData('data_inicial', e.target.value)}
                    />
                    <InputError message={form.errors.data_inicial} />
                </div>
            </div>

            <SheetFooter>
                <Button onClick={submit} disabled={form.processing}>
                    {editando ? 'Salvar' : 'Criar'}
                </Button>
            </SheetFooter>
        </>
    );
}