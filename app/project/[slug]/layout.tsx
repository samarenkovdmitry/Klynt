import type { Metadata } from "next";

import { supabase } from "@/lib/db/supabase";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  return buildPageMetadata({
    title: project?.name || "Project",
    path: `/project/${slug}`,
    index: false,
  });
}

export default function ProjectSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
