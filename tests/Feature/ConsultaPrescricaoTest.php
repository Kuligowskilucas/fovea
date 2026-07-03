<?php

use App\Models\Paciente;
use App\Models\Prescricao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->paciente = Paciente::create(['nome_completo' => 'Paciente Teste']);
});

it('registra uma consulta para o paciente', function () {
    $this->actingAs($this->user)
        ->post(route('pacientes.consultas.store', $this->paciente), [
            'atendido_em' => now()->toDateTimeString(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('consultas', [
        'paciente_id' => $this->paciente->id,
        'user_id' => $this->user->id,
        'procedimento' => 'Consulta', // default aplicado quando não enviado
    ]);
});

it('salva uma prescrição de óculos com as medidas OD e OE', function () {
    $consulta = $this->paciente->consultas()->create([
        'atendido_em' => now(),
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('consultas.prescricoes.store', $consulta), [
            'tipo' => 'oculos',
            'tipo_visao' => 'longe',
            'adicao' => 2.00,
            'lente' => 'V.S',
            'medidas' => [
                ['olho' => 'OD', 'esferico' => -3.50, 'cilindrico' => -1.00, 'eixo' => 180, 'av' => '20/20'],
                ['olho' => 'OE', 'esferico' => -2.75, 'cilindrico' => -1.00, 'eixo' => 5, 'av' => '20/20'],
            ],
        ])
        ->assertRedirect();

    $prescricao = Prescricao::first();
    expect($prescricao)->not->toBeNull();
    expect($prescricao->medidas)->toHaveCount(2);
});

it('recusa prescrição de óculos sem o tipo de visão', function () {
    $consulta = $this->paciente->consultas()->create([
        'atendido_em' => now(),
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('consultas.prescricoes.store', $consulta), [
            'tipo' => 'oculos',
            'medidas' => [
                ['olho' => 'OD'],
                ['olho' => 'OE'],
            ],
        ])
        ->assertSessionHasErrors('tipo_visao');
});