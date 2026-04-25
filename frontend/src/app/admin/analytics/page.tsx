'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Clock, Eye } from 'lucide-react';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#e50914', '#b20710', '#ff6b6b', '#ffa8a8', '#ffd1d1'];

export default function AdminAnalyticsPage() {
  const [revenuePeriod, setRevenuePeriod] = useState(6);
  const [growthPeriod, setGrowthPeriod] = useState(6);

  const { data: dashboard } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data.data,
  });

  const { data: mostWatched } = useQuery({
    queryKey: ['analytics-most-watched'],
    queryFn: async () => (await api.get('/analytics/most-watched?limit=10')).data.data,
  });

  const { data: userGrowth } = useQuery({
    queryKey: ['analytics-growth', growthPeriod],
    queryFn: async () => (await api.get(`/analytics/user-growth?months=${growthPeriod}`)).data.data,
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics-revenue', revenuePeriod],
    queryFn: async () => (await api.get(`/analytics/revenue?months=${revenuePeriod}`)).data.data,
  });

  const { data: contentTypes } = useQuery({
    queryKey: ['analytics-content-types'],
    queryFn: async () => (await api.get('/analytics/content-types')).data.data,
  });

  const { data: watchTime } = useQuery({
    queryKey: ['analytics-watchtime'],
    queryFn: async () => (await api.get('/analytics/watch-time?days=14')).data.data,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['analytics-subscriptions'],
    queryFn: async () => (await api.get('/analytics/subscriptions')).data.data,
  });

  const PeriodSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[3, 6, 12].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            value === m ? 'bg-nexora-red text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {m}m
        </button>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Analíticas</h1>
          <p className="text-gray-400 text-sm mt-1">Métricas detalladas de la plataforma</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Usuarios totales', value: dashboard?.totalUsers?.toLocaleString() || '—', icon: Users, color: 'text-blue-400' },
            { label: 'Suscripciones activas', value: dashboard?.activeSubscriptions?.toLocaleString() || '—', icon: TrendingUp, color: 'text-green-400' },
            { label: 'Horas visualizadas', value: `${dashboard?.totalWatchTimeHours?.toLocaleString() || '—'}h`, icon: Clock, color: 'text-purple-400' },
            { label: 'Ingresos totales', value: formatCurrency(dashboard?.totalRevenue || 0), icon: Eye, color: 'text-yellow-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* User growth + Revenue */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Crecimiento de usuarios</h3>
              <PeriodSelector value={growthPeriod} onChange={setGrowthPeriod} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={userGrowth || []}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Area type="monotone" dataKey="users" stroke="#e50914" fill="url(#userGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Ingresos mensuales</h3>
              <PeriodSelector value={revenuePeriod} onChange={setRevenuePeriod} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenue || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} formatter={(v: any) => [formatCurrency(v), 'Ingresos']} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Watch time + Content types + Subscriptions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Tiempo de visualización (14 días)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={watchTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(v) => `${v}m`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  formatter={(v: any) => [`${v} min`, 'Tiempo de visualización']}
                />
                <Bar dataKey="totalMinutes" fill="#e50914" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            {/* Content types */}
            <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Tipos de contenido</h3>
              <div className="space-y-2">
                {(contentTypes || []).map((item: any, i: number) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (item._count / ((contentTypes || []).reduce((a: number, b: any) => a + b._count, 0))) * 100)}%`,
                            background: COLORS[i],
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{item._count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription distribution */}
            <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Distribución de planes</h3>
              {subscriptions && (
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={subscriptions} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={50}>
                      {subscriptions.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                    <Legend
                      formatter={(v) => <span className="text-xs text-gray-300">{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Most watched table */}
        <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Top 10 — Contenido más visto</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-white/10">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Título</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Vistas</th>
                  <th className="pb-2">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(mostWatched || []).map((item: any, i: number) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-nexora-red' : 'text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {item.posterUrl && (
                          <img src={item.posterUrl} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{item.type}</td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {item.totalViews?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        ★ {item.averageRating?.toFixed(1) || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
