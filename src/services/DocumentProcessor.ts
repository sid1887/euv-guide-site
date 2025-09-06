// src/services/DocumentProcessor.ts
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as natural from 'natural';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import MarkdownIt from 'markdown-it';
import JSZip from 'jszip';

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    type: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'url';
    wordCount: number;
    readingTime: number;
    language: string;
    topics: string[];
    summary: string;
    keyTerms: string[];
    complexity: 'basic' | 'intermediate' | 'advanced';
  };
  sections: DocumentSection[];
  embeddings: number[];
  visualizations: VisualizationSuggestion[];
  createdAt: Date;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'methodology' | 'results' | 'conclusion' | 'reference' | 'figure' | 'table';
  importance: number; // 0-1 score
  embeddings: number[];
  relatedConcepts: string[];
}

export interface VisualizationSuggestion {
  type: 'chart' | 'diagram' | 'flowchart' | 'network' | 'timeline' | '3d-model';
  title: string;
  description: string;
  data: any;
  confidence: number;
}

export class DocumentProcessor {
  private tokenizer: any;
  private sentimentAnalyzer: any;
  private model: tf.LayersModel | null = null;
  private useModel: use.UniversalSentenceEncoder | null = null;

  constructor() {
    this.initializeNLP();
    this.loadEmbeddingModel();
  }

  private initializeNLP() {
    try {
      // Initialize Natural Language Processing tools
      this.tokenizer = new natural.WordTokenizer();
      this.sentimentAnalyzer = new natural.SentimentAnalyzer('English',
        natural.PorterStemmer, 'afinn');
    } catch (error) {
      console.warn('⚠️ Natural NLP initialization failed, using fallback:', error);
      // Fallback tokenizer
      this.tokenizer = {
        tokenize: (text: string) => text.toLowerCase().split(/\s+/).filter(word => word.length > 0)
      };
      this.sentimentAnalyzer = {
        getSentiment: () => 0 // Neutral sentiment as fallback
      };
    }
  }

