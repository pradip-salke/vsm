'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { VideoPopup } from '@/components/ui/VideoPopup';
import { normalizeVideoUrl } from '@/lib/video-url';
import styles from './PgdmProgram.module.css';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';

export function PgdmProgram({ content = homeDefaults.program }: { content?: HomeContent['program'] }) {
  const pgdmProgram = content;
  const { poster } = pgdmProgram;
  const [videoOpen, setVideoOpen] = useState(false);
  const videoUrl = normalizeVideoUrl(pgdmProgram.videoLink);
  return (
    <section className={styles.section} aria-labelledby="pgdm-title">
      <div className={styles.media}>
        <Image src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} sizes="(max-width: 1023px) 100vw, 50vw" />
        {videoUrl && <button type="button" className={styles.play} aria-label="Play PGDM program video" onClick={() => setVideoOpen(true)}>
          <Icon src={icons.play} size="100%" />
        </button>}
      </div>
      {videoOpen && videoUrl && <VideoPopup title={pgdmProgram.title} videoUrl={videoUrl} onClose={() => setVideoOpen(false)} />}
      <div className={styles.content}>
        <SectionHeading id="pgdm-title" eyebrow={content.eyebrow} title={content.title} />
        <h3 className={styles.subtitle}>{pgdmProgram.subtitle}</h3>
        <p className={styles.lead}>{pgdmProgram.lead}</p>
        <p>{pgdmProgram.body}</p>
        <ul className={styles.highlights} role="list">
          {pgdmProgram.highlights.map((item) => (
            <li key={item}>
              <Icon src={icons.check} className={styles.check} />
              {item}
            </li>
          ))}
        </ul>
        <Button variant="arrow" href={content.buttonHref} className={styles.link}>
          {content.buttonText}
        </Button>
      </div>
    </section>
  );
}
