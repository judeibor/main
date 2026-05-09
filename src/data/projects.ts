export type Project = {
  title: string;
  description: string;
  stack: string[];
  impact: string;
  slug: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Vector Network (vNetwork)",
    description:
      "A decentralized vector-based economic system designed to redefine value, trust, lending, staking, and digital economies.",
    stack: ["vectors", "System Design", "DeFi", "Smart Contracts"],
    impact:
      "Long-term infrastructure vision for programmable value movement and decentralized economic behavior.",
    slug: "vector-network",
    featured: true,
  },
  {
    title: "Developer Portfolio Platform",
    description:
      "A personal brand website with projects, blog, resume, and contact pages built for SEO and discoverability.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "SEO"],
    impact:
      "Professional online presence for recruiters, collaborators, and the public.",
    slug: "portfolio-platform",
    featured: true,
  },
  {
    title: "Web3 Research & Prototyping",
    description:
      "Exploration of decentralized systems, trust models, and economic mechanisms for future digital infrastructure.",
    stack: ["Research", "Web3", "Architecture", "Prototyping"],
    impact:
      "Builds the foundation for long-term product thinking and system innovation.",
    slug: "web3-research",
    featured: true,
  },
];