import api, { aiApi, chatApi } from "./api";

const CHATS_STORAGE_KEY = "nexosql_chats";
const MIGRATION_FLAG_KEY = "nexosql_chats_migrated";

const CANCELLATION_SUBSTRINGS = [
  "consulta fue cancelada por el usuario",
  "consulta cancelada por el usuario"
];

const isCancellationMessage = (message) => {
  if (!message) return false;
  if (message.cancelado) return true;
  if (message.metadata?.cancelled) return true;

  const content = message.content?.toLowerCase();
  if (!content) return false;

  return CANCELLATION_SUBSTRINGS.some((snippet) => content.includes(snippet));
};

const getMessageTimestamp = (message) => {
  if (!message) return Number.MAX_SAFE_INTEGER;

  const candidate =
    message.timestamp || message.createdAt || message.updatedAt || null;

  if (candidate instanceof Date) {
    return candidate.getTime();
  }

  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }

  if (typeof candidate === "string") {
    const parsed = Date.parse(candidate);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Number.MAX_SAFE_INTEGER;
};

const sortMessagesChronologically = (messages = []) =>
  [...messages]
    .map((message, index) => ({ message, index }))
    .sort((a, b) => {
      const timeDiff = getMessageTimestamp(a.message) - getMessageTimestamp(b.message);
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return a.index - b.index;
    })
    .map(({ message }) => message);

const withFilteredMessages = (chat) => {
  if (!chat || !Array.isArray(chat.messages)) {
    return chat;
  }

  const filteredMessages = chat.messages.filter(
    (message) => !isCancellationMessage(message),
  );

  return {
    ...chat,
    messages: sortMessagesChronologically(filteredMessages),
  };
};

class ChatService {
  constructor() {
    this.activeConnectionId = null;
    this.migrationChecked = false;
  }

  setActiveConnection(connectionId) {
    this.activeConnectionId = connectionId;
    // Check for migration when switching connections
    this.checkAndMigrateLocalStorage();
  }

  // Check if we need to migrate localStorage data
  async checkAndMigrateLocalStorage() {
    if (this.migrationChecked) return;
    
    try {
      const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
      if (migrated) {
        this.migrationChecked = true;
        return;
      }

      // Check if there's data in localStorage
      const localData = this._getAllChatsFromStorage();
      if (Object.keys(localData).length > 0) {
        console.log('Migrating chat data from localStorage to database...');
        const { data, error } = await chatApi.migrateLocalStorageChats(localData);
        
        if (!error) {
          // Mark as migrated
          localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
          console.log(`Successfully migrated ${data.migratedChatIds?.length || 0} chats`);
        } else {
          console.error('Error migrating chats:', error);
        }
      }
      
      this.migrationChecked = true;
    } catch (error) {
      console.error('Error checking migration:', error);
      this.migrationChecked = true;
    }
  }

  // Get all chats for a specific connection
  async getChats(connectionId) {
    try {
      const { data, error } = await chatApi.getChatsByConnection(connectionId);
      if (error) {
        console.error("Error getting chats:", error);
        return [];
      }

      const chats = data.chats || [];
      return chats.map(withFilteredMessages);
    } catch (error) {
      console.error("Error getting chats:", error);
      return [];
    }
  }

  // Get a specific chat by ID
  async getChatById(connectionId, chatId) {
    try {
      const { data, error } = await chatApi.getChatById(chatId);
      if (error) {
        console.error("Error getting chat by ID:", error);
        return null;
      }

      const chat = data.chat || null;
      if (!chat) {
        return null;
      }

      return withFilteredMessages(chat);
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      return null;
    }
  }

  // Create a new chat
  async createChat(connectionId, title = "Nueva consulta") {
    try {
      console.log('Creating chat with:', { connectionId, title });
      const { data, error } = await chatApi.createChat(connectionId, title);
      console.log('Chat API response:', { data, error });
      
      if (error) {
        console.error("Error creating chat:", error);
        throw new Error(typeof error === 'string' ? error : error.message || 'Error desconocido');
      }
      return data.chat;
    } catch (error) {
      console.error("Error creating chat:", error);
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("No se pudo crear el chat");
      }
    }
  }

  // Delete a chat
  async deleteChat(connectionId, chatId) {
    try {
      const { data, error } = await chatApi.deleteChat(chatId);
      if (error) {
        console.error("Error deleting chat:", error);
        throw new Error(error);
      }
      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw new Error("No se pudo eliminar el chat");
    }
  }

  // Rename a chat
  async renameChat(connectionId, chatId, newTitle) {
    try {
      const { data, error } = await chatApi.updateChatTitle(chatId, newTitle);
      if (error) {
        console.error("Error renaming chat:", error);
        throw new Error(error);
      }
      return data.chat;
    } catch (error) {
      console.error("Error renaming chat:", error);
      throw new Error("No se pudo renombrar el chat");
    }
  }

  // Add a message to a chat - This method is now mainly for compatibility
  // New messages are typically created automatically by the AI service
  async addMessage(connectionId, chatId, message) {
    try {
      const { data, error } = await chatApi.addMessage(
        chatId,
        message.type,
        message.content,
        message.metadata || null,
        message.error || false
      );
      if (error) {
        console.error("Error adding message:", error);
        throw new Error(error);
      }
      const createdMessage = data.message;
      if (!createdMessage) {
        return null;
      }

      return isCancellationMessage(createdMessage) ? null : createdMessage;
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("No se pudo añadir el mensaje");
    }
  }

  // Send a question to the AI service - Updated to use database storage
  async sendQuestion(connectionId, chatId, question, threadId) {
    try {
      // Call the AI API with the chatId and threadId to automatically save messages
      const { data, error } = await aiApi.processQuery(connectionId, question, chatId, threadId);

      if (error) {
        throw new Error(error);
      }

      return {
        ...data,
        chatId: data.chatId || chatId,
        userMessage: data.userMessage,
        assistantMessage: data.assistantMessage,
      };
    } catch (error) {
      console.error("Error sending question:", error);
      throw error;
    }
  }

  // Cancel a message by thread ID
  async cancelMessage(hiloConversacion) {
    try {
      const { data, error } = await aiApi.cancelMessage(hiloConversacion);
      if (error) {
        console.error("Error cancelling message:", error);
        throw new Error(error);
      }
      return data;
    } catch (error) {
      console.error("Error cancelling message:", error);
      throw new Error("No se pudo cancelar el mensaje");
    }
  }

  // Legacy methods for localStorage (kept for fallback and migration)
  _getAllChatsFromStorage() {
    try {
      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
      return storedChats ? JSON.parse(storedChats) : {};
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return {};
    }
  }

  _saveChatsToStorage(connectionId, chats) {
    try {
      const allChats = this._getAllChatsFromStorage();
      allChats[connectionId] = chats;
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(allChats));
    } catch (error) {
      console.error("Error saving chats to storage:", error);
    }
  }

  // Clear localStorage after successful migration
  clearLocalStorage() {
    try {
      localStorage.removeItem(CHATS_STORAGE_KEY);
      console.log("Cleared chat data from localStorage after migration");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}

export default new ChatService();
