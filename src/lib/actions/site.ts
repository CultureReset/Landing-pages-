"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSite } from "@/lib/guard";
import {
  slugTaken,
  slugify,
  updateSite,
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
  siteById,
} from "@/lib/repo";
import { themeById } from "@/lib/themes";
import type { DayHours, SectionConfig, SectionId, SiteStat, ThemeConfig } from "@/lib/types";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

export interface ActionState {
  error?: string;
  ok?: boolean;
  message?: string;
}

/* ------------------------------------------------------------------ profile */

export async function saveProfileAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const str = (k: string) => String(form.get(k) ?? "").trim();

  const business_name = str("business_name");
  if (!business_name) return { error: "Your business needs a name." };

  updateSite(site.id, {
    business_name,
    owner_name: str("owner_name"),
    headline: str("headline"),
    tagline: str("tagline"),
    bio: str("bio"),
    business_type: str("business_type") as never,
    location: str("location"),
    address: str("address"),
    phone: str("phone"),
    email: str("email"),
    whatsapp: str("whatsapp"),
    website: str("website"),
    credential: str("credential"),
    avatar_url: str("avatar_url") || null,
    cover_url: str("cover_url") || null,
  });

  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function saveSlugAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const raw = String(form.get("slug") ?? "");
  const slug = slugify(raw);
  if (slug.length < 3) return { error: "Use at least 3 characters — letters, numbers and dashes." };
  if (slugTaken(slug, site.id)) return { error: "That address is already taken. Try another." };
  updateSite(site.id, { slug });
  refresh();
  return { ok: true, message: `Your page now lives at /p/${slug}` };
}

export async function saveSeoAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  updateSite(site.id, {
    seo: {
      title: String(form.get("seo_title") ?? "").trim().slice(0, 70),
      description: String(form.get("seo_description") ?? "").trim().slice(0, 200),
    },
  });
  refresh();
  return { ok: true, message: "Search preview updated." };
}

/* -------------------------------------------------------------------- theme */

export async function saveThemeAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const presetId = String(form.get("preset") ?? site.theme.preset);
  const preset = themeById(presetId);
  const usePreset = presetId !== site.theme.preset;

  const theme: ThemeConfig = {
    ...site.theme,
    ...(usePreset
      ? {
          preset: preset.id,
          bg: preset.bg,
          surface: preset.surface,
          text: preset.text,
          muted: preset.muted,
          accent: preset.accent,
          accentText: preset.accentText,
          border: preset.border,
        }
      : {}),
    accent: String(form.get("accent") ?? (usePreset ? preset.accent : site.theme.accent)),
    font: String(form.get("font") ?? site.theme.font) as ThemeConfig["font"],
    buttonStyle: String(form.get("buttonStyle") ?? site.theme.buttonStyle) as ThemeConfig["buttonStyle"],
    radius: String(form.get("radius") ?? site.theme.radius) as ThemeConfig["radius"],
    backdrop: String(form.get("backdrop") ?? site.theme.backdrop) as ThemeConfig["backdrop"],
    header: String(form.get("header") ?? site.theme.header) as ThemeConfig["header"],
    showcase: String(form.get("showcase") ?? site.theme.showcase) as ThemeConfig["showcase"],
  };

  updateSite(site.id, { theme });
  refresh();
  return { ok: true, message: "Theme updated." };
}

export async function applyPresetAction(presetId: string): Promise<void> {
  const { site } = await requireSite();
  const preset = themeById(presetId);
  updateSite(site.id, {
    theme: {
      ...site.theme,
      preset: preset.id,
      bg: preset.bg,
      surface: preset.surface,
      text: preset.text,
      muted: preset.muted,
      accent: preset.accent,
      accentText: preset.accentText,
      border: preset.border,
      font: preset.font,
      buttonStyle: preset.buttonStyle,
      radius: preset.radius,
      backdrop: preset.backdrop,
    },
  });
  refresh();
}

