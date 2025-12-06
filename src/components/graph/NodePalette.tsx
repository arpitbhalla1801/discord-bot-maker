'use client'

import { useState, useMemo } from 'react'
import { NODE_TYPES_METADATA, NodeType } from '@/types/graph'
import { FaSearch, FaTimes } from 'react-icons/fa'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const nodesByCategory = Object.values(NODE_TYPES_METADATA).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, typeof NODE_TYPES_METADATA[NodeType][]>)

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase()
    
    return categories
      .map(category => {
        const nodes = nodesByCategory[category.id] || []
        
        // Filter by search query
        const filtered = nodes.filter(node => 
          node.label.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
        )

        // Filter by selected category
        if (selectedCategory !== 'ALL' && category.id !== selectedCategory) {
          return { ...category, nodes: [] }
        }

        return { ...category, nodes: filtered }
      })
      .filter(cat => cat.nodes.length > 0)
  }, [searchQuery, selectedCategory, nodesByCategory])

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-lg">Node Palette</h3>
        <p className="text-xs text-gray-400 mt-1">
          Click a node, then click on canvas to place it
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-9 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="p-2 flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No nodes found</p>
            <p className="text-xs mt-1">Try a different search</p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category.id} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <span>{category.emoji}</span>
                <h4 className="font-medium text-sm text-gray-300">{category.label}</h4>
                <span className="text-xs text-gray-500">({category.nodes.length})</span>
              </div>

              <div className="space-y-1">
                {category.nodes.map(node => (
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
          ))
        )}
      </div>
    </div>
  )
}
