<?php

namespace App\Services;

use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Pagination\LengthAwarePaginator;

class QuotationService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Quotation::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('party_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['quotation_to'])) {
            $query->where('quotation_to', $filters['quotation_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): Quotation
    {
        return Quotation::findOrFail($id);
    }

    public function create(array $data): Quotation
    {
        $items = $data['items'] ?? [];
        unset($data['items']);

        $quotation = Quotation::create($data);

        foreach ($items as $item) {
            $item['quotation_id'] = $quotation->id;
            $item['amount'] = ($item['qty'] ?? 1) * ($item['rate'] ?? 0);
            $item['net_amount'] = $item['amount'] - ($item['discount_amount'] ?? 0);
            QuotationItem::create($item);
        }

        $this->recalculateTotals($quotation);

        return $quotation->fresh();
    }

    public function update(int $id, array $data): Quotation
    {
        $quotation = Quotation::findOrFail($id);
        $items = $data['items'] ?? null;
        unset($data['items']);

        $quotation->update($data);

        if ($items !== null) {
            $quotation->items()->delete();
            foreach ($items as $item) {
                $item['quotation_id'] = $quotation->id;
                $item['amount'] = ($item['qty'] ?? 1) * ($item['rate'] ?? 0);
                $item['net_amount'] = $item['amount'] - ($item['discount_amount'] ?? 0);
                QuotationItem::create($item);
            }
        }

        $this->recalculateTotals($quotation);

        return $quotation->fresh();
    }

    public function delete(int $id): bool
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->items()->delete();
        return $quotation->delete();
    }

    public function submit(int $id): Quotation
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->update(['status' => 'Submitted']);
        return $quotation->fresh();
    }

    public function cancel(int $id): Quotation
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->update(['status' => 'Cancelled']);
        return $quotation->fresh();
    }

    private function recalculateTotals(Quotation $quotation): void
    {
        $totalAmount = $quotation->items()->sum('amount');
        $discountAmount = $quotation->items()->sum('discount_amount');
        $netTotal = $quotation->items()->sum('net_amount');

        $quotation->update([
            'total_amount' => $totalAmount,
            'discount_amount' => $discountAmount,
            'net_total' => $netTotal,
            'grand_total' => $netTotal + ($quotation->tax_amount ?? 0),
        ]);
    }
}
