// src/services/VisualizationEngine.ts
import * as tf from '@tensorflow/tfjs';
import { ProcessedDocument, DocumentSection, VisualizationSuggestion } from './DocumentProcessor';
import { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from './KnowledgeGraphBuilder';

export interface GeneratedVisualization {
  id: string;
  title: string;
  type: 'interactive-chart' | 'network-graph' | 'timeline' | 'concept-map' | 'flowchart' | 'heatmap' | '3d-scatter';
  data: any;
  config: VisualizationConfig;
  interactiveFunctions: string[];
  explanation: string;
  confidence: number;
}

export interface VisualizationConfig {
  dimensions: { width: number; height: number };
  colors: string[];
  animations: boolean;
  responsive: boolean;
  accessibility: {
    altText: string;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };
}

export class VisualizationEngine {
  private mlModel: tf.LayersModel | null = null;
  private chartTemplates: Map<string, ChartTemplate> = new Map();

  constructor() {
    this.initializeMLModel();
    this.initializeChartTemplates();
  }

  private async initializeMLModel(): Promise<void> {
    try {
      // Create a simple classification model for visualization recommendation
      this.mlModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 7, activation: 'softmax' }) // 7 visualization types
        ]
      });

      // Compile the model
      this.mlModel.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
    } catch (error) {
      console.warn('Failed to initialize ML model for visualization recommendation:', error);
    }
  }

  private initializeChartTemplates(): void {
    this.chartTemplates = new Map();

    // Interactive Chart Template
    this.chartTemplates.set('interactive-chart', {
      name: 'Interactive Chart',
      supportedDataTypes: ['numerical', 'temporal', 'categorical'],
      requiredFields: ['x', 'y'],
      optionalFields: ['z', 'color', 'size'],
      template: this.generateInteractiveChartConfig
    });

    // Network Graph Template
    this.chartTemplates.set('network-graph', {
      name: 'Network Graph',
      supportedDataTypes: ['relational', 'hierarchical'],
      requiredFields: ['nodes', 'edges'],
      optionalFields: ['categories', 'weights'],
      template: this.generateNetworkGraphConfig
    });

    // Timeline Template
    this.chartTemplates.set('timeline', {
      name: 'Timeline',
      supportedDataTypes: ['temporal', 'sequential'],
      requiredFields: ['date', 'event'],
      optionalFields: ['category', 'importance'],
      template: this.generateTimelineConfig
    });

    // Concept Map Template
    this.chartTemplates.set('concept-map', {
      name: 'Concept Map',
      supportedDataTypes: ['conceptual', 'relational'],
      requiredFields: ['concepts', 'relationships'],
      optionalFields: ['importance', 'categories'],
      template: this.generateConceptMapConfig
    });
  }

  async generateVisualizationsForDocument(
    document: ProcessedDocument,
    knowledgeGraph?: KnowledgeGraph
  ): Promise<GeneratedVisualization[]> {
    console.log(`Generating visualizations for: ${document.title}`);

    const visualizations: GeneratedVisualization[] = [];

    // 1. Analyze document content for visualization opportunities
    const dataAnalysis = this.analyzeDocumentData(document);

    // 2. Generate visualizations based on suggestions
    for (const suggestion of document.visualizations) {
      const visualization = await this.createVisualizationFromSuggestion(
        suggestion, 
        document, 
        dataAnalysis
      );
      if (visualization) {
        visualizations.push(visualization);
      }
    }

    // 3. Generate knowledge graph visualizations if available
    if (knowledgeGraph) {
      const knowledgeViz = await this.generateKnowledgeGraphVisualization(
        document, 
        knowledgeGraph
      );
      if (knowledgeViz) {
        visualizations.push(knowledgeViz);
      }
    }

    // 4. Generate document structure visualization
    const structureViz = this.generateDocumentStructureVisualization(document);
    visualizations.push(structureViz);

    // 5. Generate topic distribution visualization
    const topicViz = this.generateTopicDistributionVisualization(document);
    visualizations.push(topicViz);

    console.log(`Generated ${visualizations.length} visualizations`);
    return visualizations;
  }

  private analyzeDocumentData(document: ProcessedDocument): DocumentDataAnalysis {
    const content = document.content;
    
    // Extract numerical data
    const numbers = content.match(/\d+\.?\d*/g)?.map(Number) || [];
    const percentages = content.match(/\d+\.?\d*%/g) || [];
    const dates = this.extractDates(content);
    
    // Extract tables and lists
    const tables = this.extractTables(content);
    const lists = this.extractLists(content);
    
    // Analyze text patterns
    const comparisons = this.findComparisons(content);
    const processes = this.findProcesses(content);
    const hierarchies = this.findHierarchies(content);

    return {
      numerical: { values: numbers, count: numbers.length },
      temporal: { dates, count: dates.length },
      categorical: { lists, count: lists.length },
      tabular: { tables, count: tables.length },
      patterns: { comparisons, processes, hierarchies },
      complexity: document.metadata.complexity
    };
  }

  private async createVisualizationFromSuggestion(
    suggestion: VisualizationSuggestion,
    document: ProcessedDocument,
    dataAnalysis: DocumentDataAnalysis
  ): Promise<GeneratedVisualization | null> {
    const template = this.chartTemplates.get(suggestion.type);
    if (!template) return null;

    try {
      const config = template.template(suggestion.data, dataAnalysis);
      
      return {
        id: `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: suggestion.title,
        type: suggestion.type as any,
        data: suggestion.data,
        config,
        interactiveFunctions: this.getInteractiveFunctions(suggestion.type),
        explanation: suggestion.description,
        confidence: suggestion.confidence
      };
    } catch (error) {
      console.warn(`Failed to create visualization from suggestion:`, error);
      return null;
    }
  }

  private generateInteractiveChartConfig(data: any, analysis: DocumentDataAnalysis): VisualizationConfig {
    return {
      dimensions: { width: 800, height: 600 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      animations: true,
      responsive: true,
      accessibility: {
        altText: 'Interactive chart showing data relationships and trends',
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    };
  }

  private generateNetworkGraphConfig(data: any, analysis: DocumentDataAnalysis): VisualizationConfig {
    return {
      dimensions: { width: 1000, height: 800 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#667eea'],
      animations: true,
      responsive: true,
      accessibility: {
        altText: 'Network graph showing relationships between concepts and entities',
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    };
  }

  private generateTimelineConfig(data: any, analysis: DocumentDataAnalysis): VisualizationConfig {
    return {
      dimensions: { width: 1200, height: 400 },
      colors: ['#667eea', '#764ba2', '#f093fb'],
      animations: true,
      responsive: true,
      accessibility: {
        altText: 'Timeline visualization showing chronological progression of events',
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    };
  }

  private generateConceptMapConfig(data: any, analysis: DocumentDataAnalysis): VisualizationConfig {
    return {
      dimensions: { width: 900, height: 700 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      animations: true,
      responsive: true,
      accessibility: {
        altText: 'Concept map showing relationships between key ideas and topics',
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    };
  }

  private async generateKnowledgeGraphVisualization(
    document: ProcessedDocument,
    knowledgeGraph: KnowledgeGraph
  ): Promise<GeneratedVisualization> {
    // Get document-related nodes from knowledge graph
    const documentNodes = knowledgeGraph.documentMap.get(document.id) || [];
    const subGraph = this.extractSubGraph(knowledgeGraph, documentNodes);

    const graphData = {
      nodes: subGraph.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        size: Math.max(10, node.properties.importance * 30),
        color: this.getNodeColor(node.type)
      })),
      edges: subGraph.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        weight: edge.weight,
        color: this.getEdgeColor(edge.type)
      }))
    };

    return {
      id: `knowledge_graph_${document.id}`,
      title: `Knowledge Graph - ${document.title}`,
      type: 'network-graph',
      data: graphData,
      config: this.generateNetworkGraphConfig(graphData, {} as any),
      interactiveFunctions: ['zoom', 'pan', 'hover', 'click', 'filter'],
      explanation: 'Interactive knowledge graph showing concepts, entities, and their relationships extracted from the document',
      confidence: 0.9
    };
  }

  private generateDocumentStructureVisualization(document: ProcessedDocument): GeneratedVisualization {
    const structureData = {
      nodes: [
        {
          id: document.id,
          label: document.title,
          type: 'document',
          size: 40,
          color: '#667eea'
        },
        ...document.sections.map(section => ({
          id: section.id,
          label: section.title,
          type: section.type,
          size: Math.max(15, section.importance * 25),
          color: this.getSectionColor(section.type)
        }))
      ],
      edges: document.sections.map(section => ({
        source: document.id,
        target: section.id,
        type: 'contains',
        weight: section.importance
      }))
    };

    return {
      id: `structure_${document.id}`,
      title: `Document Structure - ${document.title}`,
      type: 'network-graph',
      data: structureData,
      config: {
        dimensions: { width: 800, height: 600 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
        animations: true,
        responsive: true,
        accessibility: {
          altText: 'Document structure visualization showing sections and their relationships',
          keyboardNavigation: true,
          screenReaderSupport: true
        }
      },
      interactiveFunctions: ['zoom', 'pan', 'hover', 'click'],
      explanation: 'Hierarchical visualization of document structure showing sections and their relative importance',
      confidence: 1.0
    };
  }

  private generateTopicDistributionVisualization(document: ProcessedDocument): GeneratedVisualization {
    const topicData = {
      labels: document.metadata.topics,
      values: document.metadata.topics.map(() => Math.random() * 100), // Placeholder - would be calculated from actual topic analysis
      type: 'pie'
    };

    return {
      id: `topics_${document.id}`,
      title: `Topic Distribution - ${document.title}`,
      type: 'interactive-chart',
      data: topicData,
      config: {
        dimensions: { width: 600, height: 400 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        animations: true,
        responsive: true,
        accessibility: {
          altText: 'Pie chart showing distribution of topics within the document',
          keyboardNavigation: true,
          screenReaderSupport: true
        }
      },
      interactiveFunctions: ['hover', 'click', 'legend'],
      explanation: 'Distribution of main topics identified in the document',
      confidence: 0.8
    };
  }

  private extractSubGraph(knowledgeGraph: KnowledgeGraph, nodeIds: string[]): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  } {
    const nodes = nodeIds
      .map(id => knowledgeGraph.nodes.get(id))
      .filter(node => node !== undefined) as KnowledgeNode[];

    const edges = knowledgeGraph.edges.filter(edge =>
      nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );

    return { nodes, edges };
  }

  private extractDates(content: string): string[] {
    const datePatterns = [
      /\b\d{4}\b/g, // Years
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g, // MM-DD-YYYY
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi
    ];

    const dates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = content.match(pattern) || [];
      dates.push(...matches);
    }

    return [...new Set(dates)]; // Remove duplicates
  }

  private extractTables(content: string): any[] {
    // Simple table detection - look for structured data patterns
    const tablePattern = /(\|[^|\n]+)+\|/g;
    const matches = content.match(tablePattern) || [];
    
    return matches.map((match, index) => ({
      id: `table_${index}`,
      content: match,
      rows: match.split('\n').length
    }));
  }

  private extractLists(content: string): string[] {
    const listPatterns = [
      /^\s*[-*•]\s+(.+)$/gm, // Bullet points
      /^\s*\d+\.\s+(.+)$/gm, // Numbered lists
    ];

    const lists: string[] = [];
    for (const pattern of listPatterns) {
      const matches = Array.from(content.matchAll(pattern));
      lists.push(...matches.map(match => match[1]));
    }

    return lists;
  }

  private findComparisons(content: string): string[] {
    const comparisonWords = ['versus', 'compared to', 'better than', 'worse than', 'similar to', 'different from'];
    const comparisons: string[] = [];

    for (const word of comparisonWords) {
      const regex = new RegExp(`[^.!?]*${word}[^.!?]*[.!?]`, 'gi');
      const matches = content.match(regex) || [];
      comparisons.push(...matches);
    }

    return comparisons;
  }

  private findProcesses(content: string): string[] {
    const processWords = ['step', 'process', 'procedure', 'method', 'algorithm', 'workflow'];
    const processes: string[] = [];

    for (const word of processWords) {
      const regex = new RegExp(`[^.!?]*\\b${word}\\b[^.!?]*[.!?]`, 'gi');
      const matches = content.match(regex) || [];
      processes.push(...matches);
    }

    return processes;
  }

  private findHierarchies(content: string): string[] {
    const hierarchyWords = ['category', 'type', 'class', 'level', 'tier', 'rank'];
    const hierarchies: string[] = [];

    for (const word of hierarchyWords) {
      const regex = new RegExp(`[^.!?]*\\b${word}\\b[^.!?]*[.!?]`, 'gi');
      const matches = content.match(regex) || [];
      hierarchies.push(...matches);
    }

    return hierarchies;
  }

  private getInteractiveFunctions(type: string): string[] {
    const functionMap: { [key: string]: string[] } = {
      'interactive-chart': ['zoom', 'pan', 'hover', 'click', 'brush', 'filter'],
      'network-graph': ['zoom', 'pan', 'hover', 'click', 'drag', 'filter'],
      'timeline': ['zoom', 'pan', 'hover', 'click', 'scrub'],
      'concept-map': ['zoom', 'pan', 'hover', 'click', 'expand', 'collapse'],
      'flowchart': ['hover', 'click', 'navigate'],
      'heatmap': ['hover', 'click', 'zoom'],
      '3d-scatter': ['rotate', 'zoom', 'hover', 'click']
    };

    return functionMap[type] || ['hover', 'click'];
  }

  private getNodeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'concept': '#667eea',
      'entity': '#764ba2',
      'document': '#f093fb',
      'section': '#f5576c'
    };
    return colorMap[type] || '#4facfe';
  }

  private getEdgeColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'related_to': '#999',
      'part_of': '#667eea',
      'mentions': '#764ba2',
      'defines': '#f093fb',
      'contradicts': '#f5576c'
    };
    return colorMap[type] || '#ccc';
  }

  private getSectionColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'introduction': '#667eea',
      'methodology': '#764ba2',
      'results': '#f093fb',
      'conclusion': '#f5576c',
      'reference': '#4facfe',
      'figure': '#00f2fe',
      'table': '#f093fb'
    };
    return colorMap[type] || '#667eea';
  }
}

interface ChartTemplate {
  name: string;
  supportedDataTypes: string[];
  requiredFields: string[];
  optionalFields: string[];
  template: (data: any, analysis: DocumentDataAnalysis) => VisualizationConfig;
}

interface DocumentDataAnalysis {
  numerical: { values: number[]; count: number };
  temporal: { dates: string[]; count: number };
  categorical: { lists: string[]; count: number };
  tabular: { tables: any[]; count: number };
  patterns: {
    comparisons: string[];
    processes: string[];
    hierarchies: string[];
  };
  complexity: 'basic' | 'intermediate' | 'advanced';
}