  private async loadEmbeddingModel() {
    try {
      // Load Universal Sentence Encoder
      this.useModel = await use.load();
      console.log('✅ Universal Sentence Encoder model loaded');
      
      // Load pre-trained universal sentence encoder for embeddings
      // For now, we'll create a simple embedding model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [100], units: 256, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 128, activation: 'relu' }),
          tf.layers.dense({ units: 64, activation: 'tanh' })
        ]
      });
    } catch (error) {
      console.warn('Failed to load embedding model:', error);
    }
  }

  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = this.detectFileType(file);
    let content = '';

    try {
      switch (fileType) {
        case 'pdf':
          content = await this.processPDF(file);
          break;
        case 'docx':
          content = await this.processDocx(file);
          break;
        case 'txt':
        case 'md':
          content = await this.processText(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      return await this.analyzeDocument(content, file.name, fileType);
    } catch (error) {
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async processURL(url: string): Promise<ProcessedDocument> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract main content (remove nav, footer, ads)
      $('nav, footer, aside, .advertisement, .sidebar').remove();
      const content = $('main, article, .content, body').text();
      
      const title = $('title').text() || $('h1').first().text() || 'Web Document';
      
      return await this.analyzeDocument(content, title, 'html');
    } catch (error) {
      throw new Error(`Failed to process URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private detectFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'txt': return 'txt';
      case 'md': case 'markdown': return 'md';
      case 'html': case 'htm': return 'html';
      default: return 'txt';
    }
  }

  private async processPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async processDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async processText(file: File): Promise<string> {
    return await file.text();
  }

  private async analyzeDocument(content: string, title: string, type: string): Promise<ProcessedDocument> {
    const sections = this.extractSections(content);
    const metadata = await this.extractMetadata(content);
    const embeddings = await this.generateEmbeddings(content);
    const visualizations = await this.suggestVisualizations(content, sections);

    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.replace(/\.[^/.]+$/, ''), // Remove file extension
      content,
      metadata: {
        type: type as any,
        ...metadata
      },
      sections,
      embeddings,
      visualizations,
      createdAt: new Date()
    };
  }

  private extractSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Split by headers (# ## ### or numbered sections)
    const headerRegex = /^(#{1,6}\s+.*|^\d+\.?\s+[A-Z].*|^[A-Z][^.]*:?\s*$)/gm;
    const parts = content.split(headerRegex).filter(part => part.trim());

    for (let i = 0; i < parts.length; i += 2) {
      const header = parts[i]?.trim();
      const sectionContent = parts[i + 1]?.trim() || '';

      if (header && sectionContent) {
        const sectionType = this.classifySection(header, sectionContent);
        const importance = this.calculateImportance(sectionContent);
        const relatedConcepts = this.extractKeyTerms(sectionContent);

        sections.push({
          id: `section_${i}`,
          title: header.replace(/^#+\s*/, '').replace(/^\d+\.?\s*/, ''),
          content: sectionContent,
          type: sectionType,
          importance,
          embeddings: [], // Will be populated later if needed
          relatedConcepts
        });
      }
    }

    return sections;
  }

  private classifySection(header: string, content: string): DocumentSection['type'] {
    const headerLower = header.toLowerCase();
    const contentLower = content.toLowerCase();

    if (headerLower.includes('introduction') || headerLower.includes('overview')) {
      return 'introduction';
    }
    if (headerLower.includes('method') || headerLower.includes('approach')) {
      return 'methodology';
    }
    if (headerLower.includes('result') || headerLower.includes('finding')) {
      return 'results';
    }
    if (headerLower.includes('conclusion') || headerLower.includes('summary')) {
      return 'conclusion';
    }
    if (headerLower.includes('reference') || headerLower.includes('bibliography')) {
      return 'reference';
    }
    if (contentLower.includes('figure') || contentLower.includes('chart')) {
      return 'figure';
    }
    if (contentLower.includes('table') || headerLower.includes('table')) {
      return 'table';
    }

    return 'introduction'; // Default
  }

  private async extractMetadata(content: string) {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    const wordCount = tokens.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 WPM average

    // Extract key terms using TF-IDF
    const keyTerms = this.extractKeyTerms(content);
    
    // Detect language (simplified)
    const language = this.detectLanguage(content);
    
    // Generate summary
    const summary = this.generateSummary(content);
    
    // Classify complexity
    const complexity = this.classifyComplexity(content);
    
    // Extract topics
    const topics = this.extractTopics(content, keyTerms);

    return {
      wordCount,
      readingTime,
      language,
      topics,
      summary,
      keyTerms,
      complexity
    };
  }

  private extractKeyTerms(content: string): string[] {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    const stemmedTokens = tokens.map((token: string) => natural.PorterStemmer.stem(token));
    
    // Calculate TF-IDF scores
    const termFreq: { [key: string]: number } = {};
    stemmedTokens.forEach((token: string) => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });

    // Get top terms (simplified TF-IDF)
    const sortedTerms = Object.entries(termFreq)
      .filter(([term]) => term.length > 3) // Filter short words
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([term]) => term);

    return sortedTerms;
  }

  private detectLanguage(content: string): string {
    // Simple English detection (can be enhanced with language detection libraries)
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const words = content.toLowerCase().split(/\s+/).slice(0, 100);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishCount > 10 ? 'en' : 'unknown';
  }

  private generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const topSentences = sentences
      .slice(0, 5) // Take first 5 sentences as basic summary
      .join('. ');
    
    return topSentences.length > 500 ? 
      topSentences.substring(0, 497) + '...' : 
      topSentences;
  }

  private classifyComplexity(content: string): 'basic' | 'intermediate' | 'advanced' {
    const avgWordsPerSentence = content.split(/[.!?]+/).reduce((acc, sentence) => {
      const words = sentence.trim().split(/\s+/).length;
      return acc + words;
    }, 0) / content.split(/[.!?]+/).length;

    const technicalTermsPattern = /\b(algorithm|methodology|implementation|analysis|evaluation|optimization|coefficient|parameter|variable|function|equation|hypothesis|theoretical|empirical|quantitative|qualitative)\b/gi;
    const technicalTerms = content.match(technicalTermsPattern) || [];

    if (avgWordsPerSentence > 20 && technicalTerms.length > 50) {
      return 'advanced';
    } else if (avgWordsPerSentence > 15 && technicalTerms.length > 20) {
      return 'intermediate';
    } else {
      return 'basic';
    }
  }

  private extractTopics(content: string, keyTerms: string[]): string[] {
    // Group related terms into topics
    const topicClusters: { [key: string]: string[] } = {
      'Technology': ['technology', 'innovation', 'development', 'system', 'design'],
      'Research': ['research', 'study', 'analysis', 'method', 'experiment'],
      'Data': ['data', 'information', 'database', 'processing', 'analysis'],
      'Science': ['science', 'scientific', 'theory', 'hypothesis', 'discovery'],
      'Engineering': ['engineering', 'technical', 'implementation', 'architecture']
    };

    const topics: string[] = [];
    const contentLower = content.toLowerCase();

    Object.entries(topicClusters).forEach(([topic, terms]) => {
      const matchCount = terms.filter(term => 
        contentLower.includes(term) || keyTerms.includes(term)
      ).length;
      
      if (matchCount > 2) {
        topics.push(topic);
      }
    });

    return topics.length > 0 ? topics : ['General'];
  }

  private async generateEmbeddings(content: string): Promise<number[]> {
    try {
      if (this.useModel) {
        // Use the actual Universal Sentence Encoder
        const embeddings = await this.useModel.embed([content]);
        const embeddingArray = await embeddings.data();
        embeddings.dispose(); // Clean up memory
        return Array.from(embeddingArray);
      }
    } catch (error) {
      console.warn('Failed to generate embeddings with USE model:', error);
    }
    
    // Fallback to simple hash-based embedding
    const hash = this.simpleHash(content);
    return Array.from({ length: 512 }, (_, i) => 
      Math.sin(hash * (i + 1)) * Math.cos(hash / (i + 2))
    );
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async suggestVisualizations(content: string, sections: DocumentSection[]): Promise<VisualizationSuggestion[]> {
    const suggestions: VisualizationSuggestion[] = [];

    // Detect numerical data for charts
    const numbers = content.match(/\d+\.?\d*/g);
    if (numbers && numbers.length > 10) {
      suggestions.push({
        type: 'chart',
        title: 'Data Visualization',
        description: 'Interactive chart based on detected numerical data',
        data: { numbers: numbers.slice(0, 20) },
        confidence: 0.7
      });
    }

    // Detect process descriptions for flowcharts
    const processWords = ['step', 'process', 'procedure', 'method', 'workflow'];
    const hasProcess = processWords.some(word => content.toLowerCase().includes(word));
    if (hasProcess) {
      suggestions.push({
        type: 'flowchart',
        title: 'Process Flow',
        description: 'Flowchart representing the described process',
        data: { sections: sections.map(s => s.title) },
        confidence: 0.8
      });
    }

    // Detect timeline content
    const timeWords = ['year', 'month', 'timeline', 'history', 'evolution'];
    const hasTimeline = timeWords.some(word => content.toLowerCase().includes(word));
    if (hasTimeline) {
      suggestions.push({
        type: 'timeline',
        title: 'Timeline Visualization',
        description: 'Timeline showing chronological progression',
        data: { events: this.extractTimelineEvents(content) },
        confidence: 0.6
      });
    }

    return suggestions;
  }

  private extractTimelineEvents(content: string): any[] {
    // Simple timeline event extraction
    const yearRegex = /(\d{4})[:\-\s]+([^.!?]+)/g;
    const events = [];
    let match;

    while ((match = yearRegex.exec(content)) !== null && events.length < 10) {
      events.push({
        year: match[1],
        description: match[2].trim().substring(0, 100)
      });
    }

    return events;
  }

  private calculateImportance(content: string): number {
    // Calculate section importance based on length, keywords, and position
    const wordCount = content.split(/\s+/).length;
    const hasKeywords = ['important', 'key', 'main', 'primary', 'critical'].some(
      keyword => content.toLowerCase().includes(keyword)
    );
    
    let importance = Math.min(wordCount / 100, 1.0); // Base on length
    if (hasKeywords) importance *= 1.5; // Boost for key terms
    
    return Math.min(importance, 1.0);
  }
}
