import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CampoMoeda } from './campo-moeda';

export interface Consulta {
    id: number;
    atendido_em: string | null;
    procedimento: string | null;
    retorno_em: string | null;
    observacoes: string | null;
    valor_pago: string | null;
    forma_pagamento: string | null;
}

type Errors = Partial<Record<string, string>>;

/** Data/hora local no formato aceito por <input type="datetime-local"> (YYYY-MM-DDTHH:MM). */
function agoraLocal(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function Campo({ label, name, error, children, className, obrigatorio }: {
    label: string;
    name: string;
    error?: string;
    children: ReactNode;
    className?: string;
    obrigatorio?: boolean;
}) {
    return (
        <div className={`grid gap-1.5 ${className ?? ''}`}>
            <Label htmlFor={name}>
                {label}
                {obrigatorio && <span className="text-destructive"> *</span>}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export function ConsultaFields({ consulta, errors,}: { consulta?: Consulta; errors: Errors;}) {
    
    const atendidoDefault = consulta?.atendido_em ? consulta.atendido_em.slice(0, 16) : agoraLocal();

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Campo
                label="Data e hora do atendimento"
                name="atendido_em"
                error={errors.atendido_em}
                obrigatorio
            >
                <Input
                    id="atendido_em"
                    name="atendido_em"
                    type="datetime-local"
                    defaultValue={atendidoDefault}
                    required
                />
            </Campo>

            <Campo label="Procedimento" name="procedimento" error={errors.procedimento}>
                <Input
                    id="procedimento"
                    name="procedimento"
                    defaultValue={consulta?.procedimento ?? ''}
                    placeholder="Consulta"
                    autoComplete="off"
                />
            </Campo>

            <Campo label="Retorno em" name="retorno_em" error={errors.retorno_em}>
                <Input
                    id="retorno_em"
                    name="retorno_em"
                    type="date"
                    defaultValue={consulta?.retorno_em ? consulta.retorno_em.slice(0, 10) : ''}
                />
            </Campo>

            <Campo label="Valor pago (R$)" name="valor_pago" error={errors.valor_pago}>
                <CampoMoeda
                    id="valor_pago"
                    name="valor_pago"
                    defaultValue={consulta?.valor_pago}
                    placeholder="0,00"
                />
            </Campo>

            <Campo label="Forma de pagamento" name="forma_pagamento" error={errors.forma_pagamento}>
                <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    defaultValue={consulta?.forma_pagamento ?? ''}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">—</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                    <option value="debito">Cartão de débito</option>
                    <option value="credito">Cartão de crédito</option>
                    <option value="convenio">Convênio</option>
                </select>
            </Campo>

            <Campo
                label="Observações"
                name="observacoes"
                error={errors.observacoes}
                className="sm:col-span-2"
            >
                <textarea
                    id="observacoes"
                    name="observacoes"
                    defaultValue={consulta?.observacoes ?? ''}
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </Campo>
        </div>
    );
}