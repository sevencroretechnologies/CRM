<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->string('subject')->nullable();
            $table->string('communication_type')->default('Communication');
            $table->string('communication_medium')->default('Email');
            $table->string('status')->default('Open');
            $table->dateTime('communication_date')->nullable();
            $table->string('sender')->nullable();
            $table->string('sender_full_name')->nullable();
            $table->text('recipients')->nullable();
            $table->text('cc')->nullable();
            $table->text('bcc')->nullable();
            $table->text('content')->nullable();
            $table->string('reference_doctype')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->boolean('sent_or_received')->default(true);
            $table->boolean('has_attachment')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['reference_doctype', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
    }
};
