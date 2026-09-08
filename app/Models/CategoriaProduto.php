<?php

namespace App\Models;

use Database\Factories\CategoriaProdutoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoriaProduto extends Model
{
    /** @use HasFactory<CategoriaProdutoFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $table = 'categorias_produto';

    protected $fillable = [
        'nome',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
        ];
    }

    public function produtos(): HasMany
    {
        return $this->hasMany(Produto::class, 'categoria_produto_id');
    }
}
