<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('naming_series')->nullable();
            $table->string('quotation_to')->default('Customer');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities')->nullOnDelete();
            $table->string('party_name')->nullable();
            $table->string('status')->default('Draft');
            $table->date('transaction_date')->nullable();
            $table->date('valid_till')->nullable();
            $table->string('order_type')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('net_total', 15, 2)->default(0);
            $table->foreignId('territory_id')->nullable()->constrained('territories')->nullOnDelete();
            $table->string('customer_address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_mobile')->nullable();
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('sales_person_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('quotations')->cascadeOnDelete();
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->decimal('qty', 15, 4)->default(1);
            $table->string('uom')->nullable();
            $table->decimal('rate', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('net_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
    }
};
