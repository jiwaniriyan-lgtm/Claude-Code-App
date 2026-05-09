'use client';

import { useState } from 'react';
import IdeaCard from '@/components/IdeaCard';
import type { SavedIdea } from '@/lib/types';

export default function HistoryClient({ initial }: { initial: SavedIdea[] }) {
  const [ideas, setIdeas] = useState<SavedIdea[]>(initial);

  function onDelete(id: string) {
    setIdeas((p) => p.filter((i) => i.id !== id));
  }

  return (
    <div className="page-shell">
      <div className="list-header-row">
        <div>
          <h2>📚 Saved Ideas</h2>
          <p className="sub">Your saved viral ideas across all sessions.</p>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No saved ideas yet. Hit 💾 Save on any idea to bookmark it here.</p>
        </div>
      ) : (
        <div className="ideas-grid">
          {ideas.map((idea, i) => (
            <IdeaCard key={idea.id} idea={idea} index={i} isHistory onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