/* ----------------------------------------------------------------- sections */

export async function saveSectionsAction(sections: SectionConfig[]): Promise<void> {
  const { site } = await requireSite();
  const known = new Set(site.layout.map((s) => s.id as string));
  const clean = sections
    .filter((s) => known.has(s.id as string))
    .map((s) => ({ id: s.id as SectionId, title: String(s.title ?? "").slice(0, 60), enabled: !!s.enabled }));
  if (clean.length) updateSite(site.id, { layout: clean });
  refresh();
}

export async function toggleSectionAction(sectionId: string, enabled: boolean): Promise<void> {
  const { site } = await requireSite();
  updateSite(site.id, {
    layout: site.layout.map((s) => (s.id === sectionId ? { ...s, enabled } : s)),
  });
  refresh();
}

/* -------------------------------------------------------------------- stats */

export async function saveStatsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const stats: SiteStat[] = [];
  for (let i = 0; i < 3; i++) {
    const value = String(form.get(`stat_value_${i}`) ?? "").trim();
    const label = String(form.get(`stat_label_${i}`) ?? "").trim();
    if (value) stats.push({ value: value.slice(0, 12), label: label.slice(0, 32) });
  }
  updateSite(site.id, { stats });
  refresh();
  return { ok: true, message: "Highlights updated." };
}

/* -------------------------------------------------------------------- hours */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function saveHoursAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const hours: DayHours[] = DAYS.map((day) => ({
    day,
    open: String(form.get(`open_${day}`) ?? "09:00"),
    close: String(form.get(`close_${day}`) ?? "17:00"),
    closed: form.get(`closed_${day}`) === "on",
  }));
  updateSite(site.id, { hours });
  refresh();
  return { ok: true, message: "Opening hours saved." };
}

/* ------------------------------------------------------------------ gallery */

export async function saveGalleryAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const urls = String(form.get("gallery") ?? "")
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 24);
  updateSite(site.id, { gallery: urls });
  refresh();
  return { ok: true, message: `Gallery updated — ${urls.length} image${urls.length === 1 ? "" : "s"}.` };
}

export async function addGalleryImageAction(url: string): Promise<void> {
  const { site } = await requireSite();
  if (!url) return;
  updateSite(site.id, { gallery: [...site.gallery, url].slice(0, 24) });
  refresh();
}

export async function removeGalleryImageAction(url: string): Promise<void> {
  const { site } = await requireSite();
  updateSite(site.id, { gallery: site.gallery.filter((g) => g !== url) });
  refresh();
}

/* ------------------------------------------------------------------ publish */

export async function setPublishedAction(published: boolean): Promise<void> {
  const { site } = await requireSite();
  updateSite(site.id, { published: published ? 1 : 0 });
  refresh();
  revalidatePath(`/p/${site.slug}`);
}

/* ------------------------------------------------------------- testimonials */

export async function saveTestimonialAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const id = String(form.get("id") ?? "");
  const payload = {
    author: String(form.get("author") ?? "").trim(),
    role: String(form.get("role") ?? "").trim(),
    quote: String(form.get("quote") ?? "").trim(),
    rating: Math.max(1, Math.min(5, Number(form.get("rating") ?? 5))),
    active: form.get("active") === "on" ? 1 : 0,
  };
  if (!payload.author || !payload.quote) return { error: "A name and a quote are required." };

  if (id) {
    updateTestimonial(id, payload);
  } else {
    createTestimonial(site.id, payload);
  }
  refresh();
  return { ok: true, message: "Testimonial saved." };
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireSite();
  deleteTestimonial(id);
  refresh();
}

/* --------------------------------------------------------------------- misc */

export async function viewLiveAction(): Promise<void> {
  const { site } = await requireSite();
  redirect(`/p/${site.slug}`);
}

export async function siteSnapshot(siteId: string) {
  return siteById(siteId);
}
