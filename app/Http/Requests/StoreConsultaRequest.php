<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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