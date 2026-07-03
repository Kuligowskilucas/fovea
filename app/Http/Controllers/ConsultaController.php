<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsultaRequest;
use App\Http\Requests\UpdateConsultaRequest;
use App\Models\Consulta;
use App\Models\Paciente;
use Inertia\Inertia;

class ConsultaController extends Controller
{
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
        $data['user_id'] = $request->user()->id; // profissional = usuário logado

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
        $consulta->delete(); // soft delete

        return redirect()
            ->route('pacientes.show', $pacienteId)
            ->with('success', 'Consulta arquivada.');
    }
}