// src/components/AnalysisDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Brain, Network, BarChart3, FileText, Search, Download, Eye, Filter, Sparkles } from 'lucide-react';
import { ProcessedDocument } from '../services/DocumentProcessor';
import { KnowledgeGraph } from '../services/KnowledgeGraphBuilder';
import { GeneratedVisualization } from '../services/VisualizationEngine';

interface AnalysisDashboardProps {
  documents: ProcessedDocument[];
  knowledgeGraph: KnowledgeGraph;
  visualizations: GeneratedVisualization[];
  onGenerateVisualization: (documentId: string, type: string) => Promise<void>;
  onExportResults: (format: 'pdf' | 'json' | 'csv') => Promise<void>;
  isGenerating: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  documents,
  knowledgeGraph,
  visualizations,
  onGenerateVisualization,
  onExportResults,
  isGenerating
}) => {
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [selectedVisualization, setSelectedVisualization] = useState<GeneratedVisualization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'docx' | 'txt' | 'url'>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'documents' | 'graph' | 'visualizations'>('overview');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.metadata.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getDocumentMetrics = () => {
    const totalWords = documents.reduce((sum, doc) => sum + doc.metadata.wordCount, 0);
    const totalReadingTime = documents.reduce((sum, doc) => sum + doc.metadata.readingTime, 0);
    const averageComplexity = documents.reduce((sum, doc) => sum + doc.metadata.keyTerms.length, 0) / documents.length;
    
    return {
      totalDocuments: documents.length,
      totalWords,
      totalReadingTime,
      averageComplexity: Math.round(averageComplexity)
    };
  };

  const metrics = getDocumentMetrics();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Documents</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.totalDocuments}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Words</p>
              <p className="text-2xl font-bold text-green-900">{metrics.totalWords.toLocaleString()}</p>
            </div>
            <Brain className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Reading Time</p>
              <p className="text-2xl font-bold text-purple-900">{metrics.totalReadingTime} min</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Visualizations</p>
              <p className="text-2xl font-bold text-orange-900">{visualizations.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Knowledge Graph Summary */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Network className="w-5 h-5 mr-2 text-blue-500" />
          Knowledge Graph Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{knowledgeGraph.nodes.size}</p>
            <p className="text-sm text-gray-600">Concepts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{knowledgeGraph.edges.length}</p>
            <p className="text-sm text-gray-600">Relationships</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {knowledgeGraph.topics?.size || 0}
            </p>
            <p className="text-sm text-gray-600">Topics</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {knowledgeGraph.nodes.size > 0 ? Math.round((knowledgeGraph.edges.length / knowledgeGraph.nodes.size) * 100) / 100 : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Connections</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {documents.slice(0, 5).map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                  <p className="text-xs text-gray-500">
                    {doc.metadata.wordCount} words • {doc.metadata.readingTime} min read
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                doc.metadata.type === 'pdf' ? 'bg-red-100 text-red-800' :
                doc.metadata.type === 'docx' ? 'bg-blue-100 text-blue-800' :
                doc.metadata.type === 'txt' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {doc.metadata.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">Text</option>
          <option value="url">URL</option>
        </select>
      </div>

      {/* Document List */}
      <div className="grid gap-6">
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {doc.metadata.summary}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {doc.metadata.topics.slice(0, 3).map(topic => (
                    <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                doc.metadata.type === 'pdf' ? 'bg-red-100 text-red-800' :
                doc.metadata.type === 'docx' ? 'bg-blue-100 text-blue-800' :
                doc.metadata.type === 'txt' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {doc.metadata.type.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{doc.metadata.wordCount} words</span>
              <span>{doc.metadata.readingTime} min read</span>
              <span>{doc.metadata.language}</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedDocument(doc)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => onGenerateVisualization(doc.id, 'auto')}
                disabled={isGenerating}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Generate Viz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVisualizations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Generated Visualizations</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onExportResults('pdf')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => onExportResults('json')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visualizations.map(viz => (
          <div key={viz.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-md font-semibold text-gray-900">{viz.title}</h4>
                <p className="text-sm text-gray-600">{viz.explanation}</p>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {viz.type}
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4 h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Visualization Preview</p>
                <p className="text-xs">Confidence: {Math.round(viz.confidence * 100)}%</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {viz.interactiveFunctions.slice(0, 3).map(func => (
                  <span key={func} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {func}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedVisualization(viz)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                View Full
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Dashboard</h1>
        <p className="text-gray-600">
          Explore insights, visualizations, and knowledge graphs from your documents
        </p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: Brain },
          { key: 'documents', label: 'Documents', icon: FileText },
          { key: 'graph', label: 'Knowledge Graph', icon: Network },
          { key: 'visualizations', label: 'Visualizations', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'documents' && renderDocuments()}
      {viewMode === 'visualizations' && renderVisualizations()}
      {viewMode === 'graph' && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Graph</h3>
          <div className="h-96 bg-gray-50 rounded-md flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Network className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Interactive Knowledge Graph</p>
              <p className="text-sm">
                {knowledgeGraph.nodes.size} nodes, {knowledgeGraph.edges.length} edges
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedDocument.title}</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedDocument.content.substring(0, 2000)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
