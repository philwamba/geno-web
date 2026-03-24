import { create } from 'zustand'
import { MoodLog, JournalEntry, Goal, WellnessStats } from '@/types'
import { wellnessApi } from '../api/client'

interface WellnessState {
    // Mood state
    todayMood: MoodLog | null
    moodHistory: MoodLog[]
    moodTrends: Record<string, unknown> | null

    // Journal state
    journalEntries: JournalEntry[]

    // Goals state
    goals: Goal[]
    activeGoals: Goal[]

    // Stats
    wellnessStats: WellnessStats | null

    // Loading states
    isLoading: boolean
    isMoodLoading: boolean
    isJournalLoading: boolean
    isGoalsLoading: boolean

    // Actions
    fetchTodayMood: () => Promise<void>
    logMood: (mood: string, note?: string) => Promise<{ points_earned: number }>
    fetchMoodTrends: (days?: number) => Promise<void>
    fetchMoodHistory: (params?: {
        start_date?: string
        end_date?: string
        per_page?: number
    }) => Promise<void>

    fetchJournalEntries: () => Promise<void>
    createJournalEntry: (
        content: string,
        mood?: string,
        tags?: string[],
    ) => Promise<void>
    updateJournalEntry: (
        id: number,
        data: { content?: string; mood?: string; tags?: string[] },
    ) => Promise<void>
    deleteJournalEntry: (id: number) => Promise<void>

    fetchGoals: (category?: string) => Promise<void>
    createGoal: (data: {
        category: string
        title: string
        description?: string
        target_value?: number
        unit?: string
        start_date?: string
        target_date?: string
    }) => Promise<void>
    updateGoalProgress: (id: number, value: number) => Promise<void>
    completeGoal: (id: number) => Promise<void>

    fetchWellnessStats: () => Promise<void>
}

export const useWellnessStore = create<WellnessState>((set, _get) => ({
    todayMood: null,
    moodHistory: [],
    moodTrends: null,
    journalEntries: [],
    goals: [],
    activeGoals: [],
    wellnessStats: null,
    isLoading: false,
    isMoodLoading: false,
    isJournalLoading: false,
    isGoalsLoading: false,

    fetchTodayMood: async () => {
        set({ isMoodLoading: true })
        try {
            const response = await wellnessApi.getTodayMood()
            set({ todayMood: response.mood_log as MoodLog | null })
        } catch (error) {
            console.error('Failed to fetch today mood:', error)
        } finally {
            set({ isMoodLoading: false })
        }
    },

    logMood: async (mood: string, note?: string) => {
        set({ isMoodLoading: true })
        try {
            const response = await wellnessApi.logMood({ mood, note })
            set({ todayMood: response.mood_log as MoodLog })
            return { points_earned: response.points_earned }
        } finally {
            set({ isMoodLoading: false })
        }
    },

    fetchMoodTrends: async (days = 7) => {
        try {
            const response = await wellnessApi.getMoodTrends(days)
            set({ moodTrends: response.trends as Record<string, unknown> })
        } catch (error) {
            console.error('Failed to fetch mood trends:', error)
        }
    },

    fetchMoodHistory: async (params?: {
        start_date?: string
        end_date?: string
        per_page?: number
    }) => {
        set({ isMoodLoading: true })
        try {
            const response = await wellnessApi.getMoods(params)
            set({ moodHistory: response.mood_logs as MoodLog[] })
        } catch (error) {
            console.error('Failed to fetch mood history:', error)
        } finally {
            set({ isMoodLoading: false })
        }
    },

    fetchJournalEntries: async () => {
        set({ isJournalLoading: true })
        try {
            const response = await wellnessApi.getJournalEntries()
            set({ journalEntries: response.journal_entries as JournalEntry[] })
        } catch (error) {
            console.error('Failed to fetch journal entries:', error)
        } finally {
            set({ isJournalLoading: false })
        }
    },

    createJournalEntry: async (
        content: string,
        mood?: string,
        tags?: string[],
    ) => {
        set({ isJournalLoading: true })
        try {
            const response = await wellnessApi.createJournalEntry({
                content,
                mood,
                tags,
            })
            const newEntry = response.entry as JournalEntry
            set(state => ({
                journalEntries: [newEntry, ...state.journalEntries],
            }))
        } finally {
            set({ isJournalLoading: false })
        }
    },

    updateJournalEntry: async (
        id: number,
        data: { content?: string; mood?: string; tags?: string[] },
    ) => {
        set({ isJournalLoading: true })
        try {
            const response = await wellnessApi.updateJournalEntry(id, data)
            const updatedEntry = response.entry as JournalEntry
            set(state => ({
                journalEntries: state.journalEntries.map(e =>
                    e.id === id ? updatedEntry : e,
                ),
            }))
        } finally {
            set({ isJournalLoading: false })
        }
    },

    deleteJournalEntry: async (id: number) => {
        try {
            await wellnessApi.deleteJournalEntry(id)
            set(state => ({
                journalEntries: state.journalEntries.filter(e => e.id !== id),
            }))
        } catch (error) {
            console.error('Failed to delete journal entry:', error)
            throw error
        }
    },

    fetchGoals: async (category?: string) => {
        set({ isGoalsLoading: true })
        try {
            const response = await wellnessApi.getGoals({ category })
            const goals = response.goals as Goal[]
            set({
                goals,
                activeGoals: goals.filter(g => g.status === 'active'),
            })
        } catch (error) {
            console.error('Failed to fetch goals:', error)
        } finally {
            set({ isGoalsLoading: false })
        }
    },

    createGoal: async data => {
        set({ isGoalsLoading: true })
        try {
            const response = await wellnessApi.createGoal(data)
            const newGoal = response.goal as Goal
            set(state => ({
                goals: [newGoal, ...state.goals],
                activeGoals:
                    newGoal.status === 'active'
                        ? [newGoal, ...state.activeGoals]
                        : state.activeGoals,
            }))
        } finally {
            set({ isGoalsLoading: false })
        }
    },

    updateGoalProgress: async (id: number, value: number) => {
        try {
            const response = await wellnessApi.updateGoalProgress(id, value)
            const updatedGoal = response.goal as Goal
            set(state => ({
                goals: state.goals.map(g => (g.id === id ? updatedGoal : g)),
                activeGoals: state.activeGoals.map(g =>
                    g.id === id ? updatedGoal : g,
                ),
            }))
        } catch (error) {
            console.error('Failed to update goal progress:', error)
            throw error
        }
    },

    completeGoal: async (id: number) => {
        try {
            await wellnessApi.updateGoal(id, { status: 'completed' })
            set(state => ({
                goals: state.goals.map(g =>
                    g.id === id ? { ...g, status: 'completed' as const } : g,
                ),
                activeGoals: state.activeGoals.filter(g => g.id !== id),
            }))
        } catch (error) {
            console.error('Failed to complete goal:', error)
            throw error
        }
    },

    fetchWellnessStats: async () => {
        try {
            const response = await wellnessApi.getPoints()
            set({ wellnessStats: response.stats as WellnessStats })
        } catch (error) {
            console.error('Failed to fetch wellness stats:', error)
        }
    },
}))
