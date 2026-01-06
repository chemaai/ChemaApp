import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { 
  getCurrentHilo, 
  getAllHilos,
  createNewHilo,
  switchHilo,
  renameHilo,
  deleteHilo,
  loadMessages, 
  saveMessage 
} from '../lib/database';
import { useAuthContext } from './AuthContext';

// Message type matching the chat screen
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  type?: string;
  name?: string;
  uri?: string;
  isNew?: boolean;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => Promise<void>;
  clearMessages: () => void;
  currentHiloId: string | null;
  allHilos: any[];
  createHilo: (title: string) => Promise<void>;
  switchHilo: (hiloId: string) => Promise<void>;
  renameHilo: (hiloId: string, newTitle: string) => Promise<void>;
  deleteHilo: (hiloId: string) => Promise<void>;
  isInitializing: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentHiloId, setCurrentHiloId] = useState<string | null>(null);
  const [allHilos, setAllHilos] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const { user } = useAuthContext() as { user: { id?: string } | null };

  // Load messages from database on mount
  useEffect(() => {
    async function loadInitialData() {
      setIsInitializing(true);
      
      if (!user?.id) {
        setIsInitializing(false);
        return;
      }
      
      try {
        // Get current active HILO
        const hilo = await getCurrentHilo(user.id);
        setCurrentHiloId(hilo.id);
        
        // Get ALL user's HILOs
        const hilos = await getAllHilos(user.id);
        setAllHilos(hilos);
        
        // Load messages for active HILO
        const loadedMessages = await loadMessages(hilo.id, 40);
        setMessages(loadedMessages.map(msg => ({
          ...msg,
          isNew: false
        })));
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setIsInitializing(false);
      }
    }
    
    loadInitialData();
  }, [user?.id]);

  // Add message to UI and save to database
  const addMessage = useCallback(async (message: Message) => {
    // Add to UI immediately (with animation flag)
    setMessages(prev => [...prev, { ...message, isNew: true }]);
    
    // Save to database
    if (currentHiloId && message.role && message.content) {
      try {
        await saveMessage(currentHiloId, message.role, message.content);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  }, [currentHiloId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Create new HILO
  const handleCreateHilo = useCallback(async (title: string) => {
    if (!user?.id) return;
    
    try {
      const newHilo = await createNewHilo(user.id, title);
      const hilos = await getAllHilos(user.id);
      setAllHilos(hilos);
      setCurrentHiloId(newHilo.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating HILO:', error);
    }
  }, [user?.id]);

  // Switch to different HILO
  const handleSwitchHilo = useCallback(async (hiloId: string) => {
    try {
      await switchHilo(hiloId);
      setCurrentHiloId(hiloId);
      const hiloMessages = await loadMessages(hiloId, 40);
      setMessages(hiloMessages.map(msg => ({ ...msg, isNew: false })));
      if (user?.id) {
        const hilos = await getAllHilos(user.id);
        setAllHilos(hilos);
      }
    } catch (error) {
      console.error('Error switching HILO:', error);
    }
  }, [user?.id]);

  // Rename HILO
  const handleRenameHilo = useCallback(async (hiloId: string, newTitle: string) => {
    try {
      await renameHilo(hiloId, newTitle);
      if (user?.id) {
        const hilos = await getAllHilos(user.id);
        setAllHilos(hilos);
      }
    } catch (error) {
      console.error('Error renaming HILO:', error);
    }
  }, [user?.id]);

  // Delete HILO
  const handleDeleteHilo = useCallback(async (hiloId: string) => {
    if (!user?.id) return;
    
    console.log('🗑️ DELETE START - HILO ID:', hiloId);
    console.log('🗑️ Current allHilos count:', allHilos.length);
    console.log('🗑️ Current HILO IDs:', allHilos.map(h => h.id));
    
    try {
      await deleteHilo(hiloId);
      console.log('🗑️ Database deletion complete');
      
      // Always reload HILOs after deletion
      const hilos = await getAllHilos(user.id);
      console.log('🗑️ Reloaded HILOs count:', hilos.length);
      console.log('🗑️ Reloaded HILO IDs:', hilos.map(h => h.id));
      
      setAllHilos(hilos);
      console.log('🗑️ setAllHilos called');
      
      // If deleted the current HILO, switch to another
      if (hiloId === currentHiloId) {
        console.log('🗑️ Deleted HILO was current, switching...');
        if (hilos.length > 0) {
          // Switch to first available HILO
          await switchHilo(hilos[0].id);
          setCurrentHiloId(hilos[0].id);
          const hiloMessages = await loadMessages(hilos[0].id, 40);
          setMessages(hiloMessages.map(msg => ({ ...msg, isNew: false })));
          console.log('🗑️ Switched to HILO:', hilos[0].id);
        } else {
          // No HILOs left, create default one
          console.log('🗑️ No HILOs left, creating default');
          const newHilo = await createNewHilo(user.id, 'Chema');
          setCurrentHiloId(newHilo.id);
          setMessages([]);
          const updatedHilos = await getAllHilos(user.id);
          setAllHilos(updatedHilos);
          console.log('🗑️ Created new default HILO:', newHilo.id);
        }
      }
      console.log('🗑️ DELETE COMPLETE');
    } catch (error) {
      console.error('🗑️ Error deleting HILO:', error);
    }
  }, [user?.id, currentHiloId, allHilos]);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      setMessages, 
      addMessage, 
      clearMessages,
      currentHiloId,
      allHilos,
      createHilo: handleCreateHilo,
      switchHilo: handleSwitchHilo,
      renameHilo: handleRenameHilo,
      deleteHilo: handleDeleteHilo,
      isInitializing
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
