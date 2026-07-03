<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescricaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'medidas.*.cilindrico' => ['nullable', 'numeric', 'between:-99.99,99.99'],
            'medidas.*.eixo' => ['nullable', 'integer', 'between:0,180'],
            'medidas.*.av' => ['nullable', 'string', 'max:20'],
            'medidas.*.prisma' => ['nullable', 'string', 'max:50'],  
            'medidas.*.dnp' => ['nullable', 'numeric', 'between:0,999.9'], 
        ];
    }
}