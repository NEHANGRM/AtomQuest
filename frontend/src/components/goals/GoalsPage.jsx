import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Plus, FileEdit, Send, Eye, Trash2, ChevronDown,
  ChevronUp, Activity, CheckCircle, Clock, AlertCircle, RefreshCw, X, Save
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import GoalCreationForm from './GoalCreationForm';
import QuarterlyUpdateModal from './QuarterlyUpdateModal';
import { AuthContext } from '../../context/AuthContext';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: 'badge-warning',  icon: FileEdit },
  submitted: { label: 'Submitted', color: 'badge-info',     icon: Clock },
  approved:  { label: 'Approved',  color: 'badge-success',  icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: 'badge-danger',   icon: AlertCircle },
  returned:  { label: 'Returned',  color: 'badge-warning',  icon: RefreshCw },
};

const GoalStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const ProgressBar = ({ value }) => (
  <div className="progress-bar">
    <div
      className={`progress-fill ${value >= 100 ? 'bg-emerald-500' : value >= 60 ? 'bg-brand-500' : 'bg-amber-500'}`}
      style={{ width: `${Math.min(value || 0, 100)}%` }}
    />
  </div>
);

const GoalCard = ({ goal, onLogUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{goal.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{goal.thrustArea} · Target: {goal.target} {goal.uomType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 hidden sm:block">
            {goal.progressScore || 0}%
          </span>
          <div className="w-20 hidden sm:block">
            <ProgressBar value={goal.progressScore || 0} />
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block ${
            goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
            goal.status === 'On Track' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' :
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {goal.status || 'Not Started'}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              {goal.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{goal.description}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Weightage</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{goal.weightage}%</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Target</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{goal.target}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Progress</p>
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{goal.progressScore || 0}%</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Timeline</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{goal.timeline || 'Full Year'}</p>
                </div>
              </div>

              {goal.achievements?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Achievement History</p>
                  <div className="space-y-1.5">
                    {goal.achievements.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700 text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{a.quarter}</span>
                        <span className="text-brand-600 dark:text-brand-400 font-bold">{a.actualValue}</span>
                        {a.comments && <span className="text-slate-400 text-xs truncate max-w-[150px]">{a.comments}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {onLogUpdate && (
                <button
                  onClick={() => onLogUpdate(goal)}
                  className="btn-primary py-1.5 text-xs"
                >
                  <Activity className="w-3.5 h-3.5" /> Log Quarterly Update
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GoalSheetCard = ({ sheet, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeUpdateGoal, setActiveUpdateGoal] = useState(null);
  const progress = sheet.goals?.length
    ? Math.round(sheet.goals.reduce((s, g) => s + ((g.progressScore || 0) * (g.weightage / 100)), 0))
    : 0;
  const isRejected = sheet.status === 'rejected';

  return (
    <div className={`card overflow-hidden ${isRejected ? 'opacity-80' : ''}`}>
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg ${isRejected ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'}`}>
            {sheet.year?.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">FY {sheet.year}</h3>
              <GoalStatusBadge status={sheet.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {sheet.goals?.length || 0} goals · Overall progress {progress}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{progress}%</span>
            <div className="w-24 mt-1"><ProgressBar value={progress} /></div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      {/* Rejected banner */}
      {isRejected && sheet.managerComments && (
        <div className="mx-5 mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm">
          <p className="font-semibold text-red-700 dark:text-red-400 mb-0.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Goal Sheet Rejected
          </p>
          <p className="text-red-600 dark:text-red-400">{sheet.managerComments}</p>
          <p className="text-xs text-red-500 dark:text-red-500 mt-1.5">Please create a new goal sheet to re-submit your goals.</p>
        </div>
      )}

      {/* Returned (rework) banner */}
      {sheet.status === 'returned' && sheet.managerComments && (
        <div className="mx-5 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Manager Feedback</p>
          <p className="text-amber-700 dark:text-amber-400">{sheet.managerComments}</p>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-5 space-y-3">
              {isRejected && (
                <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400 italic">
                  This goal sheet was rejected. Goals are shown for reference only.
                </div>
              )}
              {sheet.goals?.length > 0 ? sheet.goals.map(goal => (
                <GoalCard key={goal._id} goal={goal} onLogUpdate={isRejected ? null : setActiveUpdateGoal} />
              )) : (
                <div className="empty-state py-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No goals in this sheet yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeUpdateGoal && (
        <QuarterlyUpdateModal
          goal={activeUpdateGoal}
          onClose={() => setActiveUpdateGoal(null)}
          onComplete={() => { setActiveUpdateGoal(null); onRefresh(); }}
        />
      )}
    </div>
  );
};


// ── Draft Editor ──────────────────────────────────────────────
const THRUST_AREAS = ['Revenue Growth', 'Customer Experience', 'Innovation', 'Operational Excellence', 'People & Culture', 'Compliance & Risk', 'Sales', 'Technology', 'Other'];
const TIMELINES = ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Full Year'];
const UOM_TYPES = ['Numeric', 'Percentage', 'Timeline', 'Zero-based'];

const emptyGoal = () => ({ thrustArea: 'Revenue Growth', title: '', description: '', uomType: 'Numeric', direction: 'Higher', target: 100, weightage: 10, timeline: 'Q4' });

const DraftEditor = ({ sheet, onClose, onSaved }) => {
  const [goals, setGoals] = useState(
    sheet.goals?.length > 0
      ? sheet.goals.map(g => ({
          thrustArea: g.thrustArea || '',
          title: g.title || '',
          description: g.description || '',
          uomType: g.uomType || 'Numeric',
          direction: g.direction || 'Higher',
          target: g.target ?? 100,
          weightage: g.weightage ?? 10,
          timeline: g.timeline || 'Q4',
          isShared: g.isShared || false,
          sharedGoalId: g.sharedGoalId,
        }))
      : [emptyGoal()]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeight = goals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);

  const updateGoal = (index, field, value) =>
    setGoals(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));

  const addGoal = () => {
    if (goals.length >= 8) { toast.error('Maximum 8 goals allowed.'); return; }
    setGoals(prev => [...prev, emptyGoal()]);
  };

  const removeGoal = (index) => {
    if (goals.length <= 1) { toast.error('At least 1 goal is required.'); return; }
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (status) => {
    if (goals.some(g => !g.title.trim() || !g.thrustArea.trim())) {
      toast.error('Please fill in Title and Thrust Area for all goals.');
      return;
    }
    if (status === 'submitted' && totalWeight !== 100) {
      toast.error(`Total weightage is ${totalWeight}%. Must be exactly 100% to submit.`);
      return;
    }
    if (status === 'submitted' && goals.some(g => Number(g.weightage) < 10)) {
      toast.error('Each goal must have at least 10% weightage.');
      return;
    }
    if (status === 'draft' && totalWeight > 100) {
      toast.error('Total weightage cannot exceed 100%.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.put(`/api/goals/sheet/${sheet._id}`, { goals, status });
      toast.success(status === 'submitted' ? 'Goal sheet submitted to your manager!' : 'Draft saved successfully!');
      onSaved();
      if (status === 'submitted') onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border-l-4 border-l-amber-400 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/30">
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-amber-500" /> Editing Draft — FY {sheet.year}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} · Total weightage:
            <span className={`font-bold ml-1 ${totalWeight === 100 ? 'text-emerald-600 dark:text-emerald-400' : totalWeight > 100 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {totalWeight}%
            </span>
            {totalWeight === 100 && <span className="ml-1 text-emerald-600 dark:text-emerald-400">✓</span>}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Goal Forms */}
      <div className="p-5 space-y-4">
        {goals.map((goal, idx) => (
          <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Goal #{idx + 1}{goal.isShared ? ' · Shared KPI' : ''}</span>
              <button type="button" onClick={() => removeGoal(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition" title="Remove goal">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Thrust Area */}
              <div>
                <label className="label-text">Thrust Area</label>
                <select
                  disabled={goal.isShared}
                  value={goal.thrustArea}
                  onChange={e => updateGoal(idx, 'thrustArea', e.target.value)}
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="label-text">Timeline</label>
                <select
                  disabled={goal.isShared}
                  value={goal.timeline}
                  onChange={e => updateGoal(idx, 'timeline', e.target.value)}
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {TIMELINES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="label-text">Goal Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  readOnly={goal.isShared}
                  value={goal.title}
                  onChange={e => updateGoal(idx, 'title', e.target.value)}
                  placeholder="e.g. Increase Q1 Revenue by 20%"
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label-text">Description <span className="text-slate-400 text-xs">(optional)</span></label>
                <input
                  type="text"
                  readOnly={goal.isShared}
                  value={goal.description}
                  onChange={e => updateGoal(idx, 'description', e.target.value)}
                  placeholder="Detailed success criteria..."
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* UoM Type */}
              <div>
                <label className="label-text">UoM Type</label>
                <select
                  disabled={goal.isShared}
                  value={goal.uomType}
                  onChange={e => updateGoal(idx, 'uomType', e.target.value)}
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {UOM_TYPES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>

              {/* Direction — only for Numeric / Percentage */}
              {(goal.uomType === 'Numeric' || goal.uomType === 'Percentage') && (
                <div>
                  <label className="label-text">Optimization</label>
                  <select
                    disabled={goal.isShared}
                    value={goal.direction || 'Higher'}
                    onChange={e => updateGoal(idx, 'direction', e.target.value)}
                    className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="Higher">Higher is Better</option>
                    <option value="Lower">Lower is Better</option>
                  </select>
                </div>
              )}

              {/* Target */}
              <div>
                <label className="label-text">Target</label>
                <input
                  type="number"
                  readOnly={goal.isShared}
                  value={goal.target}
                  onChange={e => updateGoal(idx, 'target', Number(e.target.value))}
                  className={`input-field ${goal.isShared ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Weightage */}
              <div>
                <label className="label-text">Weightage (%)</label>
                <input
                  type="number"
                  min="10" max="100"
                  value={goal.weightage}
                  onChange={e => updateGoal(idx, 'weightage', Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Goal Button */}
        <button
          type="button"
          onClick={addGoal}
          disabled={goals.length >= 8}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {goals.length >= 8 ? 'Maximum 8 goals reached' : 'Add Another Goal'}
        </button>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
        {totalWeight !== 100 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 sm:flex-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {totalWeight > 100 ? `Over by ${totalWeight - 100}% — reduce some weightages.` : `Need ${100 - totalWeight}% more — increase weightages to reach 100%.`}
          </p>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={isSubmitting || totalWeight !== 100}
            onClick={() => handleSave('submitted')}
            className="btn-primary flex items-center gap-2"
            title={totalWeight !== 100 ? `Weightage must total 100% (currently ${totalWeight}%)` : ''}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit to Manager'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main GoalsPage ────────────────────────────────────────────
const GoalsPage = () => {
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeDraft, setActiveDraft] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'drafts'

  const fetchSheets = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/goals/my');
      setSheets(data);
    } catch (err) {
      toast.error('Failed to load your goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSheets(); }, []);

  const drafts = sheets.filter(s => s.status === 'draft');
  const activeSheets = sheets.filter(s => s.status !== 'draft');

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">My Goals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {sheets.length} total · {drafts.length} drafts · {activeSheets.length} active sheets
          </p>
        </div>
        <button onClick={() => setShowCreateForm(s => !s)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Close Form' : 'New Goal Sheet'}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GoalCreationForm onComplete={() => { setShowCreateForm(false); fetchSheets(); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1">
        {[
          { key: 'active', label: 'Active Sheets', count: activeSheets.length },
          { key: 'drafts', label: 'Drafts', count: drafts.length, highlight: drafts.length > 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                : tab.highlight ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeSheets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Target className="w-6 h-6" /></div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active goal sheets yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Create a goal sheet and submit it to your manager to get started.
              </p>
              <button className="btn-primary mt-4" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4" /> Create Goal Sheet
              </button>
            </div>
          ) : (
            activeSheets.map(sheet => (
              <GoalSheetCard key={sheet._id} sheet={sheet} onRefresh={fetchSheets} />
            ))
          )}
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileEdit className="w-6 h-6" /></div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No drafts saved</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Save a goal sheet as a draft to edit it before submitting.
              </p>
            </div>
          ) : (
            drafts.map(sheet => (
              <div key={sheet._id}>
                {activeDraft?._id === sheet._id ? (
                  <DraftEditor sheet={sheet} onClose={() => setActiveDraft(null)} onSaved={fetchSheets} />
                ) : (
                  <div className="card p-5 border-l-4 border-l-amber-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <FileEdit className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-display font-bold text-slate-900 dark:text-white">FY {sheet.year}</p>
                            <span className="badge badge-warning">Draft</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {sheet.goals?.length || 0} goals · Weightage: {sheet.goals?.reduce((s, g) => s + Number(g.weightage || 0), 0) || 0}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDraft(sheet)}
                          className="btn-secondary text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View & Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
