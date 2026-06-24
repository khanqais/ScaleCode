import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — AlgoGrid',
  description: 'Sign in to AlgoGrid to access your coding challenges and organize your practice sessions.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
