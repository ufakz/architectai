import { useState, useCallback } from 'react';
import { Diagram, DiagramVersion, VersionStatus } from '../types';

/**
 * Custom hook for managing diagram version history.
 * Provides state and actions for creating, updating, and querying versions.
 */
export function useVersionStore() {
    const [versions, setVersions] = useState<DiagramVersion[]>([]);
    const [processingVersionId, setProcessingVersionId] = useState<string | null>(null);

    /**
     * Create a new version from the current diagrams.
     * Initializes with 'pending' status.
     */
    const createVersion = useCallback((diagrams: Diagram[]): DiagramVersion => {
        const newVersion: DiagramVersion = {
            id: `v-${Date.now()}`,
            versionNumber: versions.length + 1,
            timestamp: Date.now(),
            diagrams: diagrams.map(d => ({ ...d })), // Deep copy
            refinedImage: null,
            specs: [],
            status: 'pending',
        };

        setVersions(prev => [...prev, newVersion]);
        return newVersion;
    }, [versions.length]);

    /**
     * Update a version by ID with partial updates.
     */
    const updateVersion = useCallback((id: string, updates: Partial<DiagramVersion>) => {
        setVersions(prev => prev.map(v =>
            v.id === id ? { ...v, ...updates } : v
        ));
    }, []);

    /**
     * Get a version by ID.
     */
    const getVersion = useCallback((id: string): DiagramVersion | undefined => {
        return versions.find(v => v.id === id);
    }, [versions]);

    /**
     * Get the latest version with 'complete' status.
     */
    const getLatestCompleteVersion = useCallback((): DiagramVersion | undefined => {
        return [...versions].reverse().find(v => v.status === 'complete');
    }, [versions]);

    /**
     * Get the latest version regardless of status.
     */
    const getLatestVersion = useCallback((): DiagramVersion | undefined => {
        return versions[versions.length - 1];
    }, [versions]);

    /**
     * Check if any version is currently being processed.
     */
    const isProcessing = versions.some(v =>
        v.status === 'pending' || v.status === 'refining' || v.status === 'specifying'
    );

    /**
     * Get count of versions by status.
     */
    const getStatusCounts = useCallback(() => {
        return versions.reduce((acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        }, {} as Record<VersionStatus, number>);
    }, [versions]);

    return {
        versions,
        processingVersionId,
        setProcessingVersionId,
        isProcessing,
        createVersion,
        updateVersion,
        getVersion,
        getLatestVersion,
        getLatestCompleteVersion,
        getStatusCounts,
    };
}

export type VersionStore = ReturnType<typeof useVersionStore>;
