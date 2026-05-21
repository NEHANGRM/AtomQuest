import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Send, AlertCircle, Network } from 'lucide-react';
import api from '../../services/api';

const goalSchema = z.object({
  thrustArea: z.string().min(2, "Required"),
  title: z.string().min(5, "Title too short"),
  description: z.string().optional(),
  uomType: z.enum(['Numeric', 'Percentage', 'Timeline', 'Zero-based']),
  direction: z.enum(['Higher', 'Lower']).optional(),
  target: z.number().min(1, "Must be > 0"),
  weightage: z.number().min(10, "Min 10%").max(100, "Max 100%"),
  timeline: z.string().min(2, "Required"),
  isShared: z.boolean().optional(),
  sharedGoalId: z.string().optional()
});

const formSchema = z.object({
  year: z.string().min(4),
  goals: z.array(goalSchema).min(1, "At least 1 goal is required").max(8, "Maximum 8 goals allowed")
});

const GoalCreationForm = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedSharedGoals, setAssignedSharedGoals] = useState([]);

  React.useEffect(() => {
    api.get('/api/shared-goals/employee')
      .then(res => setAssignedSharedGoals(res.data))
      .catch(err => console.error(err));
  }, []);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      goals: [{ thrustArea: '', title: '', description: '', uomType: 'Numeric', direction: 'Higher', target: 100, weightage: 10, timeline: 'Q4' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "goals" });
  const watchGoals = watch("goals");
  const totalWeightage = watchGoals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  const processSubmission = async (data, status) => {
    if (status === 'submitted' && totalWeightage !== 100) {
      toast.error('Total weightage must be exactly 100% to submit.');
      return;
    }
    if (status === 'draft' && totalWeightage > 100) {
      toast.error('Total weightage cannot exceed 100%.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/api/goals', { ...data, status });
      toast.success(`Goal sheet successfully ${status === 'draft' ? 'saved as draft' : 'submitted'}`);
      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Goal Sheet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define your KPIs for the year. Max 8 goals. Total weightage must be exactly 100%.</p>
        </div>
        <div className="flex space-x-3">
          <div className={`px-4 py-2 rounded-xl font-bold transition-colors ${totalWeightage === 100 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-350' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'}`}>
            Total Weightage: {totalWeightage}%
          </div>
        </div>
      </div>

      <form className="space-y-8">
        <div className="w-48">
          <label className="label-text">Performance Year</label>
          <select {...register("year")} className="input-field">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {assignedSharedGoals.length > 0 && (
          <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-200 dark:border-brand-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-brand-900 dark:text-brand-300 mb-3 flex items-center">
              <Network className="w-4 h-4 mr-1.5 text-brand-500" /> Department KPIs assigned to you
            </h3>
            <div className="space-y-3">
              {assignedSharedGoals.map(sg => {
                const isAlreadyAdded = watchGoals.some(g => g.sharedGoalId === sg._id);
                return (
                  <div key={sg._id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-brand-100 dark:border-brand-800/80 shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{sg.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Target: {sg.target} {sg.uomType} | {sg.thrustArea}</p>
                    </div>
                    <button 
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => append({ thrustArea: sg.thrustArea, title: sg.title, description: sg.description, uomType: sg.uomType, direction: sg.direction, target: sg.target, weightage: 10, timeline: sg.timeline, isShared: true, sharedGoalId: sg._id })}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-350 text-white text-xs font-semibold rounded-xl transition"
                    >
                      {isAlreadyAdded ? 'Added' : 'Add to Sheet'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 relative group transition-all hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Goal #{index + 1}</h4>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <label className="label-text">Thrust Area</label>
                  <input readOnly={watchGoals[index]?.isShared} {...register(`goals.${index}.thrustArea`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`} placeholder="e.g. Sales, Tech" />
                  {errors.goals?.[index]?.thrustArea && <p className="text-red-500 text-xs mt-1">{errors.goals[index].thrustArea.message}</p>}
                </div>
                
                <div className="lg:col-span-2">
                  <label className="label-text">Goal Title {watchGoals[index]?.isShared && <span className="text-brand-650 text-[10px] ml-1 bg-brand-100 dark:bg-brand-900/30 px-1.5 py-0.5 rounded font-bold">SHARED KPI</span>}</label>
                  <input readOnly={watchGoals[index]?.isShared} {...register(`goals.${index}.title`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`} placeholder="e.g. Increase Q1 Revenue" />
                  {errors.goals?.[index]?.title && <p className="text-red-500 text-xs mt-1">{errors.goals[index].title.message}</p>}
                </div>

                <div className="lg:col-span-1">
                  <label className="label-text">Timeline</label>
                  <select disabled={watchGoals[index]?.isShared} {...register(`goals.${index}.timeline`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-white dark:bg-slate-900'}`}>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                    <option value="H1">H1</option>
                    <option value="H2">H2</option>
                    <option value="Full Year">Full Year</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="label-text">Description (Optional)</label>
                  <input readOnly={watchGoals[index]?.isShared} {...register(`goals.${index}.description`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`} placeholder="Detailed criteria..." />
                </div>

                <div className="lg:col-span-1">
                  <label className="label-text">UoM Type</label>
                  <select disabled={watchGoals[index]?.isShared} {...register(`goals.${index}.uomType`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-white dark:bg-slate-900'}`}>
                    <option value="Numeric">Numeric</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>
                </div>

                {(watchGoals[index]?.uomType === 'Numeric' || watchGoals[index]?.uomType === 'Percentage') && (
                  <div className="lg:col-span-1">
                    <label className="label-text">Optimization</label>
                    <select disabled={watchGoals[index]?.isShared} {...register(`goals.${index}.direction`)} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-white dark:bg-slate-900'}`}>
                      <option value="Higher">Higher is Better</option>
                      <option value="Lower">Lower is Better</option>
                    </select>
                  </div>
                )}

                <div className={`lg:col-span-1 grid grid-cols-2 gap-3 ${(watchGoals[index]?.uomType === 'Numeric' || watchGoals[index]?.uomType === 'Percentage') ? 'col-span-1' : 'col-span-2'}`}>
                  <div>
                    <label className="label-text">Target</label>
                    <input type="number" readOnly={watchGoals[index]?.isShared} {...register(`goals.${index}.target`, { valueAsNumber: true })} className={`input-field ${watchGoals[index]?.isShared ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`} />
                    {errors.goals?.[index]?.target && <p className="text-red-500 text-xs mt-1">{errors.goals[index].target.message}</p>}
                  </div>
                  <div>
                    <label className="label-text">Weightage (%)</label>
                    <input type="number" {...register(`goals.${index}.weightage`, { valueAsNumber: true })} className="input-field" />
                    {errors.goals?.[index]?.weightage && <p className="text-red-500 text-xs mt-1">{errors.goals[index].weightage.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.goals?.root && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm">
            <AlertCircle size={16} className="mr-2" /> {errors.goals.root.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <button 
              type="button" 
              disabled={fields.length >= 8}
              onClick={() => {
                if (fields.length < 8) {
                  append({ thrustArea: 'Revenue Growth', title: '', description: '', uomType: 'Numeric', direction: 'Higher', target: 100, weightage: 10, timeline: 'Q4' });
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center text-sm font-semibold text-brand-650 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/10 dark:hover:bg-brand-950/20 px-5 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} className="mr-2" /> Add Another Goal
            </button>
            {fields.length >= 8 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                (Maximum limit of 8 goals reached for this cycle)
              </span>
            )}
          </div>

          <div className="flex w-full sm:w-auto space-x-3">
            <button 
              type="button" 
              disabled={isSubmitting}
              onClick={handleSubmit((data) => processSubmission(data, 'draft'))}
              className="btn-secondary"
            >
              <Save size={18} className="mr-2" /> Save Draft
            </button>
            <button 
              type="button" 
              disabled={isSubmitting}
              onClick={handleSubmit((data) => processSubmission(data, 'submitted'))}
              className="btn-primary"
            >
              <Send size={18} className="mr-2" /> Submit Goals
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GoalCreationForm;
