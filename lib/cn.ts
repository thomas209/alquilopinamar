// Une clases de Tailwind ignorando las que vengan vacias o en false.
export function cn(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(" ");
}
