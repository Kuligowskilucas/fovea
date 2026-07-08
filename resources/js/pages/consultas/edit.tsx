import { Form, Head, Link } from '@inertiajs/react';
import ConsultaController from '@/actions/App/Http/Controllers/ConsultaController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index } from '@/routes/pacientes';
import { show } from '@/routes/consultas';
import { ConsultaFields, type Consulta } from './consulta-form';

interface Props {
    consulta: Consulta & { paciente: { id: number; nome_completo: string } };
}

export default function ConsultaEdit({ consulta }: Props) {
    return (
        <>
            <Head title="Editar consulta" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title="Editar consulta"
                    description={consulta.paciente.nome_completo}
                />

                <Form {...ConsultaController.update.form(consulta.id)} className="grid gap-6">
                    {({ processing, errors }) => (
                        <>
                            <ConsultaFields consulta={consulta} errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Salvar
                                </Button>
                                <Button variant="secondary" asChild>
                                    <Link href={show(consulta.id)}>Cancelar</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ConsultaEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: 'Editar consulta', href: index() },
    ],
};