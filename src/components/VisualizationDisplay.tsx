// src/components/VisualizationDisplay.tsx
import React, { useState, useEffect } from 'react';
import { GeneratedVisualization } from '../services/VisualizationEngine';
import { BarChart3, LineChart, PieChart, Network, Clock, Layers, Maximize2, Download, Settings } from 'lucide-react';

interface VisualizationDisplayProps {
  visualization: GeneratedVisualization;
  onConfigChange?: (config: any) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const VisualizationDisplay: React.FC<VisualizationDisplayProps> = ({
  visualization,
  onConfigChange,
  onExport,
  isFullScreen = false,
  onToggleFullScreen
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(visualization.config);

  useEffect(() => {
    setConfig(visualization.config);
  }, [visualization.config]);

  const handleConfigUpdate = (newConfig: any) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'interactive-chart':
        return <BarChart3 className="w-5 h-5" />;
      case 'network-graph':
        return <Network className="w-5 h-5" />;
      case 'timeline':
        return <Clock className="w-5 h-5" />;
      case 'concept-map':
        return <Layers className="w-5 h-5" />;
      case 'flowchart':
        return <LineChart className="w-5 h-5" />;
      default:
        return <PieChart className="w-5 h-5" />;
    }
  };

  const renderVisualizationContent = () => {
    // This would integrate with actual charting libraries like Plotly, D3, etc.
    // For now, we'll show a placeholder that demonstrates the structure
    
    switch (visualization.type) {
      case 'interactive-chart':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Interactive Chart</h4>
              <p className="text-sm text-gray-600 mb-4">{visualization.explanation}</p>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-xs text-gray-500">
                  Data points: {Object.keys(visualization.data).length}
                </p>
                <p className="text-xs text-gray-500">
                  Confidence: {Math.round(visualization.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>
        );

      case 'network-graph':
        return (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Network Graph</h4>
              <p className="text-sm text-gray-600 mb-4">{visualization.explanation}</p>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-xs text-gray-500">
                  Nodes: {visualization.data.nodes?.length || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Edges: {visualization.data.edges?.length || 0}
                </p>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Clock className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Timeline</h4>
              <p className="text-sm text-gray-600 mb-4">{visualization.explanation}</p>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-xs text-gray-500">
                  Events: {visualization.data.events?.length || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Time span: {visualization.data.timeSpan || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'concept-map':
        return (
          <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Layers className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Concept Map</h4>
              <p className="text-sm text-gray-600 mb-4">{visualization.explanation}</p>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-xs text-gray-500">
                  Concepts: {visualization.data.concepts?.length || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Relationships: {visualization.data.relationships?.length || 0}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{visualization.title}</h4>
              <p className="text-sm text-gray-600">{visualization.explanation}</p>
            </div>
          </div>
        );
    }
  };

  const renderConfigPanel = () => (
    <div className="absolute top-0 right-0 w-80 h-full bg-white border-l shadow-lg z-10 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          <button
            onClick={() => setShowConfig(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Width"
                value={config.dimensions.width}
                onChange={(e) => handleConfigUpdate({
                  ...config,
                  dimensions: { ...config.dimensions, width: parseInt(e.target.value) }
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Height"
                value={config.dimensions.height}
                onChange={(e) => handleConfigUpdate({
                  ...config,
                  dimensions: { ...config.dimensions, height: parseInt(e.target.value) }
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Scheme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {config.colors.map((color, index) => (
                <input
                  key={index}
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...config.colors];
                    newColors[index] = e.target.value;
                    handleConfigUpdate({ ...config, colors: newColors });
                  }}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              ))}
            </div>
          </div>

          {/* Animation Toggle */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.animations}
                onChange={(e) => handleConfigUpdate({
                  ...config,
                  animations: e.target.checked
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Animations</span>
            </label>
          </div>

          {/* Responsive Toggle */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.responsive}
                onChange={(e) => handleConfigUpdate({
                  ...config,
                  responsive: e.target.checked
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Responsive</span>
            </label>
          </div>

          {/* Accessibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessibility
            </label>
            <textarea
              placeholder="Alt text description"
              value={config.accessibility.altText}
              onChange={(e) => handleConfigUpdate({
                ...config,
                accessibility: {
                  ...config.accessibility,
                  altText: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
            <div className="mt-2 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.accessibility.keyboardNavigation}
                  onChange={(e) => handleConfigUpdate({
                    ...config,
                    accessibility: {
                      ...config.accessibility,
                      keyboardNavigation: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Keyboard Navigation</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.accessibility.screenReaderSupport}
                  onChange={(e) => handleConfigUpdate({
                    ...config,
                    accessibility: {
                      ...config.accessibility,
                      screenReaderSupport: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Screen Reader Support</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden relative ${
      isFullScreen ? 'fixed inset-0 z-50' : 'h-96'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-3">
          {getVisualizationIcon(visualization.type)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{visualization.title}</h3>
            <p className="text-sm text-gray-600">{visualization.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Interactive Functions */}
          <div className="flex space-x-1">
            {visualization.interactiveFunctions.slice(0, 3).map(func => (
              <span
                key={func}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {func}
              </span>
            ))}
          </div>
          
          {/* Actions */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {onExport && (
            <button
              onClick={() => onExport('png')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Full Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`relative ${isFullScreen ? 'h-[calc(100vh-80px)]' : 'h-80'}`}>
        <div className="w-full h-full p-4">
          {renderVisualizationContent()}
        </div>
        
        {showConfig && renderConfigPanel()}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>Confidence: {Math.round(visualization.confidence * 100)}%</span>
          <span>
            {config.dimensions.width} × {config.dimensions.height}px
          </span>
        </div>
      </div>
    </div>
  );
};

export default VisualizationDisplay;
