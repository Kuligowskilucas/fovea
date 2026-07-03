<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();

            $table->string('nome_completo');
            $table->string('nome_social')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('sexo')->nullable();          
            $table->string('cpf', 14)->nullable();       
            $table->string('rg', 20)->nullable();
            $table->string('ocupacao')->nullable();


            $table->string('celular_whatsapp')->nullable();
            $table->string('telefone_2')->nullable();
            $table->string('email')->nullable();

            $table->string('origem')->nullable();

            $table->string('responsavel_nome')->nullable();
            $table->string('responsavel_cpf', 14)->nullable();

            $table->string('cep', 9)->nullable();
            $table->string('logradouro')->nullable();
            $table->string('numero', 20)->nullable();
            $table->string('complemento')->nullable();
            $table->string('bairro')->nullable();
            $table->string('cidade')->nullable();
            $table->string('uf', 2)->nullable();

            $table->text('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('cpf');
            $table->index('nome_completo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};