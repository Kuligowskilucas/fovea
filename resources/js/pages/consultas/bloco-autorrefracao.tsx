import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Autorrefracao, OlhoGrade } from './exames-tipos';

function LinhaOlho({
    rotulo,
    value,
    onChange,
}: {
    rotulo: string;
    value: OlhoGrade;
    onChange: (v: OlhoGrade) => void;
}) {
    const set = (campo: keyof OlhoGrade, v: string) => onChange({ ...value, [campo]: v });

    return (
        <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-2">
            <span className="text-sm font-medium">{rotulo}</span>
            <Input
                aria-label={`${rotulo} esférico`}
                value={value.esferico}
                onChange={(e) => set('esferico', e.target.value)}
                autoComplete="off"
            />
            <Input
                aria-label={`${rotulo} cilíndrico`}
                value={value.cilindrico}
                onChange={(e) => set('cilindrico', e.target.value)}
                autoComplete="off"
            />
            <Input
                aria-label={`${rotulo} eixo`}
                value={value.eixo}
                onChange={(e) => set('eixo', e.target.value)}
                autoComplete="off"
            />
        </div>
    );
}

export function BlocoAutorrefracao({
    value,
    onChange,
}: {
    value: Autorrefracao;
    onChange: (v: Autorrefracao) => void;
}) {
    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground">
                <span> </span>
                <span>Esférico</span>
                <span>Cilíndrico</span>
                <span>Eixo</span>
            </div>

            <LinhaOlho
                rotulo="OD"
                value={value.od}
                onChange={(v) => onChange({ ...value, od: v })}
            />
            <LinhaOlho
                rotulo="OE"
                value={value.oe}
                onChange={(v) => onChange({ ...value, oe: v })}
            />

            <div className="grid gap-1.5">
                <Label htmlFor="autorref-obs" className="text-xs">
                    Observações
                </Label>
                <textarea
                    id="autorref-obs"
                    value={value.observacoes}
                    onChange={(e) => onChange({ ...value, observacoes: e.target.value })}
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>
    );
}