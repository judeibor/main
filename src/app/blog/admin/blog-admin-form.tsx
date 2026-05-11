"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";

type BlogAdminFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  initialPost?: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    tags: string[];
    content: string;
    coverImageAlt?: string | null;
    published?: boolean;
    featured?: boolean;
    images?: string[];
  };
};

type Step = 1 | 2 | 3 | 4;

export function BlogAdminForm({
  action,
  mode,
  initialPost,
}: BlogAdminFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [category, setCategory] = useState(initialPost?.category ?? "Web3");
  const [tags, setTags] = useState(
    initialPost?.tags?.join(", ") ?? "Vector Network, vNetwork, DeFi, Blockchain"
  );
  const [coverImageAlt, setCoverImageAlt] = useState(
    initialPost?.coverImageAlt ?? ""
  );
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? true);
  const [featured, setFeatured] = useState(initialPost?.featured ?? false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isGeneratingSlug, startGeneratingSlug] = useTransition();
  const [isClearingImages, startClearingImages] = useTransition();

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls([]);
      return;
    }

    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const parsedTags = useMemo(() => {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tags]);

  const wordCount = useMemo(() => {
    const text = `${title} ${excerpt} ${content}`.trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [title, excerpt, content]);

  const existingImages = initialPost?.images ?? [];
  const displayImageUrls =
    imagePreviewUrls.length > 0 ? imagePreviewUrls : existingImages;
  const coverPreviewUrl = displayImageUrls[0] || "";

  function generateSlugFromTitle() {
    const generated = title
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(generated);
  }

  function clearImages() {
    setImageFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function goNext() {
    setCurrentStep((step) => Math.min(4, (step + 1) as Step));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(1, (step - 1) as Step));
  }

  const steps = [
    { id: 1 as Step, label: "Basics" },
    { id: 2 as Step, label: "Writing" },
    { id: 3 as Step, label: "Media" },
    { id: 4 as Step, label: "Preview" },
  ];

  return (
    <div className="mt-8">
      <div className="mb-6 rounded-3xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {mode === "edit" ? "Edit post" : "Create post"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Move through the editor step by step. The final step shows the full preview.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>{currentStep}/4</span>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-950 transition-all dark:bg-zinc-100"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((step) => {
            const active = step.id === currentStep;
            const done = step.id < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={[
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                    : done
                    ? "border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <form
          action={action}
          className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          {mode === "edit" ? (
            <input
              type="hidden"
              name="originalSlug"
              value={initialPost?.slug ?? ""}
            />
          ) : null}

          <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {currentStep === 1 && "Step 1 · Basics"}
                {currentStep === 2 && "Step 2 · Writing"}
                {currentStep === 3 && "Step 3 · Media"}
                {currentStep === 4 && "Step 4 · Preview"}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {currentStep === 1 && "Set the slug, title, category, and tags."}
                {currentStep === 2 && "Write the excerpt and the main content."}
                {currentStep === 3 && "Upload images and set publishing options."}
                {currentStep === 4 && "Review the final post before saving."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => startGeneratingSlug(generateSlugFromTitle)}
              disabled={isGeneratingSlug}
              aria-busy={isGeneratingSlug}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isGeneratingSlug ? "Generating..." : "Generate slug"}
            </button>
          </div>

          <div className="grid gap-6 p-5 sm:p-6">
            {currentStep === 1 ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Slug"
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="what-is-vnetwork"
                  />
                  <Field
                    label="Title"
                    name="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What is Vector Network?"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Web3"
                  />
                  <Field
                    label="Tags"
                    name="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Vector Network, vNetwork, DeFi, Blockchain"
                    helpText="Separate tags with commas."
                  />
                </div>
              </>
            ) : null}

            {currentStep === 2 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    required
                    rows={4}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
                    placeholder="A short summary that should appear in search and previews."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={18}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
                    placeholder={`Write your content here.

Use image paths like:
![Alt text](/blog/what-is-vnetwork/1-cover-image.jpg)`}
                  />
                </div>
              </>
            ) : null}

            {currentStep === 3 ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      Upload images
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="postImages"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setImageFiles(Array.from(e.target.files ?? []))
                      }
                      className="mt-2 w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:border-zinc-700 dark:file:bg-zinc-100 dark:file:text-zinc-950"
                    />
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {mode === "edit"
                        ? "Uploading new images replaces the current post images."
                        : "Images are stored in PostgreSQL and served from /blog/&lt;slug&gt;/&lt;fileName&gt;."}
                    </p>
                  </div>

                  <Field
                    label="Cover image alt text"
                    name="coverImageAlt"
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="Vector Network concept illustration"
                    helpText="Used for the first uploaded image."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      name="published"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    Published
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    Featured
                  </label>
                </div>

                <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {imageFiles.length} new images selected
                  </p>
                  <button
                    type="button"
                    onClick={() => startClearingImages(clearImages)}
                    disabled={isClearingImages}
                    aria-busy={isClearingImages}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {isClearingImages ? "Clearing..." : "Clear images"}
                  </button>
                </div>
              </>
            ) : null}

            {currentStep === 4 ? (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      alt={coverImageAlt || title || "Cover preview"}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
                      Cover image preview will appear here
                    </div>
                  )}
                </div>

                {displayImageUrls.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {displayImageUrls.slice(1).map((url, index) => (
                      <div
                        key={url}
                        className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
                      >
                        <img
                          src={url}
                          alt={`Uploaded image ${index + 2}`}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      {category || "Category"}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {title || "Post title preview"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {excerpt || "Your excerpt will appear here."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {parsedTags.length > 0 ? (
                      parsedTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        No tags yet
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 sm:grid-cols-2">
                    <div>
                      <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Slug
                      </span>
                      <span className="mt-1 block break-all font-medium text-zinc-900 dark:text-zinc-50">
                        {slug || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Status
                      </span>
                      <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-50">
                        {published ? "Published" : "Draft"}
                        {featured ? " · Featured" : ""}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Word count
                      </span>
                      <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-50">
                        {wordCount}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Images
                      </span>
                      <span className="mt-1 block font-medium text-zinc-900 dark:text-zinc-50">
                        {displayImageUrls.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-300">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Content preview
                    </p>
                    <p className="mt-2 whitespace-pre-wrap leading-6">
                      {content || "Your full content will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {wordCount} words · {parsedTags.length} tags · {imageFiles.length} new images
              </p>

              <div className="flex flex-wrap gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Back
                  </button>
                ) : null}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Next
                  </button>
                ) : (
                  <SubmitButton mode={mode} />
                )}
              </div>
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Live preview
            </h3>

            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                {coverPreviewUrl ? (
                  <img
                    src={coverPreviewUrl}
                    alt={coverImageAlt || title || "Cover preview"}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
                    Cover image preview will appear here
                  </div>
                )}
              </div>

              {displayImageUrls.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {displayImageUrls.slice(1).map((url, index) => (
                    <div
                      key={url}
                      className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
                    >
                      <img
                        src={url}
                        alt={`Uploaded image ${index + 2}`}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {category || "Category"}
                </p>
                <h4 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {title || "Post title preview"}
                </h4>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {excerpt || "Your excerpt will appear here."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {parsedTags.length > 0 ? (
                  parsedTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    No tags yet
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Quick notes
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <li>• The slug is the post key in the database.</li>
              <li>• Existing images stay visible until you upload new ones.</li>
              <li>• Uploading new images replaces the current set.</li>
              <li>• Tags are split by commas automatically.</li>
              <li>• The final step is the last review before saving.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
    >
      {pending
        ? mode === "edit"
          ? "Updating..."
          : "Saving..."
        : mode === "edit"
        ? "Update post"
        : "Save post"}
    </button>
  );
}

function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  required,
  helpText,
}: {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {label}
      </label>
      <input
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
      />
      {helpText ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
