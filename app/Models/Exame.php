<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exame extends Model
{
    use SoftDeletes;

    protected $table = 'exames';

    protected $fillable = [
        'consulta_id',
        'dados',
    ];

    protected function casts(): array
    {
        return [
            'dados' => 'array', // jsonb <-> array PHP
        ];
    }

    public function consulta(): BelongsTo
    {
        return $this->belongsTo(Consulta::class);
    }
}