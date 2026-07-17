import { Form, Head, Link } from '@inertiajs/react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index, show, edit } from '@/routes/pacientes';
import { PacienteFields, type Paciente } from './paciente-form';

export default function PacienteEdit({ paciente }: { paciente: Paciente }) {
    return (
        <>
            <Head title={`Editar — ${paciente.nome_completo}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading variant="small" title="Editar paciente" description={paciente.nome_completo} />

                <Form {...PacienteController.update.form(paciente.id)} className="grid gap-8">
                    {({ processing, errors }) => (
                        <>
                            <PacienteFields paciente={paciente} errors={errors} />

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Salvar alterações
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

PacienteEdit.layout = (props: { paciente: Paciente }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pacientes', href: index() },
        { title: props.paciente.nome_completo, href: show(props.paciente.id) },
        { title: 'Editar', href: edit(props.paciente.id) },
    ],
});