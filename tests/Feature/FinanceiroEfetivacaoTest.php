<?php

use App\Actions\Financeiro\EfetivarLancamento;
use App\Models\FinanceiroCategoria;
use App\Models\FinanceiroLancamento;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->categoria = FinanceiroCategoria::create([
        'natureza' => 'despesa',
        'nome' => 'Custo de Vida',
    ]);

    $this->acao = new EfetivarLancamento();
});

function novoLancamento(array $overrides = []): FinanceiroLancamento
{
    return FinanceiroLancamento::create(array_merge([
        'descricao' => 'Mercado',
        'natureza' => 'despesa',
        'categoria_id' => test()->categoria->id,
        'valor_previsto' => '2000.00',
        'data_vencimento' => '2026-07-10',
    ], $overrides));
}

it('efetiva com valor e data explícitos', function () {
    $lancamento = novoLancamento();

    $this->acao->efetivar($lancamento, '1850.00', Carbon::parse('2026-07-09'));

    $lancamento->refresh();
    expect($lancamento->valor_efetivado)->toBe('1850.00');
    expect($lancamento->efetivado_em->format('Y-m-d'))->toBe('2026-07-09');
});

it('usa valor previsto e data de hoje quando omitidos', function () {
    $lancamento = novoLancamento();

    $this->acao->efetivar($lancamento);

    $lancamento->refresh();
    expect($lancamento->valor_efetivado)->toBe('2000.00');
    expect($lancamento->efetivado_em->format('Y-m-d'))->toBe(now()->format('Y-m-d'));
});

it('sobrescreve um lançamento já efetivado', function () {
    $lancamento = novoLancamento();

    $this->acao->efetivar($lancamento, '1850.00', Carbon::parse('2026-07-09'));
    $this->acao->efetivar($lancamento, '1900.00', Carbon::parse('2026-07-11'));

    $lancamento->refresh();
    expect($lancamento->valor_efetivado)->toBe('1900.00');
    expect($lancamento->efetivado_em->format('Y-m-d'))->toBe('2026-07-11');
});

it('desfaz a efetivação', function () {
    $lancamento = novoLancamento();
    $this->acao->efetivar($lancamento, '1850.00', Carbon::parse('2026-07-09'));

    $this->acao->desfazer($lancamento);

    $lancamento->refresh();
    expect($lancamento->valor_efetivado)->toBeNull();
    expect($lancamento->efetivado_em)->toBeNull();
});