'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../events/events.module.css';

export type Speaker = { name: string; role?: string; designation?: string; company?: string; topic?: string; description?: string; date?: string; photoUrl?: string; enabled?: boolean };

function Photo({ speaker, modal = false }: { speaker: Speaker; modal?: boolean }) {
  const className = modal ? styles.speakerModalPhoto : styles.speakerPhoto;
  return speaker.photoUrl ? <img className={className} src={speaker.photoUrl} alt={speaker.name} loading="lazy" /> : <span className={`${styles.speakerPlaceholder} ${modal ? styles.speakerModalPhoto : ''}`} aria-hidden="true">{speaker.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>;
}

export function SpeakerCards({ items, title, description }: { items: Speaker[]; title: string; description: string }) {
  const [selected, setSelected] = useState<Speaker | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    else if (!selected && dialog.current?.open) dialog.current.close();
  }, [selected]);
  function close() { setSelected(null); returnFocus.current?.focus(); }
  return <>
    <div className={styles.speakerGrid}>{items.map((speaker, index) => <button type="button" className={styles.speaker} key={`${speaker.name}-${index}`} aria-haspopup="dialog" onClick={event => { returnFocus.current = event.currentTarget; setSelected(speaker); }}>
      <Photo speaker={speaker} />
      <span className={styles.speakerCopy}><strong className={styles.speakerName}>{speaker.name}</strong>{(speaker.designation || speaker.role) && <span className={styles.speakerCardRole}>{speaker.designation || speaker.role}</span>}</span>
    </button>)}</div>
    <dialog ref={dialog} className={styles.speakerDialog} aria-labelledby="speaker-dialog-name" onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      {selected && <div className={styles.speakerModalContent}>
        <header className={styles.speakerModalIntro}><p>Guest Speakers</p><h2>{title}</h2><div>{description}</div></header>
        <div className={styles.speakerModalCard}>
        <button type="button" className={styles.speakerModalClose} onClick={close} aria-label="Close speaker profile">×</button>
        <Photo speaker={selected} modal />
        <div className={styles.speakerModalBody}>
          <h2 id="speaker-dialog-name">{selected.name}</h2>
          {(selected.designation || selected.company || selected.role) && <p className={styles.speakerModalRole}>{[selected.designation || selected.role, selected.company].filter(Boolean).join(', ')}</p>}
          {selected.date && <time className={styles.speakerDate} dateTime={selected.date}>{new Date(`${selected.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}
          {selected.topic && <p className={styles.speakerModalTopic}>Topic: {selected.topic}</p>}
          {selected.description && <div className={styles.speakerDescription} dangerouslySetInnerHTML={{ __html: selected.description }} />}
        </div>
        </div>
      </div>}
    </dialog>
  </>;
}
