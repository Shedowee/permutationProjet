<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use Illuminate\Support\Facades\Storage;

class UtilisateursController extends Controller
{
    /**
     * Update profile picture
     */
    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('image')->store('profile_pictures', 'public');
        $user->update(['profile_picture' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'url' => asset('storage/' . $path)
        ]);
    }

    /**
     * Upload professional document
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:5120',
            'title' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $file = $request->file('document');
        $path = $file->store('user_documents/' . $user->id, 'public');

        $document = $user->documents()->create([
            'title' => $request->title,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'message' => 'Document ajouté avec succès',
            'document' => $document
        ]);
    }

    /**
     * List user documents
     */
    public function listDocuments(Request $request)
    {
        $documents = $request->user()->documents()->latest()->get();
        return response()->json(['data' => $documents]);
    }

    /**
     * Delete user document
     */
    public function deleteDocument(Request $request, \App\Models\UserDocument $document)
    {
        if ($document->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('role')->orderBy('nom')->get();

        $data = $users->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->nom,
                'email' => $u->email,
                'role' => $u->role ? strtolower($u->role->code) : null,
                'status' => $u->actif ? 'actif' : 'inactif',
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'email' => 'required|email|unique:utilisateurs,email',
                'password' => 'required|string|min:6',
                'role' => 'required|string',
                'status' => 'nullable|string',
            ]);

            $roleCode = strtolower($validated['role']);
            $roleId = \App\Models\Role::whereRaw('LOWER(code) = ?', [$roleCode])->value('id');

            if (!$roleId) {
                return response()->json(['message' => 'Role not found'], 422);
            }

            $user = User::create([
                'nom' => $validated['nom'],
                'email' => $validated['email'],
                'mot_de_passe' => Hash::make($validated['password']),
                'role_id' => $roleId,
                'actif' => isset($validated['status']) ? ($validated['status'] === 'actif' || $validated['status'] === 'active') : true,
            ]);

            \App\Models\LogAction::record(
                $request->user()?->id,
                'Création utilisateur',
                'utilisateurs',
                $user->id,
                $request->ip()
            );

            $user->load('role');

            return response()->json([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->nom,
                    'email' => $user->email,
                    'role' => $user->role ? strtolower($user->role->code) : null,
                    'status' => $user->actif ? 'actif' : 'inactif',
                ]
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = User::with(['role', 'documents', 'employe.grade', 'employe.region', 'employe.etablissement'])->findOrFail($id);
        return response()->json(['data' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $utilisateurs)
    {
        $validated = $request->validate([
            'nom' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:utilisateurs,email,' . $utilisateurs->id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        if (isset($validated['role'])) {
            $roleCode = strtolower($validated['role']);
            $roleId = \App\Models\Role::whereRaw('LOWER(code) = ?', [$roleCode])->value('id');
            if (!$roleId) {
                return response()->json(['message' => 'Role not found'], 422);
            }
            $utilisateurs->role_id = $roleId;
        }

        if (isset($validated['nom'])) {
            $utilisateurs->nom = $validated['nom'];
        }
        if (isset($validated['email'])) {
            $utilisateurs->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $utilisateurs->mot_de_passe = Hash::make($validated['password']);
        }
        if (isset($validated['status'])) {
            $utilisateurs->actif = ($validated['status'] === 'actif' || $validated['status'] === 'active');
        }

        $utilisateurs->save();
        $utilisateurs->load('role');

        \App\Models\LogAction::record(
            $request->user()?->id,
            'Mise à jour utilisateur',
            'utilisateurs',
            $utilisateurs->id,
            $request->ip()
        );

        return response()->json([
            'data' => [
                'id' => $utilisateurs->id,
                'name' => $utilisateurs->nom,
                'email' => $utilisateurs->email,
                'role' => $utilisateurs->role ? strtolower($utilisateurs->role->code) : null,
                'status' => $utilisateurs->actif ? 'actif' : 'inactif',
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $utilisateurs)
    {
        $utilisateurs->delete();
        \App\Models\LogAction::record(
            request()->user()?->id,
            'Suppression utilisateur',
            'utilisateurs',
            $utilisateurs->id,
            request()->ip()
        );
        return response()->json(['message' => 'User deleted']);
    }
}
