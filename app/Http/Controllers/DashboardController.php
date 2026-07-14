<?php

namespace App\Http\Controllers;

use App\Models\Consulta;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Fuso da clínica. `atendido_em` é wall-clock (a hora que a médica digitou),
     * e o app roda em UTC — então "hoje" precisa ser calculado aqui, senão
     * depois das 21h o servidor já viraria o dia.
     */
    private const TZ = 'America/Sao_Paulo';

    public function index()
    {
        $agora = now(self::TZ);
        $hoje = $agora->toDateString();
        $limiteRetorno = $agora->copy()->addDays(30)->toDateString();

        $consultasHoje = Consulta::query()
            ->with('paciente:id,nome_completo')
            ->whereDate('atendido_em', $hoje)
            ->orderBy('atendido_em')
            ->get(['id', 'paciente_id', 'atendido_em', 'procedimento']);

        $retornos = Consulta::query()
            ->with('paciente:id,nome_completo')
            ->whereNotNull('retorno_em')
            ->whereBetween('retorno_em', [$hoje, $limiteRetorno])
            ->orderBy('retorno_em')
            ->get(['id', 'paciente_id', 'retorno_em', 'procedimento']);

        return Inertia::render('dashboard', [
            'metricas' => [
                'atendimentos_hoje' => $consultasHoje->count(),
                'consultas_no_mes' => Consulta::whereYear('atendido_em', $agora->year)
                    ->whereMonth('atendido_em', $agora->month)
                    ->count(),
                'retornos_previstos' => $retornos->count(),
            ],
            'consultas_hoje' => $consultasHoje,
            'retornos' => $retornos,
        ]);
    }
}