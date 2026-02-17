<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Newsletter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subject',
        'status',
        'message',
        'email_group',
        'send_at',
        'sent_at',
        'total_recipients',
        'emails_sent',
        'campaign_id',
        'sender_id',
        'sender_name',
        'sender_email',
    ];

    protected $casts = [
        'send_at' => 'datetime',
        'sent_at' => 'datetime',
        'total_recipients' => 'integer',
        'emails_sent' => 'integer',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
