import { Form, Head, Link } from '@inertiajs/react';
import ConsultaController from '@/actions/App/Http/Controllers/ConsultaController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index, show } from '@/routes/pacientes';
import { ConsultaFields } from './consulta-form';

interface Props {
    paciente: { id: number; nome_completo: string };
}

export default function ConsultaCreate({ paciente }: Props) {
    return (
        <>
            <Head title="Nova consulta" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="Nova consulta"
                    description={paciente.nome_completo}
                />

                <Form {...ConsultaController.store.form(paciente.id)} className="grid gap-6">
                    {({ processing, errors }) => (
                        <>
                            <ConsultaFields errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Salvar
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href={show(paciente.id)}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ConsultaCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: 'Nova consulta', href: index() },
    ],
};