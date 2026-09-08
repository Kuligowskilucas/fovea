<?php

namespace App\Http\Requests;

class UpdateProdutoRequest extends StoreProdutoRequest
{
    // Mesmas regras do store. A imagem continua opcional: quando não vier no
    // payload, o controller preserva a atual em vez de sobrescrever com null.
}
