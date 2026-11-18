import { redirect } from 'next/navigation';

export default function GalleryPageTwo() {
  redirect('/events/gallery/?page=2');
}
