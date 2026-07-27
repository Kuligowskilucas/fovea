import { useState, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

/** Formata centavos como moeda pt-BR sem símbolo (100000 -> "1.000,00"). */
function centavosParaTexto(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** "1000.00" (valor do banco) -> centavos; vazio/null -> null. */
function valorInicialParaCentavos(valor: string | null | undefined): number | null {
    if (valor === null || valor === undefined || valor === '') return null;
    return Math.round(Number(valor) * 100);
}

export function CampoMoeda({
    id,
    name,
    defaultValue,
    placeholder,
}: {
    id: string;
    name: string;
    defaultValue?: string | null;
    placeholder?: string;
}) {
    const [centavos, setCentavos] = useState<number | null>(
        valorInicialParaCentavos(defaultValue),
    );

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const digitos = e.target.value.replace(/\D/g, '');
        setCentavos(digitos === '' ? null : parseInt(digitos, 10));
    }

    // Vai no submit: número com ponto decimal ("1000.00"); vazio -> null via middleware.
    const valorSubmit = centavos === null ? '' : (centavos / 100).toFixed(2);
    const textoVisivel = centavos === null ? '' : centavosParaTexto(centavos);

    return (
        <>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                value={textoVisivel}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
            />
            <input type="hidden" name={name} value={valorSubmit} />
        </>
    );
}