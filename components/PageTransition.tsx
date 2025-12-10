'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

type PageTransitionProps = {
  children: React.ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="min-h-screen overflow-hidden"
    >
      {children}
    </motion.div>
  );
}


