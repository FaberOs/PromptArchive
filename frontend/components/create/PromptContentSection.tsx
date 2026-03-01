"use client";

import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import type { CreateFormData } from '@/hooks/useCreatePrompt';
import { Textarea } from '@/components/ui/Textarea';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { Plus, X, FileText, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptContentSectionProps {
  form: UseFormReturn<CreateFormData>;
  fieldArray: UseFieldArrayReturn<CreateFormData, 'positive_prompts'>;
  promptType: string;
}

export function PromptContentSection({ form, fieldArray, promptType }: PromptContentSectionProps) {
  const { register } = form;
  const { fields, append, remove } = fieldArray;

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex flex-col lg:flex-1">
      {/* Format toggle row */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Prompt</span>
        </div>
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
          <label
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
              promptType === 'structured'
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <input type="radio" value="structured" {...register('prompt_type')} className="sr-only" />
            <FileText className="w-3 h-3" /> Standard
          </label>
          <label
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
              promptType === 'json'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <input type="radio" value="json" {...register('prompt_type')} className="sr-only" />
            <Code className="w-3 h-3" /> JSON
          </label>
        </div>
      </div>

      {/* Dynamic content */}
      {promptType === 'structured' ? (
        <div className="flex flex-col gap-4 lg:flex-1">
          <div className="flex flex-col lg:flex-1">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <FieldLabel tip="The main generation prompt. Add up to 3 slots to break it into logical sections.">
                Positive Prompts
              </FieldLabel>
              {fields.length < 3 && (
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add slot
                </button>
              )}
            </div>
            <div className="space-y-2 flex flex-col lg:flex-1">
              {fields.map((field, index) => (
                <div key={field.id} className="relative group flex flex-col min-h-[100px] lg:flex-1">
                  <Textarea
                    {...register(`positive_prompts.${index}.value`, { required: true })}
                    placeholder={
                      index === 0
                        ? 'masterpiece, best quality, 1girl, cityscape…'
                        : `Section ${index + 1} — e.g. lighting, background…`
                    }
                    className="min-h-[100px] lg:min-h-0 flex-1 pr-8 text-sm resize-y"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 p-0.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <FieldLabel tip="Words/phrases the model should avoid.">Negative Prompt</FieldLabel>
            <Textarea
              {...register('negative_prompt')}
              placeholder="low quality, blurry, watermark, extra fingers…"
              className="min-h-[60px] text-sm resize-y"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-1">
          <FieldLabel tip="Paste a full ComfyUI, InvokeAI, or other JSON workflow.">JSON Workflow</FieldLabel>
          <Textarea
            {...register('positive_prompts.0.value', { required: true })}
            placeholder='{ "nodes": [ ... ] }'
            className="min-h-[250px] lg:flex-1 font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/40 resize-y"
          />
        </div>
      )}
    </div>
  );
}
