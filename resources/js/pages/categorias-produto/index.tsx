import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import { dashboard } from '@/routes';
import { create, destroy, edit, index } from '@/routes/categorias-produto';
import { index as produtosIndex } from '@/routes/produtos';
import type { Categoria } from './categoria-form';

type CategoriaListada = Categoria & { produtos_count: number };

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

export default function CategoriasProdutoIndex({
    categorias,
}: {
    categorias: Paginated<CategoriaListada>;
}) {
    const confirm = useConfirm();

    async function remover(categoria: CategoriaListada) {
        const ok = await confirm({
            title: 'Remover categoria?',
            description: `"${categoria.nome}" deixará de aparecer no cadastro de produtos.`,
            confirmText: 'Remover',
            destructive: true,
        });

        if (!ok) {
return;
}

        // Categoria com produtos vinculados volta flash.error — o Toaster global
        // já exibe, então não há tratamento especial aqui.
        router.delete(destroy(categoria.id).url, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Categorias" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Categorias"
                        description="Agrupamento dos produtos do catálogo"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Nova
                        </Link>
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                    {categorias.total} categoria(s)
                </p>

                <div className="flex flex-col gap-2">
                    {categorias.data.length === 0 && (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Nenhuma categoria. Crie a primeira (ex.: Armações).
                        </p>
                    )}

                    {categorias.data.map((categoria) => (
                        <div
                            key={categoria.id}
                            className="flex items-center gap-3 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                        >
                            <div className="grid min-w-0 flex-1 gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-medium">{categoria.nome}</p>
                                    <Badge variant={categoria.ativo ? 'default' : 'secondary'}>
                                        {categoria.ativo ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {categoria.produtos_count} produto(s)
                                </p>
                            </div>

                            <Button size="sm" variant="ghost" asChild>
                                <Link
                                    href={edit(categoria.id)}
                                    aria-label={`Editar ${categoria.nome}`}
                                >
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => remover(categoria)}
                                aria-label={`Remover ${categoria.nome}`}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {categorias.links.length > 3 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {categorias.links.map((link, i) => (
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

CategoriasProdutoIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: produtosIndex() },
        { title: 'Categorias', href: index() },
    ],
};
