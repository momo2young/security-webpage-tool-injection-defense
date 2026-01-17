/**
 * Skills state management hook using Zustand
 */

import { create } from 'zustand';
import { Skill, skillsApi } from '../lib/skillsApi';

interface SkillsState {
    skills: Skill[];
    loading: boolean;
    error: string | null;

    // Actions
    loadSkills: () => Promise<void>;
    reload: () => Promise<void>;
}

export const useSkills = create<SkillsState>((set) => ({
    skills: [],
    loading: false,
    error: null,

    loadSkills: async () => {
        set({ loading: true, error: null });
        try {
            const skills = await skillsApi.getSkills();
            set({ skills, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load skills',
                loading: false,
            });
        }
    },

    reload: async () => {
        set({ loading: true, error: null });
        try {
            const skills = await skillsApi.reloadSkills();
            set({ skills, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to reload skills',
                loading: false
            });
        }
    }
}));
