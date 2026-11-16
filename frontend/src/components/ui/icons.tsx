import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PawIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="6.3" cy="9.2" rx="2.1" ry="2.7" />
      <ellipse cx="17.7" cy="9.2" rx="2.1" ry="2.7" />
      <ellipse cx="10.4" cy="5.6" rx="2.1" ry="2.9" />
      <ellipse cx="13.6" cy="5.6" rx="2.1" ry="2.9" />
      <path d="M12 11.2c-3.1 0-5.9 2.5-5.9 5.2 0 1.7 1.3 2.9 3 2.9 1.1 0 1.9-.4 2.9-.4s1.8.4 2.9.4c1.7 0 3-1.2 3-2.9 0-2.7-2.8-5.2-5.9-5.2Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20.5s-8.5-5.4-8.5-11a4.9 4.9 0 0 1 8.5-3.3A4.9 4.9 0 0 1 20.5 9.5c0 5.6-8.5 11-8.5 11Z" />
    </Icon>
  );
}
