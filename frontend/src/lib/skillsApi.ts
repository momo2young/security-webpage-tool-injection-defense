/**
 * Skills API client functions
 */

export interface Skill {
    name: string;
    description: string;
    path: string;
    enabled: boolean;
}

const API_BASE = '/api/skills';

export const skillsApi = {
    /**
     * Get all available skills
     */
    async getSkills(): Promise<Skill[]> {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error(`Failed to fetch skills: ${response.statusText}`);
        }
        return await response.json();
    },

    /**
     * Reload skills from disk
     */
    async reloadSkills(): Promise<Skill[]> {
        const response = await fetch(`${API_BASE}/reload`, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to reload skills: ${response.statusText}`);
        }
        return await response.json();
    },

    /**
     * Toggle a skill's enabled state
     */
    async toggleSkill(name: string): Promise<{ name: string; enabled: boolean }> {
        const response = await fetch(`${API_BASE}/${name}/toggle`, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to toggle skill: ${response.statusText}`);
        }
        return await response.json();
    }
};
