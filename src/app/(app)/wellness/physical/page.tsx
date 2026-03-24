'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn, calculateBMI, getBMICategory } from '@/lib/utils'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { wellnessApi } from '@/lib/api/client'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { GoalCard } from '@/components/wellness/goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    bmiCalculatorSchema,
    type BMICalculatorInput,
} from '@/lib/validations/wellness'
import type { WellnessMetric } from '@/types'
import {
    FiActivity,
    FiTarget,
    FiTrendingUp,
    FiPlus,
    FiSave,
} from 'react-icons/fi'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'

export default function PhysicalWellnessPage() {
    const router = useRouter()
    const { goals, fetchGoals } = useWellnessStore()

    const [metrics, setMetrics] = useState<Record<string, WellnessMetric>>({})
    const [stepHistory, setStepHistory] = useState<WellnessMetric[]>([])
    const [_isLoading, setIsLoading] = useState(true)
    const [showBMIForm, setShowBMIForm] = useState(false)

    const physicalGoals = goals.filter(
        g => g.category === 'physical' && g.status === 'active',
    )

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<BMICalculatorInput>({
        resolver: zodResolver(bmiCalculatorSchema),
    })

    const height = watch('height')
    const weight = watch('weight')
    const calculatedBMI = height && weight ? calculateBMI(weight, height) : null
    const bmiCategory = calculatedBMI ? getBMICategory(calculatedBMI) : null

    useEffect(() => {
        const loadData = async () => {
            try {
                const [metricsRes, stepsRes] = await Promise.all([
                    wellnessApi.getLatestMetrics(),
                    wellnessApi.getMetrics({ type: 'steps' }),
                ])
                const loadedMetrics = metricsRes.metrics as Record<
                    string,
                    WellnessMetric
                >
                setMetrics(loadedMetrics)
                // Sort steps by date descending (most recent first)
                const sortedSteps = (stepsRes.metrics as WellnessMetric[]).sort(
                    (a, b) =>
                        new Date(b.logged_at || b.created_at).getTime() -
                        new Date(a.logged_at || a.created_at).getTime(),
                )
                setStepHistory(sortedSteps)
                // Prefill form with existing values
                reset({
                    height: loadedMetrics.height?.value || undefined,
                    weight: loadedMetrics.weight?.value || undefined,
                })
            } catch (error) {
                console.error('Failed to load metrics:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
        fetchGoals('physical')
    }, [fetchGoals, reset])

    const onSubmitBMI = useCallback(async (data: BMICalculatorInput) => {
        try {
            await Promise.all([
                wellnessApi.logMetric({
                    metric_type: 'height',
                    value: data.height,
                    unit: 'cm',
                }),
                wellnessApi.logMetric({
                    metric_type: 'weight',
                    value: data.weight,
                    unit: 'kg',
                }),
            ])
            toast.success('Measurements saved!')
            setShowBMIForm(false)
            // Refresh metrics
            const metricsRes = await wellnessApi.getLatestMetrics()
            setMetrics(metricsRes.metrics as Record<string, WellnessMetric>)
        } catch {
            toast.error('Failed to save measurements')
        }
    }, [])

    const stepChartData = stepHistory
        .slice(0, 7)
        .reverse()
        .map(m => ({
            date: new Date(m.logged_at || m.created_at).toLocaleDateString(
                'en-US',
                {
                    weekday: 'short',
                },
            ),
            steps: m.value,
        }))

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader
                title="Physical Wellness"
                showBack
                onBack={() => router.push('/wellness')}
            />

            <main className="p-4 space-y-4">
                {/* Hero Section */}
                <section className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <FiActivity className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Physical Wellness
                            </h1>
                            <p className="text-sm text-white/80">
                                Track fitness, nutrition & health
                            </p>
                        </div>
                    </div>
                </section>

                {/* BMI Card */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            BMI Tracker
                        </h2>
                        <button
                            onClick={() => setShowBMIForm(!showBMIForm)}
                            className="text-xs text-primary hover:underline">
                            {showBMIForm ? 'Cancel' : 'Update'}
                        </button>
                    </div>

                    {showBMIForm ? (
                        <form
                            onSubmit={handleSubmit(onSubmitBMI)}
                            className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs text-gray-500">
                                        Height (cm)
                                    </label>
                                    <Input
                                        type="number"
                                        {...register('height', {
                                            valueAsNumber: true,
                                        })}
                                        error={errors.height?.message}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-gray-500">
                                        Weight (kg)
                                    </label>
                                    <Input
                                        type="number"
                                        {...register('weight', {
                                            valueAsNumber: true,
                                        })}
                                        error={errors.weight?.message}
                                    />
                                </div>
                            </div>

                            {calculatedBMI && (
                                <div className="rounded-lg bg-gray-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {calculatedBMI.toFixed(1)}
                                    </p>
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            bmiCategory?.color,
                                        )}>
                                        {bmiCategory?.label}
                                    </p>
                                </div>
                            )}

                            <Button type="submit" size="sm" className="w-full">
                                <FiSave className="mr-2 h-4 w-4" />
                                Save Measurements
                            </Button>
                        </form>
                    ) : metrics.bmi ? (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900">
                                {metrics.bmi.value.toFixed(1)}
                            </p>
                            <p
                                className={cn(
                                    'text-sm font-medium',
                                    getBMICategory(metrics.bmi.value)?.color,
                                )}>
                                {getBMICategory(metrics.bmi.value)?.label}
                            </p>
                            <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
                                {metrics.height && (
                                    <span>
                                        Height: {metrics.height.value} cm
                                    </span>
                                )}
                                {metrics.weight && (
                                    <span>
                                        Weight: {metrics.weight.value} kg
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 text-center">
                            <p className="mb-2 text-sm text-gray-500">
                                No BMI data yet
                            </p>
                            <Button
                                onClick={() => setShowBMIForm(true)}
                                size="sm"
                                variant="outline">
                                <FiPlus className="mr-1 h-4 w-4" />
                                Add Measurements
                            </Button>
                        </div>
                    )}
                </section>

                {/* Step Tracking */}
                <section className="rounded-xl bg-white p-4 shadow-sm">
                    <h2 className="mb-3 text-sm font-medium text-gray-700">
                        Step Tracking
                    </h2>

                    {stepChartData.length > 0 ? (
                        <>
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stepHistory[0]?.value.toLocaleString() ||
                                            0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        steps today
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                    <FiTrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                            </div>

                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stepChartData}>
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: '#9ca3af',
                                            }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload?.[0])
                                                    return null
                                                return (
                                                    <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white">
                                                        {payload[0].value?.toLocaleString()}{' '}
                                                        steps
                                                    </div>
                                                )
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="steps"
                                            stroke="#22c55e"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                            No step data available
                        </div>
                    )}
                </section>

                {/* Physical Goals */}
                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            Physical Goals
                        </h2>
                        <button
                            onClick={() =>
                                router.push(
                                    '/wellness/goals/new?category=physical',
                                )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <FiPlus className="h-3 w-3" />
                            Add Goal
                        </button>
                    </div>

                    {physicalGoals.length === 0 ? (
                        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                            <FiTarget className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-500">
                                No physical goals yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {physicalGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} compact />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
