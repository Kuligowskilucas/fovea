import { Form, Head, Link } from '@inertiajs/react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/pacientes';
import { PacienteFields } from './paciente-form';

export default function PacienteCreate() {
    return (
        <>
            <Head title="Novo paciente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading variant="small" title="Novo paciente" description="Cadastro de paciente" />

                <Form {...PacienteController.store.form()} className="grid gap-8">
                    {({ processing, errors }) => (
                        <>
                            <PacienteFields errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Salvar
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href={index()}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PacienteCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: 'Novo', href: create() },
    ],
};