<?php

return [
    /*
    | Rodapé de preço da vitrine pública. Igual pra todo item, por isso config
    | e não coluna no banco.
    */
    'rodape_preco' => env('CATALOGO_RODAPE_PRECO', 'Valor da armação, lente a consultar'),

    'whatsapp' => [
        // Número no formato internacional, só dígitos (ex.: 5541999998888).
        'numero' => env('CATALOGO_WHATSAPP_NUMERO', ''),

        // {nome} é substituído pelo nome do produto na hora do clique.
        'mensagem' => env(
            'CATALOGO_WHATSAPP_MENSAGEM',
            'Olá! Tenho interesse na armação {nome}.',
        ),
    ],
];
