import React, { createContext, useContext, useState, useEffect } from 'react';
import { conexionDBApi } from '../services/api';
import { useAuth } from './AuthContext';

const ConnectionContext = createContext();

// Create a custom event for connection changes
const CONNECTION_CHANGE_EVENT = 'changeConnection';

export function useConnection() {
  return useContext(ConnectionContext);
}

export function ConnectionProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load connections when user profile is available
  useEffect(() => {
    if (currentUser && userProfile) {
      fetchConnections();
    } else {
      setConnections([]);
      setActiveConnection(null);
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  // Load active connection from localStorage when connections are loaded
  useEffect(() => {
    if (connections.length > 0) {
      const savedConnectionId = localStorage.getItem('activeConnectionId');
      if (savedConnectionId) {
        const savedConnection = connections.find(conn => conn.id.toString() === savedConnectionId);
        if (savedConnection) {
          setActiveConnection(savedConnection);
        } else {
          // If saved connection no longer exists, set first available connection as active
          setActiveConnection(connections[0]);
          localStorage.setItem('activeConnectionId', connections[0].id.toString());
        }
      } else {
        // If no connection was saved, set first connection as active
        setActiveConnection(connections[0]);
        localStorage.setItem('activeConnectionId', connections[0].id.toString());
      }
    }
  }, [connections]);

  // Set up event listener for connection changes from global context
  useEffect(() => {
    const handleConnectionChange = (event) => {
      if (event.detail && event.detail.connectionId) {
        changeActiveConnection(event.detail.connectionId);
      }
    };

    // Add event listener to document for the connection context
    document.addEventListener(CONNECTION_CHANGE_EVENT, handleConnectionChange);

    return () => {
      document.removeEventListener(CONNECTION_CHANGE_EVENT, handleConnectionChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await conexionDBApi.getUserConnections();

      if (error) {
        throw new Error(error);
      }

      setConnections(data || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('No se pudieron cargar las conexiones. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const changeActiveConnection = (connectionId) => {
    const connection = connections.find(conn => conn.id.toString() === connectionId.toString());

    if (connection) {
      setActiveConnection(connection);
      localStorage.setItem('activeConnectionId', connection.id.toString());
      return true;
    }

    return false;
  };

  const value = {
    connections,
    activeConnection,
    loading,
    error,
    fetchConnections,
    changeActiveConnection,
  };

  // Make the connection context available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.connectionContext = {
        changeActiveConnection: (connectionId) => {
          const event = new CustomEvent(CONNECTION_CHANGE_EVENT, {
            detail: { connectionId }
          });
          document.dispatchEvent(event);
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.connectionContext;
      }
    };
  }, []);

  return (
    <ConnectionContext.Provider value={value} data-connection-context>
      {children}
    </ConnectionContext.Provider>
  );
}
