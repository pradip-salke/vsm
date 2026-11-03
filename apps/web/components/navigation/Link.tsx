'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink>;

/** Client-side route transitions start at the top; in-page hashes still scroll to their target. */
export function Link({ href, scroll = true, ...props }: LinkProps) {
  return <NextLink href={href} scroll={scroll} {...props} />;
}
