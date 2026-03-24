'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { formatCurrency } from '@/lib/utils'
import { providerDashboardApi } from '@/lib/api/client'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts'
import { FiDollarSign, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi'

import { ChartDataItem } from '@/types'

import { useAuthStore } from '@/lib/stores/auth-store'

interface StatItem {
    label: string
    value: string
    isPositive: boolean
    icon: React.ElementType
    color: string
    bg: string
}

export default function AnalyticsPage() {
    const router = useRouter()

    const { user } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<StatItem[]>([])
    const [earningsData, setEarningsData] = useState<ChartDataItem[]>([])
    const [sessionsData, setSessionsData] = useState<ChartDataItem[]>([])

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!user) return

            try {
                const [overview, sessions, revenue] = await Promise.all([
                    providerDashboardApi.getAnalyticsOverview(),
                    providerDashboardApi.getSessionsAnalytics(),
                    providerDashboardApi.getRevenueAnalytics(),
                ])

                const overviewData = overview.overview
                setStats([
                    {
                        label: 'Total Earnings',
                        value: formatCurrency(overviewData.total_earnings),
                        // change: '+12.5%', // Need to calculate change
                        isPositive: true,
                        icon: FiDollarSign,
                        color: 'text-green-600',
                        bg: 'bg-green-100',
                    },
                    {
                        label: 'Total Sessions',
                        value: overviewData.total_sessions.toString(),
                        // change: '+8.2%',
                        isPositive: true,
                        icon: FiCalendar,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100',
                    },
                    {
                        label: 'Total Clients',
                        value: overviewData.total_clients.toString(),
                        // change: '-2.4%',
                        isPositive: true,
                        icon: FiUsers,
                        color: 'text-purple-600',
                        bg: 'bg-purple-100',
                    },
                    {
                        label: 'Avg. Rating',
                        value: Number(overviewData.average_rating).toFixed(1),
                        // change: '+4.1%',
                        isPositive: true,
                        icon: FiTrendingUp,
                        color: 'text-orange-600',
                        bg: 'bg-orange-100',
                    },
                ])

                // Transform revenue data for chart
                setEarningsData(
                    revenue.data.map(item => ({
                        date: item.date,
                        name: new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        }),
                        amount: item.amount,
                    })),
                )

                // Transform sessions data for chart
                setSessionsData(
                    sessions.data.map(item => ({
                        date: item.date,
                        name: new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        }),
                        count: item.count,
                    })),
                )
            } catch (error) {
                console.error('Failed to load analytics:', error)
                setError('Failed to load analytics data.')
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            loadAnalytics()
        }
    }, [user])

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <PageHeader
                title="Analytics"
                showBack
                onBack={() => router.back()}
            />

            <main className="px-4 py-6 space-y-6">
                {/* Key Metrics */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {isLoading && stats.length === 0
                        ? [1, 2, 3, 4].map(i => (
                              <div
                                  key={i}
                                  className="bg-white p-4 rounded-2xl shadow-sm animate-pulse"
                              >
                                  <div className="flex justify-between mb-3">
                                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                  </div>
                                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                  <div className="h-8 bg-gray-200 rounded w-2/3" />
                              </div>
                          ))
                        : stats.map((stat, index) => (
                              <div
                                  key={index}
                                  className="bg-white p-4 rounded-2xl shadow-sm"
                              >
                                  <div className="flex items-center justify-between mb-3">
                                      <div
                                          className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center`}
                                      >
                                          <stat.icon
                                              className={`w-5 h-5 ${stat.color}`}
                                          />
                                      </div>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                      {stat.label}
                                  </p>
                                  <p className="text-xl font-bold text-gray-900">
                                      {stat.value}
                                  </p>
                              </div>
                          ))}
                </div>

                {/* Earnings Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Revenue History (Last 30 Days)
                    </h3>
                    <div className="h-64 w-full">
                        {isLoading ? (
                            <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={earningsData}>
                                    <defs>
                                        <linearGradient
                                            id="colorEarnings"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#10b981"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#10b981"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={value => `$${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value?: number) => [
                                            `$${value || 0}`,
                                            'Earnings',
                                        ]}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Sessions Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Sessions (Last 30 Days)
                    </h3>
                    <div className="h-64 w-full">
                        {isLoading ? (
                            <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sessionsData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Sessions"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
