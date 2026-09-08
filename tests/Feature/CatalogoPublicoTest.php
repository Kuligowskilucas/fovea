<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\CategoriaProduto;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

/**
 * GET pela via XHR do Inertia, que devolve o page object em JSON.
 *
 * Mesmo motivo dos testes de admin: o assertInertia() exige o render HTML
 * completo, que depende do .tsx no manifest do Vite (passo 5).
 */
function getCatalogo(): TestResponse
{
    return test()->get(route('catalogo.index'), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (new HandleInertiaRequests)->version(Request::create('/')),
    ]);
}

it('responde 200 sem autenticação', function () {
    getCatalogo()
        ->assertOk()
        ->assertJsonPath('component', 'catalogo/index');
});

it('não tem middleware de auth na rota', function () {
    $rota = collect(Route::getRoutes())->first(
        fn ($r) => $r->getName() === 'catalogo.index'
    );

    expect($rota->gatherMiddleware())->not->toContain('auth');
    expect($rota->gatherMiddleware())->not->toContain('verified');
});

it('lista categorias ativas com seus produtos ativos, ordenados por nome', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);
    Produto::factory()->create(['categoria_produto_id' => $categoria->id, 'nome' => 'Zulu']);
    Produto::factory()->create(['categoria_produto_id' => $categoria->id, 'nome' => 'Alfa']);

    getCatalogo()
        ->assertOk()
        ->assertJsonCount(1, 'props.categorias')
        ->assertJsonPath('props.categorias.0.nome', 'Armações')
        ->assertJsonCount(2, 'props.categorias.0.produtos')
        ->assertJsonPath('props.categorias.0.produtos.0.nome', 'Alfa')
        ->assertJsonPath('props.categorias.0.produtos.1.nome', 'Zulu');
});

it('esconde categoria inativa', function () {
    $inativa = CategoriaProduto::factory()->inativo()->create(['nome' => 'Escondida']);
    Produto::factory()->create(['categoria_produto_id' => $inativa->id]);

    getCatalogo()->assertOk()->assertJsonCount(0, 'props.categorias');
});

it('esconde categoria soft-deletada', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);
    $categoria->delete();

    getCatalogo()->assertOk()->assertJsonCount(0, 'props.categorias');
});

it('esconde categoria sem nenhum produto ativo', function () {
    $vazia = CategoriaProduto::factory()->create(['nome' => 'Sem Produtos']);
    Produto::factory()->inativo()->create(['categoria_produto_id' => $vazia->id]);
    CategoriaProduto::factory()->create(['nome' => 'Nem Um Produto']);

    getCatalogo()->assertOk()->assertJsonCount(0, 'props.categorias');
});

it('esconde produto inativo e produto soft-deletado', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id, 'nome' => 'Visível']);
    Produto::factory()->inativo()->create(['categoria_produto_id' => $categoria->id, 'nome' => 'Inativo']);
    Produto::factory()->create(['categoria_produto_id' => $categoria->id, 'nome' => 'Apagado'])->delete();

    getCatalogo()
        ->assertOk()
        ->assertJsonCount(1, 'props.categorias.0.produtos')
        ->assertJsonPath('props.categorias.0.produtos.0.nome', 'Visível');
});

it('expõe exatamente os campos da vitrine, e nenhum a mais', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $props = getCatalogo()->assertOk()->json('props');

    expect(array_keys($props['categorias'][0]))
        ->toBe(['id', 'nome', 'produtos']);

    expect(array_keys($props['categorias'][0]['produtos'][0]))
        ->toBe(['id', 'nome', 'descricao', 'preco', 'imagem']);
});

it('não vaza estado autenticado nas props compartilhadas', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $props = getCatalogo()->assertOk()->json('props');

    expect($props)->not->toHaveKey('auth');
    expect($props)->not->toHaveKey('flash');
    expect($props)->not->toHaveKey('sidebarOpen');
});

it('não vaza estado autenticado nem quando a Pati abre a vitrine logada', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $this->actingAs(User::factory()->create(['email' => 'pati@exemplo.test']));

    $resposta = getCatalogo()->assertOk();

    expect($resposta->json('props'))->not->toHaveKey('auth');
    $resposta->assertDontSee('pati@exemplo.test');
});

it('não contém timestamps nem qualquer campo fora da vitrine', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $bruto = getCatalogo()->assertOk()->getContent();

    foreach ([
        'created_at', 'updated_at', 'deleted_at',
        'categoria_produto_id', 'ativo',
        'password', 'remember_token', 'two_factor',
    ] as $proibido) {
        expect($bruto)->not->toContain($proibido);
    }
});

it('a imagem aponta pro arquivo estático do disco público', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create([
        'categoria_produto_id' => $categoria->id,
        'imagem' => 'produtos/abc.webp',
    ]);

    getCatalogo()
        ->assertOk()
        ->assertJsonPath('props.categorias.0.produtos.0.imagem', config('app.url').'/storage/produtos/abc.webp');
});

it('manda imagem nula quando o produto não tem foto', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id, 'imagem' => null]);

    getCatalogo()->assertOk()->assertJsonPath('props.categorias.0.produtos.0.imagem', null);
});

it('tira whatsapp e rodapé de preço da config', function () {
    config()->set('catalogo.whatsapp.numero', '+55 (41) 99999-8888');
    config()->set('catalogo.whatsapp.mensagem', 'Oi! Quero a {nome}.');
    config()->set('catalogo.rodape_preco', 'Texto configurável');

    getCatalogo()
        ->assertOk()
        // Normalizado pro formato que o wa.me exige: só dígitos.
        ->assertJsonPath('props.whatsapp.numero', '5541999998888')
        ->assertJsonPath('props.whatsapp.mensagem', 'Oi! Quero a {nome}.')
        ->assertJsonPath('props.rodape_preco', 'Texto configurável');
});
