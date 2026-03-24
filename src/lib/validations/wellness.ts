import { z } from 'zod'

// Mood Types
export const MoodType = z.enum([
    'very_happy',
    'happy',
    'neutral',
    'sad',
    'anxious',
    'tired',
    'angry',
])

export type MoodTypeValue = z.infer<typeof MoodType>

// Mood Log Schema
export const moodLogSchema = z.object({
    mood: MoodType,
    note: z.string().max(500, 'Note must be 500 characters or less').optional(),
    logged_at: z.string().datetime().optional(),
})

export type MoodLogInput = z.infer<typeof moodLogSchema>

// Journal Entry Schema
export const journalEntrySchema = z.object({
    content: z
        .string()
        .min(1, 'Journal entry cannot be empty')
        .max(10000, 'Journal entry must be 10,000 characters or less'),
    mood: MoodType.optional(),
    tags: z
        .array(z.string().max(50, 'Tag must be 50 characters or less'))
        .max(10, 'Maximum 10 tags allowed')
        .optional(),
})

export type JournalEntryInput = z.infer<typeof journalEntrySchema>

// Goal Categories
export const GoalCategory = z.enum([
    'physical',
    'mental',
    'financial',
    'social',
    'occupational',
    'spiritual',
])

export type GoalCategoryValue = z.infer<typeof GoalCategory>

// Goal Status
export const GoalStatus = z.enum(['active', 'completed', 'paused', 'cancelled'])

export type GoalStatusValue = z.infer<typeof GoalStatus>

// Goal Schema
export const goalSchema = z
    .object({
        category: GoalCategory,
        title: z
            .string()
            .min(1, 'Title is required')
            .max(100, 'Title must be 100 characters or less'),
        description: z
            .string()
            .max(500, 'Description must be 500 characters or less')
            .optional(),
        target_value: z
            .number()
            .positive('Target value must be positive')
            .optional(),
        unit: z
            .string()
            .max(20, 'Unit must be 20 characters or less')
            .optional(),
        start_date: z.string().optional(),
        target_date: z.string().optional(),
    })
    .refine(
        data => {
            if (data.start_date && data.target_date) {
                return new Date(data.start_date) <= new Date(data.target_date)
            }
            return true
        },
        {
            message: 'Start date must be before or equal to target date',
            path: ['target_date'],
        },
    )

export type GoalInput = z.infer<typeof goalSchema>

// Goal Progress Update Schema
export const goalProgressSchema = z.object({
    value: z.number().min(0, 'Progress value must be non-negative'),
})

export type GoalProgressInput = z.infer<typeof goalProgressSchema>

// Metric Types
export const MetricType = z.enum([
    'steps',
    'weight',
    'height',
    'bmi',
    'meditation',
    'sleep',
    'water',
    'calories',
])

export type MetricTypeValue = z.infer<typeof MetricType>

// Wellness Metric Schema
export const wellnessMetricSchema = z.object({
    metric_type: MetricType,
    value: z.number().positive('Value must be positive'),
    unit: z.string().max(20, 'Unit must be 20 characters or less').optional(),
    logged_at: z.string().datetime().optional(),
})

export type WellnessMetricInput = z.infer<typeof wellnessMetricSchema>

// BMI Calculator Schema
export const bmiCalculatorSchema = z.object({
    height: z
        .number()
        .min(50, 'Height must be at least 50 cm')
        .max(300, 'Height must be at most 300 cm'),
    weight: z
        .number()
        .min(10, 'Weight must be at least 10 kg')
        .max(500, 'Weight must be at most 500 kg'),
})

export type BMICalculatorInput = z.infer<typeof bmiCalculatorSchema>

// Gratitude Entry Schema
export const gratitudeEntrySchema = z.object({
    entries: z
        .array(
            z
                .string()
                .min(1, 'Gratitude entry cannot be empty')
                .max(200, 'Entry must be 200 characters or less'),
        )
        .min(1, 'At least one gratitude entry is required')
        .max(3, 'Maximum 3 gratitude entries'),
})

export type GratitudeEntryInput = z.infer<typeof gratitudeEntrySchema>

// Mood emoji mapping for reference
export const MOOD_EMOJIS: Record<MoodTypeValue, string> = {
    very_happy: '😃',
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    anxious: '😟',
    tired: '😴',
    angry: '😠',
}

// Goal category colors for UI
export const GOAL_CATEGORY_COLORS: Record<GoalCategoryValue, string> = {
    physical: 'bg-teal-500',
    mental: 'bg-purple-500',
    financial: 'bg-yellow-500',
    social: 'bg-blue-500',
    occupational: 'bg-orange-500',
    spiritual: 'bg-pink-500',
}

// Goal category icons (using class names for lucide-react)
export const GOAL_CATEGORY_ICONS: Record<GoalCategoryValue, string> = {
    physical: 'Dumbbell',
    mental: 'Brain',
    financial: 'Wallet',
    social: 'Users',
    occupational: 'Briefcase',
    spiritual: 'Sparkles',
}
