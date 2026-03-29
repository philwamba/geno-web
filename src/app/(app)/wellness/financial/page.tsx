'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { wellnessApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WellnessMetric } from '@/types'
import {
    FiDollarSign,
    FiTarget,
    FiPlus,
    FiTrendingUp,
    FiTrendingDown,
    FiX,
} from 'react-icons/fi'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'

type LogType = 'income' | 'expense' | null

export default function FinancialWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const [incomeMetrics, setIncomeMetrics] = useState<WellnessMetric[]>([])
    const [expenseMetrics, setExpenseMetrics] = useState<WellnessMetric[]>([])
    const [_isLoading, setIsLoading] = useState(true)
    const [showLogModal, setShowLogModal] = useState<LogType>(null)
    const [logAmount, setLogAmount] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const financialGoals = goals.filter(
        g => g.category === 'financial' && g.status === 'active',
    )

    useEffect(() => {
        fetchGoals('financial')
        loadMetrics()
    }, [fetchGoals])

    const loadMetrics = async () => {
        setIsLoading(true)
        try {
            const [incomeRes, expenseRes] = await Promise.all([
                wellnessApi.getMetrics({ type: 'financial_income' }),
                wellnessApi.getMetrics({ type: 'financial_expense' }),
            ])
            setIncomeMetrics(incomeRes.metrics as WellnessMetric[])
            setExpenseMetrics(expenseRes.metrics as WellnessMetric[])
        } catch {
            // Metrics may not exist yet, that's OK
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogMetric = async () => {
        if (!logAmount || !showLogModal) return
        setIsSaving(true)
        try {
            await wellnessApi.logMetric({
                metric_type: `financial_${showLogModal}`,
                value: parseFloat(logAmount),
                unit: 'KES',
            })
            toast.success(
                `${showLogModal === 'income' ? 'Income' : 'Expense'} logged!`,
            )
            setShowLogModal(null)
            setLogAmount('')

            loadMetrics()
        } catch {
            toast.error('Failed to log entry')
        } finally {
            setIsSaving(false)
        }
    }

    const totalIncome = incomeMetrics.reduce((sum, m) => sum + (m.value || 0), 0)
    const totalExpenses = expenseMetrics.reduce(
        (sum, m) => sum + (m.value || 0),
        0,
    )
    const balance = totalIncome - totalExpenses
    const savingsRate =
        totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

    // Build chart data from last 7 entries
    const chartData = [...incomeMetrics, ...expenseMetrics]
        .sort(
            (a, b) =>
                new Date(a.logged_at || a.created_at).getTime() -
                new Date(b.logged_at || b.created_at).getTime(),
        )
        .slice(-14)
        .reduce(
            (acc, m) => {
                const date = new Date(
                    m.logged_at || m.created_at,
                ).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                const existing = acc.find(d => d.date === date)
                const key =
                    m.metric_type === 'financial_income' ? 'income' : 'expense'
                if (existing) {
                    existing[key] = (existing[key] || 0) + (m.value || 0)
                } else {
                    acc.push({ date, income: 0, expense: 0, [key]: m.value || 0 })
                }
                return acc
            },
            [] as { date: string; income: number; expense: number }[],
        )

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Financial Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiDollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Financial Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Track income, expenses & savings
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">Income</p>
                            <p className="text-lg font-bold">
                                {totalIncome.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">Expenses</p>
                            <p className="text-lg font-bold">
                                {totalExpenses.toLocaleString()}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-3 text-center">
                            <p className="text-xs text-white/70">
                                Savings Rate
                            </p>
                            <p className="text-lg font-bold">{savingsRate}%</p>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowLogModal('income')}
                        className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <FiTrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">
                                Log Income
                            </p>
                            <p className="text-xs text-gray-500">
                                Record earnings
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowLogModal('expense')}
                        className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <FiTrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">
                                Log Expense
                            </p>
                            <p className="text-xs text-gray-500">
                                Track spending
                            </p>
                        </div>
                    </button>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-medium text-gray-700">
                            Income vs Expenses
                        </h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="income"
                                        fill="#22c55e"
                                        radius={[4, 4, 0, 0]}
                                        name="Income"
                                    />
                                    <Bar
                                        dataKey="expense"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                        name="Expense"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {/* Budget Progress */}
                {totalIncome > 0 && (
                    <section className="rounded-xl bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-medium text-gray-700">
                            Budget Progress
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Spent: KES{' '}
                                    {totalExpenses.toLocaleString()}
                                </span>
                                <span className="text-gray-600">
                                    of KES {totalIncome.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        totalExpenses / totalIncome > 0.9
                                            ? 'bg-red-500'
                                            : totalExpenses / totalIncome > 0.7
                                              ? 'bg-amber-500'
                                              : 'bg-green-500'
                                    }`}
                                    style={{
                                        width: `${Math.min(100, (totalExpenses / totalIncome) * 100)}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                {balance >= 0
                                    ? `KES ${balance.toLocaleString()} remaining`
                                    : `KES ${Math.abs(balance).toLocaleString()} over budget`}
                            </p>
                        </div>
                    </section>
                )}

                {/* Financial Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Financial Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=financial',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {financialGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <p className="mb-2 text-sm font-medium text-gray-600">
                                No financial goals yet
                            </p>
                            <p className="mb-4 text-xs text-gray-400">
                                Set savings targets, budget limits, or income
                                goals
                            </p>
                            <Button
                                onClick={() =>
                                    router.push(
                                        '/wellness/goals/new?category=financial',
                                    )
                                }
                                size="sm">
                                <FiPlus className="mr-1 h-4 w-4" />
                                Create Goal
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {financialGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Tips */}
                <section className="rounded-xl bg-amber-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-amber-800">
                        Financial Wellness Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-amber-700">
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Track your daily spending to understand your
                                habits
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Set aside 20% of income for savings and
                                investments
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Build an emergency fund covering 3-6 months of
                                expenses
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>
                                Review and cancel unused subscriptions monthly
                            </span>
                        </li>
                    </ul>
                </section>
            </main>

            {/* Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Log{' '}
                                {showLogModal === 'income'
                                    ? 'Income'
                                    : 'Expense'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowLogModal(null)
                                    setLogAmount('')
                        
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (KES)
                                </label>
                                <Input
                                    type="number"
                                    value={logAmount}
                                    onChange={e => setLogAmount(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowLogModal(null)
                                        setLogAmount('')
                            
                                    }}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleLogMetric}
                                    disabled={!logAmount || isSaving}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
