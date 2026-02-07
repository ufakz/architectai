import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Copy, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { DeviceFlowState, requestDeviceCode, completeDeviceFlow } from '../../services/githubService';
import { GitHubAuth } from '../../types/projectTypes';

interface DeviceFlowDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (auth: GitHubAuth) => void;
}

export default function DeviceFlowDialog({
    isOpen,
    onClose,
    onSuccess,
}: DeviceFlowDialogProps) {
    const [step, setStep] = useState<'loading' | 'code' | 'polling' | 'success' | 'error'>('loading');
    const [deviceFlow, setDeviceFlow] = useState<DeviceFlowState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const startDeviceFlow = useCallback(async () => {
        setStep('loading');
        setError(null);

        try {
            const flow = await requestDeviceCode();
            setDeviceFlow(flow);
            setStep('code');
        } catch (err: any) {
            setError(err.message || 'Failed to start authentication');
            setStep('error');
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            startDeviceFlow();
        }
    }, [isOpen, startDeviceFlow]);

    const handleCopyCode = async () => {
        if (deviceFlow?.userCode) {
            await navigator.clipboard.writeText(deviceFlow.userCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenGitHub = () => {
        if (deviceFlow?.verificationUri) {
            window.open(deviceFlow.verificationUri, '_blank');
            startPolling();
        }
    };

    const startPolling = async () => {
        if (!deviceFlow) return;

        setStep('polling');

        try {
            const auth = await completeDeviceFlow(
                deviceFlow.deviceCode,
                deviceFlow.interval
            );
            setStep('success');
            setTimeout(() => onSuccess(auth), 1500);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setStep('error');
        }
    };

    const handleClose = () => {
        if (step !== 'polling') {
            setStep('loading');
            setDeviceFlow(null);
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={step !== 'polling' ? handleClose : undefined}
            />

            {/* Dialog */}
            <Card className="relative w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                <div className="p-8 text-center">
                    {/* Loading */}
                    {step === 'loading' && (
                        <>
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Connecting to GitHub
                            </h2>
                            <p className="text-slate-500">Preparing authentication...</p>
                        </>
                    )}

                    {/* Show Code */}
                    {step === 'code' && deviceFlow && (
                        <>
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Enter this code on GitHub
                            </h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Copy the code below and enter it on GitHub to connect your account
                            </p>

                            {/* Code Display */}
                            <div className="relative mb-6">
                                <div className="bg-slate-100 rounded-xl p-6 font-mono text-3xl font-bold tracking-widest text-slate-900">
                                    {deviceFlow.userCode}
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                                    title="Copy code"
                                >
                                    {copied ? (
                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={18} />
                                    )}
                                </button>
                            </div>

                            {/* Actions */}
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full bg-slate-900 hover:bg-slate-800 mb-3"
                                onClick={handleOpenGitHub}
                            >
                                <ExternalLink size={18} className="mr-2" />
                                Open GitHub
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>

                            <p className="mt-4 text-xs text-slate-400">
                                Code expires in {Math.floor(deviceFlow.expiresIn / 60)} minutes
                            </p>
                        </>
                    )}

                    {/* Polling */}
                    {step === 'polling' && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Waiting for authorization
                            </h2>
                            <p className="text-slate-500">
                                Complete the authorization on GitHub to continue...
                            </p>
                        </>
                    )}

                    {/* Success */}
                    {step === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Connected!
                            </h2>
                            <p className="text-slate-500">
                                Successfully connected to GitHub
                            </p>
                        </>
                    )}

                    {/* Error */}
                    {step === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Connection Failed
                            </h2>
                            <p className="text-red-600 mb-6">{error}</p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button variant="primary" className="flex-1" onClick={startDeviceFlow}>
                                    Try Again
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
