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


Route::get('/', function () {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('pacientes', PacienteController::class);
    Route::get('consultas', [ConsultaController::class, 'index'])->name('consultas.index');
    Route::resource('pacientes.consultas', ConsultaController::class)
        ->shallow()->except(['index']);
    Route::resource('consultas.prescricoes', PrescricaoController::class)
        ->shallow()->only(['store', 'update', 'destroy'])
        ->parameters(['prescricoes' => 'prescricao']);
    Route::get('prescricoes/{prescricao}/imprimir', [PrescricaoController::class, 'imprimir'])
        ->name('prescricoes.imprimir');
    
    Route::get('busca/pacientes', [BuscaController::class, 'pacientes'])->name('busca.pacientes');

    Route::get('arquivados', [ArquivadosController::class, 'index'])->name('arquivados.index');

    Route::put('pacientes/{paciente}/restaurar', [PacienteController::class, 'restaurar'])
        ->name('pacientes.restaurar')->withTrashed();

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
});

require __DIR__.'/settings.php';