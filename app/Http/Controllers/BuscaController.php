<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuscaController extends Controller
{
    /**
     * Busca rápida do header. Responde JSON puro (não Inertia) — é consumida
     * via fetch pelo componente de autocomplete.
     */
    public function pacientes(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $like = '%'.$q.'%';

        $pacientes = Paciente::query()
            ->where(fn ($sub) => $sub
                ->where('nome_completo', 'ilike', $like)
                ->orWhere('nome_social', 'ilike', $like)
                ->orWhere('cpf', 'ilike', $like)
            )
            ->orderBy('nome_completo')
            ->limit(8)
            ->get(['id', 'nome_completo', 'nome_social', 'cpf', 'data_nascimento']);

        return response()->json($pacientes);
    }
}