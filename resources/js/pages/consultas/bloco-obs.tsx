import { Label } from '@/components/ui/label';

/** Campo de observações reutilizado pelos blocos de exame. `id` deve ser único. */
export function ObsExame({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id} className="text-xs">
                Observações
            </Label>
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
    );
}