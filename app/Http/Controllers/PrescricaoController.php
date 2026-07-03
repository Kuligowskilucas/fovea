<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrescricaoRequest;
use App\Http\Requests\UpdatePrescricaoRequest;
use App\Models\Consulta;
use App\Models\Prescricao;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class PrescricaoController extends Controller
{
    public function store(StorePrescricaoRequest $request, Consulta $consulta)
    {
        $data = $request->validated();

        DB::transaction(function () use ($consulta, $data) {
            $prescricao = $consulta->prescricoes()->create(Arr::except($data, 'medidas'));

            foreach ($data['medidas'] as $medida) {
                $prescricao->medidas()->create($medida);
            }
        });

        return back()->with('success', 'Prescrição salva com sucesso.');
    }

    public function update(UpdatePrescricaoRequest $request, Prescricao $prescricao)
    {
        $data = $request->validated();

        DB::transaction(function () use ($prescricao, $data) {
            $prescricao->update(Arr::except($data, 'medidas'));

            foreach ($data['medidas'] as $medida) {
                $prescricao->medidas()->updateOrCreate(
                    ['olho' => $medida['olho']],
                    $medida
                );
            }
        });

        return back()->with('success', 'Prescrição atualizada com sucesso.');
    }

    public function destroy(Prescricao $prescricao)
    {
        $consultaId = $prescricao->consulta_id;
        $prescricao->delete();

        return redirect()
            ->route('consultas.show', $consultaId)
            ->with('success', 'Prescrição removida.');
    }

    public function imprimir(Prescricao $prescricao)
    {
        $prescricao->load(['medidas', 'consulta.paciente', 'consulta.profissional:id,name']);
        return view('prescricoes.imprimir', [
            'prescricao' => $prescricao,
        ]);
    }
}