'use client'

import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MiniMap,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { 
  CommandGraphJson, 
  NodeType, 
  NODE_TYPES_METADATA,
  createNode,
  validateGraph 
} from '@/types/graph'
import { GRAPH_TEMPLATES } from '@/lib/graphTemplates'
import GraphNode from './GraphNode'
import NodePalette from './NodePalette'
import { FaFileImport } from 'react-icons/fa'

interface GraphEditorProps {
  initialGraph?: CommandGraphJson
  onSave?: (graph: CommandGraphJson) => void
  onChange?: (graph: CommandGraphJson) => void
  readOnly?: boolean
}

const nodeTypes = {
  default: GraphNode,
}

export default function GraphEditor({ initialGraph, onSave, onChange, readOnly = false }: GraphEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialGraph?.nodes.map(n => ({
      id: n.id,
      type: 'default',
      position: n.position,
      data: { ...n.data, nodeType: n.type }
    })) || []
  )
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialGraph?.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    })) || []
  )

  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Build graph helper - defined first as it's used by other callbacks
  const buildGraph = useCallback((): CommandGraphJson => {
    return {
      nodes: nodes.map((n: Node) => {
        const { nodeType, ...restData } = n.data as any
        return {
          id: n.id,
          type: nodeType as NodeType,
          position: n.position,
          data: restData
        }
      }) as any,
      edges: edges.map((e: Edge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
        label: e.label as string | undefined
      })),
      variables: initialGraph?.variables || {}
    }
  }, [nodes, edges, initialGraph?.variables])

  // Notify parent of changes
  const notifyChange = useCallback(() => {
    const graph = buildGraph()
    onChange?.(graph)
  }, [buildGraph, onChange])

  const handleSave = useCallback(() => {
    const graph = buildGraph()
    const validation = validateGraph(graph)
    setValidationErrors(validation.errors)

    if (validation.valid) {
      onSave?.(graph)
    }
  }, [buildGraph, onSave])

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      }, eds))
      notifyChange()
    },
    [setEdges, readOnly, notifyChange]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (readOnly) return
    console.log('Node clicked:', node)
  }, [readOnly])

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (readOnly || !selectedNodeType) return

    // Get the click position relative to the flow
    const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect()
    const position = {
      x: event.clientX - reactFlowBounds.left - 100,
      y: event.clientY - reactFlowBounds.top - 50,
    }

    const newNode = createNode(selectedNodeType, position)
    
    setNodes((nds) => [
      ...nds,
      {
        id: newNode.id,
        type: 'default',
        position: newNode.position,
        data: { ...newNode.data, nodeType: newNode.type }
      }
    ])

    setSelectedNodeType(null)
    notifyChange()
  }, [selectedNodeType, setNodes, readOnly, notifyChange])

  const handleClear = useCallback(() => {
    if (!readOnly && confirm('Clear all nodes and edges?')) {
      setNodes([])
      setEdges([])
      notifyChange()
    }
  }, [setNodes, setEdges, readOnly, notifyChange])

  const handleAddStartNode = useCallback(() => {
    if (readOnly) return
    
    const hasStartNode = nodes.some(n => n.data.nodeType === 'START')
    if (hasStartNode) {
      alert('Only one START node is allowed')
      return
    }

    const startNode = createNode('START', { x: 250, y: 50 })
    setNodes((nds) => [
      ...nds,
      {
        id: startNode.id,
        type: 'default',
        position: startNode.position,
        data: { ...startNode.data, nodeType: startNode.type }
      }
    ])
    notifyChange()
  }, [nodes, setNodes, readOnly, notifyChange])

  const [showTemplates, setShowTemplates] = useState(false)

  const loadTemplate = useCallback((templateGraph: CommandGraphJson) => {
    const templateNodes = templateGraph.nodes.map(n => ({
      id: n.id,
      type: 'default' as const,
      position: n.position,
      data: { ...n.data, nodeType: n.type }
    }))

    const templateEdges = templateGraph.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      animated: true as const,
      style: { stroke: '#94a3b8' as const, strokeWidth: 2 }
    }))

    setNodes(templateNodes)
    setEdges(templateEdges as any)
    setShowTemplates(false)
    notifyChange()
  }, [setNodes, setEdges, notifyChange])

  return (
    <div className="flex h-full w-full">
      {/* Node Palette */}
      {!readOnly && (
        <NodePalette
          selectedNodeType={selectedNodeType}
          onSelectNodeType={setSelectedNodeType}
        />
      )}

      {/* Graph Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes)
            if (changes.length > 0 && !readOnly) notifyChange()
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes)
            if (changes.length > 0 && !readOnly) notifyChange()
          }}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={readOnly ? null : 'Delete'}
          className="bg-gray-900"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#374151" gap={16} />
          <Controls className="bg-gray-800 border-gray-700" />
          <MiniMap
            className="bg-gray-800 border-gray-700"
            nodeColor={(node) => {
              const metadata = NODE_TYPES_METADATA[node.data.nodeType as NodeType]
              return metadata?.color || '#94a3b8'
            }}
          />
          
          {!readOnly && (
            <Panel position="top-right" className="space-y-2">
              {validationErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm max-w-xs">
                  <p className="font-semibold mb-1">Validation Errors:</p>
                  <ul className="list-disc list-inside text-xs">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-gray-800 border border-gray-700 rounded p-2 space-y-2">
                {nodes.length === 0 && (
                  <>
                    <button
                      onClick={handleAddStartNode}
                      className="btn-primary w-full text-sm"
                    >
                      Add START Node
                    </button>
                    
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <FaFileImport />
                      Load Template
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleSave}
                  className="btn-primary w-full text-sm"
                  disabled={nodes.length === 0}
                  data-save-button
                >
                  Save Graph
                </button>
                
                <button
                  onClick={handleClear}
                  className="btn-secondary w-full text-sm"
                  disabled={nodes.length === 0}
                >
                  Clear All
                </button>
              </div>
              
              {selectedNodeType && (
                <div className="bg-blue-500/20 border border-blue-500 text-blue-200 px-3 py-2 rounded text-sm">
                  Click on canvas to place: <strong>{NODE_TYPES_METADATA[selectedNodeType].label}</strong>
                </div>
              )}
            </Panel>
          )}
        </ReactFlow>

        {/* Template Picker Modal */}
        {showTemplates && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Load Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Choose a template to get started quickly. This will replace your current graph.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {GRAPH_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      if (confirm(`Load "${template.name}" template? This will replace your current graph.`)) {
                        loadTemplate(template.graph)
                      }
                    }}
                    className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2">{template.description}</p>
                        <div className="mt-2">
                          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                            {template.graph.nodes.length} nodes
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
