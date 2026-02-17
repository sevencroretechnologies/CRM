<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'naming_series',
        'quotation_to',
        'customer_id',
        'lead_id',
        'opportunity_id',
        'party_name',
        'status',
        'transaction_date',
        'valid_till',
        'order_type',
        'currency',
        'total_amount',
        'discount_amount',
        'grand_total',
        'tax_amount',
        'net_total',
        'territory_id',
        'customer_address',
        'contact_person',
        'contact_email',
        'contact_mobile',
        'terms',
        'notes',
        'sales_person_id',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'net_total' => 'decimal:2',
        'transaction_date' => 'date',
        'valid_till' => 'date',
    ];

    protected $with = ['customer', 'lead', 'opportunity', 'territory', 'items'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    public function salesPerson(): BelongsTo
    {
        return $this->belongsTo(SalesPerson::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }
}
