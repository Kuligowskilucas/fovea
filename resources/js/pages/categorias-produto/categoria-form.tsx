import type { InertiaFormProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type Categoria = {
    id: number;
    nome: string;
    ativo: boolean;
};

/** Generic do useForm precisa de index signature — por isso type, não interface. */
export type CategoriaFormData = {
    nome: string;
    ativo: boolean;
};

type Errors = Partial<Record<keyof CategoriaFormData, string>>;

export function CategoriaFields({
    data,
    errors,
    onChange,
}: {
    data: CategoriaFormData;
    errors: Errors;
    onChange: InertiaFormProps<CategoriaFormData>['setData'];
}) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-1.5">
                <Label htmlFor="nome">
                    Nome
                    <span className="text-destructive"> *</span>
                </Label>
                <Input
                    id="nome"
                    value={data.nome}
                    onChange={(e) => onChange('nome', e.target.value)}
                    placeholder="Armações, Lentes, Óculos de sol..."
                    autoComplete="off"
                />
                <InputError message={errors.nome} />
            </div>

            <div className="flex items-center space-x-3">
                <Checkbox
                    id="ativo"
                    checked={data.ativo}
                    onCheckedChange={(marcado) => onChange('ativo', marcado === true)}
                />
                <Label htmlFor="ativo">Categoria ativa</Label>
            </div>
            <InputError message={errors.ativo} />
        </div>
    );
}
