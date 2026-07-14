<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConsultaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExameController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PrescricaoController;
use App\Http\Controllers\BuscaController;

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

    Route::post('consultas/{consulta}/exame', [ExameController::class, 'salvar'])
        ->name('consultas.exame.salvar');
});

require __DIR__.'/settings.php';