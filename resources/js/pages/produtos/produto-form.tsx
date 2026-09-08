import type { InertiaFormProps } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef  } from 'react';
import type {ChangeEvent} from 'react';
import InputError from '@/components/input-error';
import { InputMoeda } from '@/components/input-moeda';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type Categoria = {
    id: number;
    nome: string;
};

export type Produto = {
    id: number;
    categoria_produto_id: number;
    nome: string;
    descricao: string | null;
    preco: string | null;
    imagem: string | null;
    ativo: boolean;
};

/** Generic do useForm precisa de index signature — por isso type, não interface. */
export type ProdutoFormData = {
    categoria_produto_id: string;
    nome: string;
    descricao: string;
    preco: string;
    ativo: boolean;
    imagem: File | null;
};

type Errors = Partial<Record<keyof ProdutoFormData, string>>;

/** URL pública de um caminho gravado no disco `public`. */
export function urlDaImagem(caminho: string): string {
    return `/storage/${caminho}`;
}

/**
 * Estado inicial do form. Campos que o ConvertEmptyStringsToNull zera voltam do
 * banco como null e precisam virar '' — senão o input vira não-controlado.
 */
export function dadosIniciais(produto?: Produto): ProdutoFormData {
    return {
        categoria_produto_id: produto ? String(produto.categoria_produto_id) : '',
        nome: produto?.nome ?? '',
        descricao: produto?.descricao ?? '',
        preco: produto?.preco ?? '',
        ativo: produto?.ativo ?? true,
        imagem: null,
    };
}

export function ProdutoFields({
    data,
    errors,
    categorias,
    imagemAtual,
    onChange,
}: {
    data: ProdutoFormData;
    errors: Errors;
    categorias: Categoria[];
    imagemAtual?: string | null;
    onChange: InertiaFormProps<ProdutoFormData>['setData'];
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const preview = useMemo(
        () => (data.imagem ? URL.createObjectURL(data.imagem) : null),
        [data.imagem],
    );

    // objectURL precisa ser revogado, senão vaza a cada troca de arquivo.
    useEffect(() => {
        if (!preview) {
            return;
        }

        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
        onChange('imagem', e.target.files?.[0] ?? null);
    }

    function limparEscolha() {
        onChange('imagem', null);

        if (inputRef.current) {
inputRef.current.value = '';
}
    }

    const mostrando = preview ?? (imagemAtual ? urlDaImagem(imagemAtual) : null);

    return (
        <div className="grid gap-4">
            <div className="grid gap-1.5">
                <Label htmlFor="nome">
                    Nome
                    <span className="text-destructive"> *</span>
                </Label>
                <Input
                    id="nome"
                    value={data.nome}
                    onChange={(e) => onChange('nome', e.target.value)}
                    placeholder="Armação redonda acetato"
                    autoComplete="off"
                />
                <InputError message={errors.nome} />
            </div>

            <div className="grid gap-1.5">
                <Label>
                    Categoria
                    <span className="text-destructive"> *</span>
                </Label>
                <Select
                    value={data.categoria_produto_id}
                    onValueChange={(v) => onChange('categoria_produto_id', v)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {categorias.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.categoria_produto_id} />
                {categorias.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma categoria ativa. Cadastre uma antes de criar o produto.
                    </p>
                )}
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                    id="descricao"
                    value={data.descricao}
                    onChange={(e) => onChange('descricao', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <InputError message={errors.descricao} />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="preco">Preço</Label>
                <InputMoeda
                    id="preco"
                    value={data.preco}
                    onChange={(v) => onChange('preco', v)}
                />
                <p className="text-xs text-muted-foreground">
                    Deixe em branco para exibir “Sob consulta”.
                </p>
                <InputError message={errors.preco} />
            </div>

            <div className="grid gap-1.5">
                <Label>Imagem</Label>

                {mostrando && (
                    <div className="relative w-fit">
                        <img
                            src={mostrando}
                            alt="Pré-visualização do produto"
                            className="size-32 rounded-xl border object-cover"
                        />
                        {data.imagem && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={limparEscolha}
                                aria-label="Descartar imagem escolhida"
                                className="absolute -top-2 -right-2 size-7 rounded-full p-0"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                )}

                <input
                    ref={inputRef}
                    id="imagem"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={aoEscolher}
                />

                <Button
                    type="button"
                    variant="secondary"
                    className="w-fit"
                    onClick={() => inputRef.current?.click()}
                >
                    <ImagePlus className="size-4" />
                    {mostrando ? 'Trocar imagem' : 'Escolher imagem'}
                </Button>

                {imagemAtual && !data.imagem && (
                    <p className="text-xs text-muted-foreground">
                        Imagem atual mantida se você não escolher outra.
                    </p>
                )}
                <InputError message={errors.imagem} />
            </div>

            <div className="flex items-center space-x-3">
                <Checkbox
                    id="ativo"
                    checked={data.ativo}
                    onCheckedChange={(marcado) => onChange('ativo', marcado === true)}
                />
                <Label htmlFor="ativo">Produto ativo</Label>
            </div>
            <InputError message={errors.ativo} />
        </div>
    );
}
