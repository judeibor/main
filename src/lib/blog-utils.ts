export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function countWords(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*`_\-\[\]()!]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadingTime(content: string) {
  const words = countWords(content);
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}