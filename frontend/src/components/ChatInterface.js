import React, { useState, useEffect, useRef } from "react";
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
import { SendFill, Database } from "react-bootstrap-icons";
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
  // State to track loading message
  const [loadingMessage] = useState("");

  // Load chats when active connection changes
  useEffect(() => {
    if (activeConnection) {
      const connectionChats = chatService.getChats(activeConnection.id);
      setChats(connectionChats);

      // Select the first chat if available, or create a new one if none exist
      if (connectionChats.length > 0) {
        setSelectedChatId(connectionChats[0].id);
      } else {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        handleCreateChat();
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

  const handleCreateChat = (title = "Nueva consulta") => {
    if (!activeConnection) return;

    const newChat = chatService.createChat(activeConnection.id, title);
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
    setUserInput("");
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setUserInput("");
  };

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

  if (connections.length === 0) {
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
    <Container fluid className="p-0" style={{ height: "calc(100vh - 136px)" }}>
      <Row className="g-0 h-100">
        {/* Sidebar with chat list */}
        <Col xs={12} md={3} lg={3} className="h-100 d-flex flex-column">
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
                  {connections.map((conn) => (
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
          <div className="flex-grow-1 overflow-hidden">
            <ChatSidebar
              connectionId={activeConnection?.id}
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateChat}
              onDeleteChat={handleDeleteChat}
              onChatRenamed={handleChatRenamed}
            />
          </div>
        </Col>

        {/* Chat window */}
        <Col xs={12} md={9} lg={9} className="h-100 d-flex flex-column">
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
              {/* Chat header */}
              <div className="p-3 border-bottom">
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
