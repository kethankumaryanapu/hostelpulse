import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api';
import {
  Layers,
  Building,
  Shield,
  Utensils,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
  Search,
  Activity,
} from 'lucide-react';

import { ComplaintsAnalyticsMountPoint } from './ComplaintsAnalyticsMountPoint';

export function AdminDashboard({ activeTab = 'stats' }) {
  const [stats, setStats] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [wardensData, setWardensData] = useState({ wardens: [], preloadedList: [] });
  const [staffList, setStaffList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [cutoffTime, setCutoffTime] = useState({ hour: 21, minute: 0 });

  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  // Form Modals / Expanders
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: '', code: '', gender: 'male', totalFloors: 4, description: '' });

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ blockId: '', roomNumber: '', floor: 1, capacity: 2 });

  const [showPreloadModal, setShowPreloadModal] = useState(false);
  const [newPreload, setNewPreload] = useState({ collegeIdNumber: '', fullName: '', email: '', gender: 'male', blockId: '' });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    phone: '',
    password: 'Password@123',
    role: 'maintenance',
    staffIdNumber: '',
    fullName: '',
    department: 'Facility Maintenance',
    specialisations: ['Plumbing & Water Supply'],
    isActive: true,
  });

  async function loadData() {
    try {
      const s = await api.get('/admin/stats');
      if (s.success) setStats(s.data);

      const b = await api.get('/admin/blocks');
      if (b.success) {
        setBlocks(b.data);
        if (b.data.length > 0 && !newRoom.blockId) {
          setNewRoom(prev => ({ ...prev, blockId: b.data[0].id }));
          setNewPreload(prev => ({ ...prev, blockId: b.data[0].id }));
        }
      }

      const r = await api.get('/admin/rooms');
      if (r.success) setRooms(r.data);

      const w = await api.get('/admin/wardens');
      if (w.success) setWardensData(w.data);

      const st = await api.get('/admin/staff');
      if (st.success) setStaffList(st.data);

      const c = await api.get('/admin/categories');
      if (c.success) setCategories(c.data);

      const al = await api.get('/admin/audit-logs');
      if (al.success) setAuditLogs(al.data);

      const co = await api.get('/food/cutoff');
      if (co.success) setCutoffTime(co.data);
    } catch (err) {
      console.warn('Admin load error:', err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateBlock(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/admin/blocks', newBlock);
      if (res.success) {
        setMsg(`Block ${newBlock.name} created.`);
        setShowBlockModal(false);
        loadData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/admin/rooms', newRoom);
      if (res.success) {
        setMsg(`Room ${newRoom.roomNumber} created.`);
        setShowRoomModal(false);
        loadData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePreloadWarden(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/admin/wardens/preload', newPreload);
      if (res.success) {
        setMsg(`Warden ${newPreload.fullName} added to pre-loaded roster.`);
        setShowPreloadModal(false);
        loadData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateStaff(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/admin/staff', newStaff);
      if (res.success) {
        setMsg(`Staff account created for ${newStaff.fullName}.`);
        setShowStaffModal(false);
        loadData();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateCutoff(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.put('/food/cutoff', cutoffTime);
      if (res.success) {
        setMsg(res.data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
          Hostel Chief Administration Panel
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Campus-wide control over blocks, rooms, warden credentials, staff accounts, dining cutoff, and audit logs.
        </p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab: Overview / Stats */}
      {activeTab === 'stats' && (
        <div>
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Hostel Blocks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#93c5fd', marginTop: '0.35rem' }}>
                {blocks.length}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Physical Rooms</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34d399', marginTop: '0.35rem' }}>
                {rooms.length}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Wardens</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#a78bfa', marginTop: '0.35rem' }}>
                {wardensData.wardens.length}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Personnel</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f472b6', marginTop: '0.35rem' }}>
                {staffList.length}
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Activity size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Audit Logs & Compliance Trail</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>Action</th>
                    <th style={{ padding: '0.5rem' }}>Entity</th>
                    <th style={{ padding: '0.5rem' }}>Initiator</th>
                    <th style={{ padding: '0.5rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 8).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: '600', color: '#93c5fd' }}>{log.action}</td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>{log.entity_type} #{log.entity_id || '-'}</td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>{log.user_email || 'System'}</td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Infrastructure (Blocks & Rooms) */}
      {activeTab === 'infrastructure' && (
        <div>
          {/* Blocks List */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Hostel Blocks</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowBlockModal(true)}>
                <Plus size={16} /> Add Block
              </button>
            </div>
            <div className="grid-2">
              {blocks.map(b => (
                <div key={b.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{b.name}</h4>
                    <span className="badge badge-role">{b.gender}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Code: <b>{b.code}</b> | Floors: {b.total_floors} | Students: {b.student_count || 0}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{b.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Hostel Rooms</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowRoomModal(true)}>
                <Plus size={16} /> Add Room
              </button>
            </div>
            <div className="grid-4">
              {rooms.map(r => (
                <div key={r.id} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Room {r.room_number}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.block_name} (Floor {r.floor})</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
                    Capacity: {r.occupied_count || 0} / {r.capacity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wardens & Staff */}
      {activeTab === 'wardens' && (
        <div>
          {/* Pre-loaded Wardens Roster */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Pre-Loaded Warden Roster</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Wardens matching this list receive instant auto-approval upon sign up.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPreloadModal(true)}>
                <Plus size={16} /> Pre-Load Warden
              </button>
            </div>
            <div className="grid-2">
              {wardensData.preloadedList?.map(pw => (
                <div key={pw.id} style={{ padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{pw.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>{pw.college_id_number}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pw.email} • {pw.block_name} ({pw.gender})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Accounts */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Operational Staff Accounts</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>
                <Plus size={16} /> Add Staff Account
              </button>
            </div>
            <div className="grid-2">
              {staffList.map(st => {
                const specs = typeof st.specialisations === 'string'
                  ? JSON.parse(st.specialisations)
                  : (st.specialisations || []);
                return (
                  <div key={st.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '700' }}>{st.full_name}</div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span className={`badge ${st.is_active ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '0.65rem' }}>
                          {st.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="badge badge-role">{st.role}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Dept: {st.department} | Staff ID: {st.staff_id_number}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email} • {st.phone}</div>

                    {/* Specialisations for maintenance auto-suggestion */}
                    {st.role === 'maintenance' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Specialises in:</span>
                        {specs.length > 0 ? (
                          specs.map(sp => (
                            <span key={sp} style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: '4px' }}>
                              {sp}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>General Maintenance</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Food Cut-off Config */}
      {activeTab === 'food' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Daily Meal Cut-Off Configuration
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Set the precise daily cut-off time. At this time every evening, meal preferences for the subsequent day are locked.
            </p>

            <form onSubmit={handleUpdateCutoff}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hour (0-23, 24h format)</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="form-input"
                    value={cutoffTime.hour}
                    onChange={e => setCutoffTime(prev => ({ ...prev, hour: parseInt(e.target.value, 10) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minute (0-59)</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    className="form-input"
                    value={cutoffTime.minute}
                    onChange={e => setCutoffTime(prev => ({ ...prev, minute: parseInt(e.target.value, 10) }))}
                    required
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                Current Effective Cut-Off: <b>{String(cutoffTime.hour).padStart(2, '0')}:{String(cutoffTime.minute).padStart(2, '0')} daily</b> (Default: 21:00 / 9:00 PM).
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Update Cut-Off Setting
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Complaints Analytics Shell Mount Point for Teammate */}
      {activeTab === 'complaints' && (
        <ComplaintsAnalyticsMountPoint />
      )}

      {/* Block Create Modal */}
      {showBlockModal && (
        <div className="modal-backdrop" onClick={() => setShowBlockModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Hostel Block</h3>
            <form onSubmit={handleCreateBlock}>
              <div className="form-group">
                <label className="form-label">Block Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramanujan Boys Block C"
                  value={newBlock.name}
                  onChange={e => setNewBlock(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Block Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RBC"
                    value={newBlock.code}
                    onChange={e => setNewBlock(prev => ({ ...prev, code: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designated Gender *</label>
                  <select
                    className="form-select"
                    value={newBlock.gender}
                    onChange={e => setNewBlock(prev => ({ ...prev, gender: e.target.value }))}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Block</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Create Modal */}
      {showRoomModal && (
        <div className="modal-backdrop" onClick={() => setShowRoomModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label className="form-label">Hostel Block *</label>
                <select
                  className="form-select"
                  value={newRoom.blockId}
                  onChange={e => setNewRoom(prev => ({ ...prev, blockId: e.target.value }))}
                  required
                >
                  {blocks.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Room No. *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 103"
                    value={newRoom.roomNumber}
                    onChange={e => setNewRoom(prev => ({ ...prev, roomNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.floor}
                    onChange={e => setNewRoom(prev => ({ ...prev, floor: parseInt(e.target.value, 10) }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.capacity}
                    onChange={e => setNewRoom(prev => ({ ...prev, capacity: parseInt(e.target.value, 10) }))}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preload Warden Modal */}
      {showPreloadModal && (
        <div className="modal-backdrop" onClick={() => setShowPreloadModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pre-load Warden Roster</h3>
            <form onSubmit={handlePreloadWarden}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">College ID Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. W-MALE-301"
                    value={newPreload.collegeIdNumber}
                    onChange={e => setNewPreload(prev => ({ ...prev, collegeIdNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={newPreload.fullName}
                    onChange={e => setNewPreload(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rajesh.khanna@hostelpulse.edu"
                  value={newPreload.email}
                  onChange={e => setNewPreload(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={newPreload.gender}
                    onChange={e => setNewPreload(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hostel Block</label>
                  <select
                    className="form-select"
                    value={newPreload.blockId}
                    onChange={e => setNewPreload(prev => ({ ...prev, blockId: e.target.value }))}
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreloadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Pre-load Warden</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Account Modal */}
      {showStaffModal && (
        <div className="modal-backdrop" onClick={() => setShowStaffModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create Operational Staff Account</h3>
            <form onSubmit={handleCreateStaff}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={newStaff.role}
                    onChange={e => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="health_assistant">Health Assistant</option>
                    <option value="security">Security</option>
                    <option value="mess">Mess Staff</option>
                    <option value="admin">Chief Warden (Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Staff ID Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MAINT-202"
                    value={newStaff.staffIdNumber}
                    onChange={e => setNewStaff(prev => ({ ...prev, staffIdNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Patel"
                  value={newStaff.fullName}
                  onChange={e => setNewStaff(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="staff@hostelpulse.edu"
                    value={newStaff.email}
                    onChange={e => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 9777700009"
                    value={newStaff.phone}
                    onChange={e => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Maintenance Specialisations & Active Flag */}
              {newStaff.role === 'maintenance' && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                    Maintenance Specialisation Categories (For Auto-Dispatch)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                    {['Plumbing & Water Supply', 'Electrical & Lighting', 'Carpentry & Furniture', 'Wi-Fi & LAN Network', 'Room & Floor Hygiene'].map(cat => {
                      const checked = (newStaff.specialisations || []).includes(cat);
                      return (
                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: checked ? '#93c5fd' : 'var(--text-secondary)' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              const curr = newStaff.specialisations || [];
                              const updated = e.target.checked ? [...curr, cat] : curr.filter(c => c !== cat);
                              setNewStaff(prev => ({ ...prev, specialisations: updated }));
                            }}
                            style={{ accentColor: 'var(--accent-indigo)' }}
                          />
                          {cat}
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="staffActiveToggle"
                      checked={newStaff.isActive !== false}
                      onChange={e => setNewStaff(prev => ({ ...prev, isActive: e.target.checked }))}
                      style={{ accentColor: 'var(--accent-emerald)', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="staffActiveToggle" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Mark Technician as <b>Active</b> for complaint assignment
                    </label>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStaffModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
