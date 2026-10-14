import React from 'react';
import {
  Sparkles,
  BarChart3,
  Bot,
  Clock,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

/**
 * CONTRACT COMPONENT FOR TEAMMATE (Complaints / AI Dispatch Module):
 * This is the dedicated dashboard view shell where the complaints teammate
 * can mount analytics, AI ticket triage summaries, SLA tracking, and resolution charts.
 */
export function ComplaintsAnalyticsMountPoint() {
  return (
    <div style={{ padding: '0 0.5rem' }}>
      {/* Teammate Integration Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}
        >
          <Bot size={28} color="#ffffff" />
        </div>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-role">Hackathon Track Shell</span>
            <span style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: '700' }}>
              Dejavu Hackathon Campus Solve
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.25rem' }}>
            Complaints & AI Analytics Dashboard Shell
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <b>Contract Integration Point:</b> Teammate building Complaints & AI module can mount widgets, NLP category charts, SLA heatmaps, and technician auto-assignment tables right here in <code>ComplaintsAnalyticsMountPoint.jsx</code>.
          </p>
        </div>
      </div>

      {/* Analytics Widget Placeholder Slots */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Complaints</span>
            <Sparkles size={16} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            28
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
            +12% this academic week
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Auto-Triage Rate</span>
            <Cpu size={16} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#a5b4fc', marginTop: '0.5rem' }}>
            94.6%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Specialisation matched
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Resolution Time</span>
            <Clock size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fcd34d', marginTop: '0.5rem' }}>
            2.4 hrs
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
            Under 4-hour SLA
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Maintenance</span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#6ee7b7', marginTop: '0.5rem' }}>
            5 Technicians
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Plumbing, Electric, LAN
          </div>
        </div>
      </div>

      {/* Main Mount Panels */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={20} color="var(--accent-blue)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
              Complaints Category Distribution (Teammate Mount Slot)
            </h4>
          </div>
          <div
            style={{
              height: '180px',
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <BarChart3 size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div><b>Complaints Chart Mount Slot</b></div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Plumbing: 38% | Electrical: 32% | Wi-Fi: 18% | Hygiene: 12%
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Bot size={20} color="var(--accent-indigo)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
              AI Smart Assignee Dispatch Queue (Teammate Mount Slot)
            </h4>
          </div>
          <div
            style={{
              height: '180px',
              border: '2px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <Bot size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div><b>AI Dispatch Widget Mount Slot</b></div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Connected to <code>GET /api/v1/admin/maintenance/assignees</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
