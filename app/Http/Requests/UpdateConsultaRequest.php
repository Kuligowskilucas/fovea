<?php

namespace App\Http\Requests;
use Illuminate\Validation\Rule;

class UpdateConsultaRequest extends StoreConsultaRequest
{

public function rules(): array
    {
        return [
            'valor_pago' => ['nullable', 'numeric', 'min:0'],
            'forma_pagamento' => ['nullable', 'string', Rule::in(['dinheiro', 'pix', 'debito', 'credito', 'convenio'])],
        ];
    }
}