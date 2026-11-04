'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faculty, facultyIntro, type FacultyMember } from '@/content/shared';
import styles from './FacultySection.module.css';

type FacultySectionProps = {
  id?: string;
  /** `page` = dark Home section with intro; `column` = light Academics variant. */
  variant?: 'page' | 'column';
};

export function FacultyProfilePopup({
  member,
  onClose,
  returnFocusRef,
  headingId,
}: {
  member: FacultyMember | null;
  onClose: () => void;
  returnFocusRef: { current: HTMLButtonElement | null };
  headingId: string;
}) {
  const pageDialogRef = useRef<HTMLDialogElement>(null);
  const popupIntroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = pageDialogRef.current;
    if (!dialog) return;

    if (member && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
      popupIntroRef.current?.focus({ preventScroll: true });
      dialog.scrollTop = 0;
    } else if (!member && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [member, returnFocusRef]);

  useEffect(() => {
    if (!member) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [member]);

  if (!member) return null;

  return (
    <dialog
      ref={pageDialogRef}
      className={styles.profileOverlay}
      aria-labelledby="faculty-modal-name"
      onClose={onClose}
    >
      <div ref={popupIntroRef} className={styles.popupIntro} tabIndex={-1}>
        <FacultyIntroduction id={headingId} isPage popup />
      </div>
      <div className={styles.modalCard}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close profile">
          <Icon src={icons.closeX} size="100%" />
        </button>
        <Image
          className={styles.modalPhoto}
          src={member.image.src}
          alt={member.image.alt}
          width={member.image.width}
          height={member.image.height}
          sizes="(max-width: 767px) 45vw, 16.93vw"
        />
        <div className={styles.modalBody}>
          <h3 id="faculty-modal-name" className={styles.modalName}>
            {member.name}
          </h3>
          <p className={styles.modalRole}>{member.role}</p>
          <dl className={styles.details}>
            {member.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}:</dt> <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </dialog>
  );
}

function FacultyIntroduction({ id, isPage, popup = false }: { id: string; isPage: boolean; popup?: boolean }) {
  return (
    <SectionHeading
      id={id}
      className={popup ? styles.popupHeading : undefined}
      eyebrow={isPage ? 'Masters of Their Craft, Mentors for the Future' : 'Our Faculties'}
      eyebrowTone="plain"
      title="Meet Our Industry-Oriented PGDM Faculty"
      tone={isPage ? 'light' : 'dark'}
    >
      {isPage && <p>{facultyIntro}</p>}
    </SectionHeading>
  );
}

export function FacultySection({ id = 'faculties', variant = 'page' }: FacultySectionProps) {
  const [selected, setSelected] = useState<FacultyMember | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const closeProfile = useCallback(() => {
    setSelected(null);
  }, []);
  const isPage = variant === 'page';
  const headingId = `${id}-title`;

  const slides = faculty.map((member) => (
    <button key={member.name} type="button" className={styles.card} onClick={(event) => {
      returnFocusRef.current = event.currentTarget;
      setSelected(member);
    }} aria-haspopup="dialog">
      <span className={styles.photo}>
        <Image
          src={member.image.src}
          alt={member.image.alt}
          width={member.image.width}
          height={member.image.height}
          sizes="(max-width: 767px) 80vw, (max-width: 1279px) 40vw, 22vw"
        />
      </span>
      <span className={styles.name}>{member.name}</span>
      <span className={styles.role}>{isPage ? member.role : member.shortRole ?? member.role}</span>
    </button>
  ));

  return (
    <section id={id} className={styles[variant]} aria-labelledby={headingId}>
      <div className={isPage ? 'container' : undefined}>
        {!selected && <FacultyIntroduction id={headingId} isPage={isPage} />}
        <Carousel
          label="Faculty"
          slides={slides}
          className={styles.carousel}
          dotsTone={isPage ? 'light' : 'dark'}
          dotsAlign={isPage ? 'center' : 'start'}
        />
      </div>
      <FacultyProfilePopup member={selected} onClose={closeProfile} returnFocusRef={returnFocusRef} headingId={headingId} />
    </section>
  );
}
