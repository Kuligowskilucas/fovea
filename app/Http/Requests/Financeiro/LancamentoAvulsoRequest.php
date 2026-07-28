<?php

namespace App\Http\Requests\Financeiro;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LancamentoAvulsoRequest extends FormRequest
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
                Rule::exists('financeiro_categorias', 'id')->where('natureza', $this->natureza),
            ],
            'conta_id' => ['required', Rule::exists('financeiro_contas', 'id')],
            'valor_previsto' => ['required', 'numeric', 'min:0'],
            'data_vencimento' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'descricao' => 'descrição',
            'categoria_id' => 'categoria',
            'conta_id' => 'conta',
            'valor_previsto' => 'valor',
            'data_vencimento' => 'data',
        ];
    }
}