// app/review/[trackId]/components/CommentTextWithLinks.tsx
import React, { JSX } from "react";

export const CommentTextWithLinks = ({
  text,
  links = [],
}: {
  text: string;
  links?: { url: string; text: string }[];
}) => {
  if (!links || links.length === 0) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const linkPattern = /\[LINK:(\d+)\]/g;
  let lastIndex = 0;
  const parts: (string | JSX.Element)[] = [];
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkIndex = parseInt(match[1], 10);
    if (links[linkIndex]) {
      parts.push(
        <a
          key={`link-${linkIndex}`}
          href={links[linkIndex].url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline break-all mx-1"
        >
          {links[linkIndex].text || links[linkIndex].url}
        </a>
      );
    } else {
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <p className="whitespace-pre-wrap">{parts}</p>;
};
