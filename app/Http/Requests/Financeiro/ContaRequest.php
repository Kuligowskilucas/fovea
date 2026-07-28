<?php

namespace App\Http\Requests\Financeiro;

use Illuminate\Foundation\Http\FormRequest;

class ContaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'saldo_inicial' => ['required', 'numeric'],
            'data_inicial' => ['required', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'saldo_inicial' => 'saldo inicial',
            'data_inicial' => 'data inicial',
        ];
    }
}