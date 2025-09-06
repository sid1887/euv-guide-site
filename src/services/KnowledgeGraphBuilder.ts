// src/services/KnowledgeGraphBuilder.ts
import * as tf from '@tensorflow/tfjs';
import { ProcessedDocument, DocumentSection } from './DocumentProcessor';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'document' | 'section';
  properties: {
    description?: string;
    importance: number;
    frequency: number;
    connections: number;
    documentIds: string[];
  };
  embeddings: number[];
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  type: 'related_to' | 'part_of' | 'mentions' | 'defines' | 'contradicts';
  weight: number;
  properties: {
    confidence: number;
    context: string;
    documentId: string;
  };
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  topics: Map<string, string[]>; // topic -> node ids
  documentMap: Map<string, string[]>; // document id -> node ids
}

export class KnowledgeGraphBuilder {
  private graph: KnowledgeGraph;
  private conceptExtractor: ConceptExtractor;
  private relationshipAnalyzer: RelationshipAnalyzer;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: [],
      topics: new Map(),
      documentMap: new Map()
    };
    this.conceptExtractor = new ConceptExtractor();
    this.relationshipAnalyzer = new RelationshipAnalyzer();
  }

  async processDocument(document: ProcessedDocument): Promise<void> {
    console.log(`Building knowledge graph for: ${document.title}`);

    // Extract concepts and entities
    const concepts = await this.conceptExtractor.extractConcepts(document);
    const entities = await this.conceptExtractor.extractEntities(document);

    // Create document node
    const docNode: KnowledgeNode = {
      id: document.id,
      label: document.title,
      type: 'document',
      properties: {
        description: document.metadata.summary,
        importance: 1.0,
        frequency: 1,
        connections: 0,
        documentIds: [document.id]
      },
      embeddings: document.embeddings
    };
    this.graph.nodes.set(document.id, docNode);

    // Process concepts
    for (const concept of concepts) {
      await this.addOrUpdateNode(concept, document.id);
    }

    // Process entities
    for (const entity of entities) {
      await this.addOrUpdateNode(entity, document.id);
    }

    // Create section nodes and relationships
    for (const section of document.sections) {
      await this.processSectionNode(section, document.id);
    }

    // Analyze relationships between concepts
    await this.relationshipAnalyzer.analyzeRelationships(
      document, 
      concepts, 
      entities, 
      this.graph
    );

    // Update topic mappings
    this.updateTopicMappings(document);

    // Update document mapping
    const nodeIds = Array.from(this.graph.nodes.keys()).filter(id => 
      this.graph.nodes.get(id)?.properties.documentIds.includes(document.id)
    );
    this.graph.documentMap.set(document.id, nodeIds);

    console.log(`Knowledge graph updated. Nodes: ${this.graph.nodes.size}, Edges: ${this.graph.edges.length}`);
  }

  private async addOrUpdateNode(concept: ExtractedConcept, documentId: string): Promise<void> {
    const existingNode = this.graph.nodes.get(concept.id);

    if (existingNode) {
      // Update existing node
      existingNode.properties.frequency += concept.frequency;
      existingNode.properties.importance = Math.max(
        existingNode.properties.importance, 
        concept.importance
      );
      if (!existingNode.properties.documentIds.includes(documentId)) {
        existingNode.properties.documentIds.push(documentId);
      }
    } else {
      // Create new node
      const newNode: KnowledgeNode = {
        id: concept.id,
        label: concept.label,
        type: concept.type,
        properties: {
          description: concept.description,
          importance: concept.importance,
          frequency: concept.frequency,
          connections: 0,
          documentIds: [documentId]
        },
        embeddings: concept.embeddings
      };
      this.graph.nodes.set(concept.id, newNode);
    }
  }

  private async processSectionNode(section: DocumentSection, documentId: string): Promise<void> {
    const sectionNode: KnowledgeNode = {
      id: `${documentId}_${section.id}`,
      label: section.title,
      type: 'section',
      properties: {
        description: section.content.substring(0, 200) + '...',
        importance: section.importance,
        frequency: 1,
        connections: 0,
        documentIds: [documentId]
      },
      embeddings: section.embeddings
    };

    this.graph.nodes.set(sectionNode.id, sectionNode);

    // Create edge from document to section
    this.graph.edges.push({
      source: documentId,
      target: sectionNode.id,
      type: 'part_of',
      weight: 1.0,
      properties: {
        confidence: 1.0,
        context: 'Document structure',
        documentId
      }
    });
  }

  private updateTopicMappings(document: ProcessedDocument): void {
    for (const topic of document.metadata.topics) {
      const existingNodes = this.graph.topics.get(topic) || [];
      if (!existingNodes.includes(document.id)) {
        existingNodes.push(document.id);
        this.graph.topics.set(topic, existingNodes);
      }
    }
  }

  getRelatedDocuments(documentId: string, limit: number = 5): ProcessedDocument[] {
    // Find documents with similar embeddings or shared concepts
    const targetDoc = this.graph.nodes.get(documentId);
    if (!targetDoc) return [];

    const similarities: { docId: string; score: number }[] = [];

    for (const [nodeId, node] of this.graph.nodes) {
      if (node.type === 'document' && nodeId !== documentId) {
        const similarity = this.calculateCosineSimilarity(
          targetDoc.embeddings, 
          node.embeddings
        );
        similarities.push({ docId: nodeId, score: similarity });
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.docId) as any; // Return document IDs for now
  }

  getConceptNetwork(conceptId: string, depth: number = 2): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  } {
    const visitedNodes = new Set<string>();
    const resultNodes: KnowledgeNode[] = [];
    const resultEdges: KnowledgeEdge[] = [];

    const traverse = (nodeId: string, currentDepth: number) => {
      if (currentDepth > depth || visitedNodes.has(nodeId)) return;

      visitedNodes.add(nodeId);
      const node = this.graph.nodes.get(nodeId);
      if (node) {
        resultNodes.push(node);

        // Find connected edges
        const connectedEdges = this.graph.edges.filter(
          edge => edge.source === nodeId || edge.target === nodeId
        );

        for (const edge of connectedEdges) {
          if (!resultEdges.find(e => 
            (e.source === edge.source && e.target === edge.target) ||
            (e.source === edge.target && e.target === edge.source)
          )) {
            resultEdges.push(edge);
            
            // Traverse connected nodes
            const nextNodeId = edge.source === nodeId ? edge.target : edge.source;
            traverse(nextNodeId, currentDepth + 1);
          }
        }
      }
    };

    traverse(conceptId, 0);

    return { nodes: resultNodes, edges: resultEdges };
  }

  searchConcepts(query: string, limit: number = 10): KnowledgeNode[] {
    const queryLower = query.toLowerCase();
    const results: { node: KnowledgeNode; score: number }[] = [];

    for (const [, node] of this.graph.nodes) {
      let score = 0;

      // Exact match in label
      if (node.label.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Match in description
      if (node.properties.description?.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      // Importance boost
      score *= node.properties.importance;

      if (score > 0) {
        results.push({ node, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.node);
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  exportGraph(): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    stats: {
      totalNodes: number;
      totalEdges: number;
      topicCount: number;
      documentCount: number;
    };
  } {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: this.graph.edges,
      stats: {
        totalNodes: this.graph.nodes.size,
        totalEdges: this.graph.edges.length,
        topicCount: this.graph.topics.size,
        documentCount: this.graph.documentMap.size
      }
    };
  }
}

interface ExtractedConcept {
  id: string;
  label: string;
  type: 'concept' | 'entity';
  description?: string;
  importance: number;
  frequency: number;
  embeddings: number[];
}

class ConceptExtractor {
  async extractConcepts(document: ProcessedDocument): Promise<ExtractedConcept[]> {
    const concepts: ExtractedConcept[] = [];

    // Extract from key terms
    for (const term of document.metadata.keyTerms) {
      concepts.push({
        id: `concept_${term}`,
        label: term,
        type: 'concept',
        description: `Key concept extracted from ${document.title}`,
        importance: 0.7,
        frequency: 1,
        embeddings: this.generateConceptEmbedding(term)
      });
    }

    // Extract technical terms using patterns
    const technicalPatterns = [
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w*(?:tion|sion|ment|ness|ity|ism)\b/g, // Abstract nouns
      /\b(?:method|algorithm|approach|technique|system|model|framework)\w*\b/gi
    ];

    for (const pattern of technicalPatterns) {
      const matches = document.content.match(pattern) || [];
      for (const match of matches.slice(0, 20)) { // Limit to avoid too many concepts
        const conceptId = `concept_${match.toLowerCase()}`;
        if (!concepts.find(c => c.id === conceptId)) {
          concepts.push({
            id: conceptId,
            label: match,
            type: 'concept',
            importance: 0.6,
            frequency: 1,
            embeddings: this.generateConceptEmbedding(match)
          });
        }
      }
    }

    return concepts;
  }

  async extractEntities(document: ProcessedDocument): Promise<ExtractedConcept[]> {
    const entities: ExtractedConcept[] = [];

    // Extract named entities using patterns
    const entityPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Person names
      /\b[A-Z][A-Za-z]+ (?:Inc|Corp|Ltd|LLC|University|Institute|Laboratory)\b/g, // Organizations
      /\b(?:Figure|Table|Equation|Chapter|Section) \d+/g, // References
    ];

    for (const pattern of entityPatterns) {
      const matches = document.content.match(pattern) || [];
      for (const match of matches.slice(0, 15)) {
        const entityId = `entity_${match.toLowerCase().replace(/\s+/g, '_')}`;
        if (!entities.find(e => e.id === entityId)) {
          entities.push({
            id: entityId,
            label: match,
            type: 'entity',
            importance: 0.8,
            frequency: 1,
            embeddings: this.generateConceptEmbedding(match)
          });
        }
      }
    }

    return entities;
  }

  private generateConceptEmbedding(concept: string): number[] {
    // Simple hash-based embedding for concepts
    const hash = this.simpleHash(concept);
    return Array.from({ length: 64 }, (_, i) => 
      Math.sin(hash * (i + 1)) * Math.cos(hash / (i + 2))
    );
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

class RelationshipAnalyzer {
  async analyzeRelationships(
    document: ProcessedDocument,
    concepts: ExtractedConcept[],
    entities: ExtractedConcept[],
    graph: KnowledgeGraph
  ): Promise<void> {
    const allItems = [...concepts, ...entities];

    // Analyze co-occurrence relationships
    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const item1 = allItems[i];
        const item2 = allItems[j];

        const relationship = this.findRelationship(item1, item2, document.content);
        if (relationship.confidence > 0.3) {
          graph.edges.push({
            source: item1.id,
            target: item2.id,
            type: relationship.type,
            weight: relationship.confidence,
            properties: {
              confidence: relationship.confidence,
              context: relationship.context,
              documentId: document.id
            }
          });
        }
      }
    }

    // Create document -> concept relationships
    for (const item of allItems) {
      graph.edges.push({
        source: document.id,
        target: item.id,
        type: 'mentions',
        weight: item.importance,
        properties: {
          confidence: item.importance,
          context: `Mentioned in ${document.title}`,
          documentId: document.id
        }
      });
    }
  }

  private findRelationship(item1: ExtractedConcept, item2: ExtractedConcept, content: string): {
    type: KnowledgeEdge['type'];
    confidence: number;
    context: string;
  } {
    const sentences = content.split(/[.!?]+/);
    let maxConfidence = 0;
    let bestContext = '';
    let relationType: KnowledgeEdge['type'] = 'related_to';

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const hasItem1 = sentenceLower.includes(item1.label.toLowerCase());
      const hasItem2 = sentenceLower.includes(item2.label.toLowerCase());

      if (hasItem1 && hasItem2) {
        let confidence = 0.5; // Base co-occurrence confidence

        // Check for specific relationship indicators
        if (sentence.match(/\b(?:is|are|was|were)\b.*\b(?:part of|component of)\b/i)) {
          relationType = 'part_of';
          confidence = 0.8;
        } else if (sentence.match(/\b(?:defines|means|refers to)\b/i)) {
          relationType = 'defines';
          confidence = 0.9;
        } else if (sentence.match(/\b(?:however|but|although|contradicts)\b/i)) {
          relationType = 'contradicts';
          confidence = 0.7;
        } else if (sentence.match(/\b(?:related to|associated with|connected to)\b/i)) {
          relationType = 'related_to';
          confidence = 0.6;
        }

        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          bestContext = sentence.trim().substring(0, 150) + '...';
        }
      }
    }

    return {
      type: relationType,
      confidence: maxConfidence,
      context: bestContext
    };
  }
}
