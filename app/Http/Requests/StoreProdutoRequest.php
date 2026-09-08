<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Acesso já é garantido pelo middleware 'auth' na rota.
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_produto_id' => ['required', Rule::exists('categorias_produto', 'id')],
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'preco' => ['nullable', 'numeric', 'min:0'], // nulo = sob consulta
            'ativo' => ['boolean'],
            'imagem' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'], // 5 MB (em KB)
        ];
    }

    public function attributes(): array
    {
        return [
            'categoria_produto_id' => 'categoria',
            'descricao' => 'descrição',
            'preco' => 'preço',
        ];
    }
}
