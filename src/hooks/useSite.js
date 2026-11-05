import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/platformClient";
import { DEFAULT_SECTIONS } from "@/lib/theme";

export const EMPTY_CONTENT = {
  brand_name: "SARA INTARCH",
  brand_tagline: "Interior Architecture Studio",
  accent: "mocha",
  display_font: "italiana",
  sections: DEFAULT_SECTIONS,
  nav_items: [],
};

const asItems = (result) => (Array.isArray(result) ? result : result?.items || []);

const isPreview = () =>
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("preview") === "1";

export function useSiteContent() {
  const query = useQuery({
    queryKey: ["site-content", isPreview()],
    queryFn: async () => {
      const result = await api.entities.SiteContent.list({ sort: "-created_date", limit: 1 });
      const record = asItems(result)[0] || null;
      let content = { ...EMPTY_CONTENT, ...(record || {}) };
      if (isPreview()) {
        try {
          const user = await api.auth.me();
          if (user?.role === "admin") {
            const drafts = asItems(
              await api.entities.SiteDraft.list({ sort: "-updated_date", limit: 1 })
            );
            if (drafts[0]?.payload) content = { ...content, ...drafts[0].payload };
          }
        } catch (error) {
          // visitors simply see the published site
        }
      }
      return { content, record };
    },
  });

  return {
    content: query.data?.content || EMPTY_CONTENT,
    record: query.data?.record || null,
    loading: query.isLoading,
    refresh: query.refetch,
  };
}

export function useProjects({ includeUnpublished = false } = {}) {
  const query = useQuery({
    queryKey: ["projects", includeUnpublished],
    queryFn: async () => {
      const filter = includeUnpublished ? {} : { published: { $ne: false } };
      const result = await api.entities.Project.filter(filter, {
        sort: "order",
        limit: 200,
      });
      return asItems(result);
    },
  });

  const projects = query.data || [];
  return {
    projects,
    loading: query.isLoading,
    refresh: query.refetch,
    featured: projects.filter((p) => p.featured),
  };
}

export function useServices() {
  const query = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await api.entities.Service.filter(
        { published: { $ne: false } },
        { sort: "order", limit: 100 }
      );
      return asItems(result);
    },
  });

  return { services: query.data || [], loading: query.isLoading, refresh: query.refetch };
}

export const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");