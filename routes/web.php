<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConsultaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExameController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PrescricaoController;
use App\Http\Controllers\BuscaController;
use App\Http\Controllers\ArquivadosController;
use App\Http\Controllers\FinanceiroLancamentoController;
use App\Http\Controllers\FinanceiroContaController;
use App\Http\Controllers\FinanceiroRecorrenciaController;
use App\Http\Controllers\PacienteArquivoController;


Route::get('/', function () {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('pacientes', PacienteController::class);
    Route::get('consultas', [ConsultaController::class, 'index'])->name('consultas.index');
    Route::resource('pacientes.consultas', ConsultaController::class)->shallow()->except(['index']);
    Route::get('consultas/{consulta}/prontuario', [ConsultaController::class, 'prontuario'])
        ->name('consultas.prontuario');

    Route::resource('consultas.prescricoes', PrescricaoController::class)
        ->shallow()->only(['store', 'update', 'destroy'])
        ->parameters(['prescricoes' => 'prescricao']);
    Route::get('prescricoes/{prescricao}/imprimir', [PrescricaoController::class, 'imprimir'])
        ->name('prescricoes.imprimir');
    
    Route::get('busca/pacientes', [BuscaController::class, 'pacientes'])->name('busca.pacientes');

    Route::get('arquivados', [ArquivadosController::class, 'index'])->name('arquivados.index');

    Route::put('pacientes/{paciente}/restaurar', [PacienteController::class, 'restaurar'])
        ->name('pacientes.restaurar')->withTrashed();
    
    Route::put('pacientes/{paciente}/nome', [PacienteController::class, 'atualizarNome'])
        ->name('pacientes.atualizar-nome');

    Route::post('pacientes/{paciente}/arquivos', [PacienteArquivoController::class, 'store'])
        ->name('pacientes.arquivos.store');
    Route::get('arquivos/{arquivo}/download', [PacienteArquivoController::class, 'download'])
        ->name('pacientes.arquivos.download');
    Route::delete('arquivos/{arquivo}', [PacienteArquivoController::class, 'destroy'])
        ->name('pacientes.arquivos.destroy');

    Route::put('consultas/{consulta}/restaurar', [ConsultaController::class, 'restaurar'])
        ->name('consultas.restaurar')->withTrashed();

    Route::post('consultas/{consulta}/exame', [ExameController::class, 'salvar'])
        ->name('consultas.exame.salvar');

    Route::get('financeiro/mes', [FinanceiroLancamentoController::class, 'index'])
        ->name('financeiro.mes');
    Route::put('financeiro/lancamentos/{lancamento}/efetivar', [FinanceiroLancamentoController::class, 'efetivar'])
        ->name('financeiro.lancamentos.efetivar');
    Route::put('financeiro/lancamentos/{lancamento}/desfazer', [FinanceiroLancamentoController::class, 'desfazer'])
        ->name('financeiro.lancamentos.desfazer');
    Route::get('financeiro/contas', [FinanceiroContaController::class, 'index'])
        ->name('financeiro.contas.index');
    Route::post('financeiro/contas', [FinanceiroContaController::class, 'store'])
        ->name('financeiro.contas.store');
    Route::put('financeiro/contas/{conta}', [FinanceiroContaController::class, 'update'])
        ->name('financeiro.contas.update');
    Route::get('financeiro/recorrencias', [FinanceiroRecorrenciaController::class, 'index'])
        ->name('financeiro.recorrencias.index');
    Route::post('financeiro/recorrencias', [FinanceiroRecorrenciaController::class, 'store'])
        ->name('financeiro.recorrencias.store');
    Route::put('financeiro/recorrencias/{recorrencia}', [FinanceiroRecorrenciaController::class, 'update'])
        ->name('financeiro.recorrencias.update');
    Route::post('financeiro/lancamentos', [FinanceiroLancamentoController::class, 'store'])
        ->name('financeiro.lancamentos.store');
});

require __DIR__.'/settings.php';