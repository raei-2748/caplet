// Vibrant two-stop gradients used for course / class cover art. One is picked
// deterministically per entity (by id) so each card keeps a stable, distinct
// colour across renders and sessions.
export const COVER_GRADIENTS = [
  ['#FF6B6B', '#FFD93D'], // coral → gold
  ['#4FACFE', '#00F2FE'], // blue → cyan
  ['#A855F7', '#6366F1'], // violet → indigo
  ['#43E97B', '#38F9D7'], // green → teal
  ['#FA709A', '#FEE140'], // pink → yellow
  ['#F093FB', '#F5576C'], // orchid → rose
  ['#30CFD0', '#330867'], // teal → deep purple
  ['#FDBB2D', '#FF7E5F'], // amber → coral
];

// Returns an inline style object with a soft top-left highlight over a 135°
// blend. Pass a stable seed (e.g. the entity id) for a consistent colour.
export function coverGradient(seed) {
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const [a, b] = COVER_GRADIENTS[h % COVER_GRADIENTS.length];
  return {
    backgroundImage:
      `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.40), transparent 55%), ` +
      `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
  };
}
