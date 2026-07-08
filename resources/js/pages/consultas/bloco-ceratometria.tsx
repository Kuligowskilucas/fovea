import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Ceratometria } from './exames-tipos';

export function BlocoCeratometria({
    value,
    onChange,
}: {
    value: Ceratometria;
    onChange: (v: Ceratometria) => void;
}) {
    const set = (campo: keyof Ceratometria, v: string) => onChange({ ...value, [campo]: v });

    return (
        <div className="grid gap-4">
            <p className="text-xs text-muted-foreground">Técnica: AutoRefratômetro</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                    <Label htmlFor="cerato-od" className="text-xs">
                        OD
                    </Label>
                    <Input
                        id="cerato-od"
                        value={value.od}
                        onChange={(e) => set('od', e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="cerato-oe" className="text-xs">
                        OE
                    </Label>
                    <Input
                        id="cerato-oe"
                        value={value.oe}
                        onChange={(e) => set('oe', e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="cerato-miras" className="text-xs">
                        Miras
                    </Label>
                    <Input
                        id="cerato-miras"
                        value={value.miras}
                        onChange={(e) => set('miras', e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="cerato-obs" className="text-xs">
                    Observações
                </Label>
                <textarea
                    id="cerato-obs"
                    value={value.observacoes}
                    onChange={(e) => set('observacoes', e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>
    );
}