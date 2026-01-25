/**
 * Skills API client functions
 */

import { API_BASE } from './api';

export interface Skill {
    name: string;
    description: string;
    path: string;
    enabled: boolean;
}

const SKILLS_ENDPOINT = `${API_BASE}/skills`;

export const skillsApi = {
    /**
     * Get all available skills
     */
    async getSkills(): Promise<Skill[]> {
        const response = await fetch(SKILLS_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Failed to fetch skills: ${response.statusText}`);
        }
        return await response.json();
    },

    /**
     * Reload skills from disk
     */
    async reloadSkills(): Promise<Skill[]> {
        const response = await fetch(`${SKILLS_ENDPOINT}/reload`, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to reload skills: ${response.statusText}`);
        }
        return await response.json();
    },

    /**
     * Toggle a skill's enabled state
     */
    async toggleSkill(name: string): Promise<{ name: string; enabled: boolean }> {
        const response = await fetch(`${SKILLS_ENDPOINT}/${name}/toggle`, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to toggle skill: ${response.statusText}`);
        }
        return await response.json();
    }
};
