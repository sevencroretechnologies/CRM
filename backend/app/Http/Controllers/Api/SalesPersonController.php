<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesPerson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesPersonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SalesPerson::with(['parent', 'territory']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('sales_person_name', 'like', "%{$search}%");
        }

        if ($request->filled('enabled')) {
            $query->where('enabled', $request->boolean('enabled'));
        }

        $salesPersons = $query->orderBy('sales_person_name')->get();
        return response()->json($salesPersons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sales_person_name' => 'required|string|max:255',
            'parent_sales_person_id' => 'nullable|integer|exists:sales_persons,id',
            'is_group' => 'nullable|boolean',
            'enabled' => 'nullable|boolean',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'employee_id' => 'nullable|integer',
            'territory_id' => 'nullable|integer|exists:territories,id',
        ]);

        $salesPerson = SalesPerson::create($validated);
        return response()->json($salesPerson->fresh(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $salesPerson = SalesPerson::with(['parent', 'children', 'territory'])->findOrFail($id);
        return response()->json($salesPerson);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'sales_person_name' => 'nullable|string|max:255',
            'parent_sales_person_id' => 'nullable|integer|exists:sales_persons,id',
            'is_group' => 'nullable|boolean',
            'enabled' => 'nullable|boolean',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'employee_id' => 'nullable|integer',
            'territory_id' => 'nullable|integer|exists:territories,id',
        ]);

        $salesPerson = SalesPerson::findOrFail($id);
        $salesPerson->update($validated);
        return response()->json($salesPerson->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $salesPerson = SalesPerson::findOrFail($id);
        $salesPerson->delete();
        return response()->json(null, 204);
    }
}
