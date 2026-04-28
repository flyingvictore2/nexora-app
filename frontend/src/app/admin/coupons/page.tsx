'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Tag, Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  code: '', description: '', discountType: 'PERCENT',
  discountValue: 10, minAmount: 0, maxUses: '', expiresAt: '', isActive: true,
};

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await api.get('/coupons')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Cupón creado'); closeForm(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/coupons/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Cupón actualizado'); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Cupón eliminado'); },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description ?? '', discountType: c.discountType,
      discountValue: c.discountValue, minAmount: c.minAmount,
      maxUses: c.maxUses ?? '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive: c.isActive,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = () => {
    const payload = {
      ...form,
      discountValue: parseFloat(form.discountValue),
      minAmount: parseFloat(form.minAmount) || 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cupones y Descuentos</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona códigos promocionales</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-nexora-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Nuevo cupón
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total cupones', value: coupons.length, color: 'text-white' },
            { label: 'Activos', value: coupons.filter((c: any) => c.isActive).length, color: 'text-green-400' },
            { label: 'Usos totales', value: coupons.reduce((a: number, c: any) => a + c.usedCount, 0), color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hay cupones. Crea el primero.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-white/10">
                  {['Código', 'Descuento', 'Usos', 'Mín. importe', 'Expira', 'Estado', ''].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-nexora-red tracking-widest">{c.code}</span>
                        <button onClick={() => copyCode(c.code, c.id)} className="text-gray-500 hover:text-white transition-colors">
                          {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-400">
                        {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `$${c.discountValue}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.minAmount > 0 ? `$${c.minAmount}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-1 rounded-full font-medium', c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                        {c.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('¿Eliminar cupón?')) deleteMutation.mutate(c.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-nexora-dark-2 border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-bold">{editing ? 'Editar cupón' : 'Crear cupón'}</h3>
              <button onClick={closeForm}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Código *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="VERANO25" className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm font-mono uppercase tracking-widest" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm">
                    <option value="PERCENT">Porcentaje (%)</option>
                    <option value="FIXED">Importe fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valor *</label>
                  <input type="number" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Importe mínimo</label>
                  <input type="number" step="0.01" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                    className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Máx. usos</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Sin límite" className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Expira el</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Descripción</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Descuento de verano" className="w-full bg-nexora-dark-3 border border-white/20 rounded px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-nexora-red" />
                <span className="text-sm">Activo</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={closeForm} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving || !form.code || !form.discountValue}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-nexora-red hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
