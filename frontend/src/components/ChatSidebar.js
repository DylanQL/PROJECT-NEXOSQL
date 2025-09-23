import React, { useState } from "react";
import {
  ListGroup,
  Button,
  Form,
  Modal,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import {
  PlusLg,
  ChatLeftText,
  Pencil,
  Trash,
  ThreeDots,
} from "react-bootstrap-icons";

const ChatSidebar = ({
  connectionId,
  chats,
  selectedChatId,
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
    // Close sidebar on mobile after creating chat
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

  const openRenameModal = (chat, e) => {
    e.stopPropagation();
    setChatToRename(chat);
    setRenameValue(chat.title);
    setShowRenameModal(true);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!connectionId) {
    return (
      <div className="d-flex flex-column h-100 border-end">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Chats</h5>
        </div>
        <div className="p-4 text-center text-muted">
          <ChatLeftText size={48} className="mb-3" />
          <p>Selecciona una conexión para ver tus chats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-sidebar-container border-end w-100" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="chat-sidebar-header p-2 border-bottom d-flex justify-content-between align-items-center" style={{ flexShrink: 0 }}>
        <h5 className="mb-0">Chats</h5>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowNewChatModal(true)}
        >
          <PlusLg size={16} /> Nuevo
        </Button>
      </div>

      {/* Chat list with optimized scroll */}
      <div 
        className="chat-list-container"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: 'calc(100vh - 120px)', // Better height calculation
          height: 'auto'
        }}
      >
          {chats.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <ChatLeftText size={36} className="mb-2" />
              <p className="small">No hay chats para esta conexión</p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowNewChatModal(true)}
              >
                Crear primer chat
              </Button>
            </div>
          ) : (
            <ListGroup variant="flush">
              {chats.map((chat) => (
                <ListGroup.Item
                  key={chat.id}
                  action
                  active={selectedChatId === chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    // Close sidebar on mobile after selecting chat
                    if (onSidebarToggle && window.innerWidth < 768) {
                      onSidebarToggle();
                    }
                  }}
                  className="d-flex justify-content-between align-items-center py-2"
                >
                  <div className="text-truncate flex-grow-1">
                    <div className="fw-medium text-truncate small">
                      {chat.title}
                    </div>
                    <small className="text-muted d-block text-truncate">
                      {formatDate(chat.updatedAt)}
                    </small>
                  </div>
                  <DropdownButton
                    variant={selectedChatId === chat.id ? "dark" : "light"}
                    size="sm"
                    title={<ThreeDots />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown.Item onClick={(e) => openRenameModal(chat, e)}>
                      <Pencil className="me-2" /> Renombrar
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="text-danger"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash className="me-2" /> Eliminar
                    </Dropdown.Item>
                  </DropdownButton>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

      {/* New Chat Modal */}
      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Título del chat</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ejemplo: Consultas de ventas"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
              />
              <Form.Text className="text-muted">
                Si dejas este campo vacío, se usará un título genérico.
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

      {/* Rename Chat Modal */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nuevo título</Form.Label>
              <Form.Control
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
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
    </div>
  );
};

export default ChatSidebar;
