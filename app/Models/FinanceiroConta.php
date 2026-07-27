<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceiroConta extends Model
{
    use SoftDeletes;

    protected $table = 'financeiro_contas';

    protected $fillable = [
        'nome',
        'saldo_inicial',
        'data_inicial',
    ];

    protected function casts(): array
    {
        return [
            'saldo_inicial' => 'decimal:2',
            'data_inicial' => 'date',
        ];
    }

    public function lancamentos(): HasMany
    {
        return $this->hasMany(FinanceiroLancamento::class, 'conta_id');
    }

    public function recorrencias(): HasMany
    {
        return $this->hasMany(FinanceiroRecorrencia::class, 'conta_id');
    }
}