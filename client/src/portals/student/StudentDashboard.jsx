import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { api } from '../../shared/api';
import {
  Shield,
  User,
  Phone,
  Mail,
  Building,
  Utensils,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Lock,
  HeartPulse,
  Save,
  Moon,
} from 'lucide-react';

export function StudentDashboard({ activeTab = 'dashboard' }) {
  const { user, assignedWardens, refreshProfile } = useAuth();
  const student = user?.student;

  // Meal preference state
  const [weeklyMenus, setWeeklyMenus] = useState([]);
  const [cutoffConfig, setCutoffConfig] = useState({ hour: 21, minute: 0 });
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default tomorrow
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [studentPrefs, setStudentPrefs] = useState([]);
  const [loadingFood, setLoadingFood] = useState(false);
  const [foodMsg, setFoodMsg] = useState(null);
  const [foodError, setFoodError] = useState(null);

  // Profile update state
  const [phone, setPhone] = useState(user?.phone || '');
  const [allergies, setAllergies] = useState(student?.allergies || '');
  const [emergencyContact, setEmergencyContact] = useState(student?.emergencyContact || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Load food menu and preferences
  async function loadFoodData() {
    setLoadingFood(true);
    try {
      const menuRes = await api.get('/food/menu');
      if (menuRes.success) {
        setWeeklyMenus(menuRes.data.menus || []);
        if (menuRes.data.cutoffConfig) setCutoffConfig(menuRes.data.cutoffConfig);
      }
      const prefRes = await api.get('/food/preferences');
      if (prefRes.success) {
        setStudentPrefs(prefRes.data.preferences || []);
      }
    } catch (err) {
      console.warn('Failed to load food menu:', err.message);
    } finally {
      setLoadingFood(false);
    }
  }

  useEffect(() => {
    loadFoodData();
  }, []);

  async function handleSelectPreference(mealType, optionId) {
    setFoodMsg(null);
    setFoodError(null);
    try {
      const res = await api.post('/food/preferences', {
        mealDate: selectedDate,
        mealType,
        selectedOptionId: optionId,
      });
      if (res.success) {
        setFoodMsg(res.data.message);
        loadFoodData();
      }
    } catch (err) {
      setFoodError(err.message || 'Failed to update preference.');
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileError(null);
    try {
      const res = await api.put('/auth/profile', {
        phone,
        allergies,
        emergencyContact,
        parentPhone,
      });
      if (res.success) {
        setProfileMsg('Profile details successfully updated.');
        refreshProfile();
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  }

  // Calculate day of week for selectedDate
  const targetDateObj = new Date(selectedDate);
  const targetDayOfWeek = targetDateObj.getDay();
  const menusForSelectedDay = weeklyMenus.filter(m => m.day_of_week === targetDayOfWeek);

  // Check if cutoff has passed for selectedDate
  const [year, month, day] = selectedDate.split('-').map(Number);
  const cutoffDate = new Date(year, month - 1, day - 1, cutoffConfig.hour, cutoffConfig.minute, 0);
  const isCutoffLocked = Date.now() >= cutoffDate.getTime();

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.25rem' }}>
      {/* Tab: Dashboard / Assigned Warden Overview */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Welcome Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem 2rem',
              marginBottom: '1.75rem',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-approved" style={{ marginBottom: '0.5rem' }}>
                  Student Active
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                  Welcome back, {student?.fullName || user?.fullName}!
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Hostel ID: <span style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>{student?.laminatedIdNumber}</span> | Roll No: {student?.rollNumber}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Block</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{student?.blockName || 'Block A'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allocated Room</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{student?.roomNumber || 'Room 101'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Warden Information Card (Primary and Deputy) */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={22} color="#3b82f6" /> Assigned Hostel Wardens
            </h2>

            <div className="grid-2">
              {assignedWardens.map(w => (
                <div key={w.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  {/* Warden Photo / Avatar */}
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: w.is_night_deputy ? 'var(--grad-hover)' : 'var(--grad-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                      flexShrink: 0,
                    }}
                  >
                    {w.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className={`badge ${w.is_night_deputy ? 'badge-role' : 'badge-approved'}`} style={{ fontSize: '0.7rem' }}>
                        {w.is_night_deputy ? 'Night / Deputy Warden' : 'Chief Block Warden'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      {w.full_name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <Phone size={14} color="#10b981" /> <b>{w.phone}</b>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} /> {w.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid-3">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <Utensils size={28} color="#f59e0b" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Daily Mess Preference</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Select vegetarian, non-veg, or dietary meal options before the 9:00 PM cut-off.
              </p>
              <span className="badge badge-pending">Locks 9:00 PM Daily</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <HeartPulse size={28} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Medical & Allergy Note</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Registered allergies: <b>{student?.allergies || 'None'}</b>
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Emergency: {student?.emergencyContact || 'Not configured'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <Building size={28} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Hostel Rules & Outpass</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Campus gate closes at 10:00 PM. Digital outpasses integrate directly with mess reports.
              </p>
              <span className="badge badge-active">Module Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Food Module */}
      {activeTab === 'food' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Hostel Dining & Meal Selection
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Choose your next day's meal preferences. Daily cut-off: <b>{String(cutoffConfig.hour).padStart(2, '0')}:{String(cutoffConfig.minute).padStart(2, '0')}</b> (Choices lock automatically).
              </p>
            </div>

            {/* Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Calendar size={18} color="var(--accent-blue)" />
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Date:</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.35rem 0.65rem', width: 'auto', background: 'var(--bg-input)' }}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* Cut-off Lock Notice */}
          <div className={`alert ${isCutoffLocked ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: '1.5rem' }}>
            {isCutoffLocked ? (
              <>
                <Lock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <b>Choices Locked for {selectedDate}:</b> The cut-off deadline ({String(cutoffConfig.hour).padStart(2, '0')}:{String(cutoffConfig.minute).padStart(2, '0')} on previous day) has passed. If you did not make an explicit selection, the mess kitchen will serve the default hostel meal.
                </div>
              </>
            ) : (
              <>
                <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <b>Selection Open for {selectedDate}:</b> You can update your dish selection until <b>{String(cutoffConfig.hour).padStart(2, '0')}:{String(cutoffConfig.minute).padStart(2, '0')}</b> tonight.
                </div>
              </>
            )}
          </div>

          {foodMsg && <div className="alert alert-success">{foodMsg}</div>}
          {foodError && <div className="alert alert-error">{foodError}</div>}

          {/* Meals for Selected Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => {
              const menu = menusForSelectedDay.find(m => m.meal_type === mealType);
              const options = menu?.options ? (typeof menu.options === 'string' ? JSON.parse(menu.options) : menu.options) : [];
              const defaultOpt = options.find(o => o.isDefault) || options[0];

              // Current student preference for this date and meal
              const currentPref = studentPrefs.find(p => {
                const pDate = p.meal_date ? (p.meal_date.split ? p.meal_date.split('T')[0] : p.meal_date) : '';
                return pDate === selectedDate && p.meal_type === mealType;
              });

              const selectedOptionId = currentPref ? currentPref.selected_option_id : defaultOpt?.id;

              return (
                <div key={mealType} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge badge-role" style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                        {mealType}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                        {menu?.title || 'Daily Meal'}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Timing: <b>{menu?.start_time || '08:00'} - {menu?.end_time || '09:30'}</b>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {options.map(opt => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (!isCutoffLocked) {
                              handleSelectPreference(mealType, opt.id);
                            }
                          }}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                            background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                            cursor: isCutoffLocked ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isSelected ? '#93c5fd' : 'var(--text-primary)' }}>
                              {opt.name}
                            </span>
                            {opt.isDefault && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                Default
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                            {opt.tags?.map(t => (
                              <span key={t} style={{ fontSize: '0.65rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)', padding: '1px 6px', borderRadius: '3px' }}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: isSelected ? '#60a5fa' : 'var(--text-muted)', fontWeight: isSelected ? '700' : '400' }}>
                            {isSelected ? '✓ Selected Option' : isCutoffLocked ? 'Unavailable' : 'Click to select'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Student Profile */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem' }}>
              Student Profile & Emergency Records
            </h2>

            {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
            {profileError && <div className="alert alert-error">{profileError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={student?.fullName || user?.fullName} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Laminated Hostel ID</label>
                  <input type="text" className="form-input" value={student?.laminatedIdNumber || ''} disabled />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-input" value={student?.rollNumber || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">College Email</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hostel Block</label>
                  <input type="text" className="form-input" value={student?.blockName || 'Aryabhatta Boys Block A'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Allocated Room</label>
                  <input type="text" className="form-input" value={student?.roomNumber ? `Room ${student.roomNumber} (Floor ${student.floor})` : 'Room 101'} disabled />
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.5rem 0' }} />

              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Editable Contact Details
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Student Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Food Allergies / Medical Condition</label>
                  <input
                    type="text"
                    className="form-input"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%', padding: '0.85rem' }}>
                <Save size={18} /> Save Updated Contact Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
