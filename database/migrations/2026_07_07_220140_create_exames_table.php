<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exames', function (Blueprint $table) {
            $table->id();

            $table->foreignId('consulta_id')
                ->constrained('consultas')
                ->cascadeOnDelete();

           
            $table->jsonb('dados')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique('consulta_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exames');
    }
};