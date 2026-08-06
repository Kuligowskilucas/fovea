<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paciente_arquivos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('paciente_id')
                ->constrained('pacientes')
                ->cascadeOnDelete();

            $table->string('nome_original');   // nome exibido / usado no download
            $table->string('caminho');         // caminho relativo no disco 'local' (privado)
            $table->string('mime');            // ex.: application/pdf, image/jpeg
            $table->unsignedBigInteger('tamanho'); // bytes

            $table->timestamps();
            $table->softDeletes();

            $table->index('paciente_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paciente_arquivos');
    }
};