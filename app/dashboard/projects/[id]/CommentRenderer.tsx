// components/CommentRenderer.tsx
"use client";

import React from "react";

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

  // Create a regex pattern that matches all link placeholders
  const linkPattern = /\[LINK:(\d+)\]/g;
  let lastIndex = 0;
  const parts = [];
  let match;

  // Find all link placeholders and build an array of text and link elements
  while ((match = linkPattern.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Extract link index and add the link element
    const linkIndex = parseInt(match[1], 10);
    if (links[linkIndex]) {
      parts.push(
        <a
          key={`link-${linkIndex}`}
          href={links[linkIndex].url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline break-all"
        >
          {links[linkIndex].text || links[linkIndex].url}
        </a>
      );
    } else {
      // If link doesn't exist, just show the placeholder
      parts.push(<span key={`missing-${linkIndex}`}>{match[0]}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
  }

  return <p className="whitespace-pre-wrap">{parts}</p>;
};
