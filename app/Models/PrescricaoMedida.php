<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescricaoMedida extends Model
{
    protected $table = 'prescricao_medidas';

    protected $fillable = [
        'prescricao_id',
        'olho',       // OD | OE
        'esferico',
        'cilindrico',
        'eixo',
        'av',
        'prisma',     // só óculos
        'dnp',        // só óculos
    ];

    protected function casts(): array
    {
        return [
            'esferico' => 'decimal:2',
            'cilindrico' => 'decimal:2',
            'eixo' => 'integer',
            'dnp' => 'decimal:1',
        ];
    }

    public function prescricao(): BelongsTo
    {
        return $this->belongsTo(Prescricao::class);
    }
}