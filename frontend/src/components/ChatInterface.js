import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Dropdown,
  InputGroup,
} from "react-bootstrap";
import { SendFill, Database, List } from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { useConnection } from "../contexts/ConnectionContext";
import chatService from "../services/chatService";
import ChatSidebar from "./ChatSidebar";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  // State for sidebar visibility on mobile
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnimating, setSidebarAnimating] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(56);

  // Close profile dropdown when sidebar opens (improve UX)
  useEffect(() => {
    if (sidebarVisible && window.innerWidth < 768) {
      // Dispatch custom event to close profile dropdown
      const closeProfileEvent = new CustomEvent("closeProfileDropdown");
      document.dispatchEvent(closeProfileEvent);
    }
  }, [sidebarVisible]);

  // Load chats when active connection changes
  useEffect(() => {
    const createInitialChat = (title = "Nueva consulta") => {
      if (!activeConnection) return;
      const newChat = chatService.createChat(activeConnection.id, title);
      setChats([newChat]);
      setSelectedChatId(newChat.id);
      setUserInput("");
    };

    if (activeConnection) {
      const connectionChats = chatService.getChats(activeConnection.id);
      setChats(connectionChats);

      // Select the first chat if available, or create a new one if none exist
      if (connectionChats.length > 0) {
        setSelectedChatId(connectionChats[0].id);
      } else {
        createInitialChat();
      }
    } else {
      setChats([]);
      setSelectedChatId(null);
    }
  }, [activeConnection]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, chats]);

  // Focus input field when chat changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedChatId]);

  // Handle body scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (sidebarVisible) {
      document.body.classList.add("mobile-sidebar-open");
    } else {
      document.body.classList.remove("mobile-sidebar-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("mobile-sidebar-open");
    };
  }, [sidebarVisible]);

  // Handle smooth sidebar open/close animations
  const handleOpenSidebar = useCallback(() => {
    if (sidebarAnimating) return;
    setSidebarAnimating(true);
    setSidebarVisible(true);

    // Reset animation state after animation completes
    setTimeout(() => {
      setSidebarAnimating(false);
    }, 350);
  }, [sidebarAnimating]);

  const handleCloseSidebar = useCallback(() => {
    if (sidebarAnimating) return;
    setSidebarAnimating(true);

    // Add slide-out animation class
    const sidebar = document.querySelector(".mobile-sidebar");
    if (sidebar) {
      sidebar.classList.add("sliding-out");
    }

    // Hide sidebar after animation
    setTimeout(() => {
      setSidebarVisible(false);
      setSidebarAnimating(false);
      if (sidebar) {
        sidebar.classList.remove("sliding-out");
      }
    }, 350);
  }, [sidebarAnimating]);

  const handleToggleSidebar = useCallback(() => {
    if (sidebarVisible) {
      handleCloseSidebar();
    } else {
      handleOpenSidebar();
    }
  }, [sidebarVisible, handleCloseSidebar, handleOpenSidebar]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarVisible && window.innerWidth < 768) {
        const sidebar = document.querySelector(".mobile-sidebar");
        if (sidebar && !sidebar.contains(event.target)) {
          handleCloseSidebar();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible, handleCloseSidebar]);

  // Close sidebar on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarVisible) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [sidebarVisible, handleCloseSidebar]);

  // Detect navbar height on mount
  useEffect(() => {
    const detectNavbarHeight = () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        const height = navbar.offsetHeight;
        setNavbarHeight(height);
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${height}px`,
        );
      }
    };

    detectNavbarHeight();
    window.addEventListener("resize", detectNavbarHeight);

    return () => {
      window.removeEventListener("resize", detectNavbarHeight);
    };
  }, []);

  const handleCreateChat = useCallback(
    (title = "Nueva consulta") => {
      if (!activeConnection) return;

      const newChat = chatService.createChat(activeConnection.id, title);
      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
      setUserInput("");
      // Close sidebar on mobile when creating a chat with smooth animation
      if (window.innerWidth < 768) {
        handleCloseSidebar();
      }
    },
    [activeConnection, chats, handleCloseSidebar],
  );

  const handleSelectChat = useCallback(
    (chatId) => {
      setSelectedChatId(chatId);
      setUserInput("");
      // Close sidebar on mobile when selecting a chat with smooth animation
      if (window.innerWidth < 768) {
        handleCloseSidebar();
      }
    },
    [handleCloseSidebar],
  );

  const handleDeleteChat = (chatId) => {
    try {
      chatService.deleteChat(activeConnection.id, chatId);

      // Update local state
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);

      // If we deleted the selected chat, select another one or create a new one
      if (chatId === selectedChatId) {
        if (updatedChats.length > 0) {
          setSelectedChatId(updatedChats[0].id);
        } else {
          handleCreateChat();
        }
      }
    } catch (error) {
      setError("No se pudo eliminar el chat");
      console.error(error);
    }
  };

  const handleChatRenamed = (chatId, newTitle) => {
    try {
      const updatedChat = chatService.renameChat(
        activeConnection.id,
        chatId,
        newTitle,
      );

      // Update local state
      setChats(chats.map((chat) => (chat.id === chatId ? updatedChat : chat)));
    } catch (error) {
      setError("No se pudo renombrar el chat");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !activeConnection ||
      !selectedChatId ||
      !userInput.trim() ||
      isProcessing
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      await chatService.sendQuestion(
        activeConnection.id,
        selectedChatId,
        userInput.trim(),
      );

      // Update the chats from storage to get the updated messages
      setChats(chatService.getChats(activeConnection.id));
      setUserInput("");
    } catch (error) {
      setError(
        `Error al procesar tu consulta: ${error.message || "Por favor, intenta de nuevo."}`,
      );
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedChat = selectedChatId
    ? chats.find((chat) => chat.id === selectedChatId)
    : null;

  const renderMessage = (message) => {
    switch (message.type) {
      case "user":
        return (
          <div className="chat-message user-message">
            <div className="message-content bg-primary text-white p-3 rounded-3">
              {message.content}
            </div>
          </div>
        );
      case "assistant":
        if (message.loading) {
          return (
            <div className="chat-message assistant-message">
              <div className="message-content bg-light p-3 rounded-3">
                <Spinner animation="border" size="sm" className="me-2" />
                Procesando consulta...
              </div>
            </div>
          );
        }

        if (message.error) {
          return (
            <div className="chat-message assistant-message">
              <div className="message-content bg-light p-3 rounded-3 border-danger">
                <Alert variant="danger" className="mb-0">
                  {message.content}
                </Alert>
              </div>
            </div>
          );
        }

        return (
          <div className="chat-message assistant-message">
            <div className="message-content bg-light p-3 rounded-3">
              <ReactMarkdown>{message.content}</ReactMarkdown>

              {message.metadata &&
                message.metadata.queries &&
                message.metadata.queries.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <details>
                      <summary className="text-muted fw-bold cursor-pointer">
                        Consultas SQL ejecutadas (
                        {message.metadata.queries.length})
                      </summary>
                      <div className="mt-2">
                        {message.metadata.queries.map((query, index) => (
                          <div
                            key={`query-${index}-${message.id}`}
                            className="mb-2"
                          >
                            <div className="bg-dark text-light p-2 rounded">
                              <pre className="mb-0">
                                <code>{query.sql}</code>
                              </pre>
                            </div>
                            {query.error && (
                              <Alert
                                variant="danger"
                                className="mt-1 mb-2 py-1 px-2"
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
          </div>
        );
      default:
        return null;
    }
  };

  if (connectionsLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (connectionsError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{connectionsError}</Alert>
      </Container>
    );
  }

  if (!Array.isArray(connections) || connections.length === 0) {
    return (
      <Container className="py-5">
        <Card className="text-center p-5">
          <Card.Body>
            <Database size={64} className="mb-4 text-primary" />
            <Card.Title>No tienes conexiones configuradas</Card.Title>
            <Card.Text>
              Para empezar a usar el asistente SQL, necesitas configurar al
              menos una conexión a una base de datos.
            </Card.Text>
            <Button variant="primary" href="/crear-conexion">
              Crear Primera Conexión
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="p-0 w-100"
      style={{ 
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <Row className="g-0 w-100 position-relative" style={{ height: "100%" }}>
        {/* Mobile overlay */}
        {sidebarVisible && (
          <div
            className={`position-fixed w-100 bg-dark bg-opacity-50 d-md-none mobile-overlay ${sidebarVisible ? "show" : ""}`}
            style={{
              zIndex: 1040,
              top: 0,
              height: "100%",
            }}
            onClick={handleCloseSidebar}
          />
        )}

        {/* Sidebar with chat list */}
        <Col
          xs={12}
          md={3}
          lg={2}
          className={`d-flex flex-column position-md-relative bg-white mobile-sidebar ${
            sidebarVisible ? "d-block position-fixed" : "d-none d-md-block"
          }`}
          style={{
            height: "100%",
            zIndex: sidebarVisible ? 1050 : "auto",
            width: sidebarVisible ? "80%" : undefined,
            maxWidth: sidebarVisible ? "300px" : undefined,
            left: sidebarVisible ? 0 : undefined,
            top: sidebarVisible ? 0 : undefined,
          }}
        >
          <div className="p-3 bg-light border-bottom">
            <Form.Group>
              <Form.Label>Conexión activa</Form.Label>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  className="w-100 text-start d-flex align-items-center justify-content-between"
                >
                  {activeConnection?.nombre || "Seleccionar conexión"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {Array.isArray(connections) &&
                    connections.map((conn) => (
                      <Dropdown.Item
                        key={conn.id}
                        active={activeConnection?.id === conn.id}
                        onClick={() => {
                          // Dispatch custom event to change connection
                          const event = new CustomEvent("changeConnection", {
                            detail: { connectionId: conn.id },
                          });
                          document.dispatchEvent(event);
                        }}
                      >
                        {conn.nombre} - {conn.motor?.nombre || "Base de datos"}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          </div>
          <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
            <ChatSidebar
              connectionId={activeConnection?.id}
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateChat}
              onDeleteChat={handleDeleteChat}
              onChatRenamed={handleChatRenamed}
              onSidebarToggle={handleCloseSidebar}
            />
          </div>
        </Col>

        {/* Chat window */}
        <Col
          xs={12}
          md={9}
          lg={10}
          className="d-flex flex-column chat-main-container"
          style={{ marginLeft: 0, height: "100%" }}
        >
          {/* Mobile header with hamburger menu */}
          <div className="d-md-none p-2 border-bottom bg-white d-flex align-items-center justify-content-between mobile-chat-header">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleToggleSidebar}
              className="mobile-menu-button"
              disabled={sidebarAnimating}
            >
              <List size={20} />
            </Button>
            <h6 className="mb-0 flex-grow-1 text-center text-truncate">
              {selectedChat?.title || "Asistente SQL"}
            </h6>
            <div style={{ width: "40px" }}></div> {/* Spacer for centering */}
          </div>
          {!selectedChat ? (
            <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-light text-center p-4">
              <Database size={64} className="mb-4 text-secondary" />
              <h4>Asistente SQL NexoSQL</h4>
              <p className="text-muted">
                Selecciona un chat existente o crea uno nuevo para comenzar a
                interactuar con tus bases de datos a través de lenguaje natural.
              </p>
              {activeConnection && (
                <Button variant="primary" onClick={() => handleCreateChat()}>
                  Nuevo Chat
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Chat header - hidden on mobile since we have the mobile header */}
              <div className="p-3 border-bottom d-none d-md-block">
                <h5 className="mb-0">{selectedChat.title}</h5>
                <small className="text-muted">
                  Conexión: {activeConnection?.nombre} (
                  {activeConnection?.motor?.nombre})
                </small>
              </div>

              {/* Messages area */}
              <div className="flex-grow-1 p-3 overflow-auto bg-light">
                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}

                {selectedChat.messages.length === 0 ? (
                  <div className="text-center my-5 py-5">
                    <Database size={48} className="mb-3 text-secondary" />
                    <h5>¡Comienza a hacer preguntas sobre tu base de datos!</h5>
                    <p className="text-muted">
                      Puedes preguntar cosas como "¿Cuántos usuarios hay
                      registrados?" o "Muéstrame las ventas del último mes"
                    </p>
                  </div>
                ) : (
                  <div className="chat-messages">
                    {[
                      ...new Map(
                        selectedChat.messages.map((msg) => [msg.id, msg]),
                      ).values(),
                    ].map((message) => (
                      <div key={message.id} className="mb-3">
                        {renderMessage(message)}
                      </div>
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="p-3 border-top">
                <Form onSubmit={handleSubmit}>
                  <InputGroup>
                    <Form.Control
                      ref={inputRef}
                      type="text"
                      placeholder="Escribe tu consulta en lenguaje natural..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isProcessing || !activeConnection}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        isProcessing || !userInput.trim() || !activeConnection
                      }
                    >
                      {isProcessing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <SendFill />
                      )}
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatInterface;
