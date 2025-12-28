import React from 'react';

export default function Markdown({ children }) {
  if (!children || typeof children !== 'string') {
    return <span>{children}</span>;
  }

  const lines = children.split('\n');
  const elements = [];
  let currentList = null;
  let listType = null;

  const parseInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      let match;

      if ((match = remaining.match(/^\*\*(.+?)\*\*/))) {
        parts.push(<strong key={key++} className="md-strong">{parseInline(match[1])}</strong>);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      if ((match = remaining.match(/^\*(.+?)\*/))) {
        parts.push(<em key={key++} className="md-em">{parseInline(match[1])}</em>);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      if ((match = remaining.match(/^`(.+?)`/))) {
        parts.push(<code key={key++} className="md-code-inline">{match[1]}</code>);
        remaining = remaining.slice(match[0].length);
        continue;
      }

      if ((match = remaining.match(/^\[(.+?)\]\((.+?)\)/))) {
        parts.push(
          <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="md-link">
            {match[1]}
          </a>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }

      const nextSpecial = remaining.search(/[\*`\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-${elements.length}`} className={`md-${listType}`}>
          {currentList.map((item, i) => (
            <li key={i} className="md-li">{parseInline(item)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      continue;
    }

    if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={i} className="md-h3">{parseInline(trimmedLine.slice(4))}</h3>);
      continue;
    }
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={i} className="md-h2">{parseInline(trimmedLine.slice(3))}</h2>);
      continue;
    }
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={i} className="md-h1">{parseInline(trimmedLine.slice(2))}</h1>);
      continue;
    }

    if (trimmedLine.startsWith('---') || trimmedLine.startsWith('***')) {
      flushList();
      elements.push(<hr key={i} />);
      continue;
    }

    if (trimmedLine.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={i} className="md-blockquote">
          {parseInline(trimmedLine.slice(2))}
        </blockquote>
      );
      continue;
    }

    const ulMatch = trimmedLine.match(/^[-•*]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        currentList = [];
        listType = 'ul';
      }
      currentList.push(ulMatch[1]);
      continue;
    }

    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        currentList = [];
        listType = 'ol';
      }
      currentList.push(olMatch[1]);
      continue;
    }

    flushList();
    elements.push(<p key={i} className="md-p">{parseInline(trimmedLine)}</p>);
  }

  flushList();

  return <>{elements}</>;
}
