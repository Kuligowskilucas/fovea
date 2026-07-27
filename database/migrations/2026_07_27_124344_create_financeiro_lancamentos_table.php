<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financeiro_lancamentos', function (Blueprint $table) {
            $table->id();

            $table->string('descricao');
            $table->string('natureza'); // receita | despesa

            $table->foreignId('categoria_id')
                ->constrained('financeiro_categorias');

            $table->foreignId('conta_id')
                ->nullable()
                ->constrained('financeiro_contas')
                ->nullOnDelete();

            $table->foreignId('recorrencia_id')
                ->nullable()
                ->constrained('financeiro_recorrencias')
                ->nullOnDelete();

            $table->decimal('valor_previsto', 10, 2);
            $table->decimal('valor_efetivado', 10, 2)->nullable();
            $table->date('data_vencimento');
            $table->date('efetivado_em')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('data_vencimento');
            $table->index('efetivado_em');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financeiro_lancamentos');
    }
};