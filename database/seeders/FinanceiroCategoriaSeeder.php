<?php

namespace Database\Seeders;

use App\Models\FinanceiroCategoria;
use Illuminate\Database\Seeder;

class FinanceiroCategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['natureza' => 'receita', 'nome' => 'Fixa'],
            ['natureza' => 'receita', 'nome' => 'Variável'],
            ['natureza' => 'despesa', 'nome' => 'Dívida'],
            ['natureza' => 'despesa', 'nome' => 'Custo de Vida'],
            ['natureza' => 'despesa', 'nome' => 'Liberdade'],
        ];

        foreach ($categorias as $categoria) {
            FinanceiroCategoria::firstOrCreate($categoria);
        }
    }
}