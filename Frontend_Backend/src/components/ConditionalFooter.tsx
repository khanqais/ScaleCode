'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isLoginPage = pathname.includes('/login');

  if (isLoginPage) {
    return null;
  }

  return <Footer />;
}
