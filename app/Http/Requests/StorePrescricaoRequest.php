<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescricaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normaliza a entrada antes da validação:
     * - vírgula decimal vira ponto ("-1,25" => "-1.25");
     * - sinal "+" e espaços são removidos ("+0.50" => "0.50");
     * - o cilíndrico é sempre gravado em notação negativa.
     */
    protected function prepareForValidation(): void
    {
        $medidas = $this->input('medidas');

        if (is_array($medidas)) {
            $medidas = array_map(function ($medida) {
                if (! is_array($medida)) {
                    return $medida;
                }

                $medida['esferico'] = $this->numero($medida['esferico'] ?? null);
                $medida['cilindrico'] = $this->negativo($medida['cilindrico'] ?? null);
                $medida['eixo'] = $this->numero($medida['eixo'] ?? null);
                $medida['dnp'] = $this->numero($medida['dnp'] ?? null);

                return $medida;
            }, $medidas);
        }

        $this->merge([
            'adicao' => $this->numero($this->input('adicao')),
            'medidas' => $medidas,
        ]);
    }

    private function numero(mixed $valor): ?string
    {
        if (is_null($valor)) {
            return null;
        }

        $valor = str_replace([' ', '+'], '', str_replace(',', '.', (string) $valor));

        return $valor === '' ? null : $valor;
    }

    private function negativo(mixed $valor): ?string
    {
        $valor = $this->numero($valor);

        if (is_null($valor) || ! is_numeric($valor)) {
            return $valor;
        }

        $float = (float) $valor;

        return $float == 0.0 ? '0' : (string) (-abs($float));
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', 'in:oculos,lente_contato'],
            'tipo_visao' => ['nullable', 'required_if:tipo,oculos', 'in:longe,longe_perto'],
            'adicao' => ['nullable', 'numeric', 'between:-99.99,99.99'],
            'lente' => ['nullable', 'string', 'max:255'],
            'retorno_em' => ['nullable', 'date'],
            'observacoes' => ['nullable', 'string'],

            'medidas' => ['required', 'array', 'size:2'],
            'medidas.*.olho' => ['required', 'in:OD,OE'],
            'medidas.*.esferico' => ['nullable', 'numeric', 'between:-99.99,99.99'],
            'medidas.*.cilindrico' => ['nullable', 'numeric', 'lte:0', 'between:-99.99,99.99'],
            'medidas.*.eixo' => ['nullable', 'integer', 'between:0,180'],
            'medidas.*.av' => ['nullable', 'string', 'max:20'],
            'medidas.*.prisma' => ['nullable', 'string', 'max:50'],
            'medidas.*.dnp' => ['nullable', 'numeric', 'between:0,999.9'],
        ];
    }
}