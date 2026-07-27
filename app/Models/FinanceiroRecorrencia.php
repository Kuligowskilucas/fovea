<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceiroRecorrencia extends Model
{
    use SoftDeletes;

    protected $table = 'financeiro_recorrencias';

    protected $fillable = [
        'descricao',
        'natureza',
        'categoria_id',
        'conta_id',
        'valor_previsto',
        'dia_vencimento',
        'data_inicio',
        'data_fim',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'valor_previsto' => 'decimal:2',
            'dia_vencimento' => 'integer',
            'data_inicio' => 'date',
            'data_fim' => 'date',
            'ativo' => 'boolean',
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

    public function lancamentos(): HasMany
    {
        return $this->hasMany(FinanceiroLancamento::class, 'recorrencia_id');
    }
}