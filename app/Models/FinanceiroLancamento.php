<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceiroLancamento extends Model
{
    use SoftDeletes;

    protected $table = 'financeiro_lancamentos';

    protected $fillable = [
        'descricao',
        'natureza',
        'categoria_id',
        'conta_id',
        'recorrencia_id',
        'valor_previsto',
        'valor_efetivado',
        'data_vencimento',
        'efetivado_em',
    ];

    protected function casts(): array
    {
        return [
            'valor_previsto' => 'decimal:2',
            'valor_efetivado' => 'decimal:2',
            'data_vencimento' => 'date',
            'efetivado_em' => 'date',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(FinanceiroCategoria::class, 'categoria_id');
    }

    public function conta(): BelongsTo
    {
        return $this->belongsTo(FinanceiroConta::class, 'conta_id');
    }

    public function recorrencia(): BelongsTo
    {
        return $this->belongsTo(FinanceiroRecorrencia::class, 'recorrencia_id');
    }
}