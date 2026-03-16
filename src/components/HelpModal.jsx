import { useEffect } from 'react'

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box help-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="help-header">
          <div className="help-title">
            <span className="help-icon">📚</span>
            SAP MCP Telepítés és Használat
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Body */}
        <div className="help-body">

          {/* Installation */}
          <section className="help-section">
            <h3 className="help-section-title">1. Telepítés</h3>

            <div className="help-block">
              <div className="help-subtitle">Előfeltételek:</div>
              <ul className="help-list">
                <li>Node.js 18+ telepítve</li>
                <li>Claude Desktop vagy Claude Code CLI</li>
                <li>SAP rendszer hozzáférés (user/jelszó)</li>
              </ul>
            </div>

            <div className="help-block">
              <div className="help-subtitle">ABAP ADT MCP Server telepítése:</div>
              <pre className="help-code">
{`# Klónozd a repót:
git clone https://github.com/mario-andreschak/mcp-abap-adt.git
cd mcp-abap-adt
npm install
npm run build`}
              </pre>
            </div>

            <div className="help-block">
              <div className="help-subtitle">Claude Desktop konfiguráció:</div>
              <p className="help-text">
                Keresd meg és szerkeszd a <code className="help-inline-code">claude_desktop_config.json</code> fájlt:
              </p>
              <pre className="help-code help-code-small">
{`# Config fájl helye:
macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\\Claude\\claude_desktop_config.json`}
              </pre>
              <pre className="help-code help-code-small">
{`{
  "mcpServers": {
    "abap-adt": {
      "command": "node",
      "args": ["/teljes/utvonal/mcp-abap-adt/dist/index.js"],
      "env": {
        "SAP_URL": "https://your-sap-server:44300",
        "SAP_CLIENT": "100",
        "SAP_USER": "YOUR_USER",
        "SAP_PASSWORD": "YOUR_PASSWORD"
      }
    }
  }
}`}
              </pre>
            </div>

            <div className="help-block">
              <div className="help-subtitle">Ellenőrzés:</div>
              <ol className="help-list">
                <li><strong>Indítsd újra</strong> a Claude Desktop alkalmazást</li>
                <li>Nyiss egy új beszélgetést</li>
                <li>Kattints a <strong>🔌 ikon</strong>-ra - itt látnod kell az "abap-adt" szervert</li>
                <li>Ha zöld pipa van mellette, a kapcsolat működik</li>
              </ol>
            </div>
          </section>

          {/* Usage */}
          <section className="help-section">
            <h3 className="help-section-title">2. Használat</h3>

            <div className="help-block">
              <div className="help-subtitle">Prompt Launcher + Claude Desktop workflow:</div>
              <ol className="help-list">
                <li>Nyisd meg a <strong>Prompt Launcher</strong>-t a böngészőben</li>
                <li>Válassz egy promptot és kattints rá</li>
                <li>Töltsd ki a változókat (pl. osztálynév, package)</li>
                <li>Kattints a <strong>Másolás</strong> gombra</li>
                <li>Váltás a <strong>Claude Desktop</strong>-ra</li>
                <li><strong>Ctrl+V / ⌘+V</strong> - beillesztés</li>
                <li>Enter - Claude végrehajtja a promptot</li>
              </ol>
            </div>

            <div className="help-block">
              <div className="help-subtitle">Elérhető MCP eszközök:</div>
              <div className="help-tools-grid">
                <code className="help-tool-name">searchObject</code>
                <span>Objektum keresése név alapján</span>
                <code className="help-tool-name">getObjectSource</code>
                <span>Forráskód lekérése</span>
                <code className="help-tool-name">setObjectSource</code>
                <span>Forráskód visszaírása</span>
                <code className="help-tool-name">syntaxCheck</code>
                <span>Szintaxis ellenőrzés</span>
                <code className="help-tool-name">activate</code>
                <span>Objektum aktiválása</span>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="help-section">
            <h3 className="help-section-title">3. Tippek</h3>
            <ul className="help-list">
              <li>A gyors másolás (<strong>Másolás</strong> gomb) közvetlenül használható</li>
              <li>Változóknál pontosan add meg az objektum neveket (nagybetűvel)</li>
              <li>Exportáld rendszeresen a gyűjteményeidet biztonsági mentésként</li>
              <li>Használd a <strong>🌐 Fordítás angolra</strong> opciót angol Claude-hoz</li>
            </ul>
          </section>

          {/* Links */}
          <section className="help-section">
            <h3 className="help-section-title">4. Hasznos linkek</h3>
            <div className="help-links">
              <a href="https://github.com/mario-andreschak/mcp-abap-adt" target="_blank" rel="noopener noreferrer" className="help-link">
                <span className="help-link-icon">📦</span>
                ABAP ADT MCP Server GitHub
              </a>
              <a href="https://modelcontextprotocol.io/docs" target="_blank" rel="noopener noreferrer" className="help-link">
                <span className="help-link-icon">📖</span>
                MCP Dokumentáció
              </a>
              <a href="https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide" target="_blank" rel="noopener noreferrer" className="help-link">
                <span className="help-link-icon">🔧</span>
                SAP ADT User Guide
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="help-footer">
          <button onClick={onClose} className="btn-primary">Bezárás</button>
        </div>
      </div>
    </div>
  )
}
