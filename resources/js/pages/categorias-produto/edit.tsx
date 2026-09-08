import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { edit, index, update } from '@/routes/categorias-produto';
import { index as produtosIndex } from '@/routes/produtos';
import { CategoriaFields   } from './categoria-form';
import type {Categoria, CategoriaFormData} from './categoria-form';

export default function CategoriaProdutoEdit({ categoria }: { categoria: Categoria }) {
    const form = useForm<CategoriaFormData>({
        nome: categoria.nome ?? '',
        ativo: categoria.ativo,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(update(categoria.id).url);
    }

    return (
        <>
            <Head title={`Editar — ${categoria.nome}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading variant="small" title="Editar categoria" description={categoria.nome} />

                <form onSubmit={submit} className="grid max-w-lg gap-8">
                    <CategoriaFields
                        data={form.data}
                        errors={form.errors}
                        onChange={form.setData}
                    />

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            Salvar alterações
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href={index()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CategoriaProdutoEdit.layout = (props: { categoria: Categoria }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: produtosIndex() },
        { title: 'Categorias', href: index() },
        { title: props.categoria.nome, href: edit(props.categoria.id) },
    ],
});
