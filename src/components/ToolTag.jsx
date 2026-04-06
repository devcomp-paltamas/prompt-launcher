import { getMcpDefinition } from '../lib/promptMcp.js'

export default function ToolTag({ tool, mcpOptions = [] }) {
  const mcp = getMcpDefinition(tool, mcpOptions)

  if (!mcp) return null

  return (
    <span
      className="tool-tag"
      style={{
        '--tool-bg': mcp.background,
        '--tool-color': mcp.color,
      }}
    >
      {mcp.shortLabel}
    </span>
  )
}
