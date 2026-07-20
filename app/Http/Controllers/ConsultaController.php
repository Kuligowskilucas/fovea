<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsultaRequest;
use App\Http\Requests\UpdateConsultaRequest;
use App\Models\Consulta;
use App\Models\Paciente;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ConsultaController extends Controller
{

    public function index(Request $request)
    {
        $filtros = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'de' => ['nullable', 'date'],
            'ate' => ['nullable', 'date'],
        ]);

        $q = trim((string) ($filtros['q'] ?? ''));
        $de = $filtros['de'] ?? null;
        $ate = $filtros['ate'] ?? null;

        $consultas = Consulta::query()
            ->with('paciente:id,nome_completo')
            ->when($q !== '', fn ($query) => $query->whereHas(
                'paciente',
                fn ($sub) => $sub->where('nome_completo', 'ilike', "%{$q}%")
            ))
            ->when($de, fn ($query) => $query->whereDate('atendido_em', '>=', $de))
            ->when($ate, fn ($query) => $query->whereDate('atendido_em', '<=', $ate))
            ->latest('atendido_em')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('consultas/index', [
            'consultas' => $consultas,
            'filters' => ['q' => $q, 'de' => $de, 'ate' => $ate],
        ]);
    }
    
    public function create(Paciente $paciente)
    {
        return Inertia::render('consultas/create', [
            'paciente' => $paciente->only(['id', 'nome_completo']),
        ]);
    }

    public function store(StoreConsultaRequest $request, Paciente $paciente)
    {
        $data = $request->validated();
        $data['procedimento'] ??= 'Consulta';
        $data['user_id'] = $request->user()->id;

        $consulta = $paciente->consultas()->create($data);

        return redirect()
            ->route('consultas.show', $consulta)
            ->with('success', 'Consulta registrada com sucesso.');
    }

    public function show(Consulta $consulta)
    {
        $consulta->load([
            'paciente',
            'profissional:id,name',
            'prescricoes.medidas',
            'exame',
        ]);

        return Inertia::render('consultas/show', [
            'consulta' => $consulta,
        ]);
    }

    public function edit(Consulta $consulta)
    {
        $consulta->load('paciente:id,nome_completo');

        return Inertia::render('consultas/edit', [
            'consulta' => $consulta,
        ]);
    }

    public function update(UpdateConsultaRequest $request, Consulta $consulta)
    {
        $data = $request->validated();
        $data['procedimento'] ??= 'Consulta';

        $consulta->update($data);

        return redirect()
            ->route('consultas.show', $consulta)
            ->with('success', 'Consulta atualizada com sucesso.');
    }

    public function destroy(Consulta $consulta)
    {
        $pacienteId = $consulta->paciente_id;
        $consulta->delete(); 

        return redirect()
            ->route('pacientes.show', $pacienteId)
            ->with('success', 'Consulta arquivada.');
    }
}