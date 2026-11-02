'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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

function FacultyModal({ member, onClose }: { member: FacultyMember | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (member && !dialog.open) dialog.showModal();
    if (!member && dialog.open) dialog.close();
  }, [member]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="faculty-modal-name"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {member && (
        <div className={styles.modalCard}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close profile">
            <Icon src={icons.close} size="100%" />
          </button>
          <Image
            className={styles.modalPhoto}
            src={member.image.src}
            alt={member.image.alt}
            width={member.image.width}
            height={member.image.height}
            sizes="(max-width: 767px) 60vw, 325px"
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
      )}
    </dialog>
  );
}

export function FacultySection({ id = 'faculties', variant = 'page' }: FacultySectionProps) {
  const [selected, setSelected] = useState<FacultyMember | null>(null);
  const isPage = variant === 'page';
  const headingId = `${id}-title`;

  const slides = faculty.map((member) => (
    <button key={member.name} type="button" className={styles.card} onClick={() => setSelected(member)} aria-haspopup="dialog">
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
        <SectionHeading
          id={headingId}
          eyebrow={isPage ? 'Masters of Their Craft, Mentors for the Future' : 'Our Faculties'}
          eyebrowTone="plain"
          title="Meet Our Industry-Oriented PGDM Faculty"
          tone={isPage ? 'light' : 'dark'}
        >
          {isPage && <p>{facultyIntro}</p>}
        </SectionHeading>
        <Carousel
          label="Faculty"
          slides={slides}
          className={styles.carousel}
          dotsTone={isPage ? 'light' : 'dark'}
          dotsAlign={isPage ? 'center' : 'start'}
        />
      </div>
      <FacultyModal member={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
