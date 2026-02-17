<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletters', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->string('status')->default('Draft');
            $table->text('message')->nullable();
            $table->string('email_group')->nullable();
            $table->dateTime('send_at')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->integer('emails_sent')->default(0);
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_name')->nullable();
            $table->string('sender_email')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletters');
    }
};
