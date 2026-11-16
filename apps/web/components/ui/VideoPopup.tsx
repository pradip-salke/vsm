'use client';

import { useEffect, useRef, useState } from 'react';
import { normalizeVideoUrl, youtubeEmbedUrl } from '@/lib/video-url';
import styles from '@/app/events/events.module.css';

export function VideoPopup({ title, videoUrl, onClose, hideTitle = false }: { title: string; videoUrl: string; onClose: () => void; hideTitle?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const normalizedUrl = normalizeVideoUrl(videoUrl);
  const embedUrl = normalizedUrl ? youtubeEmbedUrl(normalizedUrl) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // Mount the media only once the modal is visible so autoplay starts in the
    // user's click context rather than while the native dialog is closed.
    setPlayerReady(true);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.videoDialog}
      aria-labelledby="video-popup-title"
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
    >
      <div className={`${styles.videoDialogContent} ${hideTitle ? styles.videoDialogNoTitle : ''}`}>
        <button type="button" className={styles.lightboxClose} onClick={() => dialogRef.current?.close()} aria-label="Close video">
          <span aria-hidden="true">×</span>
        </button>
        <h2 id="video-popup-title" className={hideTitle ? 'visually-hidden' : styles.videoTitle}>{title}</h2>
        {!normalizedUrl ? (
          <p role="status">This video is currently unavailable.</p>
        ) : !playerReady ? null : embedUrl ? (
          <iframe
            className={`${styles.speakerPlayer} ${styles.speakerPlayerFrame}`}
            src={embedUrl}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video className={styles.speakerPlayer} src={normalizedUrl} controls autoPlay playsInline preload="metadata">
            Your browser does not support video playback.
          </video>
        )}
      </div>
    </dialog>
  );
}
