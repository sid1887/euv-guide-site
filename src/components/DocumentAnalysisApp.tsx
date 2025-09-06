// src/components/DocumentAnalysisApp.tsx
import React, { useState, useCallback, useEffect } from 'react';
import DocumentUpload from './DocumentUpload';
import AnalysisDashboard from './AnalysisDashboard';
import VisualizationDisplay from './VisualizationDisplay';
import { 
  DocumentProcessor, 
  ProcessedDocument, 
  VisualizationSuggestion 
} from '../services/DocumentProcessor';
import { 
  KnowledgeGraphBuilder, 
  KnowledgeGraph 
} from '../services/KnowledgeGraphBuilder';
import { 
  VisualizationEngine, 
  GeneratedVisualization 
} from '../services/VisualizationEngine';
import { 
  CoreApplicationService, 
  AnalysisSession, 
  AnalysisResult 
} from '../services/CoreApplicationService';
import { FileText, Brain, Sparkles, AlertCircle } from 'lucide-react';

interface AppState {
  currentSession: AnalysisSession | null;
  documents: ProcessedDocument[];
  knowledgeGraph: KnowledgeGraph;
  visualizations: GeneratedVisualization[];
  isProcessing: boolean;
  error: string | null;
  selectedVisualization: GeneratedVisualization | null;
}

export const DocumentAnalysisApp: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentSession: null,
    documents: [],
    knowledgeGraph: {
      nodes: new Map(),
      edges: [],
      topics: new Map(),
      documentMap: new Map()
    },
    visualizations: [],
    isProcessing: false,
    error: null,
    selectedVisualization: null
  });

  // Initialize services
  const [coreService] = useState(() => new CoreApplicationService());

  useEffect(() => {
    // Initialize a new session on component mount
    const initSession = async () => {
      const sessionId = await coreService.createAnalysisSession('default-session');
      const session = coreService.getSession(sessionId);
      setState(prev => ({ ...prev, currentSession: session }));
    };
    initSession();
  }, [coreService]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!state.currentSession) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await coreService.processDocuments(
        state.currentSession.id,
        files,
        []
      );

      if (result.errors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          error: `Processing completed with errors: ${result.errors.join(', ')}` 
        }));
      }

      // Update state with new data
      const session = coreService.getSession(state.currentSession.id);
      if (session) {
        setState(prev => ({
          ...prev,
          currentSession: session,
          documents: session.documents,
          knowledgeGraph: session.knowledgeGraph,
          visualizations: session.visualizations,
          isProcessing: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        isProcessing: false
      }));
    }
  }, [state.currentSession, coreService]);

  const handleUrlUpload = useCallback(async (urls: string[]) => {
    if (!state.currentSession) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await coreService.processDocuments(
        state.currentSession.id,
        [],
        urls
      );

      if (result.errors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          error: `Processing completed with errors: ${result.errors.join(', ')}` 
        }));
      }

      // Update state with new data
      const session = coreService.getSession(state.currentSession.id);
      if (session) {
        setState(prev => ({
          ...prev,
          currentSession: session,
          documents: session.documents,
          knowledgeGraph: session.knowledgeGraph,
          visualizations: session.visualizations,
          isProcessing: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'URL processing failed',
        isProcessing: false
      }));
    }
  }, [state.currentSession, coreService]);

  const handleGenerateVisualization = useCallback(async (documentId: string, type: string) => {
    if (!state.currentSession) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const document = state.documents.find(doc => doc.id === documentId);
      if (document) {
        // Force regeneration by clearing existing visualizations for this document
        // and triggering the visualization generation process
        await coreService.processDocuments(
          state.currentSession.id,
          [], // No new files
          [] // No new URLs
        );

        const session = coreService.getSession(state.currentSession.id);
        if (session) {
          setState(prev => ({
            ...prev,
            visualizations: session.visualizations,
            isProcessing: false
          }));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Visualization generation failed',
        isProcessing: false
      }));
    }
  }, [state.currentSession, state.documents, coreService]);

  const handleExportResults = useCallback(async (format: 'pdf' | 'json' | 'csv') => {
    if (!state.currentSession) return;

    try {
      // Map csv to html since the service doesn't support csv
      const exportFormat = format === 'csv' ? 'html' : format;
      const blob = await coreService.exportSession(state.currentSession.id, exportFormat);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${state.currentSession.name}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    }
  }, [state.currentSession, coreService]);

  const handleVisualizationConfigChange = useCallback((vizId: string, config: any) => {
    setState(prev => ({
      ...prev,
      visualizations: prev.visualizations.map(viz =>
        viz.id === vizId ? { ...viz, config } : viz
      )
    }));
  }, []);

  const handleVisualizationExport = useCallback(async (vizId: string, format: 'png' | 'svg' | 'pdf') => {
    // Implementation would depend on the visualization library being used
    console.log(`Exporting visualization ${vizId} as ${format}`);
  }, []);

  const renderContent = () => {
    if (state.documents.length === 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <DocumentUpload
            onFileUpload={handleFileUpload}
            onUrlUpload={handleUrlUpload}
            isProcessing={state.isProcessing}
          />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Quick Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{state.documents.length} documents</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Brain className="w-4 h-4" />
                <span>{state.knowledgeGraph.nodes.size} concepts</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4" />
                <span>{state.visualizations.length} visualizations</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Reset to upload mode
                  setState(prev => ({
                    ...prev,
                    documents: [],
                    knowledgeGraph: {
                      nodes: new Map(),
                      edges: [],
                      topics: new Map(),
                      documentMap: new Map()
                    },
                    visualizations: []
                  }));
                }}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                New Analysis
              </button>
              <button
                onClick={() => handleExportResults('pdf')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <AnalysisDashboard
          documents={state.documents}
          knowledgeGraph={state.knowledgeGraph}
          visualizations={state.visualizations}
          onGenerateVisualization={handleGenerateVisualization}
          onExportResults={handleExportResults}
          isGenerating={state.isProcessing}
        />

        {/* Selected Visualization */}
        {state.selectedVisualization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto w-full">
              <VisualizationDisplay
                visualization={state.selectedVisualization}
                onConfigChange={(config) => 
                  handleVisualizationConfigChange(state.selectedVisualization!.id, config)
                }
                onExport={(format) => 
                  handleVisualizationExport(state.selectedVisualization!.id, format)
                }
                isFullScreen={true}
                onToggleFullScreen={() => setState(prev => ({ 
                  ...prev, 
                  selectedVisualization: null 
                }))}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Document Analysis Platform
              </h1>
              <p className="text-sm text-gray-600">
                AI-powered insights and visualizations from your documents
              </p>
            </div>
            
            {state.currentSession && (
              <div className="text-sm text-gray-500">
                Session: {state.currentSession.name}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {state.error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{state.error}</p>
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {state.isProcessing && (
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-blue-700">Processing documents...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default DocumentAnalysisApp;
