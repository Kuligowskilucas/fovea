<?php

namespace App\Actions\Financeiro;

use App\Models\FinanceiroLancamento;
use Illuminate\Support\Carbon;

class EfetivarLancamento
{
    /**
     * Marca um lançamento como efetivado (pago/recebido de fato).
     *
     * - valor ausente => assume o valor_previsto.
     * - data ausente  => assume hoje.
     * - Já efetivado  => sobrescreve (corrigir valor errado é o caso comum).
     */
    public function efetivar(
        FinanceiroLancamento $lancamento,
        int|float|string|null $valor = null,
        ?Carbon $data = null,
    ): FinanceiroLancamento {
        $lancamento->update([
            'valor_efetivado' => $valor ?? $lancamento->valor_previsto,
            'efetivado_em' => $data ?? Carbon::now(),
        ]);

        return $lancamento;
    }

    /** Desfaz a efetivação: volta a contar como previsto. */
    public function desfazer(FinanceiroLancamento $lancamento): FinanceiroLancamento
    {
        $lancamento->update([
            'valor_efetivado' => null,
            'efetivado_em' => null,
        ]);

        return $lancamento;
    }
}