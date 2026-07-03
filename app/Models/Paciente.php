<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paciente extends Model
{
    use SoftDeletes;

    protected $table = 'pacientes';

    protected $fillable = [
        'nome_completo',
        'nome_social',
        'data_nascimento',
        'sexo',
        'cpf',
        'rg',
        'ocupacao',
        'celular_whatsapp',
        'telefone_2',
        'email',
        'origem',
        'responsavel_nome',
        'responsavel_cpf',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'uf',
        'observacoes',
    ];

    protected $appends = ['idade'];

    protected function casts(): array
    {
        return [
            'data_nascimento' => 'date',
        ];
    }

    public function consultas(): HasMany
    {
        return $this->hasMany(Consulta::class);
    }

    protected function idade(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->data_nascimento?->age,
        );
    }
}