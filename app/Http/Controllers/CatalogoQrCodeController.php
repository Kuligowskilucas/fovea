<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

/**
 * Tela autenticada com o QR code da vitrine pública, pra Pati divulgar.
 *
 * Não toca em model nenhum: só devolve a URL pública do catálogo, derivada da
 * própria rota (respeita APP_URL), pra que trocar de domínio não exija mexer
 * no front. O nome da ótica já chega pela prop compartilhada `name`.
 */
class CatalogoQrCodeController extends Controller
{
    public function index()
    {
        return Inertia::render('produtos/qrcode', [
            'url' => route('catalogo.index'),
        ]);
    }
}
