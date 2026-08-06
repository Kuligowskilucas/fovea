<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePacienteArquivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Acesso já é garantido pelo middleware 'auth' na rota.
        return true;
    }

    public function rules(): array
    {
        return [
            'arquivo' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png,webp',
                'max:10240', // 10 MB (em KB)
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'arquivo' => 'arquivo',
        ];
    }
}