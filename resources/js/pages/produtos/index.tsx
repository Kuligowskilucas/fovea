import { Head, Link, router } from '@inertiajs/react';
import { ImageOff, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState  } from 'react';
import type {FormEvent} from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirm } from '@/hooks/use-confirm';
import { dashboard } from '@/routes';
import { index as categoriasIndex } from '@/routes/categorias-produto';
import { create, destroy, edit, index } from '@/routes/produtos';
import { urlDaImagem } from './produto-form';

type ProdutoListado = {
    id: number;
    nome: string;
    preco: string | null;
    imagem: string | null;
    ativo: boolean;
    categoria: { id: number; nome: string } | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

function moeda(valor: string | null): string {
    if (valor === null) {
return 'Sob consulta';
}

    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProdutosIndex({
    produtos,
    filters,
}: {
    produtos: Paginated<ProdutoListado>;
    filters: { q: string };
}) {
    const [q, setQ] = useState(filters.q ?? '');
    const confirm = useConfirm();

    function buscar(e: FormEvent) {
        e.preventDefault();
        router.get(index.url(), { q }, { preserveState: true, replace: true });
    }

    async function remover(produto: ProdutoListado) {
        const ok = await confirm({
            title: 'Remover produto?',
            description: `"${produto.nome}" deixará de aparecer no catálogo.`,
            confirmText: 'Remover',
            destructive: true,
        });

        if (!ok) {
return;
}

        router.delete(destroy(produto.id).url, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Produtos" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Produtos"
                        description="Catálogo de armações e acessórios"
                    />
                    <div className="flex gap-2">
                        <Button variant="secondary" asChild>
                            <Link href={categoriasIndex()}>
                                <Tags className="size-4" />
                                Categorias
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                Novo
                            </Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={buscar} className="flex gap-2">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por nome"
                        className="max-w-md"
                    />
                    <Button type="submit" variant="secondary">
                        Buscar
                    </Button>
                </form>

                <p className="text-sm text-muted-foreground">{produtos.total} produto(s)</p>

                <div className="flex flex-col gap-2">
                    {produtos.data.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhum produto encontrado.
                        </p>
                    )}

                    {produtos.data.map((produto) => (
                        <div
                            key={produto.id}
                            className="flex items-center gap-3 rounded-xl border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                        >
                            {produto.imagem ? (
                                <img
                                    src={urlDaImagem(produto.imagem)}
                                    alt=""
                                    loading="lazy"
                                    className="size-14 shrink-0 rounded-lg border object-cover"
                                />
                            ) : (
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                    <ImageOff className="size-5" />
                                </span>
                            )}

                            <div className="grid min-w-0 flex-1 gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-medium">{produto.nome}</p>
                                    {!produto.ativo && <Badge variant="secondary">Inativo</Badge>}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                    {produto.categoria?.nome ?? 'Sem categoria'}
                                </p>
                                <p
                                    className={`text-sm ${
                                        produto.preco === null
                                            ? 'text-muted-foreground italic'
                                            : 'font-medium'
                                    }`}
                                >
                                    {moeda(produto.preco)}
                                </p>
                            </div>

                            <Button size="sm" variant="ghost" asChild>
                                <Link href={edit(produto.id)} aria-label={`Editar ${produto.nome}`}>
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => remover(produto)}
                                aria-label={`Remover ${produto.nome}`}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {produtos.links.length > 3 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {produtos.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={[
                                    'rounded-md px-3 py-1 text-sm',
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                    !link.url ? 'pointer-events-none opacity-50' : '',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ProdutosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: index() },
    ],
};
