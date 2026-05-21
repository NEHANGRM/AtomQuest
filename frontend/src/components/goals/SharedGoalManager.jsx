import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Users, Edit2, Check, Network, Target } from 'lucide-react';
import api from '../../services/api';

const sharedGoalSchema = z.object({
  thrustArea: z.string().min(2, "Required"),
  title: z.string().min(5, "Title too short"),
  description: z.string().optional(),
  uomType: z.enum(['Numeric', 'Percentage', 'Timeline', 'Zero-based']),
  direction: z.enum(['Higher', 'Lower']).optional(),
  target: z.number().min(1, "Must be > 0"),
  timeline: z.string().min(2, "Required")
});

const SharedGoalManager = () => {
  const [sharedGoals, setSharedGoals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(sharedGoalSchema),
    defaultValues: {
      uomType: 'Numeric',
      direction: 'Higher',
      timeline: 'Full Year'
    }
  });

  const fetchData = async () => {
    try {
      const [goalsRes, teamRes] = await Promise.all([
        api.get('/api/shared-goals/manager'),
        api.get('/api/goals/team') // Team members can be extracted from here or a specific /team endpoint
      ]);
      setSharedGoals(goalsRes.data);
      
      // Extract unique team members from the team goal sheets route
      // A dedicated /api/users/team route would be better, but we'll adapt.
      const membersMap = new Map();
      teamRes.data.forEach(sheet => {
        if (sheet.user && !membersMap.has(sheet.user._id)) {
          membersMap.set(sheet.user._id, sheet.user);
        }
      });
      setTeamMembers(Array.from(membersMap.values()));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEmployeeSelection = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(e => e !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const onSubmit = async (data) => {
    if (selectedEmployees.length === 0) {
      toast.error('Please assign this goal to at least one employee.');
      return;
    }
    
    try {
      await api.post('/api/shared-goals', { ...data, assignedTo: selectedEmployees });
      toast.success('Shared Goal created and pushed to employees successfully!');
      setIsCreating(false);
      reset();
      setSelectedEmployees([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shared goal');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-white flex items-center">
            <Network className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-450" /> Department KPIs (Shared Goals)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Push top-down objectives to your team. Changes to targets sync automatically.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium transition"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} className="mr-1"/> Create KPI</>}
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <label className="label-text">Thrust Area</label>
                <input {...register('thrustArea')} className="input-field py-2 px-3" placeholder="e.g. Finance" />
                {errors.thrustArea && <p className="text-red-500 text-xs mt-1">{errors.thrustArea.message}</p>}
              </div>
              <div className="lg:col-span-2">
                <label className="label-text">Goal Title</label>
                <input {...register('title')} className="input-field py-2 px-3" placeholder="e.g. Reduce Q2 operational costs by 10%" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="lg:col-span-1">
                <label className="label-text">Timeline</label>
                <select {...register('timeline')} className="input-field py-2 px-3">
                  <option value="H1">H1</option>
                  <option value="H2">H2</option>
                  <option value="Full Year">Full Year</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="label-text">UoM Type</label>
                <select {...register('uomType')} className="input-field py-2 px-3">
                  <option value="Numeric">Numeric</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="label-text">Optimization</label>
                <select {...register('direction')} className="input-field py-2 px-3">
                  <option value="Higher">Higher is Better</option>
                  <option value="Lower">Lower is Better</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="label-text">Target</label>
                <input type="number" {...register('target', { valueAsNumber: true })} className="input-field py-2 px-3" />
                {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target.message}</p>}
              </div>
              <div className="lg:col-span-2">
                <label className="label-text">Description (Optional)</label>
                <input {...register('description')} className="input-field py-2 px-3" placeholder="Details..." />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <label className="label-text text-base">Assign to Team Members</label>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No team members found. They may need to sign in first.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {teamMembers.map(member => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => toggleEmployeeSelection(member._id)}
                      className={`flex items-center px-4 py-2 rounded-full border text-sm transition-all ${
                        selectedEmployees.includes(member._id) 
                          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {selectedEmployees.includes(member._id) ? <Check size={16} className="mr-2" /> : <Users size={16} className="mr-2" />}
                      {member.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={isSubmitting} type="submit" className="btn-primary px-6 py-2">
                {isSubmitting ? 'Pushing to Team...' : 'Create & Assign KPI'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {sharedGoals.length === 0 && !isCreating && (
          <div className="empty-state py-8">
            <div className="empty-state-icon mb-2">
              <Target size={24} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium text-base">No Department KPIs</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">Create a shared goal to automatically distribute it to your team.</p>
          </div>
        )}
        {sharedGoals.map(sg => (
          <div key={sg._id} className="card p-5 hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-lg">{sg.title}</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">{sg.thrustArea}</span>
                  <span>Target: <strong className="text-slate-700 dark:text-slate-350">{sg.target} {sg.uomType}</strong></span>
                  <span>Timeline: <strong className="text-slate-700 dark:text-slate-350">{sg.timeline}</strong></span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition"><Edit2 size={18} /></button>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Assigned To ({sg.assignedTo.length})</p>
              <div className="flex flex-wrap gap-2">
                {sg.assignedTo.map(emp => (
                  <span key={emp._id} className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-750">
                    {emp.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SharedGoalManager;
