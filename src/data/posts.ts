export type Post = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readingTime: string;
  content: string[];
};

export const posts: Post[] = [
  {
    title: "Why I’m Building Vector Network",
    slug: "why-im-building-vector-network",
    excerpt:
      "The thinking behind a decentralized vector-based economic system and the problem it aims to solve.",
    publishedAt: "2026-05-08",
    category: "Founding",
    tags: ["Web3", "DeFi", "Systems"],
    readingTime: "4 min read",
    content: [
      "Vector Network is my long-term vision for a decentralized economic system where value can move, evolve, and interact intelligently.",
      "I am building it because I believe traditional financial structures are too static for the way digital economies should operate.",
      "The goal is not only to create another blockchain product, but to design a new framework for trust, lending, staking, and programmable value.",
    ],
  },
  {
    title: "How I Think About Systems as a Developer",
    slug: "how-i-think-about-systems",
    excerpt:
      "A practical view of product engineering, infrastructure thinking, and building software that scales.",
    publishedAt: "2026-05-08",
    category: "Engineering",
    tags: ["Architecture", "Product", "Backend"],
    readingTime: "3 min read",
    content: [
      "I do not just think about features. I think about the structure behind the features.",
      "Good software should be usable, scalable, and maintainable under real-world conditions.",
      "That mindset shapes how I approach frontend, backend, APIs, blockchain tools, and product design.",
    ],
  },
];

export function getAllPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}