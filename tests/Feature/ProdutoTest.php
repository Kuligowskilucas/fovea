<?php

use App\Models\CategoriaProduto;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('cria um produto ligado a uma categoria', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);

    $produto = Produto::factory()->create([
        'categoria_produto_id' => $categoria->id,
        'nome' => 'Armação Redonda Acetato',
    ]);

    expect($produto->categoria)->toBeInstanceOf(CategoriaProduto::class);
    expect($produto->categoria->nome)->toBe('Armações');
    expect($categoria->produtos)->toHaveCount(1);
    expect($categoria->produtos->first()->nome)->toBe('Armação Redonda Acetato');
});

it('faz o cast de preco como decimal com duas casas', function () {
    $produto = Produto::factory()->create(['preco' => 1250.5]);

    $produto->refresh();

    expect($produto->preco)->toBe('1250.50');
});

it('permite preco nulo (sob consulta)', function () {
    $produto = Produto::factory()->sobConsulta()->create();

    $produto->refresh();

    expect($produto->preco)->toBeNull();
    $this->assertDatabaseHas('produtos', [
        'id' => $produto->id,
        'preco' => null,
    ]);
});

it('usa soft delete no produto', function () {
    $produto = Produto::factory()->create();

    $produto->delete();

    expect(Produto::find($produto->id))->toBeNull();
    expect(Produto::withTrashed()->find($produto->id))->not->toBeNull();
    $this->assertSoftDeleted('produtos', ['id' => $produto->id]);
});

it('usa soft delete na categoria de produto', function () {
    $categoria = CategoriaProduto::factory()->create();

    $categoria->delete();

    expect(CategoriaProduto::find($categoria->id))->toBeNull();
    $this->assertSoftDeleted('categorias_produto', ['id' => $categoria->id]);
});

it('marca produto e categoria como ativos por padrão', function () {
    $produto = Produto::factory()->create();

    expect($produto->ativo)->toBeTrue();
    expect($produto->categoria->ativo)->toBeTrue();
});
