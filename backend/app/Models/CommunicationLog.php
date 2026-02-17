<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'communication_type',
        'communication_medium',
        'status',
        'communication_date',
        'sender',
        'sender_full_name',
        'recipients',
        'cc',
        'bcc',
        'content',
        'reference_doctype',
        'reference_id',
        'sent_or_received',
        'has_attachment',
        'user_id',
    ];

    protected $casts = [
        'communication_date' => 'datetime',
        'sent_or_received' => 'boolean',
        'has_attachment' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
