<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaProdutoRequest;
use App\Http\Requests\UpdateCategoriaProdutoRequest;
use App\Models\CategoriaProduto;
use Inertia\Inertia;

class CategoriaProdutoController extends Controller
{
    public function index()
    {
        $categorias = CategoriaProduto::query()
            ->withCount('produtos')
            ->orderBy('nome')
            ->paginate(15);

        return Inertia::render('categorias-produto/index', [
            'categorias' => $categorias,
        ]);
    }

    public function create()
    {
        return Inertia::render('categorias-produto/create');
    }

    public function store(StoreCategoriaProdutoRequest $request)
    {
        CategoriaProduto::create($request->validated());

        return redirect()
            ->route('categorias-produto.index')
            ->with('success', 'Categoria cadastrada com sucesso.');
    }

    public function edit(CategoriaProduto $categoriaProduto)
    {
        return Inertia::render('categorias-produto/edit', [
            'categoria' => $categoriaProduto,
        ]);
    }

    public function update(UpdateCategoriaProdutoRequest $request, CategoriaProduto $categoriaProduto)
    {
        $categoriaProduto->update($request->validated());

        return redirect()
            ->route('categorias-produto.index')
            ->with('success', 'Categoria atualizada com sucesso.');
    }

    public function destroy(CategoriaProduto $categoriaProduto)
    {
        // O onDelete('restrict') do banco não barra soft delete: a linha continua
        // lá, só com deleted_at preenchido. Então o vínculo é checado aqui.
        if ($categoriaProduto->produtos()->exists()) {
            return back()->with('error', 'Categoria com produtos vinculados não pode ser removida.');
        }

        $categoriaProduto->delete();

        return redirect()
            ->route('categorias-produto.index')
            ->with('success', 'Categoria removida.');
    }
}
