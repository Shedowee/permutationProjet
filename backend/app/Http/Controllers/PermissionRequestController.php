<?php

namespace App\Http\Controllers;

use App\Events\UserActionOccurred;
use App\Models\PermissionRequest;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionRequestController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', PermissionRequest::class);

        $query = PermissionRequest::with(['user.role', 'reviewer'])
            ->orderByDesc('created_at');

        if (!$request->user()->hasPermission('approve_permission_requests')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $limit = (int) $request->query('limit', 10);
        if ($limit === -1) {
            return response()->json(['data' => $query->get()]);
        }

        $paginator = $query->paginate($limit);

        return response()->json([
            'data' => $paginator->getCollection(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', PermissionRequest::class);

        $validated = $request->validate([
            'type' => 'required|string|max:150',
        ]);

        $duplicatePending = PermissionRequest::where('user_id', $request->user()->id)
            ->where('type', $validated['type'])
            ->where('status', 'pending')
            ->exists();

        if ($duplicatePending) {
            return response()->json(['message' => 'Une demande identique est déjà en attente.'], 422);
        }

        $permissionRequest = DB::transaction(function () use ($request, $validated) {
            $record = PermissionRequest::create([
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'status' => 'pending',
            ]);

            event(new UserActionOccurred(
                $request->user()->id,
                'permission_request_created',
                "Demande de permission créée: {$validated['type']}"
            ));

            $this->notificationService->notifyUsersWithRole(
                'admin',
                'Nouvelle demande de permission',
                "{$request->user()->name} a soumis une demande de permission ({$validated['type']}).",
                'system'
            );

            return $record;
        });

        return response()->json(['data' => $permissionRequest], 201);
    }

    public function show(Request $request, PermissionRequest $permissionRequest)
    {
        $this->authorize('view', $permissionRequest);

        return response()->json(['data' => $permissionRequest->load(['user.role', 'reviewer'])]);
    }

    public function approve(Request $request, PermissionRequest $permissionRequest)
    {
        $this->authorize('approve', $permissionRequest);

        return $this->review($request, $permissionRequest, 'approved', 'permission_request_approved', 'Demande approuvée');
    }

    public function reject(Request $request, PermissionRequest $permissionRequest)
    {
        $this->authorize('reject', $permissionRequest);

        return $this->review($request, $permissionRequest, 'rejected', 'permission_request_rejected', 'Demande rejetée');
    }

    private function review(Request $request, PermissionRequest $permissionRequest, string $status, string $eventType, string $notificationTitle)
    {
        $validated = $request->validate([
            'comment' => 'nullable|string|max:500',
        ]);

        if ($permissionRequest->status !== 'pending') {
            return response()->json(['message' => 'Cette demande a déjà été traitée.'], 422);
        }

        $permissionRequest->update([
            'status' => $status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        event(new UserActionOccurred(
            $request->user()->id,
            $eventType,
            "{$notificationTitle}: {$permissionRequest->type}"
        ));

        $this->notificationService->notify(
            $permissionRequest->user_id,
            $notificationTitle,
            $validated['comment'] ?? "Votre demande ({$permissionRequest->type}) a été {$status}.",
            'system'
        );

        return response()->json(['data' => $permissionRequest->fresh(['user.role', 'reviewer'])]);
    }
}
