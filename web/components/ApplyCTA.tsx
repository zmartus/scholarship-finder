"use client";

import { track } from "@vercel/analytics";

/**
 * Client wrapper for the scholarship detail page's apply button.
 * Fires the apply_link_clicked event when the student clicks through
 * to the external scholarship/admissions page. This is the closest thing
 * we have to a "the product delivered value" signal — they found a
 * scholarship worth applying to.
 */
export function ApplyCTA({
  href,
  label,
  helper,
  scope,
  isAuto,
  scholarshipId,
}: {
  href: string;
  label: string;
  helper: string;
  scope: string;
  isAuto: boolean;
  scholarshipId: string;
}) {
  const handleClick = () => {
    track("apply_link_clicked", {
      scope,
      auto: isAuto ? 1 : 0,
      scholarship_id: scholarshipId,
    });
  };

  return (
    <section className="mt-14">
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={handleClick}
        className="btn-gradient w-full sm:w-auto justify-center text-base"
      >
        {label}
        <ExternalArrow />
      </a>
      <p className="mt-3 text-sm text-fg-muted">{helper}</p>
    </section>
  );
}

function ExternalArrow() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 11l6-6M6 4h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
