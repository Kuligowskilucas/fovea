import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { create, index, store } from '@/routes/categorias-produto';
import { index as produtosIndex } from '@/routes/produtos';
import { CategoriaFields  } from './categoria-form';
import type {CategoriaFormData} from './categoria-form';

export default function CategoriaProdutoCreate() {
    const form = useForm<CategoriaFormData>({
        nome: '',
        ativo: true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(store().url);
    }

    return (
        <>
            <Head title="Nova categoria" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="Nova categoria"
                    description="Agrupamento dos produtos do catálogo"
                />

                <form onSubmit={submit} className="grid max-w-lg gap-8">
                    <CategoriaFields
                        data={form.data}
                        errors={form.errors}
                        onChange={form.setData}
                    />

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            Salvar
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

CategoriaProdutoCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: produtosIndex() },
        { title: 'Categorias', href: index() },
        { title: 'Nova', href: create() },
    ],
};
