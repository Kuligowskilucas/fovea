<?php

namespace App\Http\Controllers;

use App\Actions\Produto\ProcessarImagemProduto;
use App\Http\Requests\StoreProdutoRequest;
use App\Http\Requests\UpdateProdutoRequest;
use App\Models\CategoriaProduto;
use App\Models\Produto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdutoController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $produtos = Produto::query()
            ->with('categoria:id,nome')
            ->when($q !== '', fn ($query) => $query->where('nome', 'ilike', "%{$q}%"))
            ->orderBy('nome')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('produtos/index', [
            'produtos' => $produtos,
            'filters' => ['q' => $q],
        ]);
    }

    public function create()
    {
        return Inertia::render('produtos/create', [
            'categorias' => $this->categorias(),
        ]);
    }

    public function store(StoreProdutoRequest $request, ProcessarImagemProduto $imagens)
    {
        $dados = $request->validated();

        if ($request->hasFile('imagem')) {
            $dados['imagem'] = $imagens->salvar($request->file('imagem'));
        } else {
            unset($dados['imagem']);
        }

        Produto::create($dados);

        return redirect()
            ->route('produtos.index')
            ->with('success', 'Produto cadastrado com sucesso.');
    }

    public function edit(Produto $produto)
    {
        return Inertia::render('produtos/edit', [
            'produto' => $produto,
            'categorias' => $this->categorias(),
        ]);
    }

    public function update(UpdateProdutoRequest $request, Produto $produto, ProcessarImagemProduto $imagens)
    {
        $dados = $request->validated();

        if ($request->hasFile('imagem')) {
            $anterior = $produto->imagem;

            $dados['imagem'] = $imagens->salvar($request->file('imagem'));

            $imagens->remover($anterior);
        } else {
            // Sem arquivo novo no payload: mantém a imagem atual.
            unset($dados['imagem']);
        }

        $produto->update($dados);

        return redirect()
            ->route('produtos.index')
            ->with('success', 'Produto atualizado com sucesso.');
    }

    public function destroy(Produto $produto)
    {
        // Soft delete: o arquivo físico permanece, pro produto ser recuperável.
        $produto->delete();

        return redirect()
            ->route('produtos.index')
            ->with('success', 'Produto removido.');
    }

    /** @return Collection<int, CategoriaProduto> */
    private function categorias()
    {
        return CategoriaProduto::where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'nome']);
    }
}
