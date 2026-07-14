import { useState } from 'react';
import { Input } from '@/components/ui/input';

/** Mantém apenas dígitos e um separador decimal, normalizando vírgula em ponto. */
export function limparNumero(entrada: string): string {
    const semLixo = entrada.replace(',', '.').replace(/[^\d.]/g, '');
    const [inteiro, ...resto] = semLixo.split('.');
    return resto.length ? `${inteiro}.${resto.join('')}` : inteiro;
}

type DioptriaProps = {
    id: string;
    value: string;
    onChange: (v: string) => void;
    /** 'toggle': o sinal é escolhido no botão. 'negativo': sinal fixo em −, não editável. */
    sinal: 'toggle' | 'negativo';
};

/**
 * Campo de dioptria. O teclado numérico do iOS não tem as teclas + e −,
 * então o sinal fica num botão à esquerda em vez de ser digitado.
 * O input é type="text" de propósito: type="number" rejeita "+0.50".
 */
export function CampoDioptria({ id, value, onChange, sinal }: DioptriaProps) {
    const fixo = sinal === 'negativo';
    const [negativo, setNegativo] = useState(fixo || value.trim().startsWith('-'));

    const magnitude = value.replace(/[+-]/g, '');

    function emitir(mag: string, neg: boolean) {
        onChange(mag === '' ? '' : `${neg ? '-' : '+'}${mag}`);
    }

    function aoDigitar(bruto: string) {
        // se o sinal vier digitado ou colado (desktop), ele vale
        let neg = negativo;
        if (!fixo) {
            if (bruto.includes('-')) neg = true;
            else if (bruto.includes('+')) neg = false;
            setNegativo(neg);
        }
        emitir(limparNumero(bruto), neg);
    }

    function alternarSinal() {
        if (fixo) return;
        const neg = !negativo;
        setNegativo(neg);
        emitir(magnitude, neg);
    }

    function aoSair() {
        if (magnitude === '') return;
        const n = Number(magnitude);
        if (Number.isNaN(n)) return;
        emitir(n.toFixed(2), negativo);
    }

    return (
        <div className="flex">
            <button
                type="button"
                onClick={alternarSinal}
                disabled={fixo}
                aria-label={fixo ? 'Sinal negativo (fixo)' : 'Alternar sinal'}
                className="flex w-10 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-input text-sm font-medium text-muted-foreground transition-colors disabled:cursor-default disabled:bg-muted enabled:hover:bg-muted"
            >
                {negativo ? '−' : '+'}
            </button>
            <Input
                id={id}
                type="text"
                inputMode="decimal"
                className="rounded-l-none"
                value={magnitude}
                onChange={(e) => aoDigitar(e.target.value)}
                onBlur={aoSair}
                autoComplete="off"
            />
        </div>
    );
}

type NumeroProps = {
    id: string;
    value: string;
    onChange: (v: string) => void;
    /** true = aceita casas decimais (DNP); false = só inteiro (eixo). */
    decimal?: boolean;
};

/** Campo numérico sem sinal (eixo, DNP). Também type="text" para evitar o validador nativo. */
export function CampoNumero({ id, value, onChange, decimal = false }: NumeroProps) {
    return (
        <Input
            id={id}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={value}
            onChange={(e) =>
                onChange(decimal ? limparNumero(e.target.value) : e.target.value.replace(/\D/g, ''))
            }
            autoComplete="off"
        />
    );
}