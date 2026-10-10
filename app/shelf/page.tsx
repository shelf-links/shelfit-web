import type { Metadata } from 'next';
import ShelfApp from './_components/ShelfApp';

export const metadata: Metadata = {
  title: 'Your shelf | ShelfIt',
  // This page is private to each signed-in person, so keep it out of search results.
  robots: { index: false, follow: false },
};

export default function ShelfPage() {
  return <ShelfApp />;
}
