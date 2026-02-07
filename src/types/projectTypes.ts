// Project management types for GitHub integration

export interface GitHubUser {
    login: string;
    avatarUrl: string;
    name?: string;
}

export interface GitHubAuth {
    accessToken: string;
    user: GitHubUser;
}

export interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    htmlUrl: string;
    private: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    githubRepo: {
        owner: string;
        name: string;
        fullName: string;
        url: string;
        htmlUrl: string;
    };
    createdAt: number;
    updatedAt: number;
}

// Metadata stored in .aichitect/project.json
export interface ProjectMetadata {
    version: '1.0';
    projectId: string;
    projectName: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    latestVersionId: string | null;
}

// Metadata stored in versions/<id>/version.json
export interface VersionMetadata {
    id: string;
    versionNumber: number;
    timestamp: number;
    status: 'complete' | 'error';
    diagramFiles: string[];
    refinedFile: string | null;
    specs: Array<{
        id: string;
        name: string;
        description: string;
        userNotes: string;
    }>;
    buildPlan?: string;
}
