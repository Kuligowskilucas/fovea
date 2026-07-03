<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescricoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('consulta_id')
                ->constrained('consultas')
                ->cascadeOnDelete();

            $table->string('tipo');                     
            $table->string('tipo_visao')->nullable();   
            $table->decimal('adicao', 4, 2)->nullable();
            $table->string('lente')->nullable();        
            $table->date('retorno_em')->nullable();
            $table->text('observacoes')->nullable();

            $table->timestamps();

            $table->index('consulta_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescricoes');
    }
};