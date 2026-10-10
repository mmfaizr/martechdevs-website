/**
 * Copy with **marked** phrases: the homepage's two-tone device. Marked words
 * come out in near-black, the rest in the lighter colour around them.
 */
export default function Rich({
  text,
  strong = 'font-semibold text-gray-900',
  muted,
}: {
  text: string;
  /** Classes for the marked phrases. */
  strong?: string;
  /** Classes for everything else, when it should differ from the parent. */
  muted?: string;
}) {
  return (
    <>
      {text.split('**').map((part, i) =>
        i % 2 ? (
          <strong key={i} className={strong}>
            {part}
          </strong>
        ) : muted ? (
          <span key={i} className={muted}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

/** The same copy without the marks, for meta tags and structured data. */
export function plain(text: string) {
  return text.replace(/\*\*/g, '');
}
