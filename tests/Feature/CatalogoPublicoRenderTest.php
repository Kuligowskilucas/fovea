<?php

use App\Models\CategoriaProduto;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Page object embutido no HTML da vitrine.
 *
 * Assere sobre o JSON e não sobre o HTML cru: o Inertia escapa unicode
 * (Armação vira Armação) e a saída do @vite muda conforme o dev
 * server esteja no ar ou não.
 */
function pageObjectDoCatalogo(string $html): array
{
    expect($html)->toContain('data-page');

    preg_match('/<script data-page="app" type="application\/json">(.*?)<\/script>/s', $html, $m);

    return json_decode(html_entity_decode($m[1]), true, flags: JSON_THROW_ON_ERROR);
}

it('renderiza a página completa pra visitante sem sessão', function () {
    $categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);
    Produto::factory()->create([
        'categoria_produto_id' => $categoria->id,
        'nome' => 'Armação Redonda',
        'preco' => '899.90',
    ]);

    $html = $this->get(route('catalogo.index'))->assertOk()->getContent();
    $page = pageObjectDoCatalogo($html);

    expect($page['component'])->toBe('catalogo/index');
    expect($page['props']['categorias'][0]['nome'])->toBe('Armações');
    expect($page['props']['categorias'][0]['produtos'][0]['nome'])->toBe('Armação Redonda');
});

it('não compartilha nenhuma prop autenticada, nem com a Pati logada', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $this->actingAs(User::factory()->create([
        'name' => 'Pati Exemplo',
        'email' => 'pati@exemplo.test',
    ]));

    $html = $this->get(route('catalogo.index'))->assertOk()->getContent();
    $page = pageObjectDoCatalogo($html);

    // O Inertia lista em sharedProps exatamente o que o middleware compartilhou.
    expect($page['sharedProps'])->toBe(['errors', 'name']);

    expect($page['props'])->not->toHaveKey('auth');
    expect($page['props'])->not->toHaveKey('flash');
    expect($page['props'])->not->toHaveKey('sidebarOpen');

    expect($html)->not->toContain('pati@exemplo.test');
    expect($html)->not->toContain('Pati Exemplo');
});

it('a página pública não carrega o layout administrativo', function () {
    $categoria = CategoriaProduto::factory()->create();
    Produto::factory()->create(['categoria_produto_id' => $categoria->id]);

    $html = $this->get(route('catalogo.index'))->assertOk()->getContent();

    // O resolver de layout do app.tsx é por nome de componente; se o componente
    // sair de catalogo/*, ele volta pro AppLayout com a sidebar administrativa.
    expect(pageObjectDoCatalogo($html)['component'])->toStartWith('catalogo/');
});
