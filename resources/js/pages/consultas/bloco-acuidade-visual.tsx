import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ObsExame } from './bloco-obs';
import type { AcuidadeVisual, AVLinha } from './exames-tipos';

type Grupo = { od: AVLinha; oe: AVLinha; ao: AVLinha };

function LinhaAV({
    rotulo,
    value,
    onChange,
}: {
    rotulo: string;
    value: AVLinha;
    onChange: (v: AVLinha) => void;
}) {
    const set = (campo: keyof AVLinha, v: string) => onChange({ ...value, [campo]: v });

    return (
        <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-2">
            <span className="text-sm font-medium">{rotulo}</span>
            <Input
                aria-label={`${rotulo} VL`}
                value={value.vl}
                onChange={(e) => set('vl', e.target.value)}
                autoComplete="off"
            />
            <Input
                aria-label={`${rotulo} VP`}
                value={value.vp}
                onChange={(e) => set('vp', e.target.value)}
                autoComplete="off"
            />
            <Input
                aria-label={`${rotulo} PH`}
                value={value.ph}
                onChange={(e) => set('ph', e.target.value)}
                autoComplete="off"
            />
        </div>
    );
}

function GrupoAV({
    titulo,
    value,
    onChange,
}: {
    titulo: string;
    value: Grupo;
    onChange: (v: Grupo) => void;
}) {
    return (
        <div className="grid gap-2">
            <span className="text-sm font-medium">{titulo}</span>
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground">
                <span> </span>
                <span>VL</span>
                <span>VP</span>
                <span>PH</span>
            </div>
            <LinhaAV rotulo="OD" value={value.od} onChange={(v) => onChange({ ...value, od: v })} />
            <LinhaAV rotulo="OE" value={value.oe} onChange={(v) => onChange({ ...value, oe: v })} />
            <LinhaAV rotulo="AO" value={value.ao} onChange={(v) => onChange({ ...value, ao: v })} />
        </div>
    );
}

export function BlocoAcuidadeVisual({
    value,
    onChange,
}: {
    value: AcuidadeVisual;
    onChange: (v: AcuidadeVisual) => void;
}) {
    return (
        <div className="grid gap-4">
            <div className="grid gap-1.5 sm:max-w-xs">
                <Label htmlFor="av-optotipo" className="text-xs">
                    Optotipo
                </Label>
                <Input
                    id="av-optotipo"
                    value={value.optotipo}
                    onChange={(e) => onChange({ ...value, optotipo: e.target.value })}
                    autoComplete="off"
                />
            </div>

            <GrupoAV
                titulo="Sem correção (S/C)"
                value={value.sem_correcao}
                onChange={(v) => onChange({ ...value, sem_correcao: v })}
            />
            <GrupoAV
                titulo="Com correção (C/C)"
                value={value.com_correcao}
                onChange={(v) => onChange({ ...value, com_correcao: v })}
            />

            <ObsExame
                id="av-obs"
                value={value.observacoes}
                onChange={(v) => onChange({ ...value, observacoes: v })}
            />
        </div>
    );
}