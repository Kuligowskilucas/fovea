<?php

use App\Models\Exame;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->paciente = Paciente::create(['nome_completo' => 'Paciente Teste']);
    $this->consulta = $this->paciente->consultas()->create([
        'atendido_em' => now(),
        'user_id' => $this->user->id,
    ]);
});

it('salva o exame da consulta e recupera os dados via cast', function () {
    $this->actingAs($this->user)
        ->post(route('consultas.exame.salvar', $this->consulta), [
            'dados' => [
                'ceratometria' => ['od' => '43.00', 'oe' => '44.25', 'miras' => ''],
                'autorrefracao' => [
                    'od' => ['esferico' => '-1.25', 'cilindrico' => '-0.50', 'eixo' => '180'],
                ],
            ],
        ])
        ->assertRedirect();

    $exame = Exame::first();
    expect($exame)->not->toBeNull();
    expect($exame->consulta_id)->toBe($this->consulta->id);
    // cast jsonb -> array
    expect($exame->dados['ceratometria']['od'])->toBe('43.00');
    expect($exame->dados['autorrefracao']['od']['eixo'])->toBe('180');
});

it('atualiza o mesmo exame em vez de duplicar (upsert)', function () {
    $payload = fn (string $od) => ['dados' => ['ceratometria' => ['od' => $od]]];

    $this->actingAs($this->user)
        ->post(route('consultas.exame.salvar', $this->consulta), $payload('43.00'))
        ->assertRedirect();

    $this->actingAs($this->user)
        ->post(route('consultas.exame.salvar', $this->consulta), $payload('45.50'))
        ->assertRedirect();

    expect(Exame::where('consulta_id', $this->consulta->id)->count())->toBe(1);
    expect($this->consulta->fresh()->exame->dados['ceratometria']['od'])->toBe('45.50');
});