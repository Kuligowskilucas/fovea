<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConsultaController;
use App\Http\Controllers\ExameController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PrescricaoController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('pacientes', PacienteController::class);
    Route::resource('pacientes.consultas', ConsultaController::class)
        ->shallow()->except(['index']);
    Route::resource('consultas.prescricoes', PrescricaoController::class)
        ->shallow()->only(['store', 'update', 'destroy']);
    Route::get('prescricoes/{prescricao}/imprimir', [PrescricaoController::class, 'imprimir'])
        ->name('prescricoes.imprimir');

    Route::post('consultas/{consulta}/exame', [ExameController::class, 'salvar'])
        ->name('consultas.exame.salvar');
});

require __DIR__.'/settings.php';