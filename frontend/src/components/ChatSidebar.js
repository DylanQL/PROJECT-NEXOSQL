import React, { useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  PlusLg,
  ThreeDots,
  Pencil,
  Trash,
  ChatLeftText,
  ClockHistory,
} from "react-bootstrap-icons";

const ChatSidebar = ({
  connectionId,
  chats,
  selectedChatId,
  processingChats = {},
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onChatRenamed,
  onSidebarToggle,
}) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [chatToRename, setChatToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreateChat = () => {
    const title = newChatTitle.trim() || "Nueva consulta";
    onCreateChat(title);
    setNewChatTitle("");
    setShowNewChatModal(false);
    if (onSidebarToggle && window.innerWidth < 768) {
      onSidebarToggle();
    }
  };

  const handleRenameChat = () => {
    if (chatToRename && renameValue.trim()) {
      onChatRenamed(chatToRename.id, renameValue.trim());
      setShowRenameModal(false);
      setChatToRename(null);
      setRenameValue("");
    }
  };

  const openRenameModal = (chat, event) => {
    event.preventDefault();
    event.stopPropagation();
    setChatToRename(chat);
    setRenameValue(chat.title);
    setShowRenameModal(true);
  };

  const handleDelete = (chat, event) => {
    event.preventDefault();
    event.stopPropagation();
    onDeleteChat(chat.id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!connectionId) {
    return (
      <aside className="chat-sidebar chat-sidebar--empty">
        <div className="chat-sidebar__placeholder">
          <ChatLeftText size={40} className="mb-3 text-muted" />
          <p className="text-muted mb-0 text-center">
            Selecciona una conexión para ver tu historial de chats.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__top">
        <div>
          <span className="chat-sidebar__eyebrow">Historial</span>
          <h6 className="mb-0">Conversaciones</h6>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="d-inline-flex align-items-center gap-1"
          onClick={() => setShowNewChatModal(true)}
        >
          <PlusLg size={16} /> Nuevo chat
        </Button>
      </div>

      <div className="chat-sidebar__list">
        {chats.length === 0 ? (
          <div className="chat-sidebar__empty">
            <ChatLeftText size={36} className="mb-2 text-muted" />
            <p className="small text-muted mb-3 text-center px-2">
              No hay conversaciones todavía. Crea tu primer chat para comenzar.
            </p>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowNewChatModal(true)}
            >
              Crear primer chat
            </Button>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = selectedChatId === chat.id;
            const isProcessing = Boolean(processingChats[chat.id]);

            return (
              <button
                key={chat.id}
                type="button"
                className={`chat-sidebar__item ${isActive ? "is-active" : ""}`}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (onSidebarToggle && window.innerWidth < 768) {
                    onSidebarToggle();
                  }
                }}
              >
                <div className="chat-sidebar__item-main">
                  <span className="chat-sidebar__item-title text-truncate">
                    {chat.title}
                  </span>
                  <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                    <Dropdown.Toggle
                      variant="link"
                      bsPrefix="chat-sidebar__item-toggle"
                    >
                      <ThreeDots />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={(event) => openRenameModal(chat, event)}>
                        <Pencil className="me-2" size={14} /> Renombrar
                      </Dropdown.Item>
                      <Dropdown.Item
                        className="text-danger"
                        onClick={(event) => handleDelete(chat, event)}
                      >
                        <Trash className="me-2" size={14} /> Eliminar
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="chat-sidebar__item-footer">
                  {isProcessing ? (
                    <span className="chat-sidebar__badge">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Procesando
                    </span>
                  ) : (
                    <span className="chat-sidebar__meta">
                      <ClockHistory size={12} className="me-1" />
                      {formatDate(chat.updatedAt)}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Título del chat</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ejemplo: Consultas de ventas"
                value={newChatTitle}
                onChange={(event) => setNewChatTitle(event.target.value)}
              />
              <Form.Text className="text-muted">
                Si dejas este campo vacío, usaremos un título genérico.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewChatModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateChat}>
            Crear
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nuevo título</Form.Label>
              <Form.Control
                type="text"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleRenameChat}
            disabled={!renameValue.trim()}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </aside>
  );
};

export default ChatSidebar;
