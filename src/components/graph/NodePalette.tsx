'use client'

import { NODE_TYPES_METADATA, NodeType } from '@/types/graph'

interface NodePaletteProps {
  selectedNodeType: NodeType | null
  onSelectNodeType: (type: NodeType | null) => void
}

const categories = [
  { id: 'basic', label: 'Basic', emoji: '📦' },
  { id: 'logic', label: 'Logic', emoji: '🔀' },
  { id: 'variables', label: 'Variables', emoji: '📝' },
  { id: 'discord', label: 'Discord', emoji: '💬' },
  { id: 'advanced', label: 'Advanced', emoji: '⚙️' },
]

export default function NodePalette({ selectedNodeType, onSelectNodeType }: NodePaletteProps) {
  const nodesByCategory = Object.values(NODE_TYPES_METADATA).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, typeof NODE_TYPES_METADATA[NodeType][]>)

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-lg">Node Palette</h3>
        <p className="text-xs text-gray-400 mt-1">
          Click a node, then click on canvas to place it
        </p>
      </div>

      <div className="p-2">
        {categories.map(category => {
          const nodes = nodesByCategory[category.id] || []
          if (nodes.length === 0) return null

          return (
            <div key={category.id} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <span>{category.emoji}</span>
                <h4 className="font-medium text-sm text-gray-300">{category.label}</h4>
              </div>

              <div className="space-y-1">
                {nodes.map(node => (
                  <button
                    key={node.type}
                    onClick={() => onSelectNodeType(
                      selectedNodeType === node.type ? null : node.type
                    )}
                    className={`
                      w-full text-left px-3 py-2 rounded transition-colors
                      ${selectedNodeType === node.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{node.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{node.label}</div>
                        <div className="text-xs opacity-75 truncate">{node.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
