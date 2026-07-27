<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceiroCategoria extends Model
{
    use SoftDeletes;

    protected $table = 'financeiro_categorias';

    protected $fillable = [
        'natureza',
        'nome',
    ];

    public function lancamentos(): HasMany
    {
        return $this->hasMany(FinanceiroLancamento::class, 'categoria_id');
    }

    public function recorrencias(): HasMany
    {
        return $this->hasMany(FinanceiroRecorrencia::class, 'categoria_id');
    }
}