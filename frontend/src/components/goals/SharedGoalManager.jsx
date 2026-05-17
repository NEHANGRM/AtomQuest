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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Network className="w-6 h-6 mr-2 text-blue-600" /> Department KPIs (Shared Goals)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Push top-down objectives to your team. Changes to targets sync automatically.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} className="mr-1"/> Create KPI</>}
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Thrust Area</label>
                <input {...register('thrustArea')} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" placeholder="e.g. Finance" />
                {errors.thrustArea && <p className="text-red-500 text-xs mt-1">{errors.thrustArea.message}</p>}
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Goal Title</label>
                <input {...register('title')} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" placeholder="e.g. Reduce Q2 operational costs by 10%" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Timeline</label>
                <select {...register('timeline')} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="H1">H1</option>
                  <option value="H2">H2</option>
                  <option value="Full Year">Full Year</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">UoM Type</label>
                <select {...register('uomType')} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="Numeric">Numeric</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                <input type="number" {...register('target', { valueAsNumber: true })} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
                {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target.message}</p>}
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input {...register('description')} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" placeholder="Details..." />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 mt-4">
              <label className="block text-sm font-medium text-gray-800 mb-3 mt-2">Assign to Team Members</label>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No team members found. They may need to sign in first.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {teamMembers.map(member => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => toggleEmployeeSelection(member._id)}
                      className={`flex items-center px-4 py-2 rounded-full border text-sm transition-all ${selectedEmployees.includes(member._id) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {selectedEmployees.includes(member._id) ? <Check size={16} className="mr-2" /> : <Users size={16} className="mr-2" />}
                      {member.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                {isSubmitting ? 'Pushing to Team...' : 'Create & Assign KPI'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {sharedGoals.length === 0 && !isCreating && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Target size={32} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-gray-900 font-medium">No Department KPIs</h3>
            <p className="text-sm text-gray-500">Create a shared goal to automatically distribute it to your team.</p>
          </div>
        )}
        {sharedGoals.map(sg => (
          <div key={sg._id} className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{sg.title}</h4>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{sg.thrustArea}</span>
                  <span>Target: <strong>{sg.target} {sg.uomType}</strong></span>
                  <span>Timeline: <strong>{sg.timeline}</strong></span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-blue-600 transition"><Edit2 size={18} /></button>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Assigned To ({sg.assignedTo.length})</p>
              <div className="flex flex-wrap gap-2">
                {sg.assignedTo.map(emp => (
                  <span key={emp._id} className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
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
