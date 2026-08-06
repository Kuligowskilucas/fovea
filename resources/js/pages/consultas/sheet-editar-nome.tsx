import { useForm } from '@inertiajs/react';
import PacienteController from '@/actions/App/Http/Controllers/PacienteController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface Paciente {
    id: number;
    nome_completo: string;
}

export function SheetEditarNome({
    paciente,
    onClose,
}: {
    paciente: Paciente | null;
    onClose: () => void;
}) {
    return (
        <Sheet open={paciente !== null} onOpenChange={(aberto) => !aberto && onClose()}>
            <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-xl">
                {paciente && (
                    <Formulario key={paciente.id} paciente={paciente} onClose={onClose} />
                )}
            </SheetContent>
        </Sheet>
    );
}

function Formulario({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
    const form = useForm({
        nome_completo: paciente.nome_completo,
    });

    function submit() {
        form.put(PacienteController.atualizarNome.url(paciente.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <>
            <SheetHeader>
                <SheetTitle>Editar nome</SheetTitle>
                <SheetDescription>Corrija o nome completo do paciente.</SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="nome_completo">Nome completo</Label>
                    <Input
                        id="nome_completo"
                        value={form.data.nome_completo}
                        onChange={(e) => form.setData('nome_completo', e.target.value)}
                        autoComplete="off"
                        autoFocus
                    />
                    <InputError message={form.errors.nome_completo} />
                </div>
            </div>

            <SheetFooter>
                <Button onClick={submit} disabled={form.processing}>
                    Salvar
                </Button>
            </SheetFooter>
        </>
    );
}