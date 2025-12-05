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
import GraphNode from './GraphNode'
import NodePalette from './NodePalette'

interface GraphEditorProps {
  initialGraph?: CommandGraphJson
  onSave?: (graph: CommandGraphJson) => void
  readOnly?: boolean
}

const nodeTypes = {
  default: GraphNode,
}

export default function GraphEditor({ initialGraph, onSave, readOnly = false }: GraphEditorProps) {
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

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      }, eds))
    },
    [setEdges, readOnly]
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
  }, [selectedNodeType, setNodes, readOnly])

  const handleSave = useCallback(() => {
    const graph: CommandGraphJson = {
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

    const validation = validateGraph(graph)
    setValidationErrors(validation.errors)

    if (validation.valid) {
      onSave?.(graph)
    }
  }, [nodes, edges, initialGraph?.variables, onSave])

  const handleClear = useCallback(() => {
    if (!readOnly && confirm('Clear all nodes and edges?')) {
      setNodes([])
      setEdges([])
    }
  }, [setNodes, setEdges, readOnly])

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
  }, [nodes, setNodes, readOnly])

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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
                  <button
                    onClick={handleAddStartNode}
                    className="btn-primary w-full text-sm"
                  >
                    Add START Node
                  </button>
                )}
                
                <button
                  onClick={handleSave}
                  className="btn-primary w-full text-sm"
                  disabled={nodes.length === 0}
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
      </div>
    </div>
  )
}
