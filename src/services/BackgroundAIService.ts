// src/services/BackgroundAIService.ts
import { ProcessedDocument } from './DocumentProcessor';
import { KnowledgeGraph } from './KnowledgeGraphBuilder';
import { GeneratedVisualization } from './VisualizationEngine';

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'pattern' | 'anomaly' | 'summary' | 'connection';
  title: string;
  description: string;
  confidence: number;
  relevantDocuments: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface ContextualResponse {
  query: string;
  response: string;
  sources: string[];
  confidence: number;
  followUpQuestions: string[];
}

export class BackgroundAIService {
  private static instance: BackgroundAIService;
  private insights: AIInsight[] = [];
  private contextualKnowledge: Map<string, any> = new Map();
  private processingQueue: ProcessingTask[] = [];
  private isProcessing = false;

  private constructor() {
    console.log('🤖 Background AI Service initialized');
  }

  static getInstance(): BackgroundAIService {
    if (!BackgroundAIService.instance) {
      BackgroundAIService.instance = new BackgroundAIService();
    }
    return BackgroundAIService.instance;
  }

  // Main entry point for document analysis
  async analyzeDocuments(documents: ProcessedDocument[], knowledgeGraph: KnowledgeGraph): Promise<AIInsight[]> {
    console.log(`🔍 AI analyzing ${documents.length} documents`);

    const insights: AIInsight[] = [];

    try {
      // 1. Content Pattern Analysis
      const patternInsights = await this.analyzeContentPatterns(documents);
      insights.push(...patternInsights);

      // 2. Cross-Document Connections
      const connectionInsights = await this.findCrossDocumentConnections(documents, knowledgeGraph);
      insights.push(...connectionInsights);

      // 3. Knowledge Gap Detection
      const gapInsights = await this.detectKnowledgeGaps(documents, knowledgeGraph);
      insights.push(...gapInsights);

      // 4. Visualization Recommendations
      const vizInsights = await this.recommendVisualizations(documents);
      insights.push(...vizInsights);

      // 5. Research Direction Suggestions
      const researchInsights = await this.suggestResearchDirections(documents);
      insights.push(...researchInsights);

      this.insights.push(...insights);
      
      console.log(`✅ Generated ${insights.length} AI insights`);
      return insights;

    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      return [];
    }
  }

  // Contextual AI responses for user queries
  async getContextualResponse(
    query: string, 
    sessionDocuments: ProcessedDocument[],
    knowledgeGraph: KnowledgeGraph
  ): Promise<ContextualResponse> {
    try {
      console.log(`💭 Processing contextual query: "${query}"`);

      // 1. Analyze query intent
      const intent = this.analyzeQueryIntent(query);

      // 2. Find relevant documents and concepts
      const relevantContent = this.findRelevantContent(query, sessionDocuments, knowledgeGraph);

      // 3. Generate contextual response
      const response = await this.generateResponse(query, intent, relevantContent);

      // 4. Suggest follow-up questions
      const followUpQuestions = this.generateFollowUpQuestions(query, intent, relevantContent);

      return {
        query,
        response: response.text,
        sources: response.sources,
        confidence: response.confidence,
        followUpQuestions
      };

    } catch (error) {
      console.error('❌ Contextual response generation failed:', error);
      return {
        query,
        response: "I apologize, but I'm having trouble processing your question at the moment. Please try rephrasing your query.",
        sources: [],
        confidence: 0.1,
        followUpQuestions: []
      };
    }
  }

