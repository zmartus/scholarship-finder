export function Footer() {
  return (
    <footer className="relative z-10 mt-16 sm:mt-24 pb-10">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 text-center text-sm text-fg-muted">
        © {new Date().getFullYear()} ScholarshipGuru · Built for the class of tomorrow.
      </div>
    </footer>
  );
}
