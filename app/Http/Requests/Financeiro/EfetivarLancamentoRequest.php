<?php

namespace App\Http\Requests\Financeiro;

use Illuminate\Foundation\Http\FormRequest;

class EfetivarLancamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'valor_efetivado' => ['nullable', 'numeric', 'min:0'],
            'efetivado_em' => ['nullable', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'valor_efetivado' => 'valor efetivado',
            'efetivado_em' => 'data de efetivação',
        ];
    }
}