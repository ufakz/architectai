/**
 * GitHub API Service for ArchitectAI
 * Handles GitHub App Device Flow authentication, repository operations, and artifact storage
 */

import { GitHubAuth, GitHubRepo, GitHubUser, Project, ProjectMetadata, VersionMetadata } from '../types/projectTypes';
import { DiagramVersion } from '../types';

// Backend URL for device flow - configurable via env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const GITHUB_API = 'https://api.github.com';

// Topic used to identify ArchitectAI repositories
const ARCHITECTAI_TOPIC = 'architectai-project';

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
    AUTH: 'architectai_github_auth',
    CURRENT_PROJECT: 'architectai_current_project',
};

/**
 * Get stored GitHub auth from localStorage
 */
export function getStoredAuth(): GitHubAuth | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/**
 * Store GitHub auth in localStorage
 */
export function storeAuth(auth: GitHubAuth): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
}

/**
 * Clear stored auth
 */
export function clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
}

/**
 * Get stored current project
 */
export function getStoredProject(): Project | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/**
 * Store current project
 */
export function storeProject(project: Project): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project));
}

/**
 * Clear stored project
 */
export function clearProject(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
}

/**
 * Device flow state returned when initiating auth
 */
export interface DeviceFlowState {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
}

/**
 * Step 1: Request a device code to start the authentication flow
 * Returns codes that the user needs to enter on GitHub
 */
export async function requestDeviceCode(): Promise<DeviceFlowState> {
    const response = await fetch(`${BACKEND_URL}/auth/device/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request device code');
    }

    return response.json();
}

/**
 * Step 2: Poll for access token after user authorizes
 * Returns the status of the authorization
 */
export async function pollForToken(deviceCode: string): Promise<{
    status: 'pending' | 'slow_down' | 'complete';
    accessToken?: string;
    interval?: number;
}> {
    const response = await fetch(`${BACKEND_URL}/auth/device/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to poll for token');
    }

    return response.json();
}

/**
 * Complete the device flow authentication
 * Handles the polling loop internally
 */
export async function completeDeviceFlow(
    deviceCode: string,
    interval: number,
    onPending?: () => void
): Promise<GitHubAuth> {
    let pollInterval = interval * 1000; // Convert to ms

    while (true) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        const result = await pollForToken(deviceCode);

        if (result.status === 'pending') {
            onPending?.();
            continue;
        }

        if (result.status === 'slow_down') {
            // GitHub asked us to slow down
            pollInterval = (result.interval || interval + 5) * 1000;
            continue;
        }

        if (result.status === 'complete' && result.accessToken) {
            // Success! Fetch user info and store auth
            const user = await fetchGitHubUser(result.accessToken);
            const auth: GitHubAuth = { accessToken: result.accessToken, user };
            storeAuth(auth);
            return auth;
        }

        throw new Error('Unexpected token polling result');
    }
}

/**
 * Fetch authenticated GitHub user info
 */
async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(`${GITHUB_API}/user`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch GitHub user');
    }

    const data = await response.json();
    return {
        login: data.login,
        avatarUrl: data.avatar_url,
        name: data.name,
    };
}

/**
 * Create a new GitHub repository for an ArchitectAI project
 */
export async function createRepository(
    auth: GitHubAuth,
    projectName: string,
    description: string,
    isPrivate: boolean = true
): Promise<GitHubRepo> {
    // Sanitize project name for repo (just clean up invalid characters)
    const repoName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');

    const response = await fetch(`${GITHUB_API}/user/repos`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: repoName,
            description: `ArchitectAI Project: ${description}`,
            private: isPrivate,
            auto_init: true, // Initialize with README
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create repository');
    }

    const repo = await response.json();

    // Add the architectai topic to identify this repo
    await addRepoTopic(auth, repo.owner.login, repo.name);

    return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.url,
        htmlUrl: repo.html_url,
        private: repo.private,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
    };
}

/**
 * Add architectai topic to repository for identification
 */
async function addRepoTopic(auth: GitHubAuth, owner: string, repo: string): Promise<void> {
    await fetch(`${GITHUB_API}/repos/${owner}/${repo}/topics`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            names: [ARCHITECTAI_TOPIC],
        }),
    });
}

/**
 * List user's ArchitectAI repositories
 */
