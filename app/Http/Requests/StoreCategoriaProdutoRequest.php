<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoriaProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Acesso já é garantido pelo middleware 'auth' na rota.
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'ativo' => ['boolean'],
        ];
    }
}
