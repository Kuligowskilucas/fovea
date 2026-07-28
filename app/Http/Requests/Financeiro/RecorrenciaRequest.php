<?php

namespace App\Http\Requests\Financeiro;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecorrenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descricao' => ['required', 'string', 'max:255'],
            'natureza' => ['required', Rule::in(['receita', 'despesa'])],
            'categoria_id' => [
                'required',
                // categoria precisa existir E pertencer à natureza escolhida
                Rule::exists('financeiro_categorias', 'id')->where('natureza', $this->natureza),
            ],
            'conta_id' => ['required', Rule::exists('financeiro_contas', 'id')],
            'valor_previsto' => ['required', 'numeric', 'min:0'],
            'dia_vencimento' => ['required', 'integer', 'between:1,31'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
        ];
    }

    public function attributes(): array
    {
        return [
            'descricao' => 'descrição',
            'categoria_id' => 'categoria',
            'conta_id' => 'conta',
            'valor_previsto' => 'valor previsto',
            'dia_vencimento' => 'dia de vencimento',
            'data_inicio' => 'data de início',
            'data_fim' => 'data de fim',
        ];
    }
}