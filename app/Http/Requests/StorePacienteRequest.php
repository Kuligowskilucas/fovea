<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePacienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Acesso já é garantido pelo middleware 'auth' na rota.
        return true;
    }

    public function rules(): array
    {
        return [
            'nome_completo' => ['required', 'string', 'max:255'],
            'nome_social' => ['nullable', 'string', 'max:255'],
            'data_nascimento' => ['nullable', 'date', 'before_or_equal:today'],
            'sexo' => ['nullable', 'in:masculino,feminino,outro'],
            'cpf' => ['nullable', 'string', 'max:14'],
            'rg' => ['nullable', 'string', 'max:20'],
            'ocupacao' => ['nullable', 'string', 'max:255'],

            'celular_whatsapp' => ['nullable', 'string', 'max:20'],
            'telefone_2' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],

            'origem' => ['nullable', 'string', 'max:255'],

            'responsavel_nome' => ['nullable', 'string', 'max:255'],
            'responsavel_cpf' => ['nullable', 'string', 'max:14'],

            'cep' => ['nullable', 'string', 'max:9'],
            'logradouro' => ['nullable', 'string', 'max:255'],
            'numero' => ['nullable', 'string', 'max:20'],
            'complemento' => ['nullable', 'string', 'max:255'],
            'bairro' => ['nullable', 'string', 'max:255'],
            'cidade' => ['nullable', 'string', 'max:255'],
            'uf' => ['nullable', 'string', 'size:2'],

            'observacoes' => ['nullable', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nome_completo' => 'nome completo',
            'nome_social' => 'nome social',
            'data_nascimento' => 'data de nascimento',
            'celular_whatsapp' => 'celular/WhatsApp',
            'telefone_2' => 'telefone 2',
            'responsavel_nome' => 'nome do responsável',
            'responsavel_cpf' => 'CPF do responsável',
            'observacoes' => 'observações',
        ];
    }
}