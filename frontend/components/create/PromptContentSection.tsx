"use client";

import { useId } from "react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { CreateFormData } from "@/hooks/useCreatePrompt";
import { Textarea } from "@/components/ui/Textarea";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { PromptTypeSwitch, type PromptTypeValue } from "@/components/ui/PromptTypeSwitch";
import { Plus, X, Sparkles } from "lucide-react";
import { FormSectionHeader } from "./FormSectionHeader";

interface PromptContentSectionProps {
  form: UseFormReturn<CreateFormData>;
  fieldArray: UseFieldArrayReturn<CreateFormData, "positive_prompts">;
  promptType: string;
}

export function PromptContentSection({ form, fieldArray, promptType }: PromptContentSectionProps) {
  const { register, setValue } = form;
  const { fields, append, remove } = fieldArray;
  const negativePromptId = useId();
  const jsonWorkflowId = useId();
  const positivePromptIdBase = useId();

  return (
    <div className="flex flex-col gap-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
      <FormSectionHeader
        icon={Sparkles}
        title="Prompt"
        description="Choose a prompt format, then archive the exact generation instructions."
      />
      <PromptTypeSwitch
        value={promptType as PromptTypeValue}
        onChange={(value) => setValue("prompt_type", value, { shouldDirty: true })}
        layout="block"
      />
      {promptType === "structured" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <FieldLabel tip="The main generation prompt. Add up to 3 slots to break it into logical sections.">
                Positive Prompt
              </FieldLabel>
              {fields.length < 3 && (
                <button
                  type="button"
                  onClick={() => append({ value: "" })}
                  className="flex items-center gap-1 text-[11px] font-medium text-pa-muted-soft transition-colors hover:text-pa-muted"
                >
                  <Plus className="h-3 w-3" /> Add slot
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => {
                const fieldId = `${positivePromptIdBase}-${index}`;

                return (
                  <div key={field.id} className="group relative flex min-h-[180px] flex-col">
                    <Textarea
                      id={fieldId}
                      variant="prompt"
                      aria-label={index === 0 ? "Positive prompt" : `Positive prompt section ${index + 1}`}
                      {...register(`positive_prompts.${index}.value`, {
                        required: true,
                      })}
                      placeholder={
                        index === 0
                          ? "masterpiece, best quality, 1girl, cityscape…"
                          : `Section ${index + 1} — e.g. lighting, background…`
                      }
                      className="min-h-[180px] flex-1 resize-y pr-8 text-sm"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove prompt slot ${index + 1}`}
                        className="absolute right-2 top-2 p-0.5 text-pa-muted-soft opacity-0 transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:text-pa-danger group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <FieldGroup label="Negative Prompt" info="Words/phrases the model should avoid." htmlFor={negativePromptId}>
            <Textarea
              id={negativePromptId}
              {...register("negative_prompt")}
              placeholder="low quality, blurry, watermark, extra fingers…"
              className="min-h-[96px] resize-y text-sm"
            />
          </FieldGroup>
        </div>
      ) : (
        <FieldGroup
          label="JSON Workflow"
          info="Paste a full ComfyUI, InvokeAI, or other JSON workflow."
          htmlFor={jsonWorkflowId}
        >
          <Textarea
            id={jsonWorkflowId}
            variant="json"
            {...register("positive_prompts.0.value", { required: true })}
            placeholder='{ "nodes": [ ... ] }'
            className="min-h-[280px] resize-y font-mono text-sm"
          />
        </FieldGroup>
      )}
    </div>
  );
}