export async function listArchitectAIRepos(auth: GitHubAuth): Promise<GitHubRepo[]> {
    // Search for repos with the architectai topic
    const response = await fetch(
        `${GITHUB_API}/search/repositories?q=user:${auth.user.login}+topic:${ARCHITECTAI_TOPIC}`,
        {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                Accept: 'application/vnd.github+json',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to list repositories');
    }

    const data = await response.json();

    return data.items.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.url,
        htmlUrl: repo.html_url,
        private: repo.private,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
    }));
}

/**
 * Initialize a new project in a repository
 */
export async function initializeProject(
    auth: GitHubAuth,
    repo: GitHubRepo,
    projectName: string,
    description: string
): Promise<Project> {
    const projectId = `proj-${Date.now()}`;
    const now = Date.now();

    const metadata: ProjectMetadata = {
        version: '1.0',
        projectId,
        projectName,
        description,
        createdAt: now,
        updatedAt: now,
        latestVersionId: null,
    };

    // Create .architectai/project.json
    await createOrUpdateFile(
        auth,
        repo.fullName,
        '.architectai/project.json',
        JSON.stringify(metadata, null, 2),
        'Initialize ArchitectAI project'
    );

    const project: Project = {
        id: projectId,
        name: projectName,
        description,
        githubRepo: {
            owner: repo.fullName.split('/')[0],
            name: repo.name,
            fullName: repo.fullName,
            url: repo.url,
            htmlUrl: repo.htmlUrl,
        },
        createdAt: now,
        updatedAt: now,
    };

    storeProject(project);
    return project;
}

/**
 * Load project from a repository
 */
export async function loadProject(auth: GitHubAuth, repo: GitHubRepo): Promise<{ project: Project; versions: DiagramVersion[] }> {
    // Fetch project metadata
    const metadataContent = await getFileContent(auth, repo.fullName, '.architectai/project.json');
    const metadata: ProjectMetadata = JSON.parse(metadataContent);

    const project: Project = {
        id: metadata.projectId,
        name: metadata.projectName,
        description: metadata.description,
        githubRepo: {
            owner: repo.fullName.split('/')[0],
            name: repo.name,
            fullName: repo.fullName,
            url: repo.url,
            htmlUrl: repo.htmlUrl,
        },
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
    };

    // Load versions
    const versions = await loadVersions(auth, repo.fullName);

    storeProject(project);
    return { project, versions };
}

/**
 * Load all versions from a repository
 */
