'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { NodeType, NODE_TYPES_METADATA } from '@/types/graph'

interface GraphNodeData {
  nodeType: NodeType
  content?: string
  variableName?: string
  variable?: string
  operator?: string
  value?: string | number | boolean
}

function GraphNode({ data, selected }: NodeProps) {
  const nodeData = (data as unknown) as GraphNodeData
  const metadata = NODE_TYPES_METADATA[nodeData.nodeType]
  
  if (!metadata) {
    return (
      <div className="bg-red-500 text-white px-4 py-2 rounded">
        Unknown node type: {String(nodeData.nodeType)}
      </div>
    )
  }

  const hasInputs = metadata.inputs > 0
  const hasOutputs = typeof metadata.outputs === 'number' ? metadata.outputs > 0 : false

  return (
    <div
      className={`
        rounded-lg border-2 shadow-lg min-w-[180px]
        ${selected ? 'ring-2 ring-blue-400' : ''}
      `}
      style={{
        borderColor: metadata.color,
        backgroundColor: '#1f2937'
      }}
    >
      {/* Input Handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3"
          style={{ background: metadata.color }}
        />
      )}

      {/* Node Header */}
      <div
        className="px-3 py-2 rounded-t-lg flex items-center gap-2"
        style={{ backgroundColor: metadata.color + '20' }}
      >
        <span className="text-lg">{metadata.icon}</span>
        <span className="font-semibold text-sm text-white">{metadata.label}</span>
      </div>

      {/* Node Content */}
      <div className="px-3 py-2 text-xs text-gray-300">
        {nodeData.content && <div className="mb-1 truncate">{nodeData.content}</div>}
        {nodeData.variableName && (
          <div className="text-blue-300">→ {nodeData.variableName}</div>
        )}
        {nodeData.nodeType === 'IF_CONDITION' && nodeData.variable && (
          <div className="text-yellow-300">
            {nodeData.variable} {nodeData.operator} {nodeData.value}
          </div>
        )}
      </div>

      {/* Output Handles */}
      {hasOutputs && (
        <>
          {metadata.outputs === 2 ? (
            // Conditional node with true/false branches
            <>
              <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="w-3 h-3"
                style={{ left: '30%', background: '#10b981' }}
              />
              <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="w-3 h-3"
                style={{ left: '70%', background: '#ef4444' }}
              />
              <div className="flex justify-between px-3 pb-1 text-[10px]">
                <span className="text-green-400">True</span>
                <span className="text-red-400">False</span>
              </div>
            </>
          ) : (
            // Regular node with single output
            <Handle
              type="source"
              position={Position.Bottom}
              className="w-3 h-3"
              style={{ background: metadata.color }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default memo(GraphNode)
