import api, { aiApi } from "./api";

const CHATS_STORAGE_KEY = "nexosql_chats";

class ChatService {
  constructor() {
    this.activeConnectionId = null;
  }

  setActiveConnection(connectionId) {
    this.activeConnectionId = connectionId;
  }

  // Get all chats for a specific connection
  getChats(connectionId) {
    try {
      const allChats = this._getAllChatsFromStorage();
      return allChats[connectionId] || [];
    } catch (error) {
      console.error("Error getting chats:", error);
      return [];
    }
  }

  // Get a specific chat by ID
  getChatById(connectionId, chatId) {
    try {
      const chats = this.getChats(connectionId);
      return chats.find((chat) => chat.id === chatId) || null;
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      return null;
    }
  }

  // Create a new chat
  createChat(connectionId, title = "Nueva consulta") {
    try {
      const chats = this.getChats(connectionId);
      const newChat = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedChats = [newChat, ...chats];
      this._saveChatsToStorage(connectionId, updatedChats);

      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw new Error("No se pudo crear el chat");
    }
  }

  // Delete a chat
  deleteChat(connectionId, chatId) {
    try {
      const chats = this.getChats(connectionId);
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      this._saveChatsToStorage(connectionId, updatedChats);
      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw new Error("No se pudo eliminar el chat");
    }
  }

  // Rename a chat
  renameChat(connectionId, chatId, newTitle) {
    try {
      const chats = this.getChats(connectionId);
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            title: newTitle,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });

      this._saveChatsToStorage(connectionId, updatedChats);
      return updatedChats.find((chat) => chat.id === chatId);
    } catch (error) {
      console.error("Error renaming chat:", error);
      throw new Error("No se pudo renombrar el chat");
    }
  }

  // Add a message to a chat
  addMessage(connectionId, chatId, message) {
    try {
      const chats = this.getChats(connectionId);
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          const newMessage = {
            id: message.id || Date.now().toString(),
            ...message,
            timestamp: new Date().toISOString(),
          };

          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });

      this._saveChatsToStorage(connectionId, updatedChats);
      return updatedChats.find((chat) => chat.id === chatId);
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("No se pudo añadir el mensaje");
    }
  }

  // Send a question to the AI service
  async sendQuestion(connectionId, chatId, question) {
    let loadingMessageId;
    try {
      // Add user message to chat with unique ID
      const userMessageId = `user_${Date.now()}`;
      this.addMessage(connectionId, chatId, {
        id: userMessageId,
        type: "user",
        content: question,
      });

      // Add a loading message that will be replaced later
      loadingMessageId = `assistant_${Date.now()}`;
      this.addMessage(connectionId, chatId, {
        id: loadingMessageId,
        type: "assistant",
        content: "...",
        loading: true,
      });

      // Make API call to the backend AI service
      const { data, error } = await aiApi.processQuery(connectionId, question);

      if (error) {
        throw new Error(error);
      }

      // Replace loading message with actual response
      this._updateAssistantMessage(connectionId, chatId, loadingMessageId, {
        type: "assistant",
        content: data.answer,
        metadata: data.metadata,
      });

      return data;
    } catch (error) {
      console.error("Error sending question:", error);

      // Update loading message with error
      this._updateAssistantMessage(connectionId, chatId, loadingMessageId, {
        type: "assistant",
        content: `Error: No se pudo procesar tu consulta. ${error.message}`,
        error: true,
      });

      throw error;
    }
  }

  // Private method to update an assistant message (e.g. replace loading message)
  _updateAssistantMessage(connectionId, chatId, messageId, updatedMessage) {
    try {
      const chats = this.getChats(connectionId);
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                ...updatedMessage,
                loading: false,
              };
            }
            return msg;
          });

          return {
            ...chat,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });

      this._saveChatsToStorage(connectionId, updatedChats);
      return updatedChats.find((chat) => chat.id === chatId);
    } catch (error) {
      console.error("Error updating assistant message:", error);
    }
  }

  // Private method to get all chats from localStorage
  _getAllChatsFromStorage() {
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    return storedChats ? JSON.parse(storedChats) : {};
  }

  // Private method to save chats to localStorage
  _saveChatsToStorage(connectionId, chats) {
    try {
      const allChats = this._getAllChatsFromStorage();
      allChats[connectionId] = chats;
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(allChats));
    } catch (error) {
      console.error("Error saving chats to storage:", error);
    }
  }
}

export default new ChatService();
