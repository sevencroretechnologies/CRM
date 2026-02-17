<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QuotationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    public function __construct(private QuotationService $quotationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $quotations = $this->quotationService->list($request->all());
        return response()->json($quotations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'naming_series' => 'nullable|string|max:255',
            'quotation_to' => 'nullable|string|in:Customer,Lead,Prospect',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'opportunity_id' => 'nullable|integer|exists:opportunities,id',
            'party_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Draft,Submitted,Ordered,Lost,Cancelled,Expired',
            'transaction_date' => 'nullable|date',
            'valid_till' => 'nullable|date',
            'order_type' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'tax_amount' => 'nullable|numeric|min:0',
            'territory_id' => 'nullable|integer|exists:territories,id',
            'customer_address' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:50',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'sales_person_id' => 'nullable|integer|exists:sales_persons,id',
            'items' => 'nullable|array',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.qty' => 'nullable|numeric|min:0',
            'items.*.uom' => 'nullable|string|max:50',
            'items.*.rate' => 'nullable|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
        ]);

        $quotation = $this->quotationService->create($validated);
        return response()->json($quotation, 201);
    }

    public function show(int $id): JsonResponse
    {
        $quotation = $this->quotationService->find($id);
        return response()->json($quotation);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'naming_series' => 'nullable|string|max:255',
            'quotation_to' => 'nullable|string|in:Customer,Lead,Prospect',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'opportunity_id' => 'nullable|integer|exists:opportunities,id',
            'party_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Draft,Submitted,Ordered,Lost,Cancelled,Expired',
            'transaction_date' => 'nullable|date',
            'valid_till' => 'nullable|date',
            'order_type' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'tax_amount' => 'nullable|numeric|min:0',
            'territory_id' => 'nullable|integer|exists:territories,id',
            'customer_address' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:50',
            'terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'sales_person_id' => 'nullable|integer|exists:sales_persons,id',
            'items' => 'nullable|array',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.qty' => 'nullable|numeric|min:0',
            'items.*.uom' => 'nullable|string|max:50',
            'items.*.rate' => 'nullable|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
        ]);

        $quotation = $this->quotationService->update($id, $validated);
        return response()->json($quotation);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->quotationService->delete($id);
        return response()->json(null, 204);
    }

    public function submit(int $id): JsonResponse
    {
        $quotation = $this->quotationService->submit($id);
        return response()->json($quotation);
    }

    public function cancel(int $id): JsonResponse
    {
        $quotation = $this->quotationService->cancel($id);
        return response()->json($quotation);
    }
}
