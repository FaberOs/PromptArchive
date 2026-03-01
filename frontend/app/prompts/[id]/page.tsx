"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePromptDetail } from '@/hooks/usePromptDetail';
import type { Prompt, PromptEditData, PromptUpdatePayload } from '@/lib/types';
import { PromptDetailSkeleton } from '@/components/skeletons/PromptDetailSkeleton';
import { Button } from '@/components/ui/Button';
import { GitBranch, Edit2, Trash2, Save, X, Layout, EyeOff, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { bulkHide } from '@/lib/api';

import PromptBreadcrumbs from '@/components/prompt-detail/PromptBreadcrumbs';
import PromptMeta from '@/components/prompt-detail/PromptMeta';
import PromptGallery from '@/components/prompt-detail/PromptGallery';
import PromptTextContent from '@/components/prompt-detail/PromptTextContent';
import PromptThread from '@/components/prompt-detail/PromptThread';

export default function PromptDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    prompt, parentPrompt, variants, loading, error,
    updatePrompt, deletePrompt, uploadImages, deleteImage, refresh,
  } = usePromptDetail(id!);

  const [activeTab, setActiveTab] = useState<'details' | 'thread'>('details');
  const [previewVariant, setPreviewVariant] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editData, setEditData] = useState<PromptEditData | null>(null);

  useEffect(() => {
    if (prompt) {
      setEditData({
        title: prompt.title,
        description: prompt.description || '',
        positive_prompts: prompt.positive_prompts.map((p) => p.content),
        negative_prompt: prompt.negative_prompt,
        categories: prompt.categories.map((c) => c.name),
        tags: prompt.tags.map((t) => t.name).join(', '),
        prompt_type: prompt.prompt_type,
      });
    }
  }, [prompt]);

  if (loading) return <PromptDetailSkeleton />;
  if (error || !prompt || !editData)
    return <div className="p-10 text-center text-slate-500">{error || 'Prompt not found'}</div>;

  const handleSave = async () => {
    try {
      const payload: PromptUpdatePayload = {
        title: editData.title,
        description: editData.description,
        negative_prompt: editData.negative_prompt,
        positive_prompts: editData.positive_prompts.filter((p: string) => p.trim() !== ''),
        categories: editData.categories,
        tags: editData.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
        prompt_type: editData.prompt_type,
      };
      await updatePrompt(payload);
      setIsEditing(false);
      toast.success('Changes saved');
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const handleDelete = () => {
    toast('Delete this prompt and all its images?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deletePrompt();
            toast.success('Prompt deleted');
            router.push('/');
          } catch {
            toast.error('Failed to delete prompt');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const files = Array.from(e.target.files);
      if (prompt.images.length + files.length > 4) {
        toast.warning('Max 4 images allowed per prompt.');
        return;
      }
      await uploadImages(files);
      toast.success('Image(s) uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = (imageId: number) => {
    toast('Delete this image?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteImage(imageId);
            toast.success('Image deleted');
          } catch {
            toast.error('Failed to delete image');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const activeData = previewVariant || prompt;

  let variantLabel = 'Original';
  if (previewVariant) {
    const idx = variants.findIndex((v) => v.id === previewVariant.id);
    if (idx !== -1) variantLabel = `V${idx + 1}`;
  } else if (prompt.parent_id) {
    const idx = variants.findIndex((v) => v.id === prompt.id);
    if (idx !== -1) variantLabel = `V${idx + 1}`;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Hidden prompt banner */}
      {prompt.is_hidden && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-2 text-sm">
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <span>This prompt is hidden and won&apos;t appear in the library.</span>
          </div>
          <button
            onClick={async () => {
              try {
                await bulkHide({ prompt_ids: [prompt.id], folder_ids: [], hidden: false });
                toast.success('Prompt restored');
                refresh();
              } catch { toast.error('Failed to restore'); }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Restore
          </button>
        </div>
      )}

      {/* Hidden parent folder banner */}
      {prompt.folder?.is_hidden && !prompt.is_hidden && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <EyeOff className="w-4 h-4 flex-shrink-0" />
          <span>This prompt belongs to the hidden folder <strong>&ldquo;{prompt.folder.name}&rdquo;</strong>.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PromptBreadcrumbs prompt={prompt} parentPrompt={parentPrompt} />
        <div className="flex gap-2 shrink-0">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push(`/create?parent_id=${prompt.parent_id || prompt.id}`)}>
                <GitBranch className="w-4 h-4 mr-2" /> Variant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await bulkHide({ prompt_ids: [prompt.id], folder_ids: [], hidden: !prompt.is_hidden });
                    toast.success(prompt.is_hidden ? 'Prompt restored' : 'Prompt hidden');
                    refresh();
                  } catch { toast.error('Failed to update visibility'); }
                }}
                title={prompt.is_hidden ? 'Restore prompt' : 'Hide prompt'}
              >
                {prompt.is_hidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {prompt.is_hidden ? 'Show' : 'Hide'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('details')}
          className={cn(
            'px-5 py-2 text-sm font-medium flex items-center gap-2 rounded-lg transition-all',
            activeTab === 'details'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Layout className="w-4 h-4" /> Details
        </button>
        <button
          onClick={() => setActiveTab('thread')}
          className={cn(
            'px-5 py-2 text-sm font-medium flex items-center gap-2 rounded-lg transition-all',
            activeTab === 'thread'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <GitBranch className="w-4 h-4" />
          Variants
          {variants.length > 0 && (
            <span className="bg-slate-200 dark:bg-slate-600/60 px-2 py-0.5 rounded-full text-xs">{variants.length}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <>
          <PromptMeta prompt={prompt} isEditing={isEditing} editData={editData} setEditData={setEditData} />
          <PromptGallery
            prompt={prompt}
            variants={variants}
            isEditing={isEditing}
            previewVariant={previewVariant}
            setPreviewVariant={setPreviewVariant}
            onUploadImage={handleImageUpload}
            onDeleteImage={handleDeleteImage}
            uploadingImage={uploadingImage}
          />
          <PromptTextContent
            prompt={activeData}
            isEditing={isEditing}
            editData={editData}
            setEditData={setEditData}
            isPreviewingVariant={!!previewVariant}
            variantLabel={variantLabel}
          />
        </>
      ) : (
        <PromptThread prompt={prompt} rootItem={parentPrompt || (prompt.parent_id ? null : prompt)} variants={variants} />
      )}
    </div>
  );
}
