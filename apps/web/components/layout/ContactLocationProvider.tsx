'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { FooterContent } from '@vsmedu/contracts/footer';

export const contactLocationLabels = {
  andheri: 'Andheri',
  borivali: 'Borivali',
  ghatkopar: 'Ghatkopar',
} as const;

export type ContactLocationId = keyof typeof contactLocationLabels;
export type ContactLocationOption = { id: ContactLocationId; label: string; address: string; mapLink: string };

const DEFAULT_CONTACT_LOCATIONS: FooterContent['contactPage']['locations'] = {
  andheri: '5th Floor, Valia College Building, Cosmopolitan Education Society Road, Andheri & D. N. Nagar Metro Station, Andheri (West), Mumbai – 400 053.',
  borivali: '',
  ghatkopar: '',
};
const DEFAULT_CONTACT_MAP_LINKS: FooterContent['contactPage']['mapLinks'] = {
  andheri: '',
  borivali: '',
  ghatkopar: '',
};

type ContactLocationContextValue = {
  isContactPage: boolean;
  locations: ContactLocationOption[];
  selectedLocation: ContactLocationOption;
  setSelectedLocationId: (id: ContactLocationId) => void;
};

const ContactLocationContext = createContext<ContactLocationContextValue | null>(null);

export function ContactLocationProvider({ locations, mapLinks, children }: { locations?: FooterContent['contactPage']['locations'] | null; mapLinks?: FooterContent['contactPage']['mapLinks'] | null; children: ReactNode }) {
  const pathname = usePathname();
  const [selectedLocationId, setSelectedLocationId] = useState<ContactLocationId>('andheri');
  const configuredLocations = locations ?? DEFAULT_CONTACT_LOCATIONS;
  const configuredMapLinks = mapLinks ?? DEFAULT_CONTACT_MAP_LINKS;
  const options = (Object.keys(contactLocationLabels) as ContactLocationId[]).map((id) => ({
    id,
    label: contactLocationLabels[id],
    address: configuredLocations?.[id] ?? DEFAULT_CONTACT_LOCATIONS[id],
    mapLink: configuredMapLinks?.[id] ?? DEFAULT_CONTACT_MAP_LINKS[id],
  }));
  const selectedLocation = options.find((location) => location.id === selectedLocationId) ?? options[0]!;

  return (
    <ContactLocationContext.Provider value={{
      isContactPage: pathname === '/contact-us' || pathname === '/contact-us/',
      locations: options,
      selectedLocation,
      setSelectedLocationId,
    }}>
      {children}
    </ContactLocationContext.Provider>
  );
}

export function useContactLocation() {
  const context = useContext(ContactLocationContext);
  if (!context) throw new Error('useContactLocation must be used inside ContactLocationProvider');
  return context;
}
