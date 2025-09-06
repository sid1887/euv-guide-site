// src/services/CoreApplicationService.ts
import { DocumentProcessor, ProcessedDocument } from './DocumentProcessor';
import { KnowledgeGraphBuilder, KnowledgeGraph } from './KnowledgeGraphBuilder';
import { VisualizationEngine, GeneratedVisualization } from './VisualizationEngine';

export interface AnalysisSession {
  id: string;
  name: string;
  documents: ProcessedDocument[];
  knowledgeGraph: KnowledgeGraph;
  visualizations: GeneratedVisualization[];
  createdAt: Date;
  lastModified: Date;
  settings: SessionSettings;
}

export interface SessionSettings {
  autoGenerateVisualizations: boolean;
  includeKnowledgeGraph: boolean;
  complexityLevel: 'basic' | 'intermediate' | 'advanced';
  visualizationPreferences: {
    preferredChartTypes: string[];
    colorScheme: 'default' | 'colorblind' | 'dark' | 'light';
    animationsEnabled: boolean;
  };
  processingOptions: {
    extractImages: boolean;
    analyzeTables: boolean;
    generateSummaries: boolean;
    detectLanguages: boolean;
  };
}

export interface AnalysisResult {
  success: boolean;
  sessionId: string;
  documentsProcessed: number;
  visualizationsGenerated: number;
  knowledgeGraphNodes: number;
  processingTimeMs: number;
  warnings: string[];
  errors: string[];
}

export class CoreApplicationService {
  private documentProcessor: DocumentProcessor;
  private knowledgeGraphBuilder: KnowledgeGraphBuilder;
  private visualizationEngine: VisualizationEngine;
  private sessions: Map<string, AnalysisSession>;
  private backgroundProcessor: BackgroundProcessor;

  constructor() {
    this.documentProcessor = new DocumentProcessor();
    this.knowledgeGraphBuilder = new KnowledgeGraphBuilder();
    this.visualizationEngine = new VisualizationEngine();
    this.sessions = new Map();
    this.backgroundProcessor = new BackgroundProcessor();
    
    console.log('🚀 Core Application Service initialized');
  }

  async createAnalysisSession(name: string, settings?: Partial<SessionSettings>): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultSettings: SessionSettings = {
      autoGenerateVisualizations: true,
      includeKnowledgeGraph: true,
      complexityLevel: 'intermediate',
      visualizationPreferences: {
        preferredChartTypes: ['interactive-chart', 'network-graph', 'timeline'],
        colorScheme: 'default',
        animationsEnabled: true
      },
      processingOptions: {
        extractImages: true,
        analyzeTables: true,
        generateSummaries: true,
        detectLanguages: true
      }
    };

    const session: AnalysisSession = {
      id: sessionId,
      name,
      documents: [],
      knowledgeGraph: {
        nodes: new Map(),
        edges: [],
        topics: new Map(),
        documentMap: new Map()
      },
      visualizations: [],
      createdAt: new Date(),
      lastModified: new Date(),
      settings: { ...defaultSettings, ...settings }
    };

    this.sessions.set(sessionId, session);
    
