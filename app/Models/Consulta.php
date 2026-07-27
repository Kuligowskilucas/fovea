<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consulta extends Model
{
    use SoftDeletes;

    protected $table = 'consultas';

    protected $fillable = [
        'paciente_id',
        'user_id',
        'atendido_em',
        'procedimento',
        'retorno_em',
        'observacoes',
        'valor_pago',
        'forma_pagamento',
    ];

    protected function casts(): array
    {
        return [
            'atendido_em' => 'datetime',
            'retorno_em' => 'date',
            'valor_pago' => 'decimal:2',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function profissional(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function prescricoes(): HasMany
    {
        return $this->hasMany(Prescricao::class);
    }

    public function exame(): HasOne
    {
        return $this->hasOne(Exame::class);
    }
}