<?php

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('cadastra um paciente', function () {
    $this->actingAs($this->user)
        ->post(route('pacientes.store'), [
            'nome_completo' => 'Maria da Silva',
            'cidade' => 'Curitiba',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('pacientes', [
        'nome_completo' => 'Maria da Silva',
    ]);
});

it('exige o nome completo', function () {
    $this->actingAs($this->user)
        ->post(route('pacientes.store'), [])
        ->assertSessionHasErrors('nome_completo');
});

it('busca por nome, cpf ou cidade num campo único', function () {
    Paciente::create(['nome_completo' => 'João Souza', 'cidade' => 'Curitiba']);
    Paciente::create(['nome_completo' => 'Ana Lima', 'cidade' => 'Joinville']);

    $this->actingAs($this->user)
        ->get(route('pacientes.index', ['q' => 'curitiba']))
        ->assertInertia(fn ($page) => $page
            ->component('pacientes/index')
            ->has('pacientes.data', 1)
        );
});

it('arquiva o paciente sem apagar do banco', function () {
    $paciente = Paciente::create(['nome_completo' => 'Para Arquivar']);

    $this->actingAs($this->user)
        ->delete(route('pacientes.destroy', $paciente))
        ->assertRedirect();

    expect(Paciente::find($paciente->id))->toBeNull();                    
    expect(Paciente::withTrashed()->find($paciente->id))->not->toBeNull();
});