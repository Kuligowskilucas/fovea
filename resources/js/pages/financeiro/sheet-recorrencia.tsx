import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { InputMoeda } from '@/components/input-moeda';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { store, update } from '@/routes/financeiro/recorrencias';

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
}

function hojeISO(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function SheetRecorrencia({
    alvo,
    categorias,
    contas,
    onClose,
}: {
    alvo: Recorrencia | 'nova' | null;
    categorias: Categoria[];
    contas: Conta[];
    onClose: () => void;
}) {
    return (
        <Sheet open={alvo !== null} onOpenChange={(aberto) => !aberto && onClose()}>
            <SheetContent
                side="bottom"
                className="mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-t-xl"
            >
                {alvo && (
                    <Formulario
                        key={alvo === 'nova' ? 'nova' : alvo.id}
                        recorrencia={alvo === 'nova' ? null : alvo}
                        categorias={categorias}
                        contas={contas}
                        onClose={onClose}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

function Formulario({
    recorrencia,
    categorias,
    contas,
    onClose,
}: {
    recorrencia: Recorrencia | null;
    categorias: Categoria[];
    contas: Conta[];
    onClose: () => void;
}) {
    const editando = recorrencia !== null;

    const form = useForm({
        descricao: recorrencia?.descricao ?? '',
        natureza: recorrencia?.natureza ?? '',
        categoria_id: recorrencia ? String(recorrencia.categoria_id) : '',
        conta_id: recorrencia?.conta_id ? String(recorrencia.conta_id) : '',
        valor_previsto: recorrencia?.valor_previsto ?? '',
        dia_vencimento: recorrencia ? String(recorrencia.dia_vencimento) : '',
        data_inicio: recorrencia?.data_inicio?.slice(0, 10) ?? hojeISO(),
        data_fim: recorrencia?.data_fim?.slice(0, 10) ?? '',
    });

    const categoriasFiltradas = categorias.filter((c) => c.natureza === form.data.natureza);

    function mudarNatureza(valor: string) {
        form.setData('natureza', valor);
        form.setData('categoria_id', ''); // reseta categoria ao trocar natureza
    }

    function submit() {
        const opts = { preserveScroll: true, onSuccess: onClose };
        if (editando) {
            form.put(update.url(recorrencia.id), opts);
        } else {
            form.post(store.url(), opts);
        }
    }

    return (
        <>
            <SheetHeader>
                <SheetTitle>{editando ? 'Editar recorrência' : 'Nova recorrência'}</SheetTitle>
                <SheetDescription>
                    Um lançamento por mês é gerado automaticamente a partir daqui.
                </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                        id="descricao"
                        value={form.data.descricao}
                        onChange={(e) => form.setData('descricao', e.target.value)}
                        placeholder="Salário, Aluguel, Mercado..."
                        autoComplete="off"
                    />
                    <InputError message={form.errors.descricao} />
                </div>

                <div className="grid gap-1.5">
                    <Label>Natureza</Label>
                    <Select value={form.data.natureza} onValueChange={mudarNatureza}>
                        <SelectTrigger>
                            <SelectValue placeholder="Receita ou despesa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.natureza} />
                </div>

                <div className="grid gap-1.5">
                    <Label>Categoria</Label>
                    <Select
                        value={form.data.categoria_id}
                        onValueChange={(v) => form.setData('categoria_id', v)}
                        disabled={form.data.natureza === ''}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    form.data.natureza === ''
                                        ? 'Escolha a natureza primeiro'
                                        : 'Selecione'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {categoriasFiltradas.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.categoria_id} />
                </div>

                <div className="grid gap-1.5">
                    <Label>Conta</Label>
                    <Select
                        value={form.data.conta_id}
                        onValueChange={(v) => form.setData('conta_id', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                            {contas.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.conta_id} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="valor_previsto">Valor previsto</Label>
                        <InputMoeda
                            id="valor_previsto"
                            value={form.data.valor_previsto}
                            onChange={(v) => form.setData('valor_previsto', v)}
                        />
                        <InputError message={form.errors.valor_previsto} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="dia_vencimento">Dia venc.</Label>
                        <Input
                            id="dia_vencimento"
                            type="number"
                            min={1}
                            max={31}
                            inputMode="numeric"
                            value={form.data.dia_vencimento}
                            onChange={(e) => form.setData('dia_vencimento', e.target.value)}
                            placeholder="10"
                        />
                        <InputError message={form.errors.dia_vencimento} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="data_inicio">Início</Label>
                        <Input
                            id="data_inicio"
                            type="date"
                            value={form.data.data_inicio}
                            onChange={(e) => form.setData('data_inicio', e.target.value)}
                        />
                        <InputError message={form.errors.data_inicio} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="data_fim">Fim (opcional)</Label>
                        <Input
                            id="data_fim"
                            type="date"
                            value={form.data.data_fim}
                            onChange={(e) => form.setData('data_fim', e.target.value)}
                        />
                        <InputError message={form.errors.data_fim} />
                    </div>
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