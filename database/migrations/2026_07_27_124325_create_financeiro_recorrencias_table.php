<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financeiro_recorrencias', function (Blueprint $table) {
            $table->id();

            $table->string('descricao');
            $table->string('natureza'); // receita | despesa

            $table->foreignId('categoria_id')
                ->constrained('financeiro_categorias');

            $table->foreignId('conta_id')
                ->nullable()
                ->constrained('financeiro_contas')
                ->nullOnDelete();

            $table->decimal('valor_previsto', 10, 2);
            $table->unsignedTinyInteger('dia_vencimento'); // 1..31
            $table->date('data_inicio');
            $table->date('data_fim')->nullable(); // null = sem fim
            $table->boolean('ativo')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financeiro_recorrencias');
    }
};