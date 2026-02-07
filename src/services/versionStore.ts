import { useState, useCallback } from 'react';
import { Diagram, DiagramVersion, VersionStatus } from '../types';

export function useVersionStore() {
    const [versions, setVersions] = useState<DiagramVersion[]>([]);
    const [processingVersionId, setProcessingVersionId] = useState<string | null>(null);

    const createVersion = useCallback((diagrams: Diagram[]): DiagramVersion => {
        const newVersion: DiagramVersion = {
            id: `v-${Date.now()}`,
            versionNumber: versions.length + 1,
            timestamp: Date.now(),
            diagrams: diagrams.map(d => ({ ...d })),
            refinedImage: null,
            specs: [],
            status: 'pending',
        };

        setVersions(prev => [...prev, newVersion]);
        return newVersion;
    }, [versions.length]);

    const updateVersion = useCallback((id: string, updates: Partial<DiagramVersion>) => {
        setVersions(prev => prev.map(v =>
            v.id === id ? { ...v, ...updates } : v
        ));
    }, []);

    const getVersion = useCallback((id: string): DiagramVersion | undefined => {
        return versions.find(v => v.id === id);
    }, [versions]);

    const getLatestCompleteVersion = useCallback((): DiagramVersion | undefined => {
        return [...versions].reverse().find(v => v.status === 'complete');
    }, [versions]);

    const getLatestVersion = useCallback((): DiagramVersion | undefined => {
        return versions[versions.length - 1];
    }, [versions]);

    const isProcessing = versions.some(v =>
        v.status === 'pending' || v.status === 'refining' || v.status === 'specifying'
    );

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