async function loadVersions(auth: GitHubAuth, repoFullName: string): Promise<DiagramVersion[]> {
    try {
        // List contents of versions directory
        const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/versions`, {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                Accept: 'application/vnd.github+json',
            },
        });

        if (!response.ok) {
            // No versions yet
            return [];
        }

        const items = await response.json();
        const versions: DiagramVersion[] = [];

        for (const item of items) {
            if (item.type === 'dir') {
                try {
                    const versionContent = await getFileContent(auth, repoFullName, `versions/${item.name}/version.json`);
                    const versionMeta: VersionMetadata = JSON.parse(versionContent);

                    // Load refined image if exists
                    let refinedImage: string | null = null;
                    if (versionMeta.refinedFile) {
                        try {
                            refinedImage = await getFileAsBase64(auth, repoFullName, `versions/${item.name}/refined/refined.png`);
                        } catch {
                            // Refined image not available
                        }
                    }

                    // Load diagrams
                    const diagrams = await Promise.all(
                        versionMeta.diagramFiles.map(async (file, index) => {
                            try {
                                const dataUrl = await getFileAsBase64(auth, repoFullName, `versions/${item.name}/diagrams/${file}`);
                                return {
                                    id: file.replace('.png', ''),
                                    name: index === 0 ? 'Main Architecture' : `Sub-Diagram ${index}`,
                                    dataUrl,
                                    type: (index === 0 ? 'main' : 'sub') as 'main' | 'sub',
                                };
                            } catch {
                                return null;
                            }
                        })
                    );

                    versions.push({
                        id: versionMeta.id,
                        versionNumber: versionMeta.versionNumber,
                        timestamp: versionMeta.timestamp,
                        diagrams: diagrams.filter(Boolean) as any[],
                        refinedImage,
                        specs: versionMeta.specs,
                        buildPlan: versionMeta.buildPlan,
                        status: versionMeta.status,
                    });
                } catch (e) {
                    console.error(`Failed to load version ${item.name}:`, e);
                }
            }
        }

        return versions.sort((a, b) => a.versionNumber - b.versionNumber);
    } catch {
        return [];
    }
}

/**
 * Save a version to the repository
 */
export async function saveVersion(
    auth: GitHubAuth,
    project: Project,
    version: DiagramVersion
): Promise<void> {
    const versionPath = `versions/${version.id}`;
    const repoFullName = project.githubRepo.fullName;

    // Save diagrams
    const diagramFiles: string[] = [];
    for (const diagram of version.diagrams) {
        if (diagram.dataUrl) {
            const filename = `${diagram.id}.png`;
            diagramFiles.push(filename);
            await createOrUpdateFile(
                auth,
                repoFullName,
                `${versionPath}/diagrams/${filename}`,
                diagram.dataUrl.replace(/^data:image\/\w+;base64,/, ''),
                `Save diagram ${diagram.name}`,
                true // isBase64
            );
        }
    }

    // Save refined image if exists
    let refinedFile: string | null = null;
    if (version.refinedImage) {
        refinedFile = 'refined.png';
        await createOrUpdateFile(
            auth,
            repoFullName,
            `${versionPath}/refined/refined.png`,
            version.refinedImage.replace(/^data:image\/\w+;base64,/, ''),
            `Save refined diagram for version ${version.versionNumber}`,
            true
        );
    }

    // Save version metadata
    const versionMeta: VersionMetadata = {
        id: version.id,
        versionNumber: version.versionNumber,
        timestamp: version.timestamp,
        status: version.status === 'error' ? 'error' : 'complete',
        diagramFiles,
        refinedFile,
        specs: version.specs,
        buildPlan: version.buildPlan,
    };

    await createOrUpdateFile(
        auth,
        repoFullName,
        `${versionPath}/version.json`,
        JSON.stringify(versionMeta, null, 2),
        `Save version ${version.versionNumber} metadata`
    );

    // Update specs/latest-specs.json
    if (version.specs.length > 0) {
        await createOrUpdateFile(
            auth,
            repoFullName,
            'specs/latest-specs.json',
            JSON.stringify(version.specs, null, 2),
            'Update latest specs'
        );
    }

    // Save build plan as markdown in specs folder
    if (version.buildPlan) {
        const versionName = `v${version.versionNumber}`;
        await createOrUpdateFile(
            auth,
            repoFullName,
            `specs/${versionName}.md`,
            version.buildPlan,
            `Save build plan for ${versionName}`
        );
    }

    // Update project metadata
    const metadata: ProjectMetadata = {
        version: '1.0',
        projectId: project.id,
        projectName: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: Date.now(),
        latestVersionId: version.id,
    };

    await createOrUpdateFile(
        auth,
        repoFullName,
        '.architectai/project.json',
        JSON.stringify(metadata, null, 2),
        'Update project metadata'
    );
}

/**
 * Create or update a file in a repository
 */
async function createOrUpdateFile(
    auth: GitHubAuth,
    repoFullName: string,
    path: string,
    content: string,
    message: string,
    isBase64: boolean = false
): Promise<void> {
    // Try to get existing file SHA
    let sha: string | undefined;
    try {
        const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${path}`, {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                Accept: 'application/vnd.github+json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
        }
    } catch {
        // File doesn't exist, that's fine
    }

    const body: any = {
        message,
        content: isBase64 ? content : btoa(unescape(encodeURIComponent(content))),
    };

    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${path}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to save file ${path}: ${error.message}`);
    }
}

/**
 * Get file content from repository
 */
async function getFileContent(auth: GitHubAuth, repoFullName: string, path: string): Promise<string> {
    const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${path}`, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get file ${path}`);
    }

    const data = await response.json();
    return decodeURIComponent(escape(atob(data.content)));
}

/**
 * Get file as base64 data URL
 */
async function getFileAsBase64(auth: GitHubAuth, repoFullName: string, path: string): Promise<string> {
    const response = await fetch(`${GITHUB_API}/repos/${repoFullName}/contents/${path}`, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get file ${path}`);
    }

    const data = await response.json();
    return `data:image/png;base64,${data.content.replace(/\n/g, '')}`;
}