  private async analyzeContentPatterns(documents: ProcessedDocument[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze document complexity distribution
    const complexityDistribution = this.analyzeComplexityDistribution(documents);
    if (complexityDistribution.hasImbalance) {
      insights.push({
        id: `complexity_${Date.now()}`,
        type: 'pattern',
        title: 'Document Complexity Imbalance Detected',
        description: `Your collection has ${complexityDistribution.advanced} advanced documents but only ${complexityDistribution.basic} basic ones. Consider adding foundational materials for better learning progression.`,
        confidence: 0.8,
        relevantDocuments: complexityDistribution.relevantDocs,
        actionable: true,
        priority: 'medium',
        createdAt: new Date()
      });
    }

    // Analyze topic coverage
    const topicAnalysis = this.analyzeTopicCoverage(documents);
    if (topicAnalysis.hasGaps) {
      insights.push({
        id: `topics_${Date.now()}`,
        type: 'recommendation',
        title: 'Topic Coverage Gaps Identified',
        description: `Your collection covers ${topicAnalysis.coveredTopics.join(', ')} well, but lacks content on ${topicAnalysis.missingTopics.join(', ')}. These gaps might affect comprehensive understanding.`,
        confidence: 0.7,
        relevantDocuments: documents.map(d => d.id),
        actionable: true,
        priority: 'high',
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async findCrossDocumentConnections(
    documents: ProcessedDocument[], 
    knowledgeGraph: KnowledgeGraph
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Find strong conceptual connections between documents
    const connections = this.identifyStrongConnections(documents, knowledgeGraph);
    
    if (connections.length > 0) {
      for (const connection of connections.slice(0, 3)) { // Top 3 connections
        insights.push({
          id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'connection',
          title: `Strong Connection: ${connection.concept}`,
          description: `Found significant overlap in "${connection.concept}" across ${connection.documents.length} documents. This concept appears ${connection.frequency} times and could be a key theme for visualization.`,
          confidence: connection.strength,
          relevantDocuments: connection.documents,
          actionable: true,
          priority: connection.strength > 0.8 ? 'high' : 'medium',
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  private async detectKnowledgeGaps(
    documents: ProcessedDocument[], 
    knowledgeGraph: KnowledgeGraph
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Detect concepts mentioned but not explained
    const orphanConcepts = this.findOrphanConcepts(knowledgeGraph);
    
    if (orphanConcepts.length > 0) {
      insights.push({
        id: `gaps_${Date.now()}`,
        type: 'anomaly',
        title: 'Unexplained Concepts Detected',
        description: `Found ${orphanConcepts.length} concepts (${orphanConcepts.slice(0, 3).join(', ')}) that are mentioned but not defined. Consider adding explanatory content for these terms.`,
        confidence: 0.9,
        relevantDocuments: documents.map(d => d.id),
        actionable: true,
        priority: 'medium',
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async recommendVisualizations(documents: ProcessedDocument[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze data patterns for visualization opportunities
    const vizOpportunities = this.identifyVisualizationOpportunities(documents);

    for (const opportunity of vizOpportunities) {
      insights.push({
        id: `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'recommendation',
        title: `Visualization Opportunity: ${opportunity.type}`,
        description: opportunity.description,
        confidence: opportunity.confidence,
        relevantDocuments: opportunity.documents,
        actionable: true,
        priority: opportunity.confidence > 0.7 ? 'high' : 'medium',
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async suggestResearchDirections(documents: ProcessedDocument[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze content to suggest research directions
    const directions = this.analyzeResearchDirections(documents);

    for (const direction of directions) {
      insights.push({
        id: `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'recommendation',
        title: `Research Direction: ${direction.topic}`,
        description: direction.suggestion,
        confidence: direction.confidence,
        relevantDocuments: direction.relatedDocs,
        actionable: true,
        priority: 'low',
        createdAt: new Date()
      });
    }

    return insights;
  }

  private analyzeQueryIntent(query: string): QueryIntent {
    const queryLower = query.toLowerCase();

    // Define intent patterns
    const intentPatterns = {
      explanation: ['what is', 'explain', 'define', 'how does', 'what does'],
      comparison: ['compare', 'difference', 'versus', 'vs', 'better than'],
      process: ['how to', 'step by step', 'process', 'procedure', 'method'],
      search: ['find', 'search', 'locate', 'show me', 'where is'],
      analysis: ['analyze', 'evaluate', 'assess', 'examine'],
      summary: ['summarize', 'overview', 'summary', 'brief']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => queryLower.includes(pattern))) {
        return {
          type: intent as any,
          confidence: 0.8,
          keywords: this.extractKeywords(query)
        };
      }
    }

    return {
      type: 'general',
      confidence: 0.6,
      keywords: this.extractKeywords(query)
    };
  }

  private findRelevantContent(
    query: string, 
    documents: ProcessedDocument[], 
    knowledgeGraph: KnowledgeGraph
  ): RelevantContent {
    const queryLower = query.toLowerCase();
    const relevantDocs: ProcessedDocument[] = [];
    const relevantConcepts: any[] = [];

    // Find relevant documents
    for (const doc of documents) {
      let relevanceScore = 0;

      // Check title
      if (doc.title.toLowerCase().includes(queryLower)) {
        relevanceScore += 10;
      }

      // Check content
      if (doc.content.toLowerCase().includes(queryLower)) {
        relevanceScore += 5;
      }

      // Check metadata
      if (doc.metadata.keyTerms.some(term => queryLower.includes(term))) {
        relevanceScore += 8;
      }

      if (relevanceScore > 5) {
        relevantDocs.push(doc);
      }
    }

    // Find relevant concepts from knowledge graph
    for (const [nodeId, node] of knowledgeGraph.nodes) {
      if (node.label.toLowerCase().includes(queryLower)) {
        relevantConcepts.push(node);
      }
    }

    return {
      documents: relevantDocs.slice(0, 5), // Top 5 most relevant
      concepts: relevantConcepts.slice(0, 10), // Top 10 concepts
      totalRelevance: relevantDocs.length + relevantConcepts.length
    };
  }

  private async generateResponse(
    query: string, 
    intent: QueryIntent, 
    content: RelevantContent
  ): Promise<{ text: string; sources: string[]; confidence: number }> {
    if (content.totalRelevance === 0) {
      return {
        text: "I don't have specific information about that topic in the analyzed documents. Try asking about concepts or topics that appear in your document collection.",
        sources: [],
        confidence: 0.2
      };
    }

    // Generate contextual response based on intent and content
    let response = '';
    const sources: string[] = [];

    switch (intent.type) {
      case 'explanation':
        response = this.generateExplanation(intent.keywords, content);
        break;
      case 'comparison':
        response = this.generateComparison(intent.keywords, content);
        break;
      case 'summary':
        response = this.generateSummary(content);
        break;
      default:
        response = this.generateGeneralResponse(query, content);
    }

    // Add sources
    for (const doc of content.documents) {
      sources.push(doc.title);
    }

    return {
      text: response,
      sources: sources.slice(0, 3), // Top 3 sources
      confidence: Math.min(0.9, 0.4 + (content.totalRelevance * 0.1))
    };
  }

  private generateExplanation(keywords: string[], content: RelevantContent): string {
    if (content.documents.length === 0) {
      return "I don't have sufficient information to explain this concept based on your documents.";
    }

    const relevantDoc = content.documents[0];
    const explanation = relevantDoc.metadata.summary;
    
    return `Based on the analyzed documents, particularly "${relevantDoc.title}": ${explanation}`;
  }

  private generateComparison(keywords: string[], content: RelevantContent): string {
    if (content.documents.length < 2) {
      return "I need at least two documents or concepts to make a meaningful comparison.";
    }

    const doc1 = content.documents[0];
    const doc2 = content.documents[1];

    return `Comparing information from "${doc1.title}" and "${doc2.title}": Both documents share common themes around ${doc1.metadata.topics.join(', ')}, but differ in their approach and complexity levels.`;
  }

  private generateSummary(content: RelevantContent): string {
    if (content.documents.length === 0) {
      return "No relevant documents found for summarization.";
    }

    const keyTopics = new Set<string>();
    for (const doc of content.documents) {
      doc.metadata.topics.forEach(topic => keyTopics.add(topic));
    }

    return `Summary of ${content.documents.length} relevant documents: The main topics covered include ${Array.from(keyTopics).join(', ')}. These documents collectively provide insights into the queried concepts with varying levels of detail and perspective.`;
  }

  private generateGeneralResponse(query: string, content: RelevantContent): string {
    if (content.documents.length === 0) {
      return "I couldn't find specific information about your query in the analyzed documents. Try asking about topics that appear in your document collection.";
    }

    const doc = content.documents[0];
    return `Based on "${doc.title}" and related documents, I found relevant information. The document discusses ${doc.metadata.topics.join(', ')} and provides insights that may answer your question.`;
  }

  private generateFollowUpQuestions(query: string, intent: QueryIntent, content: RelevantContent): string[] {
    const questions: string[] = [];

    if (content.documents.length > 0) {
      const doc = content.documents[0];
      
      questions.push(
        `Can you explain more about ${doc.metadata.keyTerms[0]}?`,
        `How does this relate to ${doc.metadata.topics[0]}?`,
        `What are the practical applications?`
      );
    }

    if (content.concepts.length > 0) {
      const concept = content.concepts[0];
      questions.push(`Tell me more about ${concept.label}`);
    }

    return questions.slice(0, 3);
  }

  // Helper methods for analysis
  private analyzeComplexityDistribution(documents: ProcessedDocument[]) {
    const distribution = { basic: 0, intermediate: 0, advanced: 0 };
    const relevantDocs: string[] = [];

    for (const doc of documents) {
      distribution[doc.metadata.complexity]++;
      relevantDocs.push(doc.id);
    }

    return {
      ...distribution,
      hasImbalance: Math.abs(distribution.advanced - distribution.basic) > 2,
      relevantDocs
    };
  }

  private analyzeTopicCoverage(documents: ProcessedDocument[]) {
    const allTopics = new Set<string>();
    for (const doc of documents) {
      doc.metadata.topics.forEach(topic => allTopics.add(topic));
    }

    const coveredTopics = Array.from(allTopics);
    const missingTopics = ['Fundamentals', 'Applications', 'Future Trends'].filter(
      topic => !coveredTopics.includes(topic)
    );

    return {
      coveredTopics,
      missingTopics,
      hasGaps: missingTopics.length > 0
    };
  }

  private identifyStrongConnections(documents: ProcessedDocument[], knowledgeGraph: KnowledgeGraph) {
    const conceptFreq: { [key: string]: { freq: number; docs: string[] } } = {};

    // Count concept frequency across documents
    for (const doc of documents) {
      for (const term of doc.metadata.keyTerms) {
        if (!conceptFreq[term]) {
          conceptFreq[term] = { freq: 0, docs: [] };
        }
        conceptFreq[term].freq++;
        conceptFreq[term].docs.push(doc.id);
      }
    }

    return Object.entries(conceptFreq)
      .filter(([, data]) => data.freq > 1 && data.docs.length > 1)
      .map(([concept, data]) => ({
        concept,
        frequency: data.freq,
        documents: data.docs,
        strength: Math.min(0.9, data.freq / documents.length)
      }))
      .sort((a, b) => b.strength - a.strength);
  }

  private findOrphanConcepts(knowledgeGraph: KnowledgeGraph): string[] {
    const orphans: string[] = [];
    
    for (const [nodeId, node] of knowledgeGraph.nodes) {
      if (node.type === 'concept' && node.properties.connections === 0) {
        orphans.push(node.label);
      }
    }
    
    return orphans;
  }

  private identifyVisualizationOpportunities(documents: ProcessedDocument[]) {
    const opportunities: VisualizationOpportunity[] = [];

    // Check for numerical data
    const hasNumericalData = documents.some(doc => 
      doc.content.match(/\d+\.?\d*/g)?.length! > 10
    );

    if (hasNumericalData) {
      opportunities.push({
        type: 'Data Visualization',
        description: 'Detected numerical data that could be visualized as interactive charts or graphs',
        confidence: 0.8,
        documents: documents.filter(doc => doc.content.match(/\d+\.?\d*/g)?.length! > 10).map(d => d.id)
      });
    }

    // Check for process descriptions
    const hasProcesses = documents.some(doc => 
      ['step', 'process', 'procedure', 'method'].some(word => 
        doc.content.toLowerCase().includes(word)
      )
    );

    if (hasProcesses) {
      opportunities.push({
        type: 'Process Flow',
        description: 'Found process descriptions that could be visualized as flowcharts or workflows',
        confidence: 0.7,
        documents: documents.map(d => d.id)
      });
    }

    return opportunities;
  }

  private analyzeResearchDirections(documents: ProcessedDocument[]) {
    const directions: ResearchDirection[] = [];

    // Analyze gaps and suggest research directions
    const commonTopics = this.findCommonTopics(documents);
    
    for (const topic of commonTopics.slice(0, 3)) {
      directions.push({
        topic,
        suggestion: `Consider exploring advanced applications of ${topic} or investigating recent developments in this area.`,
        confidence: 0.6,
        relatedDocs: documents.filter(doc => doc.metadata.topics.includes(topic)).map(d => d.id)
      });
    }

    return directions;
  }

  private findCommonTopics(documents: ProcessedDocument[]): string[] {
    const topicCount: { [key: string]: number } = {};
    
    for (const doc of documents) {
      for (const topic of doc.metadata.topics) {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      }
    }

    return Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);
  }

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['what', 'how', 'when', 'where', 'why', 'does', 'this', 'that'].includes(word));
  }

  // Public methods for accessing insights
  getInsights(): AIInsight[] {
    return this.insights.sort((a, b) => b.confidence - a.confidence);
  }

  getHighPriorityInsights(): AIInsight[] {
    return this.insights.filter(insight => insight.priority === 'high');
  }

  clearInsights(): void {
    this.insights = [];
  }
}

// Supporting interfaces
interface QueryIntent {
  type: 'explanation' | 'comparison' | 'process' | 'search' | 'analysis' | 'summary' | 'general';
  confidence: number;
  keywords: string[];
}

interface RelevantContent {
  documents: ProcessedDocument[];
  concepts: any[];
  totalRelevance: number;
}

interface VisualizationOpportunity {
  type: string;
  description: string;
  confidence: number;
  documents: string[];
}

interface ResearchDirection {
  topic: string;
  suggestion: string;
  confidence: number;
  relatedDocs: string[];
}

interface ProcessingTask {
  id: string;
  type: 'analysis' | 'response' | 'insight';
  data: any;
  priority: number;
}
