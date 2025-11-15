<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TodoController extends Controller
{
    /**
     * Menampilkan daftar todos dengan pagination, pencarian, dan filter status
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = $user->todos()->getQuery();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
            });
        }

        if (!is_null($request->input('is_finished'))) {
            $query->where('is_finished', filter_var($request->input('is_finished'), FILTER_VALIDATE_BOOLEAN));
        }

        $todos = $query->orderBy('created_at', 'desc')
                       ->paginate(20)
                       ->withQueryString();

        // ✅ Format data untuk Inertia dengan struktur meta
        return Inertia::render('app/TodosPage', [
            'todos' => [
                'data' => $todos->items(),
                'meta' => [
                    'current_page' => $todos->currentPage(),
                    'last_page' => $todos->lastPage(),
                    'per_page' => $todos->perPage(),
                    'total' => $todos->total(),
                    'from' => $todos->firstItem(),
                    'to' => $todos->lastItem(),
                    'links' => $todos->linkCollection()->toArray(),
                ]
            ],
            'filters' => $request->only(['search', 'is_finished']),
        ]);
    }

    /**
     * Menyimpan todo baru
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|max:2048',
            'is_finished' => 'nullable|in:0,1,true,false',
        ]);

        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('covers', 'public');
        }

        Todo::create($data);

        return redirect()->back()->with('success', 'Todo berhasil ditambahkan');
    }

    /**
     * Memperbarui todo yang ada - FIXED VERSION
     */
    public function update(Request $request, Todo $todo)
    {
        // ✅ PERBAIKAN: Cek ownership dengan benar
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak berhak mengubah todo ini');
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|image|max:2048',
            'is_finished' => 'nullable|in:0,1,true,false',
        ]);

        if ($request->hasFile('cover')) {
            if ($todo->cover) {
                Storage::disk('public')->delete($todo->cover);
            }
            $data['cover'] = $request->file('cover')->store('covers', 'public');
        }

        $todo->update($data);

        return redirect()->back()->with('success', 'Todo berhasil diperbarui');
    }

    /**
     * Menghapus todo
     */
    public function destroy(Request $request, Todo $todo)
    {
        // ✅ Pastikan user yang login adalah pemilik todo
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak berhak menghapus todo ini');
        }

        // Hapus file cover jika ada
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        return redirect()->back()->with('success', 'Todo berhasil dihapus');
    }

    /**
     * Statistik todo
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'total' => $user->todos()->count(),
            'finished' => $user->todos()->where('is_finished', true)->count(),
            'notFinished' => $user->todos()->where('is_finished', false)->count(),
        ]);
    }

    /**
     * Statistik harian
     */
    public function dailyStats(Request $request)
    {
        $user = $request->user();

        $stats = $user->todos()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(6))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $dates = collect();
        for ($i = 6; $i >= 0; $i--) {
            $dates->push(now()->subDays($i)->format('Y-m-d'));
        }

        $dailyCounts = $dates->mapWithKeys(function ($date) use ($stats) {
            return [$date => $stats->firstWhere('date', $date)?->count ?? 0];
        });

        return response()->json([
            'dates' => $dailyCounts->keys(),
            'counts' => $dailyCounts->values()
        ]);
    }
}