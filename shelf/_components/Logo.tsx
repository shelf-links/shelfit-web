export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect x="0" y="2" width="36" height="9" rx="4.5" fill="#FF006E" />
      <rect x="0" y="14" width="36" height="9" rx="4.5" fill="#00FF88" />
      <rect x="0" y="26" width="36" height="9" rx="4.5" fill="#3A86FF" />
    </svg>
  );
}
