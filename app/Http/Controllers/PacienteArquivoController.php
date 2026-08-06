<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePacienteArquivoRequest;
use App\Models\Paciente;
use App\Models\PacienteArquivo;
use Illuminate\Support\Facades\Storage;

class PacienteArquivoController extends Controller
{
    public function store(StorePacienteArquivoRequest $request, Paciente $paciente)
    {
        $arquivo = $request->file('arquivo');

        // Lê os metadados antes de mover o arquivo temporário.
        $nomeOriginal = $arquivo->getClientOriginalName();
        $mime = $arquivo->getMimeType();
        $tamanho = $arquivo->getSize();

        // Guarda no disco privado com nome aleatório: storage/app/private/pacientes/{id}/...
        $caminho = $arquivo->store("pacientes/{$paciente->id}", 'local');

        $paciente->arquivos()->create([
            'nome_original' => $nomeOriginal,
            'caminho' => $caminho,
            'mime' => $mime,
            'tamanho' => $tamanho,
        ]);

        return back()->with('success', 'Arquivo enviado com sucesso.');
    }

    public function download(PacienteArquivo $arquivo)
    {
        abort_unless(Storage::disk('local')->exists($arquivo->caminho), 404);

        return Storage::disk('local')->download($arquivo->caminho, $arquivo->nome_original);
    }

    public function destroy(PacienteArquivo $arquivo)
    {
        // Soft delete: some da lista, mas o arquivo físico permanece (recuperável e no backup).
        $arquivo->delete();

        return back()->with('success', 'Arquivo removido.');
    }
}