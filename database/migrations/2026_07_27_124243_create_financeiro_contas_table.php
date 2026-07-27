<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financeiro_contas', function (Blueprint $table) {
            $table->id();

            $table->string('nome');
            $table->decimal('saldo_inicial', 10, 2)->default(0);
            $table->date('data_inicial');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financeiro_contas');
    }
};