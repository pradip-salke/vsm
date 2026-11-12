'use client';

import { useEffect, useRef, useState } from 'react';
import type { EventsVideoItem } from '@vsmedu/contracts/events';
import { videoThumbnailUrl } from '@/lib/video-url';
import { VideoPopup } from '@/components/ui/VideoPopup';
import styles from '../events/events.module.css';

export function SpeakerVideos({ videos }: { videos: EventsVideoItem[] }) {
  const [activeVideo, setActiveVideo] = useState<EventsVideoItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const thumbnails = grid.querySelectorAll<HTMLVideoElement>('video[data-src]');
    if (!('IntersectionObserver' in window)) {
      thumbnails.forEach((video) => {
        video.src = video.dataset.src ?? '';
        video.load();
        delete video.dataset.src;
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target as HTMLVideoElement;
        video.src = video.dataset.src ?? '';
        video.load();
        delete video.dataset.src;
        observer.unobserve(video);
      });
    }, { rootMargin: '240px 0px' });

    thumbnails.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [videos]);

  return (
    <>
      <div ref={gridRef} className={styles.speakerGrid}>
        {videos.map((video) => {
          const thumbnail = videoThumbnailUrl(video.videoUrl);
          return (
            <article className={`${styles.speaker} ${styles.videoCard}`} key={video.videoUrl}>
              <button
                className={styles.speakerThumbnail}
                type="button"
                onClick={() => setActiveVideo(video)}
                aria-haspopup="dialog"
                aria-label={`Play ${video.title}`}
              >
                {thumbnail ? (
                  <img className={styles.thumbnailVideo} src={thumbnail} alt="" loading="lazy" />
                ) : (
                  <video className={styles.thumbnailVideo} data-src={video.videoUrl} muted playsInline preload="none" aria-hidden="true" />
                )}
                <span className={styles.speakerPlay} aria-hidden="true">▶</span>
              </button>
              <h3 className={styles.speakerTitle}>{video.title}</h3>
              <p className={styles.speakerRole}>{video.role}</p>
            </article>
          );
        })}
      </div>
      {activeVideo && <VideoPopup title={activeVideo.title} videoUrl={activeVideo.videoUrl} onClose={() => setActiveVideo(null)} />}
    </>
  );
}
