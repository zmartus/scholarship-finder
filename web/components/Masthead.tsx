import Link from "next/link";

export function Masthead() {
  return (
    <header className="relative z-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-7 pb-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="logo-orb">
            <CapIcon className="w-4 h-4" />
          </span>
          <span className="font-bold text-[1.35rem] tracking-tight text-fg">
            ScholarshipGuru
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] text-fg-soft">
          <Link href="#how-it-works" className="hover:text-fg transition-colors">How it works</Link>
          <Link href="#features" className="hover:text-fg transition-colors">Features</Link>
          <Link href="#faq" className="hover:text-fg transition-colors">FAQ</Link>
        </nav>

        <Link href="/colleges" className="btn-ghost text-[14px] py-2.5 px-5">
          Get started
        </Link>
      </div>
    </header>
  );
}

function CapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  );
}
