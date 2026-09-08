<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProduto;
use App\Models\Produto;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Vitrine pública do catálogo — a ÚNICA rota do sistema fora do auth.
 *
 * Toca apenas CategoriaProduto e Produto. O payload é montado campo a campo,
 * então uma coluna nova nessas tabelas não vaza pra internet por acidente.
 */
class CatalogoPublicoController extends Controller
{
    public function index()
    {
        $categorias = CategoriaProduto::query()
            ->where('ativo', true)
            ->whereHas('produtos', fn ($query) => $query->where('ativo', true))
            ->with([
                'produtos' => fn ($query) => $query
                    ->where('ativo', true)
                    ->orderBy('nome')
                    // categoria_produto_id só existe pra casar o eager load;
                    // não chega no payload por causa do map() abaixo.
                    ->select('id', 'categoria_produto_id', 'nome', 'descricao', 'preco', 'imagem'),
            ])
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return Inertia::render('catalogo/index', [
            'categorias' => $categorias->map(fn (CategoriaProduto $categoria) => [
                'id' => $categoria->id,
                'nome' => $categoria->nome,
                'produtos' => $categoria->produtos
                    ->map(fn (Produto $produto) => [
                        'id' => $produto->id,
                        'nome' => $produto->nome,
                        'descricao' => $produto->descricao,
                        'preco' => $produto->preco, // null = sob consulta
                        // Arquivo estático servido pelo nginx via storage:link.
                        'imagem' => $produto->imagem
                            ? Storage::disk('public')->url($produto->imagem)
                            : null,
                    ])
                    ->values(),
            ])->values(),

            'rodape_preco' => config('catalogo.rodape_preco'),

            'whatsapp' => [
                'numero' => preg_replace('/\D/', '', (string) config('catalogo.whatsapp.numero')),
                'mensagem' => config('catalogo.whatsapp.mensagem'),
            ],
        ]);
    }
}
