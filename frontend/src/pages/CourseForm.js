import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { useToast } from '../components/Toast';
import './CourseForm.css';

const CATEGORIES = ['Web Development','Data Science','AI/ML','Mobile Dev','DevOps','Design','Business','Marketing'];
const LEVELS = ['beginner','intermediate','advanced'];

const emptyModule = () => ({ title: '', videoUrl: '', duration: '', order: 0, _id: `tmp_${Date.now()}` });

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', description: '', price: 0, category: '', level: 'beginner',
    thumbnail: '', tags: '', modules: [],
  });
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (isEdit) {
      courseAPI.getById(id).then(res => {
        const c = res.data;
        setForm({
          title: c.title || '', description: c.description || '',
          price: c.price || 0, category: c.category || '', level: c.level || 'beginner',
          thumbnail: c.thumbnail || '', tags: (c.tags || []).join(', '),
          modules: c.modules || [],
        });
        setIsPublished(c.isPublished || false);
      }).catch(() => toast.error('Failed to load course'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addModule = () => set('modules', [...form.modules, emptyModule()]);
  const removeModule = (idx) => set('modules', form.modules.filter((_, i) => i !== idx));
  const updateModule = (idx, k, v) => {
    const mods = [...form.modules];
    mods[idx] = { ...mods[idx], [k]: v };
    set('modules', mods);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await courseAPI.publish(id);
      setIsPublished(true);
      toast.success('Course published! Students can now find it in Browse Courses.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Title, description, and category are required'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        modules: form.modules.map((m, i) => ({ title: m.title, videoUrl: m.videoUrl, order: i })),
      };
      if (isEdit) {
        await courseAPI.update(id, payload);
        toast.success('Course updated!');
      } else {
        const res = await courseAPI.create(payload);
        toast.success('Course created as Draft. Click "Publish Course" to make it visible to students.');
        navigate(`/instructor/edit/${res.data.course._id}`);
        return;
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-inner"><div className="skeleton" style={{height:300,borderRadius:20}} /></div>;

  return (
    <div className="page-inner fade-in">
      <div className="cf-header">
        <h1 className="cf-title">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
        {isEdit && (
          <span className={`badge ${isPublished ? 'badge-green' : 'badge-amber'}`} style={{marginLeft:'auto'}}>
            {isPublished ? '● Published' : '○ Draft'}
          </span>
        )}
        {isEdit && !isPublished && (
          <button type="button" className="btn btn-sm" style={{background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(34,211,165,0.25)',flexShrink:0}}
            onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing...' : 'Publish Course'}
          </button>
        )}
      </div>

      <form onSubmit={submit} className="cf-form">
        <div className="cf-layout">
          <div className="cf-main">
            {/* Basic info */}
            <div className="cf-section">
              <h2 className="cf-section-title">Course Information</h2>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input className="input-field" placeholder="e.g. Complete React Developer Course"
                  value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="input-field cf-textarea" rows={4}
                  placeholder="What will students learn in this course?"
                  value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>
              <div className="cf-row">
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Category *</label>
                  <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label className="form-label">Level</label>
                  <select className="input-field" value={form.level} onChange={e => set('level', e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{width:140}}>
                  <label className="form-label">Price (₹)</label>
                  <input className="input-field" type="number" min={0} placeholder="0"
                    value={form.price} onChange={e => set('price', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input className="input-field" placeholder="https://..."
                  value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} />
                {form.thumbnail && <img src={form.thumbnail} alt="thumb" className="cf-thumb-preview" />}
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="input-field" placeholder="react, javascript, frontend"
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>

            {/* Modules */}
            <div className="cf-section">
              <div className="cf-section-header">
                <h2 className="cf-section-title">Curriculum</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addModule}>+ Add Module</button>
              </div>
              {form.modules.length === 0 ? (
                <div className="cf-empty-modules">
                  <span>📹</span>
                  <p>No modules yet. Add your first module to build the curriculum.</p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={addModule}>Add First Module</button>
                </div>
              ) : (
                <div className="cf-modules">
                  {form.modules.map((mod, idx) => (
                    <div key={mod._id || idx} className="cf-module-item">
                      <div className="cf-module-num">{idx + 1}</div>
                      <div className="cf-module-fields">
                        <input className="input-field" placeholder="Module title *"
                          value={mod.title} onChange={e => updateModule(idx, 'title', e.target.value)} required />
                        <input className="input-field" placeholder="Video URL (optional)"
                          value={mod.videoUrl} onChange={e => updateModule(idx, 'videoUrl', e.target.value)} />
                      </div>
                      <button type="button" className="btn btn-danger btn-sm cf-module-del" onClick={() => removeModule(idx)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="cf-sidebar">
            <div className="cf-publish-card">
              <h3 className="cf-publish-title">Publish Settings</h3>
              {isEdit && (
                <div style={{marginBottom:12}}>
                  <span className={`badge ${isPublished ? 'badge-green' : 'badge-amber'}`}>
                    {isPublished ? '● Published' : '○ Draft — not visible to students'}
                  </span>
                </div>
              )}
              <div className="cf-publish-info">
                <div className="cf-pub-item"><span>📚</span> {form.modules.length} modules</div>
                <div className="cf-pub-item"><span>₹</span> {form.price || 0}</div>
                <div className="cf-pub-item"><span>🏷</span> {form.category || 'No category'}</div>
                <div className="cf-pub-item"><span>📊</span> {form.level}</div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={saving}>
                {saving ? <><div className="spinner"/>Saving...</> : isEdit ? 'Save Changes' : 'Create Course'}
              </button>
              {isEdit && !isPublished && (
                <button type="button" className="btn btn-lg" style={{width:'100%',marginTop:8,background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(34,211,165,0.25)'}}
                  onClick={handlePublish} disabled={publishing}>
                  {publishing ? <><div className="spinner"/>Publishing...</> : 'Publish Course'}
                </button>
              )}
              {isEdit && (
                <button type="button" className="btn btn-secondary" style={{width:'100%',marginTop:8}}
                  onClick={() => navigate(`/courses/${id}`)}>View Course Page</button>
              )}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}