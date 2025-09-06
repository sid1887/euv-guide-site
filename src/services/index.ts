// src/services/index.ts
import { DocumentProcessor } from './DocumentProcessor';
import { KnowledgeGraphBuilder } from './KnowledgeGraphBuilder';
import { VisualizationEngine } from './VisualizationEngine';
import { CoreApplicationService } from './CoreApplicationService';
import { BackgroundAIService } from './BackgroundAIService';

export { DocumentProcessor } from './DocumentProcessor';
export type { ProcessedDocument, DocumentSection, VisualizationSuggestion } from './DocumentProcessor';

export { KnowledgeGraphBuilder } from './KnowledgeGraphBuilder';
export type { KnowledgeNode, KnowledgeEdge, KnowledgeGraph } from './KnowledgeGraphBuilder';

export { VisualizationEngine } from './VisualizationEngine';
export type { GeneratedVisualization, VisualizationConfig } from './VisualizationEngine';

export { CoreApplicationService } from './CoreApplicationService';
export type { AnalysisSession, SessionSettings, AnalysisResult } from './CoreApplicationService';

export { BackgroundAIService } from './BackgroundAIService';
export type { AIInsight, ContextualResponse } from './BackgroundAIService';

// Singleton instances for global access
export const coreService = new CoreApplicationService();
export const aiService = BackgroundAIService.getInstance();

// Utility functions for quick access
export const createSession = (name: string) => coreService.createAnalysisSession(name);
export const getAIResponse = (query: string, documents: any[], knowledgeGraph: any) => 
  aiService.getContextualResponse(query, documents, knowledgeGraph);

console.log('🔧 Core Services initialized and ready');
