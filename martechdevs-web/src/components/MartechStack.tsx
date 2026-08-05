import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The MarTech architecture diagram, inlined.
 *
 * It has to be inlined rather than referenced with <img>: the animation is CSS
 * inside the SVG, and an <img> renders the file as an isolated document, so
 * :hover never fires and the page's Inter Tight never reaches the <text>.
 * This is a server component, so the file is read at build time and costs the
 * client no JavaScript.
 */
export default async function MartechStack({ className }: { className?: string }) {
  const file = path.join(process.cwd(), 'public', 'assets', 'martech-stack-animated.svg');
  const svg = await fs.readFile(file, 'utf8');

  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
