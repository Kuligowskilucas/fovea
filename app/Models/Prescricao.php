<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prescricao extends Model
{
    protected $table = 'prescricoes';

    protected $fillable = [
        'consulta_id',
        'tipo',        
        'tipo_visao',  
        'adicao',      
        'lente',
        'retorno_em',
        'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'adicao' => 'decimal:2',
            'retorno_em' => 'date',
        ];
    }

    public function consulta(): BelongsTo
    {
        return $this->belongsTo(Consulta::class);
    }

    public function medidas(): HasMany
    {
        return $this->hasMany(PrescricaoMedida::class);
    }
}