'use client';

import { useEffect, useState } from 'react';
import { homeDefaults, type HomeContent } from '@vsmedu/contracts/home';
import type { FooterSocialLink } from '@vsmedu/contracts/footer';
import { Icon } from '@/components/ui/Icon';
import { icons } from '@/components/ui/icons';
import { PhoneList } from '@/components/ui/PhoneList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EnquiryForm } from './EnquiryForm';
import styles from './EnquirySection.module.css';

export function EnquirySection({ socials = [] }: { socials?: FooterSocialLink[] }) {
  const [content, setContent] = useState<HomeContent['enquiry']>(homeDefaults.enquiry);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/public/settings/global', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Global settings unavailable');
        return response.json();
      })
      .then((result) => {
        if (result?.data?.enquiry) {
          setContent(result.data.enquiry);
        }
      })
      .catch(() => {
        // Fallback to home API or defaults
        fetch('/api/v1/public/home', { cache: 'no-store', signal: controller.signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((homeResult) => {
            if (homeResult?.data?.sections?.enquiry) {
              setContent(homeResult.data.sections.enquiry);
            }
          })
          .catch(() => undefined);
      });

    return () => controller.abort();
  }, []);

  return (
    <section id="enquire-now" className={styles.section} aria-labelledby="enquire-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <SectionHeading id="enquire-title" eyebrow={content.eyebrow} title={content.title} />
          <div className={styles.form}>
            <EnquiryForm />
          </div>
        </div>

        <aside className={styles.card} aria-label="Contact details">
          <div>
            <h3 className={styles.label}>{content.addressLabel}</h3>
            <address className={styles.value}>
              {content.addressTitle}
              <br />
              {content.address}
            </address>
          </div>
          <div>
            <h3 className={styles.label}>{content.contactLabel}</h3>
            <p className={styles.value}>
              {content.phones && content.phones.length > 0 ? (
                content.phones.map((phone, index) => (
                  <span key={`${phone.href}-${index}`}>
                    {index > 0 && ' | '}
                    <a href={phone.href}>{phone.label}</a>
                  </span>
                ))
              ) : (
                <PhoneList />
              )}
            </p>
          </div>
          <div>
            <h3 className={styles.label}>{content.openTimeLabel}</h3>
            <p className={styles.value}>
              {content.openTime.map((line, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div>
            <h3 className={styles.label}>{content.socialLabel}</h3>
            <ul className={styles.socials} role="list">
              {socials.filter((social) => social.href?.trim() && social.key in icons.social).map((social) => (
                <li key={social.key}>
                  <a href={social.href!.trim()} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={styles.social}>
                    <Icon src={icons.social[social.key as keyof typeof icons.social]} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
