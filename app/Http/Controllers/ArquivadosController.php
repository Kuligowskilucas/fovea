<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use App\Models\Paciente;
use Inertia\Inertia;

class ArquivadosController extends Controller
{
    public function index()
    {
        $pacientes = Paciente::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'nome_completo', 'cpf', 'cidade', 'uf', 'deleted_at']);

        $consultas = Consulta::onlyTrashed()
            ->with(['paciente' => fn ($q) => $q->withTrashed()->select('id', 'nome_completo')])
            ->orderByDesc('deleted_at')
            ->get(['id', 'paciente_id', 'atendido_em', 'deleted_at']);

        return Inertia::render('arquivados/index', [
            'pacientes' => $pacientes,
            'consultas' => $consultas,
        ]);
    }
}