<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PacienteArquivo extends Model
{
    use SoftDeletes;

    protected $table = 'paciente_arquivos';

    protected $fillable = [
        'paciente_id',
        'nome_original',
        'caminho',
        'mime',
        'tamanho',
    ];

    protected function casts(): array
    {
        return [
            'tamanho' => 'integer',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }
}