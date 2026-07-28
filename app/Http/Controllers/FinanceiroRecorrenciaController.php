<?php

namespace App\Http\Controllers;

use App\Actions\Financeiro\GerarLancamentosDaRecorrencia;
use App\Http\Requests\Financeiro\RecorrenciaRequest;
use App\Models\FinanceiroCategoria;
use App\Models\FinanceiroConta;
use App\Models\FinanceiroRecorrencia;
use Inertia\Inertia;

class FinanceiroRecorrenciaController extends Controller
{
    public function index()
    {
        return Inertia::render('financeiro/recorrencias', [
            'recorrencias' => FinanceiroRecorrencia::with([
                'categoria:id,natureza,nome',
                'conta:id,nome',
            ])->orderBy('descricao')->get(),
            'categorias' => FinanceiroCategoria::orderBy('natureza')
                ->orderBy('nome')
                ->get(['id', 'natureza', 'nome']),
            'contas' => FinanceiroConta::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(RecorrenciaRequest $request, GerarLancamentosDaRecorrencia $gerar)
    {
        $recorrencia = FinanceiroRecorrencia::create($request->validated());
        $gerar->handle($recorrencia);

        return back()->with('success', 'Recorrência criada e lançamentos gerados.');
    }

    public function update(
        RecorrenciaRequest $request,
        FinanceiroRecorrencia $recorrencia,
        GerarLancamentosDaRecorrencia $gerar,
    ) {
        $recorrencia->update($request->validated());
        $gerar->handle($recorrencia);

        return back()->with('success', 'Recorrência atualizada.');
    }
}