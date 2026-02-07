import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, ComponentSpec, GenerationState, Diagram, DiagramVersion, GitHubAuth, GitHubRepo, Project } from './types';
import { processVersionInBackground, generateBuildPlan } from './services/geminiService';
import {
  getStoredAuth,
  getStoredProject,
  clearAuth,
  clearProject,
  createRepository,
  initializeProject,
  loadProject,
  saveVersion,
  storeProject,
} from './services/githubService';
import { useVersionStore } from './services/versionStore';

// Layouts & UI
import { MainLayout } from './layouts';
import { Button, Card } from './components/ui';
import { ArrowLeft, Key, AlertCircle, Plus, Layout, Layers, X, History, Clock, ChevronRight, Github, FolderOpen } from 'lucide-react';

// Features / Components
import DrawingCanvas from './features/sketch/DrawingCanvas';
import VersionHistoryPanel from './features/history/VersionHistoryPanel';
import BuildView from './features/build/BuildView';
import ProcessingStatus from './components/ProcessingStatus';
import { ProjectSelector, NewProjectDialog, ContinueProjectDialog, DeviceFlowDialog } from './features/project';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // GitHub & Project state
  const [githubAuth, setGithubAuth] = useState<GitHubAuth | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Dialog states
  const [showDeviceFlowDialog, setShowDeviceFlowDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // App mode - starts with project selection if no project
  const [mode, setMode] = useState<AppMode>(AppMode.PROJECT_SELECT);

  // State for multiple diagrams
  const [diagrams, setDiagrams] = useState<Diagram[]>([
    { id: 'main', name: 'Main Architecture', dataUrl: null, type: 'main' }
  ]);
  const [activeDiagramId, setActiveDiagramId] = useState<string>('main');

  // Version management
  const versionStore = useVersionStore();

  // Build plan state
  const [buildPlan, setBuildPlan] = useState<string>('');
  const [activeBuildVersionId, setActiveBuildVersionId] = useState<string>('');
  const [genState, setGenState] = useState<GenerationState>({ isLoading: false, error: null });

  // Current processing status for the status indicator
  const [processingStatus, setProcessingStatus] = useState<DiagramVersion['status'] | null>(null);

  // Initialize auth and project from localStorage
  useEffect(() => {
    const storedAuth = getStoredAuth();
    const storedProject = getStoredProject();

    if (storedAuth) {
      setGithubAuth(storedAuth);
    }

    if (storedProject) {
      setCurrentProject(storedProject);
      setMode(AppMode.CANVAS);
    }
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
        setHasApiKey(false);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleApiError = useCallback((err: any, versionId?: string) => {
    const msg = err.message || JSON.stringify(err);
    if (msg.includes("Requested entity was not found") || msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
      setHasApiKey(false);
      setGenState({ isLoading: false, error: "Access denied. Please select a valid API Key." });
    } else {
      setGenState({ isLoading: false, error: msg });
    }

    // Update version with error if provided
    if (versionId) {
      versionStore.updateVersion(versionId, { status: 'error', error: msg });
    }
    setProcessingStatus('error');
  }, [versionStore]);

  // GitHub handlers
  const handleConnectGitHub = () => {
    setShowDeviceFlowDialog(true);
  };

  const handleDisconnectGitHub = () => {
    clearAuth();
    clearProject();
    setGithubAuth(null);
    setCurrentProject(null);
    setMode(AppMode.PROJECT_SELECT);
  };

  const handleDeviceFlowSuccess = (auth: GitHubAuth) => {
    setGithubAuth(auth);
    setShowDeviceFlowDialog(false);
  };

  // Project handlers
  const handleCreateProject = async (name: string, description: string, isPrivate: boolean) => {
    if (!githubAuth) return;

    setIsCreatingProject(true);
    setGenState({ isLoading: false, error: null });

    try {
      // Create GitHub repo
      const repo = await createRepository(githubAuth, name, description, isPrivate);

      // Initialize project in repo
      const project = await initializeProject(githubAuth, repo, name, description);

      setCurrentProject(project);
      setShowNewProjectDialog(false);
      setMode(AppMode.CANVAS);

      // Reset diagram state for new project
      setDiagrams([{ id: 'main', name: 'Main Architecture', dataUrl: null, type: 'main' }]);
      setActiveDiagramId('main');
    } catch (err: any) {
      setGenState({ isLoading: false, error: err.message || 'Failed to create project' });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSelectProject = async (repo: GitHubRepo) => {
    if (!githubAuth) return;

    setIsLoadingProject(true);
    setGenState({ isLoading: false, error: null });

    try {
      const { project, versions } = await loadProject(githubAuth, repo);

      setCurrentProject(project);

      // Restore versions if any
      if (versions.length > 0) {
        // Load the last version's diagrams
        const lastVersion = versions[versions.length - 1];
        if (lastVersion.diagrams.length > 0) {
          setDiagrams(lastVersion.diagrams);
          setActiveDiagramId(lastVersion.diagrams[0].id);
        }
      }

      setShowContinueDialog(false);
      setMode(AppMode.CANVAS);
    } catch (err: any) {
      setGenState({ isLoading: false, error: err.message || 'Failed to load project' });
    } finally {
      setIsLoadingProject(false);
    }
  };

  /**
   * Handle "Update" click from canvas - creates a new version and starts background processing
   */
  const handleUpdate = async (dataUrl: string) => {
    // Save the current diagram state first
    const updatedDiagrams = diagrams.map(d =>
      d.id === activeDiagramId ? { ...d, dataUrl } : d
    );
    setDiagrams(updatedDiagrams);

    // Filter out empty diagrams
    const validDiagrams = updatedDiagrams.filter(d => d.dataUrl !== null);

    if (validDiagrams.length === 0) {
      setGenState({ isLoading: false, error: "Please draw something first." });
      return;
    }

    // Create a new version
    const newVersion = versionStore.createVersion(validDiagrams);
    setProcessingStatus('pending');

    // Start background processing
    try {
      const images = validDiagrams.map(d => d.dataUrl as string);

      await processVersionInBackground(images, (status) => {
        versionStore.updateVersion(newVersion.id, { status });
        setProcessingStatus(status);
      }).then(async ({ refinedImage, specs }) => {
        const updatedVersion = {
          ...newVersion,
          refinedImage,
          specs,
          status: 'complete' as const,
        };

        versionStore.updateVersion(newVersion.id, {
          refinedImage,
          specs,
          status: 'complete'
        });

        // Save to GitHub if we have a project
        if (githubAuth && currentProject) {
          try {
            await saveVersion(githubAuth, currentProject, {
              ...newVersion,
              refinedImage,
              specs,
              status: 'complete',
              diagrams: validDiagrams,
            });
          } catch (err) {
            console.error('Failed to save to GitHub:', err);
            // Don't fail the whole operation, just log
          }
        }

        setProcessingStatus(null);
      });
    } catch (err: any) {
      handleApiError(err, newVersion.id);
    }
  };

  /**
   * Generate build plan from a specific version
   */
  const handleGenerateBuild = async (version: DiagramVersion) => {
    if (!version.refinedImage) return;

    setActiveBuildVersionId(version.id);
    setMode(AppMode.BUILD);

    // Check if we already have a generated plan for this version
    if (version.buildPlan) {
      setBuildPlan(version.buildPlan);
      return;
    }

    setGenState({ isLoading: true, error: null });

    try {
      const plan = await generateBuildPlan(version.refinedImage, version.specs);
      setBuildPlan(plan);

      // Cache the plan in the version
      versionStore.updateVersion(version.id, { buildPlan: plan });

      // Save updated version to GitHub
      if (githubAuth && currentProject) {
        try {
          await saveVersion(githubAuth, currentProject, {
            ...version,
            buildPlan: plan,
          });
        } catch (err) {
          console.error('Failed to save build plan to GitHub:', err);
        }
      }

      setGenState(prev => ({ ...prev, isLoading: false }));
    } catch (err: any) {
      handleApiError(err);
      setMode(AppMode.HISTORY); // Go back if failed
    }
  };

  const handleBuildVersionSelect = (versionId: string) => {
    const version = versionStore.getVersion(versionId);
    if (version) {
      handleGenerateBuild(version);
    }
  };

  const resetApp = () => {
    setDiagrams([{ id: 'main', name: 'Main Architecture', dataUrl: null, type: 'main' }]);
    setActiveDiagramId('main');
    setBuildPlan('');
    setMode(AppMode.CANVAS);
    setGenState({ isLoading: false, error: null });
  };

  const handleCloseProject = () => {
    clearProject();
    setCurrentProject(null);
    setMode(AppMode.PROJECT_SELECT);
    setDiagrams([{ id: 'main', name: 'Main Architecture', dataUrl: null, type: 'main' }]);
    setActiveDiagramId('main');
    setBuildPlan('');
  };

  const activeDiagram = diagrams.find(d => d.id === activeDiagramId);

  const addNewDiagram = () => {
    const newId = `sub-${Date.now()}`;
    const newDiagram: Diagram = {
      id: newId,
      name: `Sub-Diagram ${diagrams.length}`,
      dataUrl: null,
      type: 'sub'
    };
    setDiagrams([...diagrams, newDiagram]);
    setActiveDiagramId(newId);
  };

  const deleteDiagram = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (diagrams.length <= 1) return;

    const newDiagrams = diagrams.filter(d => d.id !== id);
    setDiagrams(newDiagrams);
    if (activeDiagramId === id) {
      setActiveDiagramId(newDiagrams[0].id);
    }
  };

  const handleSketchChange = (dataUrl: string) => {
    setDiagrams(prev => prev.map(d =>
      d.id === activeDiagramId ? { ...d, dataUrl } : d
    ));
  };

  if (isCheckingKey) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium">Initializing...</div>;
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full p-10 shadow-xl border-slate-200">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">ArchitectAI</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Connect your Google Gemini API key to start generating professional software architectures.
          </p>

          <Button
            onClick={handleSelectKey}
            variant="primary"
            className="w-full shadow-lg shadow-primary/20"
            size="lg"
          >
            Connect API Key
            <ChevronRight size={18} className="ml-2" />
          </Button>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
            Requires Gemini 2.5 or 3 Pro
          </div>
        </Card>
      </div>
    );
  }

  // Project selection mode
  if (mode === AppMode.PROJECT_SELECT) {
    return (
      <MainLayout onSelectKey={handleSelectKey}>
        <ProjectSelector
          auth={githubAuth}
          onConnectGitHub={handleConnectGitHub}
          onDisconnect={handleDisconnectGitHub}
          onNewProject={() => setShowNewProjectDialog(true)}
          onContinueProject={() => setShowContinueDialog(true)}
        />

        {/* Device Flow Dialog */}
        <DeviceFlowDialog
          isOpen={showDeviceFlowDialog}
          onClose={() => setShowDeviceFlowDialog(false)}
          onSuccess={handleDeviceFlowSuccess}
        />

        {/* New Project Dialog */}
        <NewProjectDialog
          isOpen={showNewProjectDialog}
          isLoading={isCreatingProject}
          onClose={() => setShowNewProjectDialog(false)}
          onCreate={handleCreateProject}
        />

        {/* Continue Project Dialog */}
        {githubAuth && (
          <ContinueProjectDialog
            isOpen={showContinueDialog}
            auth={githubAuth}
            onClose={() => setShowContinueDialog(false)}
            onSelect={handleSelectProject}
          />
        )}
      </MainLayout>
    );
  }

  return (
    <MainLayout onSelectKey={handleSelectKey}>
      {/* Project Header */}
      {currentProject && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderOpen size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{currentProject.name}</h2>
              <a
                href={currentProject.githubRepo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
              >
                <Github size={10} />
                {currentProject.githubRepo.fullName}
              </a>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCloseProject}>
            Close Project
          </Button>
        </div>
      )}

      {/* Error Notification */}
      {genState.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 text-sm font-medium">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-red-100 rounded-full"><AlertCircle size={16} /></div>
            <p>{genState.error}</p>
          </div>
          <button onClick={() => setGenState({ ...genState, error: null })} className="hover:text-red-900 transition-colors p-1 hover:bg-red-100 rounded-lg">✕</button>
        </div>
      )}

      {/* Views */}
      <div className="flex-1 relative min-h-[600px]">
        {mode === AppMode.CANVAS && (
          <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500 ease-out">
            {/* Header with Diagram Switcher and History Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1">
                {diagrams.map(diagram => (
                  <button
                    key={diagram.id}
                    onClick={() => setActiveDiagramId(diagram.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${activeDiagramId === diagram.id
                      ? 'bg-white border-primary text-primary shadow-sm'
                      : 'bg-white/50 border-transparent text-slate-500 hover:bg-white hover:text-slate-700'
                      }`}
                  >
                    {diagram.type === 'main' ? <Layout size={14} /> : <Layers size={14} />}
                    {diagram.name}
                    {diagram.type !== 'main' && (
                      <span
                        onClick={(e) => deleteDiagram(diagram.id, e)}
                        className="ml-1 p-0.5 rounded-md hover:bg-red-50 hover:text-red-500 opacity-60 hover:opacity-100"
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={addNewDiagram}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors border border-dashed border-slate-300 hover:border-primary/30"
                >
                  <Plus size={14} />
                  New Diagram
                </button>
              </div>

              {/* History Button */}
              <Button
                onClick={() => setMode(AppMode.HISTORY)}
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
              >
                <History size={16} className="mr-2" />
                History
                {versionStore.versions.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                    {versionStore.versions.length}
                  </span>
                )}
              </Button>
            </div>

            <div className="flex-1">
              <DrawingCanvas
                key={activeDiagramId}
                onExport={handleUpdate}
                onChange={handleSketchChange}
                initialImage={activeDiagram?.dataUrl}
                buttonLabel="Update"
              />
            </div>
          </div>
        )}

        {mode === AppMode.HISTORY && (
          <div className="h-full animate-in fade-in zoom-in-95 duration-500 ease-out">
            <VersionHistoryPanel
              versions={versionStore.versions}
              onBack={() => setMode(AppMode.CANVAS)}
              onGenerateBuild={handleGenerateBuild}
              onUpdateVersion={versionStore.updateVersion}
            />
          </div>
        )}

        {mode === AppMode.BUILD && (
          <div className="h-full animate-in fade-in zoom-in-95 duration-500 ease-out">
            <BuildView
              markdownContent={buildPlan}
              onRestart={resetApp}
              versions={versionStore.versions}
              currentVersionId={activeBuildVersionId}
              onVersionSelect={handleBuildVersionSelect}
              onBack={() => setMode(AppMode.HISTORY)}
              isLoading={genState.isLoading}
            />
          </div>
        )}
      </div>

      {/* Processing Status Indicator */}
      <ProcessingStatus
        status={processingStatus}
        versionNumber={versionStore.getLatestVersion()?.versionNumber}
        pendingCount={versionStore.versions.filter(v => v.status !== 'complete' && v.status !== 'error').length}
        onViewHistory={() => setMode(AppMode.HISTORY)}
      />
    </MainLayout>
  );
}

export default App;
