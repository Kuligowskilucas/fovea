<?php

namespace App\Http\Controllers;

use App\Http\Requests\Financeiro\ContaRequest;
use App\Models\FinanceiroConta;
use Inertia\Inertia;

class FinanceiroContaController extends Controller
{
    public function index()
    {
        return Inertia::render('financeiro/contas', [
            'contas' => FinanceiroConta::orderBy('nome')->get(),
        ]);
    }

    public function store(ContaRequest $request)
    {
        FinanceiroConta::create($request->validated());

        return back()->with('success', 'Conta criada.');
    }

    public function update(ContaRequest $request, FinanceiroConta $conta)
    {
        $conta->update($request->validated());

        return back()->with('success', 'Conta atualizada.');
    }
}