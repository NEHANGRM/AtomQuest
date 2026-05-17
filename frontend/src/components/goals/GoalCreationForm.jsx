import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Send, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const goalSchema = z.object({
  thrustArea: z.string().min(2, "Required"),
  title: z.string().min(5, "Title too short"),
  description: z.string().optional(),
  uomType: z.enum(['Numeric', 'Percentage', 'Timeline', 'Zero-based']),
  target: z.number().min(1, "Must be > 0"),
  weightage: z.number().min(10, "Min 10%").max(100, "Max 100%"),
  timeline: z.string().min(2, "Required")
});

const formSchema = z.object({
  year: z.string().min(4),
  goals: z.array(goalSchema).min(1, "At least 1 goal is required").max(8, "Maximum 8 goals allowed")
});

const GoalCreationForm = ({ onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      goals: [{ thrustArea: '', title: '', description: '', uomType: 'Numeric', target: 100, weightage: 10, timeline: 'Q4' }]
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Goal Sheet</h2>
          <p className="text-sm text-gray-500 mt-1">Define your KPIs for the year. Max 8 goals. Total weightage must be exactly 100%.</p>
        </div>
        <div className="flex space-x-3">
          <div className={`px-4 py-2 rounded-lg font-bold transition-colors ${totalWeightage === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            Total Weightage: {totalWeightage}%
          </div>
        </div>
      </div>

      <form className="space-y-8">
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Performance Year</label>
          <select {...register("year")} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50/30 relative group transition-all hover:shadow-md hover:border-blue-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">Goal #{index + 1}</h4>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Thrust Area</label>
                  <input {...register(`goals.${index}.thrustArea`)} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none" placeholder="e.g. Sales, Tech" />
                  {errors.goals?.[index]?.thrustArea && <p className="text-red-500 text-xs mt-1">{errors.goals[index].thrustArea.message}</p>}
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Goal Title</label>
                  <input {...register(`goals.${index}.title`)} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none" placeholder="e.g. Increase Q1 Revenue" />
                  {errors.goals?.[index]?.title && <p className="text-red-500 text-xs mt-1">{errors.goals[index].title.message}</p>}
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Timeline</label>
                  <select {...register(`goals.${index}.timeline`)} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none bg-white">
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input {...register(`goals.${index}.description`)} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none" placeholder="Detailed criteria..." />
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">UoM Type</label>
                  <select {...register(`goals.${index}.uomType`)} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none bg-white">
                    <option value="Numeric">Numeric</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>
                </div>

                <div className="lg:col-span-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                    <input type="number" {...register(`goals.${index}.target`, { valueAsNumber: true })} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none" />
                    {errors.goals?.[index]?.target && <p className="text-red-500 text-xs mt-1">{errors.goals[index].target.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weightage (%)</label>
                    <input type="number" {...register(`goals.${index}.weightage`, { valueAsNumber: true })} className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 transition-shadow outline-none" />
                    {errors.goals?.[index]?.weightage && <p className="text-red-500 text-xs mt-1">{errors.goals[index].weightage.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.goals?.root && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm">
            <AlertCircle size={16} className="mr-2" /> {errors.goals.root.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
          <button 
            type="button" 
            onClick={() => {
              if (fields.length < 8) {
                append({ thrustArea: '', title: '', description: '', uomType: 'Numeric', target: 100, weightage: 10, timeline: 'Q4' });
              } else {
                toast.error("Maximum 8 goals allowed");
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg transition"
          >
            <Plus size={18} className="mr-2" /> Add Another Goal
          </button>

          <div className="flex w-full sm:w-auto space-x-3">
            <button 
              type="button" 
              disabled={isSubmitting}
              onClick={handleSubmit((data) => processSubmission(data, 'draft'))}
              className="flex-1 sm:flex-none flex items-center justify-center text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              <Save size={18} className="mr-2" /> Save Draft
            </button>
            <button 
              type="button" 
              disabled={isSubmitting}
              onClick={handleSubmit((data) => processSubmission(data, 'submitted'))}
              className="flex-1 sm:flex-none flex items-center justify-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg transition shadow-sm disabled:opacity-50"
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
