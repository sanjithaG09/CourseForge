import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './Profile.css';

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder, required, autoComplete = 'new-password' }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw-input-wrap">
      <input
        className="input-field"
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="pw-toggle-btn"
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nameForm, setNameForm] = useState({ name: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [activeTab, setActiveTab] = useState('general');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await authAPI.getProfile();
      setProfile(res.data);
      setNameForm({ name: res.data.name });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const saveName = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile({ name: nameForm.name });
      await refreshProfile();
      toast.success('Name updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.changeEmail(emailForm);
      toast.success('Email updated!');
      setEmailForm({ newEmail: '', password: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await authAPI.deleteAccount();
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="page-inner"><div className="skeleton" style={{height:200,borderRadius:20}} /></div>;

  return (
    <div className="page-inner fade-in">
      <div className="prof-header">
        <div className="prof-avatar-lg">{profile?.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className="prof-name">{profile?.name}</h1>
          <div className="prof-email">{profile?.email}</div>
          <span className={`badge badge-${profile?.role === 'instructor' ? 'purple' : 'green'}`}>{profile?.role}</span>
        </div>
      </div>

      <div className="prof-tabs">
        {['general','email','password'].map(tab => (
          <button key={tab} className={`prof-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="prof-card">
        {activeTab === 'general' && (
          <form onSubmit={saveName}>
            <h2 className="prof-section-title">General Settings</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input-field" value={nameForm.name} onChange={e => setNameForm({name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="input-field" value={profile?.email} readOnly style={{opacity:0.6}} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="input-field" value={profile?.role} readOnly style={{opacity:0.6}} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <><div className="spinner"/>Saving...</> : 'Save Changes'}
            </button>

            <div className="delete-account-section">
              <h3 className="delete-account-title">Danger Zone</h3>
              <p className="delete-account-desc">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
              {!showDeleteConfirm ? (
                <button className="btn btn-danger-outline" type="button" onClick={() => setShowDeleteConfirm(true)}>
                  Delete My Account
                </button>
              ) : (
                <div className="delete-confirm-box">
                  <p className="delete-confirm-text">⚠️ Are you absolutely sure? This cannot be undone.</p>
                  <div className="delete-confirm-btns">
                    <button className="btn btn-danger" type="button" disabled={deletingAccount} onClick={handleDeleteAccount}>
                      {deletingAccount ? <><div className="spinner"/>Deleting...</> : 'Yes, Delete Forever'}
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={saveEmail}>
            <h2 className="prof-section-title">Change Email</h2>
            <div className="form-group">
              <label className="form-label">New Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="newemail@example.com"
                value={emailForm.newEmail}
                onChange={e => setEmailForm({...emailForm, newEmail: e.target.value})}
                autoComplete="off"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Password (to confirm)</label>
              <PasswordInput
                placeholder="Enter your current password"
                value={emailForm.password}
                onChange={e => setEmailForm({...emailForm, password: e.target.value})}
                autoComplete="new-password"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <><div className="spinner"/>Updating...</> : 'Update Email'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={savePassword}>
            <h2 className="prof-section-title">Change Password</h2>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <PasswordInput
                placeholder="Enter your current password"
                value={pwForm.oldPassword}
                onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <PasswordInput
                placeholder="Min 6 characters"
                value={pwForm.newPassword}
                onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <PasswordInput
                placeholder="Repeat new password"
                value={pwForm.confirm}
                onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <><div className="spinner"/>Updating...</> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
