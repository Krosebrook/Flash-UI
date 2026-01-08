import { useState, useMemo } from 'react';
import { CONFIG } from '../data/config';
import { Callout } from '../components/shared/Callout';
import type { EcosystemId } from '../types';

const ECOSYSTEM_LABELS: Record<EcosystemId, string> = {
  m365: 'M365',
  google: 'Google',
  openai: 'OpenAI',
  claude: 'Claude',
  cross: 'Cross'
};

export function ToolsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [ecosystem, setEcosystem] = useState<EcosystemId | ''>('');

  const categories = useMemo(() => {
    const cats = new Set(CONFIG.toolAtlas.map(t => t.category));
    return Array.from(cats).sort();
  }, []);

  const filteredTools = useMemo(() => {
    return CONFIG.toolAtlas.filter((tool) => {
      const matchesSearch = search === '' ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.category.toLowerCase().includes(search.toLowerCase()) ||
        tool.notes.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === '' || tool.category === category;
      const matchesEcosystem = ecosystem === '' || tool.ecosystems.includes(ecosystem);

      return matchesSearch && matchesCategory && matchesEcosystem;
    });
  }, [search, category, ecosystem]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>🧩 Tool Atlas</h1>
        <p className="subtitle">Complete inventory of integrated tools and services</p>
      </header>

      <Callout variant="info">
        All tools follow the same governance model: risk classification, approval gates, and audit logging.
        Filter by ecosystem or category to find specific integrations.
      </Callout>

      <section className="section">
        <div className="filter-bar">
          <input
            type="text"
            className="filter-search"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="filter-pills">
            {(Object.keys(ECOSYSTEM_LABELS) as EcosystemId[]).map((eco) => (
              <button
                key={eco}
                className={`filter-pill ${ecosystem === eco ? 'active' : ''}`}
                onClick={() => setEcosystem(ecosystem === eco ? '' : eco)}
              >
                {ECOSYSTEM_LABELS[eco]}
              </button>
            ))}
          </div>
        </div>

        <p className="result-count">{filteredTools.length} tools</p>

        <div className="tools-table-container">
          <table className="tools-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Category</th>
                <th>Ecosystems</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map((tool) => (
                <tr key={tool.name}>
                  <td className="tool-name">{tool.name}</td>
                  <td className="tool-category">{tool.category}</td>
                  <td className="tool-ecosystems">
                    {tool.ecosystems.map((e) => (
                      <span key={e} className={`eco-badge eco-${e}`}>
                        {ECOSYSTEM_LABELS[e]}
                      </span>
                    ))}
                  </td>
                  <td className="tool-notes">{tool.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
