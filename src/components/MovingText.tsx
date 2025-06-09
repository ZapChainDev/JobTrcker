import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quote } from 'lucide-react';

export function MovingText() {
  const [text, setText] = useState('');

  useEffect(() => {
    // Subscribe to motivational text updates
    const unsubscribe = onSnapshot(doc(db, 'admin', 'motivationalText'), (doc) => {
      if (doc.exists()) {
        setText(doc.data().text || '');
      }
    });

    return () => unsubscribe();
  }, []);

  if (!text) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center space-x-3">
          <Quote className="h-5 w-5 text-pink-500 dark:text-pink-400" />
          <div className="relative overflow-hidden flex-1">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-base font-medium text-pink-600 dark:text-pink-400">
                {text}
              </span>
            </div>
          </div>
          <Quote className="h-5 w-5 text-pink-500 dark:text-pink-400 transform rotate-180" />
        </div>
      </div>
    </div>
  );
} 