<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Newsletter::with(['campaign', 'sender']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('sender_name', 'like', "%{$search}%")
                    ->orWhere('sender_email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $newsletters = $query->orderBy('created_at', 'desc')
                              ->paginate($request->per_page ?? 15);

        return response()->json($newsletters);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'status' => 'nullable|string|in:Draft,Queued,Sending,Sent',
            'message' => 'nullable|string',
            'email_group' => 'nullable|string|max:255',
            'send_at' => 'nullable|date',
            'total_recipients' => 'nullable|integer|min:0',
            'campaign_id' => 'nullable|integer|exists:campaigns,id',
            'sender_id' => 'nullable|integer|exists:users,id',
            'sender_name' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
        ]);

        $newsletter = Newsletter::create($validated);
        return response()->json($newsletter->fresh(['campaign', 'sender']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $newsletter = Newsletter::with(['campaign', 'sender'])->findOrFail($id);
        return response()->json($newsletter);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Draft,Queued,Sending,Sent',
            'message' => 'nullable|string',
            'email_group' => 'nullable|string|max:255',
            'send_at' => 'nullable|date',
            'total_recipients' => 'nullable|integer|min:0',
            'campaign_id' => 'nullable|integer|exists:campaigns,id',
            'sender_id' => 'nullable|integer|exists:users,id',
            'sender_name' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
        ]);

        $newsletter = Newsletter::findOrFail($id);
        $newsletter->update($validated);
        return response()->json($newsletter->fresh(['campaign', 'sender']));
    }

    public function destroy(int $id): JsonResponse
    {
        $newsletter = Newsletter::findOrFail($id);
        $newsletter->delete();
        return response()->json(null, 204);
    }

    public function send(int $id): JsonResponse
    {
        $newsletter = Newsletter::findOrFail($id);
        $newsletter->update([
            'status' => 'Queued',
        ]);
        return response()->json($newsletter->fresh(['campaign', 'sender']));
    }
}
