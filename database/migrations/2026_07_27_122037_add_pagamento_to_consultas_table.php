<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->decimal('valor_pago', 10, 2)->nullable()->after('observacoes');
            $table->string('forma_pagamento')->nullable()->after('valor_pago');
        });
    }

    public function down(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->dropColumn(['valor_pago', 'forma_pagamento']);
        });
    }
};