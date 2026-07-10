<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use App\Models\Paciente;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $ultimasConsultas = Consulta::query()
            ->with('paciente:id,nome_completo')
            ->whereNotNull('atendido_em')
            ->latest('atendido_em')
            ->take(5)
            ->get(['id', 'paciente_id', 'atendido_em', 'procedimento']);

        return Inertia::render('dashboard', [
            'metricas' => [
                'total_pacientes' => Paciente::count(),
                'total_consultas' => Consulta::count(),
                'consultas_no_mes' => Consulta::whereYear('atendido_em', now()->year)
                    ->whereMonth('atendido_em', now()->month)
                    ->count(),
            ],
            'ultimas_consultas' => $ultimasConsultas,
        ]);
    }
}