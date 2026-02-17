<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPerson extends Model
{
    use HasFactory;

    protected $table = 'sales_persons';

    protected $fillable = [
        'sales_person_name',
        'parent_sales_person_id',
        'is_group',
        'enabled',
        'commission_rate',
        'employee_id',
        'territory_id',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'enabled' => 'boolean',
        'commission_rate' => 'decimal:2',
    ];

    protected $with = ['territory'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(SalesPerson::class, 'parent_sales_person_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(SalesPerson::class, 'parent_sales_person_id');
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }
}
