
"use client";

import { useState, useEffect } from 'react';
import type { AppState, Evaluation } from '@/lib/types';
import { ALL_EPAS, type EPA } from '@/lib/epa-data';
import { EpaEvaluationForm } from '@/components/modals/epa-evaluation-form';
import { getInitialAppState } from '@/lib/config-helpers'; // Adjust path
import { Button } from '@/components/ui/button';
import { MediShiftLogo } from '@/components/icons';

const MOCK_STATE_KEY = 'mock_app_state';

const getAppStateFromMockDb = (): AppState => {
    if (typeof window === 'undefined') return getInitialAppState();
    const storedStateJSON = localStorage.getItem(MOCK_STATE_KEY);
    try {
        if (storedStateJSON) {
            return JSON.parse(storedStateJSON);
        }
    } catch (e) {
        console.error("Failed to parse mock state from localStorage", e);
    }
    return getInitialAppState();
}

const saveAppStateToMockDb = (state: AppState) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
}


export default function EvaluatePage({ params }: { params: { token: string } }) {
    const { token } = params;
    const [appState, setAppState] = useState<AppState | null>(null);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [epa, setEpa] = useState<EPA | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const fullState = getAppStateFromMockDb();
        setAppState(fullState);

        const foundEval = fullState.evaluations.find(e => e.requestToken === token && e.status === 'pending');
        
        if (foundEval) {
            const foundEpa = ALL_EPAS.find(e => e.id === foundEval.epaId);
            if (foundEpa) {
                setEvaluation(foundEval);
                setEpa(foundEpa);
            } else {
                setError("Invalid EPA specified in the request.");
            }
        } else {
            const completedEval = fullState.evaluations.find(e => e.requestToken === token && e.status === 'completed');
            if (completedEval) {
                 setIsCompleted(true);
                 setError("This evaluation has already been completed. Thank you!");
            } else {
                setError("This evaluation request is invalid or has expired.");
            }
        }
    }, [token]);

    const handleSetAppState = (updater: React.SetStateAction<AppState>) => {
        if (typeof updater === 'function') {
            setAppState(prevState => {
                if (!prevState) return null;
                const newState = updater(prevState);
                saveAppStateToMockDb(newState);
                return newState;
            });
        } else {
            saveAppStateToMockDb(updater);
            setAppState(updater);
        }
    };


    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                <div className="flex items-center gap-4 mb-4">
                    <MediShiftLogo className="w-10 h-10 text-primary"/>
                    <h1 className="text-3xl font-bold">MediShift EPA Evaluation</h1>
                </div>
                 <div className="bg-card p-8 rounded-lg shadow-lg max-w-lg">
                    <h2 className={`text-2xl font-bold ${isCompleted ? 'text-primary' : 'text-destructive'}`}>{isCompleted ? 'Evaluation Complete' : 'Error'}</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                     <Button onClick={() => window.close()} className="mt-6">Close Window</Button>
                </div>
            </div>
        );
    }

    if (!appState || !evaluation || !epa) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Loading Evaluation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-muted p-4 sm:p-8">
            <div className="w-full max-w-5xl">
                 <div className="flex items-center gap-4 mb-6">
                    <MediShiftLogo className="w-10 h-10 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold">MediShift EPA Evaluation</h1>
                        <p className="text-muted-foreground">Please complete the form below. Your submission will be recorded automatically.</p>
                    </div>
                </div>
                <EpaEvaluationForm
                    evaluation={evaluation}
                    epa={epa}
                    appState={appState}
                    setAppState={handleSetAppState}
                    onComplete={() => {
                        setIsCompleted(true);
                        setError("Evaluation submitted successfully. Thank you!");
                    }}
                />
            </div>
        </div>
    );
}
