<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePacienteRequest;
use App\Http\Requests\UpdatePacienteRequest;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PacienteController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $pacientes = Paciente::query()
            ->when($q !== '', function ($query) use ($q) {
                $like = "%{$q}%";
                $query->where(function ($sub) use ($like) {
                    $sub->where('nome_completo', 'ilike', $like)
                        ->orWhere('cpf', 'ilike', $like)
                        ->orWhere('cidade', 'ilike', $like);
                });
            })
            ->orderBy('nome_completo')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('pacientes/index', [
            'pacientes' => $pacientes,
            'filters' => ['q' => $q],
        ]);
    }

    public function create()
    {
        return Inertia::render('pacientes/create');
    }

    public function store(StorePacienteRequest $request)
    {
        $paciente = Paciente::create($request->validated());

        return redirect()
            ->route('pacientes.show', $paciente)
            ->with('success', 'Paciente cadastrado com sucesso.');
    }

    public function show(Paciente $paciente)
        {
            $paciente->load([
                'consultas' => fn ($query) => $query->latest('atendido_em'),
            ]);
    
            $refracoes = $paciente->refracoes();
    
            return Inertia::render('pacientes/show', [
                'paciente' => $paciente,
                'ultima_refracao' => $refracoes->first(),
                'refracoes' => $refracoes,
            ]);
        }

    public function edit(Paciente $paciente)
    {
        return Inertia::render('pacientes/edit', [
            'paciente' => $paciente,
        ]);
    }

    public function update(UpdatePacienteRequest $request, Paciente $paciente)
    {
        $paciente->update($request->validated());

        return redirect()
            ->route('pacientes.show', $paciente)
            ->with('success', 'Paciente atualizado com sucesso.');
    }

    public function destroy(Paciente $paciente)
    {
        $paciente->delete();

        return redirect()
            ->route('pacientes.index')
            ->with('success', 'Paciente arquivado.');
    }
}