    console.log(`📁 Created analysis session: ${name} (${sessionId})`);
    return sessionId;
  }

  async processDocuments(
    sessionId: string, 
    files: File[], 
    urls: string[] = []
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const result: AnalysisResult = {
      success: false,
      sessionId,
      documentsProcessed: 0,
      visualizationsGenerated: 0,
      knowledgeGraphNodes: 0,
      processingTimeMs: 0,
      warnings: [],
      errors: []
    };

    try {
      console.log(`🔄 Processing ${files.length} files and ${urls.length} URLs for session: ${session.name}`);

      // Process files
      const filePromises = files.map(async (file) => {
        try {
          const document = await this.documentProcessor.processFile(file);
          session.documents.push(document);
          result.documentsProcessed++;
          
          // Update knowledge graph
          if (session.settings.includeKnowledgeGraph) {
            await this.knowledgeGraphBuilder.processDocument(document);
          }
          
          return document;
        } catch (error) {
          result.errors.push(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
          return null;
        }
      });

      // Process URLs
      const urlPromises = urls.map(async (url) => {
        try {
          const document = await this.documentProcessor.processURL(url);
          session.documents.push(document);
          result.documentsProcessed++;
          
          // Update knowledge graph
          if (session.settings.includeKnowledgeGraph) {
            await this.knowledgeGraphBuilder.processDocument(document);
          }
          
          return document;
        } catch (error) {
          result.errors.push(`Failed to process URL ${url}: ${error instanceof Error ? error.message : String(error)}`);
          return null;
        }
      });

      // Wait for all processing to complete
      const processedFiles = await Promise.all(filePromises);
      const processedUrls = await Promise.all(urlPromises);
      const allDocuments = [...processedFiles, ...processedUrls].filter(doc => doc !== null) as ProcessedDocument[];

      // Generate visualizations if enabled
      if (session.settings.autoGenerateVisualizations && allDocuments.length > 0) {
        await this.generateVisualizationsForSession(session, allDocuments);
      }

      // Update session
      session.lastModified = new Date();
      session.knowledgeGraph = this.knowledgeGraphBuilder.exportGraph() as any;
      
      // Calculate results
      result.success = true;
      result.visualizationsGenerated = session.visualizations.length;
      result.knowledgeGraphNodes = session.knowledgeGraph.nodes.size;
      result.processingTimeMs = Date.now() - startTime;

      console.log(`✅ Processing complete: ${result.documentsProcessed} documents, ${result.visualizationsGenerated} visualizations`);

      // Start background analysis for enhanced insights
      this.backgroundProcessor.startEnhancedAnalysis(session);

      return result;

    } catch (error) {
      result.errors.push(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
      result.processingTimeMs = Date.now() - startTime;
      console.error('❌ Document processing failed:', error);
      return result;
    }
  }

  private async generateVisualizationsForSession(
    session: AnalysisSession, 
    documents: ProcessedDocument[]
  ): Promise<void> {
    console.log(`🎨 Generating visualizations for ${documents.length} documents`);

    const visualizationPromises = documents.map(async (document) => {
      try {
        const visualizations = await this.visualizationEngine.generateVisualizationsForDocument(
          document,
          session.knowledgeGraph
        );
        return visualizations;
      } catch (error) {
        console.warn(`Failed to generate visualizations for ${document.title}:`, error);
        return [];
      }
    });

    const allVisualizations = await Promise.all(visualizationPromises);
    session.visualizations = allVisualizations.flat();

    console.log(`🎨 Generated ${session.visualizations.length} visualizations`);
  }

  getSession(sessionId: string): AnalysisSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): AnalysisSession[] {
    return Array.from(this.sessions.values());
  }

  async updateSessionSettings(sessionId: string, settings: Partial<SessionSettings>): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.settings = { ...session.settings, ...settings };
    session.lastModified = new Date();

    // Re-generate visualizations if preferences changed
    if (settings.visualizationPreferences || settings.autoGenerateVisualizations) {
      await this.regenerateVisualizations(session);
    }

    return true;
  }

  private async regenerateVisualizations(session: AnalysisSession): Promise<void> {
    if (!session.settings.autoGenerateVisualizations) {
      session.visualizations = [];
      return;
    }

    console.log(`🔄 Regenerating visualizations for session: ${session.name}`);
    await this.generateVisualizationsForSession(session, session.documents);
  }

  searchDocuments(sessionId: string, query: string): {
    documents: ProcessedDocument[];
    concepts: any[];
    visualizations: GeneratedVisualization[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { documents: [], concepts: [], visualizations: [] };
    }

    const queryLower = query.toLowerCase();

    // Search documents
    const matchingDocuments = session.documents.filter(doc =>
      doc.title.toLowerCase().includes(queryLower) ||
      doc.content.toLowerCase().includes(queryLower) ||
      doc.metadata.summary.toLowerCase().includes(queryLower) ||
      doc.metadata.keyTerms.some(term => term.toLowerCase().includes(queryLower))
    );

    // Search knowledge graph concepts
    const matchingConcepts = this.knowledgeGraphBuilder.searchConcepts(query, 10);

    // Search visualizations
    const matchingVisualizations = session.visualizations.filter(viz =>
      viz.title.toLowerCase().includes(queryLower) ||
      viz.explanation.toLowerCase().includes(queryLower)
    );

    return {
      documents: matchingDocuments,
      concepts: matchingConcepts,
      visualizations: matchingVisualizations
    };
  }

  async exportSession(sessionId: string, format: 'json' | 'pdf' | 'html'): Promise<Blob> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    switch (format) {
      case 'json':
        return this.exportToJSON(session);
      case 'pdf':
        return this.exportToPDF(session);
      case 'html':
        return this.exportToHTML(session);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToJSON(session: AnalysisSession): Blob {
    const exportData = {
      session: {
        id: session.id,
        name: session.name,
        createdAt: session.createdAt,
        lastModified: session.lastModified,
        settings: session.settings
      },
      documents: session.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        metadata: doc.metadata,
        sections: doc.sections.map(section => ({
          title: section.title,
          type: section.type,
          importance: section.importance
        }))
      })),
      knowledgeGraph: {
        nodeCount: session.knowledgeGraph.nodes.size,
        edgeCount: session.knowledgeGraph.edges.length,
        topics: Array.from(session.knowledgeGraph.topics.keys())
      },
      visualizations: session.visualizations.map(viz => ({
        id: viz.id,
        title: viz.title,
        type: viz.type,
        confidence: viz.confidence,
        explanation: viz.explanation
      }))
    };

    return new Blob(
      [JSON.stringify(exportData, null, 2)], 
      { type: 'application/json' }
    );
  }

  private async exportToPDF(session: AnalysisSession): Promise<Blob> {
    // For now, return a placeholder PDF
    // In production, use a PDF generation library like jsPDF
    const pdfContent = `
      Analysis Report: ${session.name}
      
      Generated on: ${new Date().toISOString()}
      
      Documents Processed: ${session.documents.length}
      Visualizations Generated: ${session.visualizations.length}
      Knowledge Graph Nodes: ${session.knowledgeGraph.nodes.size}
      
      Summary:
      This analysis session processed ${session.documents.length} documents and generated
      ${session.visualizations.length} interactive visualizations with a knowledge graph
      containing ${session.knowledgeGraph.nodes.size} concepts and entities.
    `;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private async exportToHTML(session: AnalysisSession): Promise<Blob> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analysis Report: ${session.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; }
          .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Analysis Report: ${session.name}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h2>Session Statistics</h2>
          <div class="stats">
            <div class="stat-card">
              <h3>${session.documents.length}</h3>
              <p>Documents Processed</p>
            </div>
            <div class="stat-card">
              <h3>${session.visualizations.length}</h3>
              <p>Visualizations Generated</p>
            </div>
            <div class="stat-card">
              <h3>${session.knowledgeGraph.nodes.size}</h3>
              <p>Knowledge Graph Nodes</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Processed Documents</h2>
          ${session.documents.map(doc => `
            <div>
              <h3>${doc.title}</h3>
              <p><strong>Word Count:</strong> ${doc.metadata.wordCount}</p>
              <p><strong>Reading Time:</strong> ${doc.metadata.readingTime} minutes</p>
              <p><strong>Complexity:</strong> ${doc.metadata.complexity}</p>
              <p><strong>Topics:</strong> ${doc.metadata.topics.join(', ')}</p>
              <p><strong>Summary:</strong> ${doc.metadata.summary}</p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    return new Blob([htmlContent], { type: 'text/html' });
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`🗑️ Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  getSessionStats(): {
    totalSessions: number;
    totalDocuments: number;
    totalVisualizations: number;
    averageDocumentsPerSession: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalDocuments = sessions.reduce((sum, session) => sum + session.documents.length, 0);
    const totalVisualizations = sessions.reduce((sum, session) => sum + session.visualizations.length, 0);

    return {
      totalSessions: sessions.length,
      totalDocuments,
      totalVisualizations,
      averageDocumentsPerSession: sessions.length > 0 ? totalDocuments / sessions.length : 0
    };
  }
}

class BackgroundProcessor {
  private processingQueue: AnalysisSession[] = [];
  private isProcessing = false;

  startEnhancedAnalysis(session: AnalysisSession): void {
    this.processingQueue.push(session);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const session = this.processingQueue.shift();
      if (session) {
        await this.performEnhancedAnalysis(session);
      }
    }

    this.isProcessing = false;
  }

  private async performEnhancedAnalysis(session: AnalysisSession): Promise<void> {
    console.log(`🔍 Starting enhanced analysis for session: ${session.name}`);

    try {
      // Analyze document similarity
      await this.analyzeSimilarity(session);

      // Extract cross-document insights
      await this.extractCrossDocumentInsights(session);

      // Generate advanced visualizations
      await this.generateAdvancedVisualizations(session);

      console.log(`✅ Enhanced analysis complete for session: ${session.name}`);
    } catch (error) {
      console.warn(`⚠️ Enhanced analysis failed for session ${session.name}:`, error);
    }
  }

  private async analyzeSimilarity(session: AnalysisSession): Promise<void> {
    // Implementation for document similarity analysis
    console.log(`📊 Analyzing document similarity for ${session.documents.length} documents`);
  }

  private async extractCrossDocumentInsights(session: AnalysisSession): Promise<void> {
    // Implementation for cross-document pattern recognition
    console.log(`🔗 Extracting cross-document insights from ${session.documents.length} documents`);
  }

  private async generateAdvancedVisualizations(session: AnalysisSession): Promise<void> {
    // Implementation for advanced visualization generation
    console.log(`🎨 Generating advanced visualizations for session: ${session.name}`);
  }
}
