<?php

namespace App\Actions\Financeiro;

use App\Models\FinanceiroLancamento;
use App\Models\FinanceiroRecorrencia;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

class GerarLancamentosDaRecorrencia
{
    /**
     * Gera (ou atualiza) os lançamentos mensais de uma recorrência.
     *
     * Regras:
     * - Um lançamento por mês no intervalo [data_inicio, fim].
     * - dia_vencimento é "clampado" ao último dia do mês (31 -> 28/fev).
     * - Idempotente: mês já existente não duplica.
     * - Atualiza valor_previsto/vencimento dos NÃO efetivados; nunca toca nos efetivados.
     *
     * @return int quantidade de lançamentos criados
     */
    public function handle(FinanceiroRecorrencia $recorrencia, ?Carbon $ate = null): int
    {
        $inicio = CarbonImmutable::parse($recorrencia->data_inicio)->startOfMonth();

        if ($recorrencia->data_fim) {
            $fim = CarbonImmutable::parse($recorrencia->data_fim)->startOfMonth();
        } elseif ($ate) {
            $fim = CarbonImmutable::parse($ate)->startOfMonth();
        } else {
            // Recorrência sem fim: horizonte padrão = fim do ano corrente.
            $fim = CarbonImmutable::now()->endOfYear()->startOfMonth();
        }

        if ($fim->lt($inicio)) {
            return 0;
        }

        // Lançamentos já existentes desta recorrência, indexados por "YYYY-MM".
        $existentes = $recorrencia->lancamentos()
            ->get()
            ->keyBy(fn (FinanceiroLancamento $l) => CarbonImmutable::parse($l->data_vencimento)->format('Y-m'));

        $criados = 0;

        for ($mes = $inicio; $mes->lte($fim); $mes = $mes->addMonth()) {
            $chave = $mes->format('Y-m');
            $vencimento = $this->vencimentoDoMes($mes, $recorrencia->dia_vencimento);

            $existente = $existentes->get($chave);

            if ($existente === null) {
                $recorrencia->lancamentos()->create([
                    'descricao' => $recorrencia->descricao,
                    'natureza' => $recorrencia->natureza,
                    'categoria_id' => $recorrencia->categoria_id,
                    'conta_id' => $recorrencia->conta_id,
                    'valor_previsto' => $recorrencia->valor_previsto,
                    'data_vencimento' => $vencimento,
                ]);
                $criados++;
                continue;
            }

            // Já existe: atualiza projeção só se ainda não foi efetivado.
            if ($existente->efetivado_em === null) {
                $existente->update([
                    'valor_previsto' => $recorrencia->valor_previsto,
                    'data_vencimento' => $vencimento,
                ]);
            }
        }

        return $criados;
    }

    /** dia_vencimento clampado ao último dia do mês. */
    private function vencimentoDoMes(CarbonImmutable $mes, int $dia): CarbonImmutable
    {
        return $mes->day(min($dia, $mes->daysInMonth));
    }
}