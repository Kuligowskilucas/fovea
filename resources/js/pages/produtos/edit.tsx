import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ProdutoController from '@/actions/App/Http/Controllers/ProdutoController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { edit, index } from '@/routes/produtos';
import {
    ProdutoFields,
    dadosIniciais
    
    
    
} from './produto-form';
import type {Categoria, Produto, ProdutoFormData} from './produto-form';

export default function ProdutoEdit({
    produto,
    categorias,
}: {
    produto: Produto;
    categorias: Categoria[];
}) {
    const form = useForm<ProdutoFormData>(dadosIniciais(produto));

    function submit(e: FormEvent) {
        e.preventDefault();
        // Upload de arquivo não vai em PUT: o form() do Wayfinder devolve POST
        // com ?_method=PUT, que é o method spoofing que o Laravel espera.
        form.post(ProdutoController.update.form(produto.id).action, {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title={`Editar — ${produto.nome}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading variant="small" title="Editar produto" description={produto.nome} />

                <form onSubmit={submit} className="grid max-w-lg gap-8">
                    <ProdutoFields
                        data={form.data}
                        errors={form.errors}
                        categorias={categorias}
                        imagemAtual={produto.imagem}
                        onChange={form.setData}
                    />

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Salvando…' : 'Salvar alterações'}
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

ProdutoEdit.layout = (props: { produto: Produto }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Produtos', href: index() },
        { title: props.produto.nome, href: edit(props.produto.id) },
    ],
});
