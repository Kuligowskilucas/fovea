<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

function getInertiaQrCode(): TestResponse
{
    return test()->get(route('catalogo.qrcode'), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (new HandleInertiaRequests)->version(Request::create('/')),
    ]);
}

it('redireciona visitante anônimo pro login', function () {
    $this->get(route('catalogo.qrcode'))->assertRedirect(route('login'));
});

it('exige auth e verified no middleware da rota', function () {
    $rota = collect(Route::getRoutes())->first(
        fn ($r) => $r->getName() === 'catalogo.qrcode'
    );

    expect($rota->gatherMiddleware())->toContain('auth');
    expect($rota->gatherMiddleware())->toContain('verified');
});

it('responde 200 e monta o page object pra usuário autenticado', function () {
    $this->actingAs($this->user);

    getInertiaQrCode()
        ->assertOk()
        ->assertJsonPath('component', 'produtos/qrcode');
});

it('manda a url completa da vitrine, derivada da rota pública', function () {
    $this->actingAs($this->user);

    $url = getInertiaQrCode()->assertOk()->json('props.url');

    expect($url)->toContain('/catalogo');
    expect($url)->toBe(route('catalogo.index'));
    expect($url)->toStartWith(config('app.url'));
});

it('acompanha o APP_URL em vez de domínio fixo', function () {
    config()->set('app.url', 'https://otica.exemplo.br');
    URL::forceRootUrl('https://otica.exemplo.br');
    URL::forceScheme('https');

    $this->actingAs($this->user);

    expect(getInertiaQrCode()->assertOk()->json('props.url'))
        ->toBe('https://otica.exemplo.br/catalogo');
});

it('não consulta model nenhum', function () {
    $this->actingAs($this->user);

    DB::enableQueryLog();
    getInertiaQrCode()->assertOk();

    $tabelas = collect(DB::getQueryLog())
        ->pluck('query')
        ->filter(fn ($q) => str_contains($q, 'pacientes')
            || str_contains($q, 'consultas')
            || str_contains($q, 'exames')
            || str_contains($q, 'financeiro')
            || str_contains($q, 'produtos'));

    expect($tabelas)->toBeEmpty();
});
