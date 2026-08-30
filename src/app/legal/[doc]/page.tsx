import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { currentUser } from "@/lib/auth";

const DOCS: Record<string, { title: string; updated: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: "Privacy policy",
    updated: "30 August 2026",
    sections: [
      {
        heading: "What this covers",
        body: [
          "This policy explains what Frontdesk collects when you run a page with us, and what visitors to your page generate when they use it. It is written to be read, not to be survived.",
        ],
      },
      {
        heading: "What we collect from you",
        body: [
          "Your account details: name, email address, and a hashed password. We never store the password itself.",
          "Whatever you choose to put on your page: your business details, contact methods, listings, images and links. You control all of it and can change or delete any of it at any time.",
        ],
      },
      {
        heading: "What your visitors generate",
        body: [
          "When someone opens your page we record an anonymous event: the fact of the view, a broad device category (iPhone, Android, desktop, tablet), and where the visit came from (a referring site, a QR scan, or direct). We do not set advertising cookies, we do not fingerprint browsers, and we do not build cross-site profiles.",
          "When someone fills in your enquiry form, we store what they typed — name, email, phone and message — and show it to you. That data belongs to you and to them, not to us.",
        ],
      },
      {
        heading: "What we never do",
        body: [
          "We do not sell your data or your visitors' data. We do not share leads with other users. We do not email your visitors on your behalf.",
        ],
      },
      {
        heading: "Deleting things",
        body: [
          "Deleting a lead removes it immediately. Deleting your account removes your page, your listings, your leads and your analytics. There is no soft-delete and no recovery window, so be certain.",
        ],
      },
      {
        heading: "Getting in touch",
        body: ["Questions about any of this go to privacy@frontdesk.example, and a person will answer."],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "30 August 2026",
    sections: [
      {
        heading: "The short version",
        body: [
          "You get a page and a dashboard. You are responsible for what you put on the page. We are responsible for keeping it available and for not doing anything strange with your data.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "One person per account. Keep your password to yourself. If you run a team plan, each member gets their own account and is responsible for their own page.",
        ],
      },
      {
        heading: "Your content",
        body: [
          "You keep ownership of everything you upload. You grant us only the permission needed to display it on your page and in your dashboard.",
          "You must have the right to publish what you publish — photographs included. Do not post anything unlawful, deceptive, or that impersonates someone else.",
        ],
      },
      {
        heading: "Availability",
        body: [
          "We aim to keep pages up continuously and will give notice of planned maintenance where we can. We do not promise perfection, and we are not liable for business losses arising from downtime.",
        ],
      },
      {
        heading: "Ending it",
        body: [
          "You can cancel from your dashboard at any time. We can suspend an account that breaks these terms, and we will tell you why.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refund policy",
    updated: "30 August 2026",
    sections: [
      {
        heading: "The trial",
        body: [
          "Every plan starts with seven days free and no card. If you cancel before the trial ends, you are never charged and there is nothing to refund.",
        ],
      },
      {
        heading: "After the trial",
        body: [
          "Plans are billed annually. If you cancel after payment, your plan stays active until the end of the paid term and does not renew.",
          "If something goes materially wrong on our side within the first thirty days of a paid term, write to us and we will refund the term in full.",
        ],
      },
      {
        heading: "Studio credits",
        body: [
          "Credits included with a plan expire with the term. Credits you top up separately do not expire and are non-refundable once spent.",
        ],
      },
      {
        heading: "How to ask",
        body: ["Email billing@frontdesk.example from your account address. We do not require a reason."],
      },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return { title: DOCS[doc]?.title ?? "Not found" };
}

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const content = DOCS[doc];
  if (!content) notFound();
  const user = await currentUser();

  return (
    <div className="bg-white">
      <MarketingNav signedIn={!!user} />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">
          Updated {content.updated}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,2.8rem)] font-semibold tracking-[-0.035em] text-ink-950">
          {content.title}
        </h1>

        <div className="mt-10 space-y-10">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink-950">{s.heading}</h2>
              <div className="mt-3 space-y-3">
                {s.body.map((p) => (
                  <p key={p} className="text-[15px] leading-relaxed text-ink-600">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 rounded-2xl border border-ink-200 bg-ink-50 p-5 text-[13.5px] leading-relaxed text-ink-500">
          Frontdesk is a working demonstration build. These documents describe how the software behaves and are
          written as a realistic starting point — have a lawyer review them before you rely on them commercially.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
