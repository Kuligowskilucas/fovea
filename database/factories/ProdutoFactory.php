<?php

namespace Database\Factories;

use App\Models\CategoriaProduto;
use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'categoria_produto_id' => CategoriaProduto::factory(),
            'nome' => fake()->words(3, true),
            'descricao' => fake()->sentence(),
            'preco' => fake()->randomFloat(2, 100, 2000),
            'imagem' => null,
            'ativo' => true,
        ];
    }

    /**
     * Indicate that the product has no price ("sob consulta").
     */
    public function sobConsulta(): static
    {
        return $this->state(fn (array $attributes) => [
            'preco' => null,
        ]);
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inativo(): static
    {
        return $this->state(fn (array $attributes) => [
            'ativo' => false,
        ]);
    }
}
