<?php

namespace App\Http\Controllers;

use App\Http\Requests\SalvarExameRequest;
use App\Models\Consulta;

class ExameController extends Controller
{
    /**
     * Upsert do exame da consulta (relação 1:1). A médica salva/re-salva a
     * mesma ficha várias vezes durante o atendimento, então um único método
     * de upsert é mais natural que store/update separados.
     */
    public function salvar(SalvarExameRequest $request, Consulta $consulta)
    {
        $data = $request->validated();

        
        $consulta->exame()->updateOrCreate(
            [],
            ['dados' => $data['dados'] ?? []],
        );

        return back()->with('success', 'Exame salvo com sucesso.');
    }
}