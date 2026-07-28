<?php

namespace App\Http\Controllers;

use App\Actions\Financeiro\EfetivarLancamento;
use App\Http\Requests\Financeiro\EfetivarLancamentoRequest;
use App\Models\FinanceiroLancamento;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use App\Http\Requests\Financeiro\LancamentoAvulsoRequest;
use App\Models\FinanceiroCategoria;
use App\Models\FinanceiroConta;

class FinanceiroLancamentoController extends Controller
{
    /** App roda em UTC; mês corrente e "hoje" precisam do fuso da clínica. */
    private const TZ = 'America/Sao_Paulo';

    public function index(Request $request)
    {
        $hoje = now(self::TZ);

        $ano = (int) $request->query('ano', $hoje->year);
        $mes = max(1, min(12, (int) $request->query('mes', $hoje->month)));

        $referencia = Carbon::create($ano, $mes, 1, 0, 0, 0, self::TZ);

        $lancamentos = FinanceiroLancamento::query()
            ->with('categoria:id,natureza,nome')
            ->whereYear('data_vencimento', $ano)
            ->whereMonth('data_vencimento', $mes)
            ->orderBy('data_vencimento')
            ->orderBy('id')
            ->get();

        return Inertia::render('financeiro/mes', [
            'referencia' => [
                'ano' => $ano,
                'mes' => $mes,
                'rotulo' => ucfirst($referencia->locale('pt_BR')->translatedFormat('F \d\e Y')),
                'anterior' => $this->refDeslocada($referencia, -1),
                'proximo' => $this->refDeslocada($referencia, 1),
            ],
            'lancamentos' => $lancamentos,
            'resumo' => [
                'receita' => $this->totais($lancamentos->where('natureza', 'receita')),
                'despesa' => $this->totais($lancamentos->where('natureza', 'despesa')),
            ],
            'categorias' => FinanceiroCategoria::orderBy('natureza')
                ->orderBy('nome')
                ->get(['id', 'natureza', 'nome']),
            'contas' => FinanceiroConta::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(LancamentoAvulsoRequest $request)
    {
        FinanceiroLancamento::create($request->validated());

        return back()->with('success', 'Lançamento criado.');
    }

    public function efetivar(
        EfetivarLancamentoRequest $request,
        FinanceiroLancamento $lancamento,
        EfetivarLancamento $acao,
    ) {
        $dados = $request->validated();

        $data = isset($dados['efetivado_em'])
            ? Carbon::parse($dados['efetivado_em'])
            : now(self::TZ);

        $acao->efetivar($lancamento, $dados['valor_efetivado'] ?? null, $data);

        return back()->with('success', 'Lançamento efetivado.');
    }

    public function desfazer(FinanceiroLancamento $lancamento, EfetivarLancamento $acao)
    {
        $acao->desfazer($lancamento);

        return back()->with('success', 'Efetivação desfeita.');
    }

    private function refDeslocada(Carbon $ref, int $meses): array
    {
        $d = $ref->copy()->addMonthsNoOverflow($meses);

        return ['ano' => $d->year, 'mes' => $d->month];
    }

    /** @param Collection<int, FinanceiroLancamento> $itens */
    private function totais(Collection $itens): array
    {
        return [
            'previsto' => round($itens->sum(fn ($l) => (float) $l->valor_previsto), 2),
            'efetivado' => round($itens->whereNotNull('efetivado_em')->sum(fn ($l) => (float) $l->valor_efetivado), 2),
        ];
    }
}