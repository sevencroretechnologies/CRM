<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_persons', function (Blueprint $table) {
            $table->id();
            $table->string('sales_person_name');
            $table->foreignId('parent_sales_person_id')->nullable()->constrained('sales_persons')->nullOnDelete();
            $table->boolean('is_group')->default(false);
            $table->boolean('enabled')->default(true);
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->foreignId('employee_id')->nullable();
            $table->foreignId('territory_id')->nullable()->constrained('territories')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_persons');
    }
};
