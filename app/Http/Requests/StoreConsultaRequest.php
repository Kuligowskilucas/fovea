<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'atendido_em' => ['required', 'date'],
            'procedimento' => ['nullable', 'string', 'max:255'],
            'retorno_em' => ['nullable', 'date'],
            'observacoes' => ['nullable', 'string'],
            'valor_pago' => ['nullable', 'numeric', 'min:0'],
            'forma_pagamento' => ['nullable', 'string', Rule::in(['dinheiro', 'pix', 'debito', 'credito', 'convenio'])],
        ];
    }

    public function attributes(): array
    {
        return [
            'atendido_em' => 'data do atendimento',
            'retorno_em' => 'data de retorno',
            'observacoes' => 'observações',
        ];
    }
}