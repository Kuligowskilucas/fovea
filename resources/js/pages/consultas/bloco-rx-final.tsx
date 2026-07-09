import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ObsExame } from './bloco-obs';
import type { OlhoRxGrade, RxFinal } from './exames-tipos';

function LinhaRx({
    rotulo,
    value,
    onChange,
}: {
    rotulo: string;
    value: OlhoRxGrade;
    onChange: (v: OlhoRxGrade) => void;
}) {
    const set = (campo: keyof OlhoRxGrade, v: string) => onChange({ ...value, [campo]: v });

    return (
        <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr] items-center gap-2">
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
            <Input
                aria-label={`${rotulo} AV`}
                value={value.av}
                onChange={(e) => set('av', e.target.value)}
                autoComplete="off"
            />
        </div>
    );
}

export function BlocoRxFinal({
    value,
    onChange,
}: {
    value: RxFinal;
    onChange: (v: RxFinal) => void;
}) {
    const set = (campo: keyof RxFinal, v: string) => onChange({ ...value, [campo]: v });

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground">
                    <span> </span>
                    <span>Esférico</span>
                    <span>Cilíndrico</span>
                    <span>Eixo</span>
                    <span>AV</span>
                </div>
                <LinhaRx
                    rotulo="OD"
                    value={value.od}
                    onChange={(v) => onChange({ ...value, od: v })}
                />
                <LinhaRx
                    rotulo="OE"
                    value={value.oe}
                    onChange={(v) => onChange({ ...value, oe: v })}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="rx-adicao" className="text-xs">
                        Adição
                    </Label>
                    <Input
                        id="rx-adicao"
                        value={value.adicao}
                        onChange={(e) => set('adicao', e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="rx-av-perto" className="text-xs">
                        AV Perto
                    </Label>
                    <Input
                        id="rx-av-perto"
                        value={value.av_perto}
                        onChange={(e) => set('av_perto', e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="rx-tipo-lente" className="text-xs">
                        Tipo lente
                    </Label>
                    <textarea
                        id="rx-tipo-lente"
                        value={value.tipo_lente}
                        onChange={(e) => set('tipo_lente', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="rx-tratamento" className="text-xs">
                        Tratamento
                    </Label>
                    <textarea
                        id="rx-tratamento"
                        value={value.tratamento}
                        onChange={(e) => set('tratamento', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <ObsExame
                id="rx-obs"
                value={value.observacoes}
                onChange={(v) => set('observacoes', v)}
            />
        </div>
    );
}