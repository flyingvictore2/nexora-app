'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users, Film, DollarSign, Eye, TrendingUp, Clock,
  Star, UserCheck, BarChart2, Activity,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#e50914', '#b20710', '#ff4444', '#ff7777', '#ffaaaa'];

function MetricCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.data,
    refetchInterval: 60000,
  });

  const { data: watchTime } = useQuery({
    queryKey: ['analytics-watchtime'],
    queryFn: async () => (await api.get('/analytics/watch-time?days=7')).data.data,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const { metrics, mostWatched, userGrowth, revenue, subscriptionDist } = data || {};

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Resumen en tiempo real de Nexora</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Usuarios totales"
            value={metrics?.totalUsers?.toLocaleString() || 0}
            icon={Users}
            color="bg-blue-600/30"
            subtitle={`+${metrics?.newUsersThisMonth || 0} este mes`}
          />
          <MetricCard
            title="Suscripciones activas"
            value={metrics?.activeSubscriptions?.toLocaleString() || 0}
            icon={UserCheck}
            color="bg-green-600/30"
          />
          <MetricCard
            title="Ingresos totales"
            value={formatCurrency(metrics?.totalRevenue || 0)}
            icon={DollarSign}
            color="bg-yellow-600/30"
            subtitle={`${formatCurrency(metrics?.monthRevenue || 0)} este mes`}
          />
          <MetricCard
            title="Horas vistas"
            value={(metrics?.totalWatchTimeHours || 0).toLocaleString()}
            icon={Clock}
            color="bg-purple-600/30"
            subtitle="Total acumulado"
          />
          <MetricCard
            title="Contenido"
            value={metrics?.totalContent?.toLocaleString() || 0}
            icon={Film}
            color="bg-orange-600/30"
            subtitle="Títulos publicados"
          />
          <MetricCard
            title="Nuevos usuarios"
            value={metrics?.newUsersThisMonth || 0}
            icon={TrendingUp}
            color="bg-nexora-red/30"
            subtitle="Este mes"
          />
          <MetricCard
            title="Ingresos este mes"
            value={formatCurrency(metrics?.monthRevenue || 0)}
            icon={BarChart2}
            color="bg-cyan-600/30"
          />
          <MetricCard
            title="Actividad"
            value="En vivo"
            icon={Activity}
            color="bg-green-600/30"
            subtitle="Plataforma operativa"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User growth */}
          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Crecimiento de usuarios</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Line type="monotone" dataKey="users" stroke="#e50914" strokeWidth={2} dot={{ fill: '#e50914' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue */}
          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Ingresos mensuales</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#e50914" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Subscription distribution */}
          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Distribución de planes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={subscriptionDist || []} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={70} label={({ plan, count }) => `${plan}: ${count}`}>
                  {(subscriptionDist || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Most watched */}
          <div className="md:col-span-2 bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Contenido más visto</h3>
            <div className="space-y-2">
              {(mostWatched || []).slice(0, 8).map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-gray-500 text-sm w-5 flex-shrink-0">{idx + 1}</span>
                  <div className="w-8 h-10 flex-shrink-0 rounded overflow-hidden bg-nexora-dark-3">
                    {item.posterUrl && <img src={item.posterUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="w-3 h-3" />
                      {item.totalViews?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="w-3 h-3" />
                      {item.averageRating?.toFixed(1) || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Watch time */}
        {watchTime && (
          <div className="bg-nexora-dark-2 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Tiempo de visualización (últimos 7 días)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={watchTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} formatter={(v: any) => [`${v} min`, 'Tiempo']} />
                <Bar dataKey="totalMinutes" fill="#e50914" radius={[4, 4, 0, 0]} name="Minutos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
