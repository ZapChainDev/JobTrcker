import { useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const disrespectfulWords = ['fuck', 'shit', 'asshole', 'bitch', 'cunt', 'damn', 'idiot']; // Add more as needed
const botResponse = "Please remember to be respectful and constructive in the chat. Let's keep it a positive environment for everyone!";

interface RespectBotProps {
  lastMessageUserId: string | null;
  onShowOverlay: (message: string, sender: string) => void;
}

export default function RespectBot({ lastMessageUserId, onShowOverlay }: RespectBotProps) {
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) return;

      const latestMessage = snapshot.docs[0].data();

      // Only react to messages not sent by the bot itself
      if (latestMessage.userId !== 'john_bot_id' && latestMessage.userName !== 'John') {
        const messageText = latestMessage.text.toLowerCase();
        const containsDisrespectfulWord = disrespectfulWords.some(word => messageText.includes(word));

        if (containsDisrespectfulWord) {
          onShowOverlay(botResponse, 'John');
        }
      }
    });

    return () => unsubscribe();
  }, [onShowOverlay]); // Add onShowOverlay to dependency array

  return null;
} 