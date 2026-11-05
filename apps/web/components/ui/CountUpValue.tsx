'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const numberPattern = /\d+(?:,\d{3})*(?:\.\d+)?/g;

function numberParts(value: string) {
  return [...value.matchAll(numberPattern)].map((match) => ({
    text: match[0],
    value: Number(match[0].replaceAll(',', '')),
    decimals: match[0].split('.')[1]?.length ?? 0,
    grouped: match[0].includes(','),
  }));
}

function renderValue(template: string, values: number[]) {
  let index = 0;
  return template.replace(numberPattern, (targetText) => {
    const part = numberParts(targetText)[0];
    const value = values[index++] ?? part.value;
    const fixed = value.toFixed(part.decimals);
    const [integer, decimal] = fixed.split('.');
    const padded = integer;
    const formattedInteger = part.grouped
      ? padded.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : padded;
    return decimal === undefined ? formattedInteger : `${formattedInteger}.${decimal}`;
  });
}

export function CountUpValue({ value, duration = 1800 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parts = useMemo(() => numberParts(value), [value]);
  const [display, setDisplay] = useState(() => renderValue(value, parts.map(() => 0)));

  useEffect(() => {
    if (!parts.length) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const finish = () => setDisplay(value);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      finish();
      return;
    }

    let frame = 0;
    let startTime = 0;
    let started = false;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(renderValue(value, parts.map((part) => part.value * eased)));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else finish();
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
    }, { threshold: 0.01 });

    const start = () => {
      if (started) return;
      started = true;
      observer.disconnect();
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      frame = requestAnimationFrame(animate);
    };

    const checkVisibility = () => {
      const bounds = node.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) start();
    };

    observer.observe(node);
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility);
    document.addEventListener('visibilitychange', checkVisibility);
    checkVisibility();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      document.removeEventListener('visibilitychange', checkVisibility);
      cancelAnimationFrame(frame);
    };
  }, [duration, parts, value]);

  return <span ref={ref} aria-label={value}>{display}</span>;
}
