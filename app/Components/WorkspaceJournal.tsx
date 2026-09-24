'use client';

import React, { useState } from 'react';
import { WorkspaceItem, JournalItem } from '../types';

interface WorkspaceJournalProps {
  mainTab: 'workspace' | 'journal';
  workspaces: WorkspaceItem[];
  journals: JournalItem[];
  addWorkspace: (title: string, description: string, link: string) => Promise<void>;
  addJournal: (date: string, content: string) => Promise<void>;
  todayStr: string;
}

export function WorkspaceJournal({ mainTab, workspaces, journals, addWorkspace, addJournal, todayStr }: WorkspaceJournalProps) {
  const [wsTitle, setWsTitle] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [wsLink, setWsLink] = useState('');

  const [journalDate, setJournalDate] = useState('');
  const [journalContent, setJournalContent] = useState('');

  const handleWsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle.trim()) return;
    await addWorkspace(wsTitle.trim(), wsDesc.trim(), wsLink.trim());
    setWsTitle(''); setWsDesc(''); setWsLink('');
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    await addJournal(journalDate || todayStr, journalContent.trim());
    setJournalContent(''); setJournalDate('');
  };

  if (mainTab === 'workspace') {
    return (
      <div>
        <form onSubmit={handleWsSubmit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" value={wsTitle} onChange={e => setWsTitle(e.target.value)} placeholder="Judul Proyek / Ide..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none' }} />
          <textarea value={wsDesc} onChange={e => setWsDesc(e.target.value)} placeholder="Catatan detail..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none', minHeight: '80px' }} />
          <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Ide</button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workspaces.map(w => (
            <div key={w.id} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>{w.title}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#57534e', whiteSpace: 'pre-wrap' }}>{w.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleJournalSubmit} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="date" value={journalDate || todayStr} onChange={e => setJournalDate(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2d9c4', background: '#fcfaf7' }} />
        <textarea value={journalContent} onChange={e => setJournalContent(e.target.value)} placeholder="Tulis catatan harian..." style={{ backgroundColor: '#fcfaf7', border: '1px solid #e2d9c4', borderRadius: '12px', padding: '12px', outline: 'none', minHeight: '80px' }} />
        <button type="submit" style={{ width: '100%', backgroundColor: '#292524', color: '#f5f5f4', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Simpan Jurnal</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {journals.map(j => (
          <div key={j.id} style={{ backgroundColor: '#f4efe6', border: '1px solid #e6decb', padding: '16px', borderRadius: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#e9e2d0', padding: '2px 6px', borderRadius: '4px' }}>{j.date}</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{j.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}