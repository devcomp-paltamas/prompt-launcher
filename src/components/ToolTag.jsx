export default function ToolTag({ tool }) {
  const isAdt = tool === 'adt'
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
      background: isAdt ? 'rgba(0,112,243,0.15)' : 'rgba(0,184,148,0.15)',
      color: isAdt ? '#60a5fa' : '#55efc4',
    }}>
      {isAdt ? '⚙️ abap-adt' : '📚 sap-docs'}
    </span>
  )
}
