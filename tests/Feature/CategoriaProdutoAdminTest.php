<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\CategoriaProduto;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

/**
 * GET pela via XHR do Inertia, que devolve o page object em JSON.
 *
 * Mesmo motivo do ProdutoAdminTest: o assertInertia() exige o render HTML
 * completo, e o app.blade.php monta um @vite() com o .tsx da própria página —
 * que só existe no passo 3.
 */
function getInertiaCategoria(string $url): TestResponse
{
    return test()->get($url, [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (new HandleInertiaRequests)->version(Request::create('/')),
    ]);
}

it('monta o page object da listagem com a contagem de produtos', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);
    Produto::factory()->count(2)->create(['categoria_produto_id' => $categoria->id]);
    CategoriaProduto::factory()->create(['nome' => 'Lentes']);

    $this->actingAs($this->user);

    getInertiaCategoria(route('categorias-produto.index'))
        ->assertOk()
        ->assertJsonPath('component', 'categorias-produto/index')
        ->assertJsonCount(2, 'props.categorias.data')
        ->assertJsonPath('props.categorias.data.0.nome', 'Armações')
        ->assertJsonPath('props.categorias.data.0.produtos_count', 2)
        ->assertJsonPath('props.categorias.data.1.produtos_count', 0);
});

it('monta o page object de criação', function () {
    $this->actingAs($this->user);

    getInertiaCategoria(route('categorias-produto.create'))
        ->assertOk()
        ->assertJsonPath('component', 'categorias-produto/create');
});

it('monta o page object de edição', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);

    $this->actingAs($this->user);

    getInertiaCategoria(route('categorias-produto.edit', $categoria))
        ->assertOk()
        ->assertJsonPath('component', 'categorias-produto/edit')
        ->assertJsonPath('props.categoria.id', $categoria->id)
        ->assertJsonPath('props.categoria.nome', 'Armações');
});

it('cadastra uma categoria', function () {
    $this->actingAs($this->user)
        ->post(route('categorias-produto.store'), [
            'nome' => 'Óculos de Sol',
            'ativo' => true,
        ])
        ->assertRedirect(route('categorias-produto.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('categorias_produto', [
        'nome' => 'Óculos de Sol',
        'ativo' => true,
    ]);
});

it('exige o nome', function () {
    $this->actingAs($this->user)
        ->post(route('categorias-produto.store'), [])
        ->assertSessionHasErrors('nome');

    expect(CategoriaProduto::count())->toBe(0);
});

it('recusa ativo não booleano', function () {
    $this->actingAs($this->user)
        ->post(route('categorias-produto.store'), [
            'nome' => 'Armações',
            'ativo' => 'talvez',
        ])
        ->assertSessionHasErrors('ativo');
});

it('atualiza nome e situação da categoria', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Nome Antigo', 'ativo' => true]);

    $this->actingAs($this->user)
        ->put(route('categorias-produto.update', $categoria), [
            'nome' => 'Nome Novo',
            'ativo' => false,
        ])
        ->assertRedirect(route('categorias-produto.index'))
        ->assertSessionHas('success');

    $categoria->refresh();

    expect($categoria->nome)->toBe('Nome Novo');
    expect($categoria->ativo)->toBeFalse();
});

it('remove categoria sem produtos vinculados', function () {
    $categoria = CategoriaProduto::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('categorias-produto.destroy', $categoria))
        ->assertRedirect(route('categorias-produto.index'))
        ->assertSessionHas('success');

    expect(CategoriaProduto::find($categoria->id))->toBeNull();
    expect(CategoriaProduto::withTrashed()->find($categoria->id))->not->toBeNull();
});

it('bloqueia a remoção de categoria com produtos vinculados', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $this->actingAs($this->user)
        ->delete(route('categorias-produto.destroy', $categoria))
        ->assertSessionHas('error', 'Categoria com produtos vinculados não pode ser removida.');

    expect(CategoriaProduto::find($categoria->id))->not->toBeNull();
    $this->assertNotSoftDeleted('categorias_produto', ['id' => $categoria->id]);
});

it('libera a remoção quando os produtos vinculados já foram removidos', function () {
    $categoria = CategoriaProduto::factory()->create();
    $produto = Produto::factory()->create(['categoria_produto_id' => $categoria->id]);
    $produto->delete();

    $this->actingAs($this->user)
        ->delete(route('categorias-produto.destroy', $categoria))
        ->assertSessionHas('success');

    expect(CategoriaProduto::find($categoria->id))->toBeNull();
});

it('bloqueia visitante não autenticado', function () {
    $categoria = CategoriaProduto::factory()->create();

    $this->get(route('categorias-produto.index'))->assertRedirect(route('login'));
    $this->post(route('categorias-produto.store'), [])->assertRedirect(route('login'));
    $this->delete(route('categorias-produto.destroy', $categoria))->assertRedirect(route('login'));
});
