import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ProdutoController from '@/actions/App/Http/Controllers/ProdutoController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/produtos';
import {
    ProdutoFields,
    dadosIniciais
    
    
} from './produto-form';
import type {Categoria, ProdutoFormData} from './produto-form';

export default function ProdutoCreate({ categorias }: { categorias: Categoria[] }) {
    const form = useForm<ProdutoFormData>(dadosIniciais());

    function submit(e: FormEvent) {
        e.preventDefault();
        // forceFormData: o payload carrega File; o Inertia precisa de multipart.
        form.post(ProdutoController.store.url(), { forceFormData: true });
    }

    return (
        <>
            <Head title="Novo produto" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="Novo produto"
                    description="Cadastro no catálogo"
                />

                <form onSubmit={submit} className="grid max-w-lg gap-8">
                    <ProdutoFields
                        data={form.data}
                        errors={form.errors}
                        categorias={categorias}
                        onChange={form.setData}
                    />

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Salvando…' : 'Salvar'}
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

ProdutoCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: index() },
        { title: 'Novo', href: create() },
    ],
};
