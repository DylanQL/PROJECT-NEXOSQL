import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Alert,
  Badge,
  Button,
  Dropdown,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  List,
  SendFill,
  XCircleFill,
  Database,
  LightningCharge,
  ClockHistory,
} from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { useConnection } from "../contexts/ConnectionContext";
import chatService from "../services/chatService";
import ChatSidebar from "./ChatSidebar";

const CANCELLATION_CONTENT_SNIPPETS = [
  "la consulta fue cancelada por el usuario",
  "consulta cancelada por el usuario",
];

const removeTempMessages = (messages = []) =>
  messages.filter(
    (msg) =>
      !(
        msg?.id?.startsWith("temp-user-") ||
        msg?.id?.startsWith("temp-assistant-")
      ),
  );

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

const shouldHideMessage = (message) => {
  if (!message) return false;
  if (message.cancelado) return true;
  if (message.metadata?.cancelled) return true;

  const content = message.content?.toLowerCase();
  if (!content) return false;

  return CANCELLATION_CONTENT_SNIPPETS.some((snippet) =>
    content.includes(snippet),
  );
};

const ChatInterface = () => {
  const {
    connections,
    activeConnection,
    loading: connectionsLoading,
    error: connectionsError,
  } = useConnection();

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [processingChats, setProcessingChats] = useState({});
  const [activeRequest, setActiveRequest] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [error, setError] = useState(null);

  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) || null,
    [chats, selectedChatId],
  );

  const messagesToRender = useMemo(() => {
    if (!selectedChat?.messages) return [];

    const visibleMessages = selectedChat.messages.filter(
      (message) => !shouldHideMessage(message),
    );

    return sortMessagesChronologically(visibleMessages);
  }, [selectedChat]);

  const setChatProcessing = useCallback((chatId, isProcessing) => {
    if (!chatId) return;
    setProcessingChats((prev) => {
      if (isProcessing) {
        return { ...prev, [chatId]: true };
      }
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
  }, []);

  const isChatProcessing = useCallback(
    (chatId) => Boolean(chatId && processingChats[chatId]),
    [processingChats],
  );

  const isCurrentChatProcessing = isChatProcessing(selectedChatId);

  useEffect(() => {
    if (sidebarVisible && window.innerWidth < 768) {
      const closeProfileEvent = new CustomEvent("closeProfileDropdown");
      document.dispatchEvent(closeProfileEvent);
    }
  }, [sidebarVisible]);

  useEffect(() => {
    const loadChats = async () => {
      if (!activeConnection) {
        setChats([]);
        setSelectedChatId(null);
        return;
      }

      try {
        const connectionChats = await chatService.getChats(activeConnection.id);
        setChats(connectionChats);
        setSelectedChatId(connectionChats[0]?.id ?? null);
      } catch (err) {
        console.error("Error loading chats:", err);
        setError("Error cargando el historial de chats");
        setChats([]);
        setSelectedChatId(null);
      }

      setUserInput("");
    };

    loadChats();
  }, [activeConnection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 120);

    return () => clearTimeout(timer);
  }, [messagesToRender.length, selectedChatId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedChatId]);

  useEffect(() => {
    if (sidebarVisible && window.innerWidth < 768) {
      document.body.classList.add("mobile-sidebar-open");
    } else {
      document.body.classList.remove("mobile-sidebar-open");
    }

    return () => {
      document.body.classList.remove("mobile-sidebar-open");
    };
  }, [sidebarVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    const height = navbar?.offsetHeight ?? 64;
    document.documentElement.style.setProperty("--navbar-height", `${height}px`);
  }, []);

  const handleCreateChat = useCallback(
    async (title = "Nueva consulta") => {
      if (!activeConnection) return;

      try {
        const newChat = await chatService.createChat(activeConnection.id, title);
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        setUserInput("");
        setSidebarVisible(false);
      } catch (err) {
        setError("No se pudo crear el chat");
        console.error(err);
      }
    },
    [activeConnection],
  );

  const handleSelectChat = useCallback((chatId) => {
    setSelectedChatId(chatId);
    setUserInput("");
    setSidebarVisible(false);
  }, []);

  const handleDeleteChat = useCallback(
    async (chatId) => {
      if (!activeConnection) return;

      try {
        await chatService.deleteChat(activeConnection.id, chatId);

        const updatedChats = chats.filter((chat) => chat.id !== chatId);
        setChats(updatedChats);

        setProcessingChats((prev) => {
          if (!prev[chatId]) return prev;
          const next = { ...prev };
          delete next[chatId];
          return next;
        });

        if (chatId === selectedChatId) {
          setSelectedChatId(updatedChats[0]?.id ?? null);
        }
      } catch (err) {
        setError("No se pudo eliminar el chat");
        console.error(err);
      }
    },
    [activeConnection, chats, selectedChatId],
  );

  const handleChatRenamed = useCallback(
    async (chatId, newTitle) => {
      if (!activeConnection) return;

      try {
        const updatedChat = await chatService.renameChat(
          activeConnection.id,
          chatId,
          newTitle,
        );

        setChats((prev) =>
          prev.map((chat) => (chat.id === chatId ? updatedChat : chat)),
        );
      } catch (err) {
        setError("No se pudo renombrar el chat");
        console.error(err);
      }
    },
    [activeConnection],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeConnection || !userInput.trim()) return;

    let targetChatId = selectedChatId;
    const userMessage = userInput.trim();

    if (isChatProcessing(targetChatId)) return;

    abortControllerRef.current = new AbortController();

    try {
      setError(null);

      if (!targetChatId) {
        const newChat = await chatService.createChat(
          activeConnection.id,
          "Nueva consulta",
        );
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(newChat.id);
        targetChatId = newChat.id;
      }

      const tempUserMessage = {
        id: `temp-user-${Date.now()}`,
        type: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };

      const tempAssistantMessage = {
        id: `temp-assistant-${Date.now()}`,
        type: "assistant",
        content: "Procesando consulta...",
        loading: true,
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === targetChatId
            ? {
                ...chat,
                messages: sortMessagesChronologically([
                  ...removeTempMessages(chat.messages),
                  tempUserMessage,
                  tempAssistantMessage,
                ]),
              }
            : chat,
        ),
      );

      setChatProcessing(targetChatId, true);
      const threadId = crypto.randomUUID();
      setActiveRequest({ chatId: targetChatId, threadId });
      setUserInput("");

      await chatService.sendQuestion(
        activeConnection.id,
        targetChatId,
        userMessage,
        threadId,
        abortControllerRef.current.signal,
      );

      const updatedChats = await chatService.getChats(activeConnection.id);
      setChats(updatedChats);
    } catch (err) {
      if (err.name === "AbortError") {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === targetChatId
              ? {
                  ...chat,
                  messages: sortMessagesChronologically(
                    removeTempMessages(chat.messages),
                  ),
                }
              : chat,
          ),
        );
        return;
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== targetChatId) return chat;

          const cleanedMessages = removeTempMessages(chat.messages);

          return {
            ...chat,
            messages: sortMessagesChronologically([
              ...cleanedMessages,
              {
                id: `error-user-${Date.now()}`,
                type: "user",
                content: userMessage,
                timestamp: new Date().toISOString(),
              },
              {
                id: `error-${Date.now()}`,
                type: "assistant",
                content: `Error al procesar tu consulta: ${
                  err.message || "Por favor, intenta de nuevo."
                }`,
                error: true,
                timestamp: new Date().toISOString(),
              },
            ]),
          };
        }),
      );

      setError(
        `Error al procesar tu consulta: ${
          err.message || "Por favor, intenta de nuevo."
        }`,
      );
      console.error(err);
    } finally {
      if (targetChatId) {
        setChatProcessing(targetChatId, false);
      }
      setActiveRequest(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest && !abortControllerRef.current) return;

    try {
      if (activeRequest?.threadId) {
        await chatService.cancelMessage(activeRequest.threadId);
      }
    } catch (err) {
      console.error("Error cancelling request", err);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (activeRequest?.chatId) {
      setChatProcessing(activeRequest.chatId, false);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeRequest.chatId
              ? {
                  ...chat,
                  messages: sortMessagesChronologically(
                    removeTempMessages(chat.messages),
                  ),
                }
              : chat,
          ),
        );
    }

    setActiveRequest(null);
  };

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const renderMessage = (message) => {
    if (!message) return null;

    if (message.type === "user") {
      return (
        <div className="chat-bubble chat-bubble--user">
          <div className="chat-bubble__content">{message.content}</div>
          <span className="chat-bubble__meta">Tú</span>
        </div>
      );
    }

    if (message.type === "assistant") {
      if (message.loading) {
        return (
          <div className="chat-bubble chat-bubble--assistant">
            <div className="chat-bubble__content">
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando consulta...
            </div>
          </div>
        );
      }

      if (message.error || message.cancelado) {
        return (
          <div className="chat-bubble chat-bubble--assistant">
            <Alert variant={message.cancelado ? "warning" : "danger"} className="mb-0">
              {message.cancelado
                ? "Esta consulta fue cancelada por el usuario"
                : message.content}
            </Alert>
          </div>
        );
      }

      return (
        <div className="chat-bubble chat-bubble--assistant">
          <div className="chat-bubble__content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {Array.isArray(message.metadata?.queries) &&
            message.metadata.queries.length > 0 && (
              <div className="chat-bubble__sidebar">
                <details>
                  <summary className="chat-bubble__summary">
                    Consultas SQL ejecutadas ({
                      message.metadata.queries.length
                    })
                  </summary>
                  <div className="chat-bubble__queries">
                    {message.metadata.queries.map((query, index) => (
                      <div key={`query-${index}-${message.id}`} className="chat-query">
                        <pre className="chat-query__code">
                          <code>{query.sql}</code>
                        </pre>
                        {query.error && (
                          <Alert
                            variant="danger"
                            className="chat-query__error"
                          >
                            <small>{query.error}</small>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
        </div>
      );
    }

    return null;
  };

  if (connectionsLoading) {
    return (
      <div className="chat-loader">
        <Spinner animation="border" role="status" />
        <p className="mt-3 text-muted">Cargando tus conexiones...</p>
      </div>
    );
  }

  if (connectionsError) {
    return (
      <div className="chat-loader">
        <Alert variant="danger">{connectionsError}</Alert>
      </div>
    );
  }

  if (!Array.isArray(connections) || connections.length === 0) {
    return (
      <div className="chat-empty">
        <Database size={60} className="text-primary mb-3" />
        <h4 className="fw-semibold">Configura tu primera conexión</h4>
        <p className="text-muted mb-4 text-center" style={{ maxWidth: 360 }}>
          Para comenzar a usar el asistente, crea una conexión a tu base de
          datos y obtén respuestas en segundos.
        </p>
        <Button href="/crear-conexion" variant="primary">
          Crear conexión
        </Button>
      </div>
    );
  }

  const showCancelButton =
    Boolean(activeRequest?.chatId) && activeRequest.chatId === selectedChatId;

  return (
    <div className="chat-app">
      <div
        className={`chat-app__sidebar ${sidebarVisible ? "is-open" : ""}`}
      >
        <div className="chat-app__sidebar-header">
          <div>
            <span className="text-uppercase text-muted small">Conexión activa</span>
            <h5 className="mb-0 mt-1 text-truncate">
              {activeConnection?.nombre || "Seleccionar conexión"}
            </h5>
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              className="shadow-none"
            >
              Cambiar
            </Dropdown.Toggle>
            <Dropdown.Menu className="chat-app__dropdown">
              {connections.map((conn) => (
                <Dropdown.Item
                  key={conn.id}
                  active={activeConnection?.id === conn.id}
                  onClick={() => {
                    const event = new CustomEvent("changeConnection", {
                      detail: { connectionId: conn.id },
                    });
                    document.dispatchEvent(event);
                    setSidebarVisible(false);
                  }}
                >
                  <div className="fw-semibold">{conn.nombre}</div>
                  <small className="text-muted">
                    {conn.motor?.nombre || "Base de datos"}
                  </small>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <ChatSidebar
          connectionId={activeConnection?.id}
          chats={chats}
          selectedChatId={selectedChatId}
          processingChats={processingChats}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          onChatRenamed={handleChatRenamed}
          onSidebarToggle={() => setSidebarVisible(false)}
        />
      </div>

      <div className="chat-app__main">
        <div className="chat-app__header">
          <div className="chat-app__header-left">
            <Button
              variant="outline-secondary"
              size="sm"
              className="chat-app__menu-trigger d-md-none"
              onClick={handleToggleSidebar}
            >
              <List size={18} />
            </Button>

            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="chat-app__title mb-0 text-truncate">
                  {selectedChat?.title || "Asistente SQL"}
                </h2>
                <Badge bg="primary" className="d-none d-md-inline-flex align-items-center gap-1">
                  <LightningCharge size={14} /> IA
                </Badge>
              </div>
              <div className="chat-app__subtitle text-muted mt-1">
                <Database size={14} className="me-1" />
                {activeConnection?.nombre}
              </div>
            </div>
          </div>

          {selectedChat && (
            <div className="chat-app__status">
              <ClockHistory size={14} className="me-1 text-muted" />
              <span className="text-muted small">
                Actualizado {new Date(selectedChat.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="mx-3 mb-3">
            {error}
          </Alert>
        )}

        <div className="chat-app__body">
          {!selectedChat ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder__icon">
                <LightningCharge size={42} />
              </div>
              <h4 className="fw-semibold">Comienza una nueva conversación</h4>
              <p className="text-muted">
                Describe lo que necesitas saber y NexoSQL traducirá tu pregunta
                a consultas SQL optimizadas.
              </p>
              <div className="chat-placeholder__tips">
                <span>Ejemplos:</span>
                <ul>
                  <li>"Muéstrame las ventas por categoría del último trimestre"</li>
                  <li>"¿Cuántos usuarios activos tuvimos la semana pasada?"</li>
                  <li>"Genera un resumen de ingresos por país"</li>
                </ul>
              </div>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => handleCreateChat("Nueva consulta")}
              >
                Crear primer chat
              </Button>
            </div>
          ) : (
            <div className="chat-thread">
              {messagesToRender.length === 0 ? (
                <div className="chat-thread__empty">
                  <p className="text-muted mb-0">
                    Todavía no hay mensajes en esta conversación.
                  </p>
                </div>
              ) : (
                messagesToRender.map((message) => (
                  <div className="chat-thread__item" key={message.id}>
                    {renderMessage(message)}
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        <div className="chat-app__composer">
          <Form onSubmit={handleSubmit} className="chat-composer">
            <Form.Control
              as="textarea"
              rows={1}
              ref={inputRef}
              className="chat-composer__input"
              placeholder="Escribe tu consulta en lenguaje natural..."
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              disabled={!activeConnection || isCurrentChatProcessing}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
            />

            <div className="chat-composer__actions">
              {showCancelButton && (
                <Button
                  variant="outline-danger"
                  type="button"
                  size="sm"
                  className="me-2"
                  onClick={handleCancelRequest}
                >
                  <XCircleFill size={16} className="me-1" />
                  Cancelar
                </Button>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={!userInput.trim() || isCurrentChatProcessing}
                className="d-inline-flex align-items-center"
              >
                {isCurrentChatProcessing ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <SendFill size={16} className="me-2" />
                )}
                Enviar
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {sidebarVisible && (
        <div
          className="chat-app__overlay d-md-none"
          role="presentation"
          onClick={() => setSidebarVisible(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
