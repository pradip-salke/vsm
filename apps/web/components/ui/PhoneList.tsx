import { contact } from '@/content/site';

/** "73043 43478 | 73043 43460" with each number dialable. */
export function PhoneList() {
  return (
    <span>
      {contact.phonesShort.split(' | ').map((label, index) => (
        <span key={label}>
          {index > 0 && ' | '}
          <a href={contact.phones[index].href}>{label}</a>
        </span>
      ))}
    </span>
  );
}
