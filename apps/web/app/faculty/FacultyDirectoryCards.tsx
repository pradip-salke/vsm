'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { FacultyProfilePopup } from '@/components/sections/FacultySection';
import type { FacultyMember } from '@/content/shared';
import aboutStyles from '../about-us/about.module.css';
import pageStyles from './FacultyPage.module.css';
import styles from './FacultyDirectoryCards.module.css';

export function FacultyDirectoryCards({ profiles: facultyMembers }: { profiles: FacultyMember[] }) {
  const [selected, setSelected] = useState<FacultyMember | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const closePopup = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className={`${aboutStyles.profileGrid} ${aboutStyles.facultyStyleGrid} ${pageStyles.facultyGrid}`}>
        {facultyMembers.map((member) => (
          <button
            key={member.name}
            type="button"
            className={`${aboutStyles.profile} ${aboutStyles.facultyStyleProfile} ${styles.card}`}
            onClick={(event) => {
              returnFocusRef.current = event.currentTarget;
              setSelected(member);
            }}
            aria-haspopup="dialog"
            aria-label={`View profile: ${member.name}`}
          >
            <Image src={member.image.src} alt={member.image.alt} width={member.image.width} height={member.image.height} sizes="(max-width: 650px) 100vw, (max-width: 1023px) 50vw, 25vw" />
            <span className={aboutStyles.profileCopy}>
              <span className={styles.cardTitle}>{member.name}</span>
              <span className={aboutStyles.profileRole}>{member.role}</span>
            </span>
          </button>
        ))}
      </div>
      <FacultyProfilePopup member={selected} onClose={closePopup} returnFocusRef={returnFocusRef} headingId="faculty-popup-heading" />
    </>
  );
}
