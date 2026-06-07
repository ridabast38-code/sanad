<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('practitioner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->dateTime('scheduled_at');
            $table->string('status')->default('pending'); // pending|confirmed|completed|cancelled|no_show
            $table->decimal('price', 8, 2);
            $table->decimal('platform_amount', 8, 2);   // 20% cut
            $table->decimal('practitioner_amount', 8, 2); // 80% cut
            $table->string('payment_status')->default('unpaid'); // unpaid|paid|refunded
            $table->string('payment_link')->nullable();  // Whish payment link
            $table->string('meeting_link')->nullable();   // video call link
            $table->text('client_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
