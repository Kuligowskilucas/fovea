<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescricao_medidas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('prescricao_id')
                ->constrained('prescricoes')
                ->cascadeOnDelete();

            $table->string('olho', 2);                     
            $table->decimal('esferico', 5, 2)->nullable();
            $table->decimal('cilindrico', 5, 2)->nullable();
            $table->smallInteger('eixo')->nullable();      
            $table->string('av')->nullable();              
            $table->string('prisma')->nullable();          
            $table->decimal('dnp', 4, 1)->nullable();      

            $table->timestamps();

            $table->unique(['prescricao_id', 'olho']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescricao_medidas');
    }
};