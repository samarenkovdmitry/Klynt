/**
 * Official Figma and Slack marks.
 *
 * Remix Icons ships monochrome glyphs for these, which meant the brands were
 * rendered in arbitrary tints (navy Figma, purple-600 Slack — Slack's retired
 * aubergine). These are the real multi-colour marks, so colour must not be set
 * from the outside: `size` is the only knob.
 */

export function FigmaIcon({ size = 14, className }: { size?: number; className?: string }) {
  // Native aspect ratio is 38x57, so width is derived from the requested height.
  return (
    <svg
      width={(size * 38) / 57}
      height={size}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.5 57c5.247 0 9.5-4.253 9.5-9.5V38H9.5C4.253 38 0 42.253 0 47.5S4.253 57 9.5 57z" fill="#0ACF83" />
      <path d="M0 28.5C0 23.253 4.253 19 9.5 19H19v19H9.5C4.253 38 0 33.747 0 28.5z" fill="#A259FF" />
      <path d="M0 9.5C0 4.253 4.253 0 9.5 0H19v19H9.5C4.253 19 0 14.747 0 9.5z" fill="#F24E1E" />
      <path d="M19 0h9.5C33.747 0 38 4.253 38 9.5S33.747 19 28.5 19H19V0z" fill="#FF7262" />
      <path d="M38 28.5C38 33.747 33.747 38 28.5 38S19 33.747 19 28.5 23.253 19 28.5 19 38 23.253 38 28.5z" fill="#1ABCFE" />
    </svg>
  );
}

export function SlackIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 122.8 122.8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
        fill="#E01E5A"
      />
      <path
        d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
        fill="#36C5F0"
      />
      <path
        d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
        fill="#2EB67D"
      />
      <path
        d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
        fill="#ECB22E"
      />
    </svg>
  );
}

export function LinearIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="#5E6AD2"
      aria-hidden="true"
    >
      <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
    </svg>
  );
}
