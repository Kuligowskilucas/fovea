<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Collection;
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

    /**
     * Todas as prescrições do paciente, atravessando consultas.
     * (Paciente → Consulta → Prescricao)
     */
    public function prescricoes(): HasManyThrough
    {
        return $this->hasManyThrough(Prescricao::class, Consulta::class);
    }

    protected function idade(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->data_nascimento?->age,
        );
    }

    /**
     * Série histórica de refrações de ÓCULOS, da mais recente para a mais antiga.
     * Ordenada por `atendido_em` da consulta (data clínica em que o grau foi medido,
     * não a data em que a receita foi digitada).
     *
     * Cada item: data + medidas OD/OE já achatadas para consumo direto no front.
     */
    public function refracoes(): Collection
    {
        return $this->prescricoes()
            ->where('prescricoes.tipo', 'oculos')
            ->with(['medidas', 'consulta:id,atendido_em'])
            ->orderByDesc('consultas.atendido_em')
            ->get(['prescricoes.id', 'prescricoes.consulta_id', 'prescricoes.tipo_visao', 'prescricoes.adicao'])
            ->map(function ($prescricao) {
                $od = $prescricao->medidas->firstWhere('olho', 'OD');
                $oe = $prescricao->medidas->firstWhere('olho', 'OE');

                return [
                    'prescricao_id' => $prescricao->id,
                    'consulta_id' => $prescricao->consulta_id,
                    'atendido_em' => $prescricao->consulta?->atendido_em,
                    'tipo_visao' => $prescricao->tipo_visao,
                    'adicao' => $prescricao->adicao,
                    'od' => $od ? $od->only(['esferico', 'cilindrico', 'eixo', 'av']) : null,
                    'oe' => $oe ? $oe->only(['esferico', 'cilindrico', 'eixo', 'av']) : null,
                ];
            });
    }

    public function arquivos(): HasMany
    {
        return $this->hasMany(PacienteArquivo::class)->latest();
    }
}