import { Input } from '@/components/ui/input';
import { ObsExame } from './bloco-obs';
import type { OlhoRetino, Retinoscopia } from './exames-tipos';

function LinhaRetino({
    rotulo,
    value,
    onChange,
}: {
    rotulo: string;
    value: OlhoRetino;
    onChange: (v: OlhoRetino) => void;
}) {
    return (
        <div className="grid grid-cols-[2.5rem_1fr_6rem] items-center gap-2">
            <span className="text-sm font-medium">{rotulo}</span>
            <Input
                aria-label={`${rotulo} retinoscopia`}
                value={value.valor}
                onChange={(e) => onChange({ ...value, valor: e.target.value })}
                autoComplete="off"
            />
            <Input
                aria-label={`${rotulo} AV`}
                value={value.av}
                onChange={(e) => onChange({ ...value, av: e.target.value })}
                autoComplete="off"
            />
        </div>
    );
}

/** Reutilizado para retinoscopia dinâmica e estática (estruturas idênticas). */
export function BlocoRetinoscopia({
    idPrefixo,
    value,
    onChange,
}: {
    idPrefixo: string;
    value: Retinoscopia;
    onChange: (v: Retinoscopia) => void;
}) {
    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-[2.5rem_1fr_6rem] gap-2 text-xs text-muted-foreground">
                <span> </span>
                <span>Retinoscopia</span>
                <span>AV</span>
            </div>

            <LinhaRetino
                rotulo="OD"
                value={value.od}
                onChange={(v) => onChange({ ...value, od: v })}
            />
            <LinhaRetino
                rotulo="OE"
                value={value.oe}
                onChange={(v) => onChange({ ...value, oe: v })}
            />

            <ObsExame
                id={`${idPrefixo}-obs`}
                value={value.observacoes}
                onChange={(v) => onChange({ ...value, observacoes: v })}
            />
        </div>
    );
}