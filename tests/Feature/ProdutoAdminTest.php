<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\CategoriaProduto;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    $this->user = User::factory()->create();
    $this->categoria = CategoriaProduto::factory()->create(['nome' => 'Armações']);
});

/**
 * GET pela via XHR do Inertia, que devolve o page object em JSON.
 *
 * O assertInertia() do Inertia exige o render HTML completo, e o app.blade.php
 * monta um @vite() com o .tsx da própria página — ou seja, um page load só
 * responde 200 depois que o componente existir e estiver buildado (passo 3).
 * A via XHR exercita exatamente o mesmo page object sem tocar no frontend.
 */
function getInertia(string $url): TestResponse
{
    return test()->get($url, [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (new HandleInertiaRequests)->version(Request::create('/')),
    ]);
}

/** Largura em pixels de um arquivo gravado no disco fake. */
function larguraDaImagem(string $caminho): int
{
    $tamanho = getimagesizefromstring(Storage::disk('public')->get($caminho));

    return $tamanho[0];
}

it('cria o produto e persiste a imagem no disco', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => 'Armação Redonda Acetato',
            'descricao' => 'Acetato preto fosco.',
            'preco' => '899.90',
            'ativo' => true,
            'imagem' => UploadedFile::fake()->image('armacao.jpg', 1600, 1200),
        ])
        ->assertRedirect(route('produtos.index'))
        ->assertSessionHas('success');

    $produto = Produto::firstWhere('nome', 'Armação Redonda Acetato');

    expect($produto)->not->toBeNull();
    expect($produto->preco)->toBe('899.90');
    expect($produto->imagem)->toStartWith('produtos/');

    Storage::disk('public')->assertExists($produto->imagem);
});

it('redimensiona a imagem enviada para no máximo 1000px de largura', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => 'Armação Grande',
            'imagem' => UploadedFile::fake()->image('grande.jpg', 2400, 1800),
        ])
        ->assertRedirect();

    $produto = Produto::firstWhere('nome', 'Armação Grande');

    expect(larguraDaImagem($produto->imagem))->toBe(1000);
});

it('não faz upscale de imagem menor que a largura máxima', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => 'Armação Pequena',
            'imagem' => UploadedFile::fake()->image('pequena.jpg', 400, 300),
        ])
        ->assertRedirect();

    $produto = Produto::firstWhere('nome', 'Armação Pequena');

    expect(larguraDaImagem($produto->imagem))->toBe(400);
});

it('exige categoria e nome', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [])
        ->assertSessionHasErrors(['categoria_produto_id', 'nome']);

    expect(Produto::count())->toBe(0);
});

it('recusa categoria inexistente', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [
            'categoria_produto_id' => 9999,
            'nome' => 'Órfão',
        ])
        ->assertSessionHasErrors('categoria_produto_id');
});

it('aceita preco nulo (sob consulta)', function () {
    $this->actingAs($this->user)
        ->post(route('produtos.store'), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => 'Armação Sob Consulta',
            'preco' => null,
        ])
        ->assertRedirect();

    $produto = Produto::firstWhere('nome', 'Armação Sob Consulta');

    expect($produto->preco)->toBeNull();
});

it('troca a imagem no update e apaga a anterior', function () {
    $produto = Produto::factory()->create([
        'categoria_produto_id' => $this->categoria->id,
        'imagem' => 'produtos/antiga.jpg',
    ]);
    Storage::disk('public')->put('produtos/antiga.jpg', 'conteudo antigo');

    $this->actingAs($this->user)
        ->put(route('produtos.update', $produto), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => $produto->nome,
            'imagem' => UploadedFile::fake()->image('nova.jpg', 1200, 900),
        ])
        ->assertRedirect(route('produtos.index'));

    $produto->refresh();

    expect($produto->imagem)->not->toBe('produtos/antiga.jpg');
    Storage::disk('public')->assertMissing('produtos/antiga.jpg');
    Storage::disk('public')->assertExists($produto->imagem);
});

it('mantém a imagem atual no update sem arquivo novo', function () {
    $produto = Produto::factory()->create([
        'categoria_produto_id' => $this->categoria->id,
        'nome' => 'Nome Antigo',
        'imagem' => 'produtos/mantida.jpg',
    ]);
    Storage::disk('public')->put('produtos/mantida.jpg', 'conteudo');

    $this->actingAs($this->user)
        ->put(route('produtos.update', $produto), [
            'categoria_produto_id' => $this->categoria->id,
            'nome' => 'Nome Novo',
        ])
        ->assertRedirect();

    $produto->refresh();

    expect($produto->nome)->toBe('Nome Novo');
    expect($produto->imagem)->toBe('produtos/mantida.jpg');
    Storage::disk('public')->assertExists('produtos/mantida.jpg');
});

it('faz soft delete no destroy e preserva o arquivo', function () {
    $produto = Produto::factory()->create([
        'categoria_produto_id' => $this->categoria->id,
        'imagem' => 'produtos/preservada.jpg',
    ]);
    Storage::disk('public')->put('produtos/preservada.jpg', 'conteudo');

    $this->actingAs($this->user)
        ->delete(route('produtos.destroy', $produto))
        ->assertRedirect(route('produtos.index'));

    expect(Produto::find($produto->id))->toBeNull();
    expect(Produto::withTrashed()->find($produto->id))->not->toBeNull();
    Storage::disk('public')->assertExists('produtos/preservada.jpg');
});

it('monta o page object da listagem', function () {
    Produto::factory()->create(['categoria_produto_id' => $this->categoria->id]);

    $this->actingAs($this->user);

    getInertia(route('produtos.index'))
        ->assertOk()
        ->assertJsonPath('component', 'produtos/index')
        ->assertJsonCount(1, 'props.produtos.data')
        ->assertJsonPath('props.produtos.data.0.categoria.nome', 'Armações');
});

it('monta o page object de criação com as categorias ativas', function () {
    CategoriaProduto::factory()->inativo()->create();

    $this->actingAs($this->user);

    getInertia(route('produtos.create'))
        ->assertOk()
        ->assertJsonPath('component', 'produtos/create')
        ->assertJsonCount(1, 'props.categorias')
        ->assertJsonPath('props.categorias.0.nome', 'Armações');
});

it('monta o page object de edição', function () {
    $produto = Produto::factory()->create(['categoria_produto_id' => $this->categoria->id]);

    $this->actingAs($this->user);

    getInertia(route('produtos.edit', $produto))
        ->assertOk()
        ->assertJsonPath('component', 'produtos/edit')
        ->assertJsonPath('props.produto.id', $produto->id)
        ->assertJsonCount(1, 'props.categorias');
});

it('bloqueia visitante não autenticado', function () {
    $this->get(route('produtos.index'))->assertRedirect(route('login'));
    $this->post(route('produtos.store'), [])->assertRedirect(route('login'));
});
