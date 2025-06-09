import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, where, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pencil, Trash2, Smile } from 'lucide-react';
import RespectBot from './RespectBot';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: any;
  isEdited?: boolean;
  // photoURL?: string; // Removed for anonymity
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: any;
}

export default function GlobalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showOverlayMessage, setShowOverlayMessage] = useState(false);
  const [overlayMessageContent, setOverlayMessageContent] = useState({
    message: '',
    sender: '',
  });
  const { currentUser } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle overlay message display and hide
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOverlayMessage) {
      timer = setTimeout(() => {
        setShowOverlayMessage(false);
        setOverlayMessageContent({ message: '', sender: '' });
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showOverlayMessage]);

  // Listen for messages
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  // Listen for typing indicators
  useEffect(() => {
    const q = query(
      collection(db, 'typing'),
      where('timestamp', '>', new Date(Date.now() - 5000))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        userId: doc.data().userId,
        userName: doc.data().userName,
        timestamp: doc.data().timestamp
      })) as TypingUser[];
      setTypingUsers(users);
    });

    return () => {
      unsubscribe();
      if (currentUser) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        deleteDoc(doc(db, 'typing', currentUser.uid));
      }
    };
  }, [currentUser]);

  const setTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!currentUser) return;

    const typingRef = doc(db, 'typing', currentUser.uid);
    if (isTyping) {
      await setDoc(typingRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      }, { merge: true });
    } else {
      await deleteDoc(typingRef);
    }
  }, [currentUser]);

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (currentUser) {
      if (!typingTimeoutRef.current) {
        setTypingStatus(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
        typingTimeoutRef.current = null;
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTypingStatus(false);

      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: currentUser.uid,
        userName: 'Anonymous',
        timestamp: serverTimestamp(),
        isEdited: false,
        // photoURL: currentUser.photoURL || null, // Removed for anonymity
      });
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEdit = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        text: editText,
        isEdited: true
      });
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
  };

  const handleShowBotOverlay = useCallback((message: string, sender: string) => {
    setOverlayMessageContent({ message, sender });
    setShowOverlayMessage(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 flex flex-col h-[calc(100vh-64px-32px)]">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Global Chat</h2>
        
        <div className="flex-1 overflow-y-auto mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.userId === currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Removed avatar display for anonymity */}
              <div
                className={`flex flex-col max-w-[70%] p-3 rounded-lg shadow-md ${
                  message.userId === currentUser?.uid
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="font-semibold text-sm mb-1">
                  {message.userId === currentUser?.uid ? 'You (Anonymous)' : 'Anonymous'}
                </p>
                {editingMessage === message.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-black border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleEdit(message.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingMessage(null)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="break-words">{message.text}</p>
                    {message.isEdited && (
                      <span className="text-xs opacity-80 mt-1 italic"> (edited)</span>
                    )}
                    {message.userId === currentUser?.uid && (
                      <div className="flex gap-2 mt-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMessage(message.id);
                            setEditText(message.text);
                          }}
                          className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(message.id)}
                          className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <p className="text-xs mt-2 text-right opacity-70">
                  {message.timestamp?.toDate().toLocaleTimeString()}
                </p>
              </div>
              {/* Removed avatar display for anonymity */}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {(() => {
          const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUser?.uid);
          if (otherTypingUsers.length > 0) {
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {otherTypingUsers
                  .map(() => 'Anonymous User') // Display as Anonymous User
                  .join(', ')}{' '}
                {otherTypingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            );
          }
          return null;
        })()}

        <form onSubmit={handleSubmit} className="flex gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-inner">
          <div className="relative flex-1">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => {
                handleTyping(e.target.value);
              }}
              placeholder="Type your message..."
              className="pr-10 border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-10">
                <Picker
                  data={data}
                  onEmojiSelect={addEmoji}
                  theme="light"
                  emojiSize={24}
                  perLine={7}
                />
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow"
          >
            Send
          </Button>
        </form>
      </div>
      {/* Render the RespectBot component and pass the callback */} 
      <RespectBot lastMessageUserId={messages.length > 0 ? messages[messages.length - 1].userId : null} onShowOverlay={handleShowBotOverlay} /> 

      {showOverlayMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-xl text-center animate-bounce-in">
            <p className="font-bold text-lg">{overlayMessageContent.sender}</p>
            <p className="mt-2">{overlayMessageContent.message}</p>
          </div>
        </div>
      )}
    </div>
  );
} 