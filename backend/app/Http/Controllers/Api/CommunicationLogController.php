<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunicationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunicationLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommunicationLog::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('sender', 'like', "%{$search}%")
                    ->orWhere('recipients', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('communication_medium')) {
            $query->where('communication_medium', $request->communication_medium);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('reference_doctype') && $request->filled('reference_id')) {
            $query->where('reference_doctype', $request->reference_doctype)
                  ->where('reference_id', $request->reference_id);
        }

        $logs = $query->orderBy('communication_date', 'desc')
                       ->paginate($request->per_page ?? 15);

        return response()->json($logs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'communication_type' => 'nullable|string|in:Communication,Comment,Feedback',
            'communication_medium' => 'nullable|string|in:Email,Phone,Chat,SMS,Event,Meeting,Visit,Other',
            'status' => 'nullable|string|in:Open,Replied,Closed,Linked',
            'communication_date' => 'nullable|date',
            'sender' => 'nullable|string|max:255',
            'sender_full_name' => 'nullable|string|max:255',
            'recipients' => 'nullable|string',
            'cc' => 'nullable|string',
            'bcc' => 'nullable|string',
            'content' => 'nullable|string',
            'reference_doctype' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'sent_or_received' => 'nullable|boolean',
            'has_attachment' => 'nullable|boolean',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $log = CommunicationLog::create($validated);
        return response()->json($log->fresh('user'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $log = CommunicationLog::with('user')->findOrFail($id);
        return response()->json($log);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'communication_type' => 'nullable|string|in:Communication,Comment,Feedback',
            'communication_medium' => 'nullable|string|in:Email,Phone,Chat,SMS,Event,Meeting,Visit,Other',
            'status' => 'nullable|string|in:Open,Replied,Closed,Linked',
            'communication_date' => 'nullable|date',
            'sender' => 'nullable|string|max:255',
            'sender_full_name' => 'nullable|string|max:255',
            'recipients' => 'nullable|string',
            'cc' => 'nullable|string',
            'bcc' => 'nullable|string',
            'content' => 'nullable|string',
            'reference_doctype' => 'nullable|string|max:255',
            'reference_id' => 'nullable|integer',
            'sent_or_received' => 'nullable|boolean',
            'has_attachment' => 'nullable|boolean',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $log = CommunicationLog::findOrFail($id);
        $log->update($validated);
        return response()->json($log->fresh('user'));
    }

    public function destroy(int $id): JsonResponse
    {
        $log = CommunicationLog::findOrFail($id);
        $log->delete();
        return response()->json(null, 204);
    }
}
