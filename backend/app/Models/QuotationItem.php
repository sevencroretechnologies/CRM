<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_id',
        'item_name',
        'description',
        'qty',
        'uom',
        'rate',
        'amount',
        'discount_percentage',
        'discount_amount',
        'net_amount',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }
}
