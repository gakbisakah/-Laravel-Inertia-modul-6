import React, { useEffect, useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { useTheme } from "@/lib/ThemeContext";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";

export default function TodosPage({ filters }) {
    const { props, errors } = usePage();
    const { auth, todos } = props;
    
    const { theme, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const onLogout = () => {
        router.get("/auth/logout");
    };

    const [search, setSearch] = useState(filters?.search || "");
    const [isFinishedFilter, setIsFinishedFilter] = useState(filters?.is_finished ?? "");
    const [form, setForm] = useState({ title: "", description: "", cover: null, is_finished: false });
    const [editingId, setEditingId] = useState(null);
    const [stats, setStats] = useState({ finished: 0, notFinished: 0 });
    const [dailyStats, setDailyStats] = useState([]);
    const [activeChart, setActiveChart] = useState('donut');
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [isLoadingPage, setIsLoadingPage] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsStatsLoading(true);
        try {
            const [statsRes, dailyStatsRes] = await Promise.all([
                fetch('/todos/stats'),
                fetch('/todos/stats/daily')
            ]);
            
            const newStats = await statsRes.json();
            const newDailyStats = await dailyStatsRes.json();
            
            setStats(newStats);
            setDailyStats(newDailyStats || []);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    // Real-time search with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            if (search === (filters?.search || "") && isFinishedFilter === (filters?.is_finished ?? "")) {
                return;
            }

            setIsLoadingPage(true);
            router.get('/todos', { search, is_finished: isFinishedFilter, page: 1, per_page: 20 }, { 
                preserveState: false, 
                replace: true,
                onFinish: () => setIsLoadingPage(false)
            });
        }, 300);

        return () => clearTimeout(handler);
    }, [search, isFinishedFilter]);

    const chartData = Array.isArray(dailyStats.dates) 
        ? dailyStats.dates.map((date, idx) => ({
            name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
            count: dailyStats.counts?.[idx] || 0,
            date: date
          }))
        : [];

    const pieData = [
        { name: 'Selesai', value: stats.finished, color: '#10B981' },
        { name: 'Belum Selesai', value: stats.notFinished, color: '#F59E0B' }
    ];

    function goToPage(page) {
        if (page < 1 || page > todos.meta.last_page) return;
        setIsLoadingPage(true);
        router.get('/todos', { 
            search, 
            is_finished: isFinishedFilter, 
            page,
            per_page: 20
        }, { 
            preserveState: false,
            onFinish: () => setIsLoadingPage(false)
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('is_finished', form.is_finished ? 1 : 0);
        if (form.cover) fd.append('cover', form.cover);

        if (editingId) {
            router.post(`/todos/${editingId}?_method=PUT`, fd, {
                onSuccess: () => {
                    cancelEdit();
                    setForm({ title: '', description: '', cover: null, is_finished: false });
                    fetchStats();
                    if (window.Swal) window.Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Todo berhasil diubah' });
                },
                onError: (pageErrors) => {
                    const errorMessages = Object.values(pageErrors).join('\n');
                    if (window.Swal) {
                        window.Swal.fire({ icon: 'error', title: 'Gagal Mengubah', text: errorMessages || 'Terjadi kesalahan saat mengubah todo.' });
                    }
                }
            });
        } else {
            router.post('/todos', fd, {
                onSuccess: () => {
                    cancelEdit();
                    setForm({ title: '', description: '', cover: null, is_finished: false });
                    fetchStats();
                    if (window.Swal) window.Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Todo berhasil ditambahkan' });
                },
                onError: (pageErrors) => {
                    const errorMessages = Object.values(pageErrors).join('\n');
                    if (window.Swal) {
                        window.Swal.fire({ icon: 'error', title: 'Gagal Menambah', text: errorMessages || 'Terjadi kesalahan saat menambah todo.' });
                    }
                }
            });
        }
    }

    function handleDelete(id) {
        if (window.Swal) {
            window.Swal.fire({
                title: 'Hapus?',
                text: 'Apakah Anda yakin ingin menghapus todo ini?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, hapus',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.delete(`/todos/${id}`, {
                        onSuccess: () => {
                            fetchStats();
                            if (window.Swal) window.Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Todo berhasil dihapus' });
                        },
                        onError: (pageErrors) => {
                            const errorMessages = Object.values(pageErrors).join('\n');
                            if (window.Swal) window.Swal.fire({ icon: 'error', title: 'Gagal', text: errorMessages || 'Gagal menghapus todo' });
                        }
                    });
                }
            });
        } else {
            if (!confirm('Hapus todo ini?')) return;
            router.delete(`/todos/${id}`);
        }
    }

    function startEdit(todo) {
        setForm({ title: todo.title || '', description: todo.description || '', cover: null, is_finished: !!todo.is_finished });
        setEditingId(todo.id);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({ title: '', description: '', cover: null, is_finished: false });
    }

    const currentPage = todos?.meta?.current_page || 1;
    const lastPage = todos?.meta?.last_page || 1;
    const totalData = todos?.meta?.total || 0;
    const startIndex = todos?.meta?.from || (totalData > 0 ? 1 : 0);
    const endIndex = todos?.meta?.to || 0;
    const perPage = todos?.meta?.per_page || 20;

    // Komponen Paginasi yang menggunakan links dari Laravel
    const Pagination = ({ links, isLoading }) => {
        if (!links || links.length === 0) return null;

        const onPageClick = (link) => {
            if (!link.url || isLoading) return;
            
            // Ekstrak nomor halaman dari URL
            const url = new URL(link.url);
            const page = url.searchParams.get('page') || 1;

            // Panggil fungsi goToPage yang sudah ada
            goToPage(parseInt(page));
        };

        const getIconForLabel = (label) => {
            if (label.includes('Previous')) {
                return <ChevronLeft size={18} title="Ke Halaman Sebelumnya" />;
            }
            if (label.includes('Next')) {
                return <ChevronRight size={18} title="Ke Halaman Berikutnya" />;
            }
            return null;
        };

        return (
            <div className="flex items-center justify-center gap-1 flex-wrap">
                {links.map((link, index) => {
                    const icon = getIconForLabel(link.label);
                    const isNumber = !icon && link.label !== '...';
                    
                    return (
                        <button
                            key={index}
                            onClick={() => onPageClick(link)}
                            disabled={!link.url || isLoading}
                            className={`inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border text-sm font-bold transition-all ${
                                link.active
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                    : link.url
                                    ? 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600'
                                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {icon || link.label}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Filter out null/undefined items from todos data
    const validTodos = Array.isArray(todos?.data) ? todos.data.filter(t => t && t.id) : [];

    return (
        <div className={`${theme} min-h-screen bg-background flex flex-col`}>
            <nav className="border-b bg-card shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="flex items-center space-x-2">
                                <span className="inline-block p-2 bg-blue-600 text-white rounded-lg font-bold text-lg">
                                    B
                                </span>
                                <span className="text-xl font-bold text-blue-600">
                                    BinjaiAplikasi
                                </span>
                            </Link>

                            <Link
                                href="/todos"
                                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                📝 Todos
                            </Link>
                        </div>

                        <div className="flex items-center space-x-5">
                            <button
                                onClick={toggleTheme}
                                title="Ganti mode"
                                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                            >
                                {theme === "light" ? "🌙" : "☀️"}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-3 bg-white p-2 rounded-lg hover:bg-gray-50 transition-colors border"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium uppercase">
                                        {auth?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <div className="text-sm font-medium text-gray-700">
                                            {auth?.name || 'User'}
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                                            <div className="px-4 py-3 border-b">
                                                <div className="text-sm font-medium text-gray-900">{auth?.name || 'User'}</div>
                                                <div className="text-sm text-gray-500">{auth?.email || ''}</div>
                                            </div>
                                            <div className="py-1">
                                                <div className="px-4 py-2 text-sm text-gray-600">
                                                    <div>Bergabung sejak:</div>
                                                    <div className="font-medium">
                                                        {auth?.created_at ? new Date(auth.created_at).toLocaleDateString("id-ID", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t">
                                                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                    🚪 Keluar
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-bold text-gray-800 mb-3">Daftar Rencana</h2>
                            <p className="text-gray-600 text-lg max-w-xl">
                                Kelola semua rencana dan target Anda dengan mudah dan terorganisir
                            </p>
                            <div className="mt-6 flex items-center justify-center md:justify-start space-x-4">
                                <div className="px-4 py-2 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {isStatsLoading ? '...' : (stats.finished + stats.notFinished)}
                                    </div>
                                    <div className="text-sm text-blue-600">Total Rencana</div>
                                </div>
                                <div className="px-4 py-2 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {isStatsLoading ? '...' : stats.finished}
                                    </div>
                                    <div className="text-sm text-green-600">Selesai</div>
                                </div>
                                <div className="px-4 py-2 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                                        {isStatsLoading ? '...' : stats.notFinished}
                                    </div>
                                    <div className="text-sm text-yellow-600">Belum Selesai</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full md:w-96 shadow-xl rounded-2xl bg-white p-6">
                            <div className="flex justify-center mb-4 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setActiveChart('donut')} className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${activeChart === 'donut' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    Ringkasan
                                </button>
                                <button onClick={() => setActiveChart('bar')} className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${activeChart === 'bar' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    Batang
                                </button>
                                <button onClick={() => setActiveChart('line')} className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${activeChart === 'line' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                                    Garis
                                </button>
                            </div>
                            
                            {isStatsLoading ? (
                                <div className="h-[280px] flex items-center justify-center animate-pulse">
                                    <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    {activeChart === 'donut' && (
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => value} />
                                            <Legend />
                                        </PieChart>
                                    )}
                                    
                                    {activeChart === 'bar' && (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3B82F6" name="Rencana Dibuat" />
                                        </BarChart>
                                    )}
                                    
                                    {activeChart === 'line' && (
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Rencana Dibuat" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-12">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                            <div className="flex-1 w-full">
                                <label className="inline-block text-sm font-semibold text-gray-700 mb-2 bg-white bg-opacity-50 px-3 py-1 rounded-full">
                                    🔍 Pencarian
                                </label>
                                <div className="relative">
                                    <input 
                                        value={search} 
                                        onChange={e=>setSearch(e.target.value)} 
                                        className="w-full h-12 pl-5 pr-12 rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg" 
                                        placeholder="Cari judul atau catatan..." 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">🔍</span>
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="inline-block text-sm font-semibold text-gray-700 mb-2 bg-white bg-opacity-50 px-3 py-1 rounded-full">
                                    📊 Status
                                </label>
                                <select 
                                    value={isFinishedFilter} 
                                    onChange={e=>setIsFinishedFilter(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="1">✅ Selesai</option>
                                    <option value="0">⏳ Belum Selesai</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                                {editingId ? '✏️' : '✨'}
                            </span>
                            {editingId ? 'Edit Rencana' : 'Tambah Rencana Baru'}
                        </h3>
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                                    <input 
                                        placeholder="Masukkan judul rencana" 
                                        value={form.title} 
                                        onChange={e=>setForm({...form, title: e.target.value})} 
                                        className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                                        required
                                    />
                                    {errors?.title && (
                                        <div className="text-sm text-red-600 mt-1">{errors.title}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                                    <textarea
                                        placeholder="Masukkan catatan atau deskripsi"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows="5"
                                        className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    ></textarea>
                                    {errors?.description && (
                                        <div className="text-sm text-red-600 mt-1">{errors.description}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e=>setForm({...form, cover: e.target.files[0]})}
                                            className="flex-1 text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors cursor-pointer" 
                                        />
                                        {form.cover && (
                                            <span className="text-sm text-green-600">✓ File dipilih</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-6">
                                <label className="flex items-center space-x-3 text-sm bg-white bg-opacity-60 backdrop-blur-sm px-4 py-2.5 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={form.is_finished} 
                                        onChange={e=>setForm({...form, is_finished: e.target.checked})}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                    />
                                    <span className="font-medium text-gray-700">Tandai sebagai selesai</span>
                                </label>
                                
                                <div className="flex items-center space-x-3">
                                    <button 
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-md"
                                    >
                                        {editingId ? '💾 Simpan Perubahan' : '➕ Tambah Rencana'}
                                    </button>
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            onClick={cancelEdit}
                                            className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all font-medium border border-gray-200"
                                        >
                                            ❌ Batal
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Tabel dengan Pagination */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        {/* Header dengan Info Data */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
                            <p className="text-sm text-gray-600">
                                {isLoadingPage ? (
                                    <span className="text-gray-500">Memuat data...</span>
                                ) : totalData > 0 ? (
                                    <>
                                        Menampilkan <span className="font-bold text-blue-600">{startIndex}</span> hingga <span className="font-bold text-blue-600">{endIndex}</span> dari <span className="font-bold text-blue-600">{totalData}</span> data.
                                    </>
                                ) : (
                                    <span className="text-gray-500">Tidak ada data tersedia</span>
                                )}
                            </p>
                        </div>

                        {/* Tabel */}
                        <div className={`overflow-x-auto ${isLoadingPage ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {validTodos.length > 0 ? (
                                        validTodos.map((t, idx) => (
                                            <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold mr-3">
                                                            {(currentPage - 1) * perPage + idx + 1}
                                                        </span>
                                                        <div className="font-medium text-gray-900">{t.title || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="prose max-w-none text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{__html: t.description || '—'}} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.cover ? (
                                                        <img 
                                                            src={`/storage/${t.cover}`} 
                                                            alt={`Cover untuk ${t.title || 'todo'}`}
                                                            className="h-20 w-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                        />
                                                    ) : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        t.is_finished 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {t.is_finished ? '✓ Selesai' : '⧖ Belum'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={()=>startEdit(t)}
                                                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                            disabled={isLoadingPage}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button 
                                                            onClick={()=>handleDelete(t.id)}
                                                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            disabled={isLoadingPage}
                                                        >
                                                            🗑️ Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center">
                                                <div className="text-gray-500 font-medium">{isLoadingPage ? 'Memuat...' : 'Tidak ada rencana ditemukan'}</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Pagination Controls */}
                        {lastPage > 1 && todos?.meta?.links && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                                    {/* Info Text */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            Halaman <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{lastPage}</span> 
                                            {' '}({perPage} per halaman)
                                        </span>
                                    </div>

                                    {/* Pagination Buttons */}
                                    <Pagination links={todos.meta.links} isLoading={isLoadingPage} />

                                    {/* Loading Status */}
                                    <div className="text-xs text-gray-500">
                                        {isLoadingPage ? (
                                            <span className="inline-flex items-center gap-1">
                                                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                                Memuat data...
                                            </span>
                                        ) : (
                                            <span>Siap</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="border-t bg-card py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} BinjaiLabs. All rights reserved.
                </div>
            </footer>
        </div>
    );
}