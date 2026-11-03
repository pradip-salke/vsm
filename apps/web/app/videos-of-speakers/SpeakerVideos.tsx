'use client';

import { useEffect, useRef, useState } from 'react';
import { speakerVideos } from '@/content/events';
import styles from '../events/events.module.css';

type SpeakerVideoItem = (typeof speakerVideos)[number];

export function SpeakerVideos({ videos }: { videos: SpeakerVideoItem[] }) {
  const [activeVideo, setActiveVideo] = useState<SpeakerVideoItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeVideo && !dialog.open) dialog.showModal();
    if (!activeVideo && dialog.open) dialog.close();
  }, [activeVideo]);

  return (
    <>
      <div ref={gridRef} className={styles.speakerGrid}>
        {videos.map((video) => (
          <article className={`${styles.speaker} ${styles.videoCard}`} key={video.src}>
            <button
              className={styles.speakerThumbnail}
              type="button"
              onClick={() => setActiveVideo(video)}
              aria-haspopup="dialog"
              aria-label={`Play ${video.title}`}
            >
              <video className={styles.thumbnailVideo} data-src={video.src} muted playsInline preload="none" aria-hidden="true" />
              <span className={styles.speakerPlay} aria-hidden="true">▶</span>
            </button>
            <h3 className={styles.speakerTitle}>{video.title}</h3>
            <p className={styles.speakerRole}>{video.role}</p>
          </article>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.videoDialog}
        aria-labelledby="speaker-video-title"
        onClose={() => setActiveVideo(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveVideo(null);
        }}
      >
        {activeVideo && (
          <div className={styles.videoDialogContent}>
            <button type="button" className={styles.lightboxClose} onClick={() => setActiveVideo(null)} aria-label="Close video">
              <span aria-hidden="true">×</span>
            </button>
            <h2 id="speaker-video-title" className={styles.videoTitle}>{activeVideo.title}</h2>
            <video className={styles.speakerPlayer} src={activeVideo.src} controls autoPlay playsInline preload="metadata">
              Your browser does not support video playback.
            </video>
          </div>
        )}
      </dialog>
    </>
  );
}
