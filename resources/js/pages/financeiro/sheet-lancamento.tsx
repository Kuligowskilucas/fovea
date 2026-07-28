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
import { store } from '@/routes/financeiro/lancamentos';

interface Categoria {
    id: number;
    natureza: 'receita' | 'despesa';
    nome: string;
}

interface Conta {
    id: number;
    nome: string;
}

export function SheetLancamento({
    aberto,
    dataPadrao,
    categorias,
    contas,
    onClose,
}: {
    aberto: boolean;
    dataPadrao: string;
    categorias: Categoria[];
    contas: Conta[];
    onClose: () => void;
}) {
    return (
        <Sheet open={aberto} onOpenChange={(a) => !a && onClose()}>
            <SheetContent
                side="bottom"
                className="mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-t-xl"
            >
                {aberto && (
                    <Formulario
                        key={dataPadrao}
                        dataPadrao={dataPadrao}
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
    dataPadrao,
    categorias,
    contas,
    onClose,
}: {
    dataPadrao: string;
    categorias: Categoria[];
    contas: Conta[];
    onClose: () => void;
}) {
    const form = useForm({
        descricao: '',
        natureza: '',
        categoria_id: '',
        conta_id: '',
        valor_previsto: '',
        data_vencimento: dataPadrao,
    });

    const categoriasFiltradas = categorias.filter((c) => c.natureza === form.data.natureza);

    function mudarNatureza(valor: string) {
        form.setData('natureza', valor);
        form.setData('categoria_id', '');
    }

    function submit() {
        form.post(store.url(), { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <>
            <SheetHeader>
                <SheetTitle>Novo lançamento</SheetTitle>
                <SheetDescription>Um gasto ou receita único, fora das recorrências.</SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                        id="descricao"
                        value={form.data.descricao}
                        onChange={(e) => form.setData('descricao', e.target.value)}
                        placeholder="Presente, conserto, extra..."
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
                    <Select value={form.data.conta_id} onValueChange={(v) => form.setData('conta_id', v)}>
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
                        <Label htmlFor="valor_previsto">Valor</Label>
                        <InputMoeda
                            id="valor_previsto"
                            value={form.data.valor_previsto}
                            onChange={(v) => form.setData('valor_previsto', v)}
                        />
                        <InputError message={form.errors.valor_previsto} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="data_vencimento">Data</Label>
                        <Input
                            id="data_vencimento"
                            type="date"
                            value={form.data.data_vencimento}
                            onChange={(e) => form.setData('data_vencimento', e.target.value)}
                        />
                        <InputError message={form.errors.data_vencimento} />
                    </div>
                </div>
            </div>

            <SheetFooter>
                <Button onClick={submit} disabled={form.processing}>
                    Criar
                </Button>
            </SheetFooter>
        </>
    );
}