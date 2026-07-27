import { router } from '@inertiajs/react';
import { useState, type ChangeEvent } from 'react';
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
import { efetivar, desfazer } from '@/routes/financeiro/lancamentos';

interface Lancamento {
    id: number;
    descricao: string;
    valor_previsto: string;
    valor_efetivado: string | null;
    efetivado_em: string | null;
}

/** "1000.00" -> centavos (100000); vazio/null -> null. */
function paraCentavos(valor: string | null): number | null {
    if (valor === null || valor === '') return null;
    return Math.round(Number(valor) * 100);
}

function centavosTexto(centavos: number | null): string {
    if (centavos === null) return '';
    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** Hoje no fuso do navegador (BRT pra Pati), formato YYYY-MM-DD. */
function hojeISO(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function SheetEfetivar({
    lancamento,
    onClose,
}: {
    lancamento: Lancamento | null;
    onClose: () => void;
}) {
    return (
        <Sheet open={lancamento !== null} onOpenChange={(aberto) => !aberto && onClose()}>
            <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-xl">
                {lancamento && (
                    <Formulario key={lancamento.id} lancamento={lancamento} onClose={onClose} />
                )}
            </SheetContent>
        </Sheet>
    );
}

function Formulario({ lancamento, onClose }: { lancamento: Lancamento; onClose: () => void }) {
    const jaEfetivado = lancamento.efetivado_em !== null;

    const [centavos, setCentavos] = useState<number | null>(
        paraCentavos(jaEfetivado ? lancamento.valor_efetivado : lancamento.valor_previsto),
    );
    const [data, setData] = useState<string>(lancamento.efetivado_em?.slice(0, 10) ?? hojeISO());
    const [enviando, setEnviando] = useState(false);

    function handleValor(e: ChangeEvent<HTMLInputElement>) {
        const digitos = e.target.value.replace(/\D/g, '');
        setCentavos(digitos === '' ? null : parseInt(digitos, 10));
    }

    function confirmar() {
        const valorSubmit = centavos === null ? '' : (centavos / 100).toFixed(2);

        setEnviando(true);
        router.put(
            efetivar.url(lancamento.id),
            { valor_efetivado: valorSubmit, efetivado_em: data },
            { preserveScroll: true, onSuccess: onClose, onFinish: () => setEnviando(false) },
        );
    }

    function reverter() {
        setEnviando(true);
        router.put(desfazer.url(lancamento.id), {}, {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setEnviando(false),
        });
    }

    return (
        <>
            <SheetHeader>
                <SheetTitle>{jaEfetivado ? 'Editar efetivação' : 'Efetivar lançamento'}</SheetTitle>
                <SheetDescription>{lancamento.descricao}</SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="valor_efetivado">Valor pago (R$)</Label>
                    <Input
                        id="valor_efetivado"
                        type="text"
                        inputMode="numeric"
                        value={centavosTexto(centavos)}
                        onChange={handleValor}
                        placeholder="0,00"
                        autoComplete="off"
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="efetivado_em">Data</Label>
                    <Input
                        id="efetivado_em"
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                </div>
            </div>

            <SheetFooter className="gap-2">
                <Button onClick={confirmar} disabled={enviando}>
                    {jaEfetivado ? 'Salvar' : 'Confirmar'}
                </Button>
                {jaEfetivado && (
                    <Button variant="secondary" onClick={reverter} disabled={enviando}>
                        Desfazer efetivação
                    </Button>
                )}
            </SheetFooter>
        </>
    );
}