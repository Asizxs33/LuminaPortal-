import React from 'react';
import { Toaster } from 'sonner';

// One persistent host outside the routed screens and their clipping containers.
export default function AppToaster() {
  return <Toaster className="lumina-toaster" theme="light" position="top-right" closeButton visibleToasts={3}
    offset={24} mobileOffset={{ top: 'max(16px, env(safe-area-inset-top))', left: 16, right: 16 }}
    toastOptions={{ duration: 4500, style: {
      background: '#FFFFFF', color: '#172033', border: '1px solid #E4DCE0',
      borderRadius: 14, padding: '16px 20px', fontFamily: 'Arial, sans-serif',
      fontSize: 14, lineHeight: 1.5, boxShadow: '0 8px 28px rgba(65, 24, 36, 0.10)',
    }, actionButtonStyle: { background: '#A00D30', color: '#FFFFFF' },
    }} />;
}
