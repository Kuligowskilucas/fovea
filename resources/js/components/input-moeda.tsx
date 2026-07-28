import { type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

/** "1000.00" (reais) -> centavos; "" -> null. */
function paraCentavos(reais: string): number | null {
    if (reais === '') return null;
    return Math.round(Number(reais) * 100);
}

function centavosTexto(centavos: number | null): string {
    if (centavos === null) return '';
    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Input de moeda controlado. `value` é a string canônica em reais ("1000.00" | "")
 * pronta pra ir no submit; a digitação é por centavos (só dígitos).
 */
export function InputMoeda({
    id,
    value,
    onChange,
    placeholder = '0,00',
}: {
    id?: string;
    value: string;
    onChange: (reais: string) => void;
    placeholder?: string;
}) {
    function handle(e: ChangeEvent<HTMLInputElement>) {
        const digitos = e.target.value.replace(/\D/g, '');
        if (digitos === '') {
            onChange('');
            return;
        }
        onChange((parseInt(digitos, 10) / 100).toFixed(2));
    }

    return (
        <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={centavosTexto(paraCentavos(value))}
            onChange={handle}
            placeholder={placeholder}
            autoComplete="off"
        />
    );
}