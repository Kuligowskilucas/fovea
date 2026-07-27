<?php

use App\Actions\Financeiro\GerarLancamentosDaRecorrencia;
use App\Models\FinanceiroCategoria;
use App\Models\FinanceiroLancamento;
use App\Models\FinanceiroRecorrencia;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->categoria = FinanceiroCategoria::create([
        'natureza' => 'receita',
        'nome' => 'Fixa',
    ]);

    $this->acao = new GerarLancamentosDaRecorrencia();
});

function novaRecorrencia(array $overrides = []): FinanceiroRecorrencia
{
    return FinanceiroRecorrencia::create(array_merge([
        'descricao' => 'Fixo',
        'natureza' => 'receita',
        'categoria_id' => test()->categoria->id,
        'valor_previsto' => '7000.00',
        'dia_vencimento' => 3,
        'data_inicio' => '2026-06-01',
        'data_fim' => '2026-12-01',
        'ativo' => true,
    ], $overrides));
}

it('gera um lançamento por mês no intervalo', function () {
    $recorrencia = novaRecorrencia();

    $criados = $this->acao->handle($recorrencia);

    expect($criados)->toBe(7); // jun..dez
    expect(FinanceiroLancamento::count())->toBe(7);

    $vencimentos = FinanceiroLancamento::orderBy('data_vencimento')
        ->pluck('data_vencimento')
        ->map(fn ($d) => $d->format('Y-m-d'))
        ->all();

    expect($vencimentos)->toBe([
        '2026-06-03', '2026-07-03', '2026-08-03', '2026-09-03',
        '2026-10-03', '2026-11-03', '2026-12-03',
    ]);
});

it('clampa o dia de vencimento ao último dia do mês', function () {
    $recorrencia = novaRecorrencia([
        'dia_vencimento' => 31,
        'data_inicio' => '2026-01-01',
        'data_fim' => '2026-02-01',
    ]);

    $this->acao->handle($recorrencia);

    $fev = FinanceiroLancamento::whereBetween('data_vencimento', ['2026-02-01', '2026-02-28'])->first();

    expect($fev)->not->toBeNull();
    expect($fev->data_vencimento->format('Y-m-d'))->toBe('2026-02-28');
});

it('é idempotente: rodar de novo não duplica', function () {
    $recorrencia = novaRecorrencia();

    $this->acao->handle($recorrencia);
    $criadosSegundaVez = $this->acao->handle($recorrencia);

    expect($criadosSegundaVez)->toBe(0);
    expect(FinanceiroLancamento::count())->toBe(7);
});

it('atualiza previsão dos não efetivados e preserva os efetivados', function () {
    $recorrencia = novaRecorrencia();
    $this->acao->handle($recorrencia);

    $junho = FinanceiroLancamento::whereBetween('data_vencimento', ['2026-06-01', '2026-06-30'])->first();
    $junho->update([
        'valor_efetivado' => '6800.00',
        'efetivado_em' => '2026-06-03',
    ]);

    $recorrencia->update(['valor_previsto' => '7500.00']);
    $this->acao->handle($recorrencia);

    $junho->refresh();
    expect($junho->valor_previsto)->toBe('7000.00');
    expect($junho->valor_efetivado)->toBe('6800.00');

    $julho = FinanceiroLancamento::whereBetween('data_vencimento', ['2026-07-01', '2026-07-31'])->first();
    expect($julho->valor_previsto)->toBe('7500.00');
});