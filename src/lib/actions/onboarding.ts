"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSite } from "@/lib/guard";
import { createLink, linksForSite, slugTaken, slugify, updateSite, uniqueSlug } from "@/lib/repo";
import { themeById } from "@/lib/themes";
import { updateUser } from "@/lib/users";
import { VOCAB } from "@/lib/vocab";
import type { BusinessType } from "@/lib/types";
import type { ActionState } from "./site";

export async function onboardingStepOne(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const businessName = String(form.get("business_name") ?? "").trim();
  const businessType = String(form.get("business_type") ?? "other") as BusinessType;

  if (!businessName) return { error: "What's the business called?" };
  if (!VOCAB[businessType]) return { error: "Pick the closest match." };

  updateSite(site.id, {
    business_name: businessName,
    business_type: businessType,
    slug: site.slug || uniqueSlug(businessName),
  });
  revalidatePath("/onboarding");
  redirect("/onboarding?step=2");
}

export async function onboardingStepTwo(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const str = (k: string) => String(form.get(k) ?? "").trim();

  updateSite(site.id, {
    owner_name: str("owner_name"),
    headline: str("headline"),
    tagline: str("tagline"),
    location: str("location"),
    phone: str("phone"),
    email: str("email"),
    whatsapp: str("phone").replace(/[^\d]/g, ""),
  });

  // Seed the quick-action row from whatever contact details they gave us.
  const existing = linksForSite(site.id);
  if (!existing.some((l) => l.is_action === 1)) {
    let position = 0;
    if (str("phone")) {
      createLink(site.id, { kind: "call", label: "Call", value: str("phone"), is_action: 1, position: position++ });
      createLink(site.id, {
        kind: "whatsapp",
        label: "WhatsApp",
        value: str("phone").replace(/[^\d]/g, ""),
        is_action: 1,
        position: position++,
      });
    }
    if (str("email")) {
      createLink(site.id, { kind: "email", label: "Email", value: str("email"), is_action: 1, position: position++ });
    }
  }

  revalidatePath("/onboarding");
  redirect("/onboarding?step=3");
}

export async function onboardingStepThree(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const preset = themeById(String(form.get("preset") ?? "midnight"));
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
  revalidatePath("/onboarding");
  redirect("/onboarding?step=4");
}

export async function onboardingFinish(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { user, site } = await requireSite();
  const slug = slugify(String(form.get("slug") ?? ""));

  if (slug.length < 3) return { error: "Use at least 3 characters — letters, numbers and dashes." };
  if (slugTaken(slug, site.id)) return { error: "That address is taken. Try another." };

  updateSite(site.id, { slug, published: 1 });
  updateUser(user.id, { onboarded: 1 });

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard?welcome=1");
}

export async function skipOnboarding(): Promise<void> {
  const { user } = await requireSite();
  updateUser(user.id, { onboarded: 1 });
  redirect("/dashboard");
}
