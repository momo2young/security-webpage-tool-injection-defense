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
    toggle: (name: string) => Promise<void>;
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
    },

    toggle: async (name: string) => {
        // Optimistic update
        set((state) => ({
            skills: state.skills.map((s) =>
                s.name === name ? { ...s, enabled: !s.enabled } : s
            ),
        }));

        try {
            const result = await skillsApi.toggleSkill(name);
            // Confirm state matches server
            set((state) => ({
                skills: state.skills.map((s) =>
                    s.name === result.name ? { ...s, enabled: result.enabled } : s
                ),
            }));
        } catch (error) {
            // Revert on error
            set((state) => ({
                skills: state.skills.map((s) =>
                    s.name === name ? { ...s, enabled: !s.enabled } : s
                ),
                error: error instanceof Error ? error.message : 'Failed to toggle skill'
            }));
        }
    }
}));
