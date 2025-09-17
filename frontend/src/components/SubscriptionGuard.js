import React from 'react';
import { Alert, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const SubscriptionGuard = ({
  children,
  requiredPlan = null,
  feature = null,
  showModal = false,
  onClose = null,
  fallbackComponent = null,
  requireActive = true,
  customMessage = null
}) => {
  const {
    hasActiveSubscription,
    currentSubscription,
    subscriptionLoading,
    canAccessFeature,
    isPlanLowerThan,
    getPlanDetails,
    getSubscriptionStatusInfo
  } = useSubscription();

  const navigate = useNavigate();

  // Show loading state
  if (subscriptionLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Verificando suscripción...</span>
        </Spinner>
      </div>
    );
  }

  // Check if user needs active subscription
  if (requireActive && !hasActiveSubscription) {
    const statusInfo = getSubscriptionStatusInfo();

    const content = (
      <Alert variant={statusInfo.variant} className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="alert-heading mb-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Suscripción Requerida
            </h5>
            <p className="mb-2">
              {customMessage || 'Para acceder a esta función necesitas una suscripción activa de NexoSQL.'}
            </p>
            <p className="mb-0 small text-muted">
              Estado actual: {statusInfo.message}
            </p>
          </div>
          <div className="ms-3">
            <Button
              variant={statusInfo.variant === 'warning' ? 'warning' : 'primary'}
              onClick={() => navigate('/subscriptions')}
              size="sm"
            >
              <i className="bi bi-credit-card me-1"></i>
              Ver Planes
            </Button>
          </div>
        </div>
      </Alert>
    );

    if (showModal && onClose) {
      return (
        <Modal show={true} onHide={onClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Suscripción Requerida</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {content}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/subscriptions');
                if (onClose) onClose();
              }}
            >
              Ver Planes de Suscripción
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }

    if (fallbackComponent) {
      return fallbackComponent;
    }

    return content;
  }

  // Check if user has required plan level
  if (requiredPlan && isPlanLowerThan(requiredPlan)) {
    const requiredPlanDetails = getPlanDetails(requiredPlan);
    const currentPlanDetails = currentSubscription ? getPlanDetails(currentSubscription.planType) : null;

    const content = (
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="alert-heading mb-2">
              <i className="bi bi-star me-2"></i>
              Plan Insuficiente
            </h5>
            <p className="mb-2">
              {customMessage || `Esta función requiere el plan ${requiredPlanDetails?.name || requiredPlan} o superior.`}
            </p>
            <p className="mb-0 small text-muted">
              Tu plan actual: {currentPlanDetails?.name || 'No disponible'}
            </p>
          </div>
          <div className="ms-3">
            <Button
              variant="info"
              onClick={() => navigate('/subscriptions')}
              size="sm"
            >
              <i className="bi bi-arrow-up-circle me-1"></i>
              Actualizar Plan
            </Button>
          </div>
        </div>
      </Alert>
    );

    if (showModal && onClose) {
      return (
        <Modal show={true} onHide={onClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Plan Insuficiente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {content}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/subscriptions');
                if (onClose) onClose();
              }}
            >
              Actualizar Plan
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }

    if (fallbackComponent) {
      return fallbackComponent;
    }

    return content;
  }

  // Check if user can access specific feature
  if (feature && !canAccessFeature(feature)) {
    const featureNames = {
      'basic_connections': 'conexiones básicas',
      'advanced_queries': 'consultas avanzadas',
      'ai_optimization': 'optimización con IA',
      'unlimited_connections': 'conexiones ilimitadas',
      'premium_support': 'soporte premium',
      'analytics': 'análisis avanzado'
    };

    const featureName = featureNames[feature] || feature;

    const content = (
      <Alert variant="warning" className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="alert-heading mb-2">
              <i className="bi bi-lock me-2"></i>
              Función No Disponible
            </h5>
            <p className="mb-2">
              {customMessage || `Tu plan actual no incluye ${featureName}.`}
            </p>
            <p className="mb-0 small text-muted">
              Considera actualizar tu plan para acceder a esta función.
            </p>
          </div>
          <div className="ms-3">
            <Button
              variant="warning"
              onClick={() => navigate('/subscriptions')}
              size="sm"
            >
              <i className="bi bi-upgrade me-1"></i>
              Mejorar Plan
            </Button>
          </div>
        </div>
      </Alert>
    );

    if (showModal && onClose) {
      return (
        <Modal show={true} onHide={onClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Función No Disponible</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {content}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate('/subscriptions');
                if (onClose) onClose();
              }}
            >
              Ver Planes
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }

    if (fallbackComponent) {
      return fallbackComponent;
    }

    return content;
  }

  // If all checks pass, render children
  return children;
};

// Higher-order component for protecting routes
export const withSubscriptionGuard = (Component, guardProps = {}) => {
  return function SubscriptionGuardedComponent(props) {
    return (
      <SubscriptionGuard {...guardProps}>
        <Component {...props} />
      </SubscriptionGuard>
    );
  };
};

// Hook for checking subscription requirements in components
export const useSubscriptionGuard = () => {
  const {
    hasActiveSubscription,
    currentSubscription,
    canAccessFeature,
    isPlanLowerThan,
    getConnectionLimit,
    canCreateConnection
  } = useSubscription();

  const checkAccess = (requirements = {}) => {
    const {
      requireActive = true,
      requiredPlan = null,
      feature = null
    } = requirements;

    // Check if active subscription is required
    if (requireActive && !hasActiveSubscription) {
      return {
        allowed: false,
        reason: 'SUBSCRIPTION_REQUIRED',
        message: 'Se requiere una suscripción activa'
      };
    }

    // Check if specific plan is required
    if (requiredPlan && isPlanLowerThan(requiredPlan)) {
      return {
        allowed: false,
        reason: 'INSUFFICIENT_PLAN',
        message: `Se requiere el plan ${requiredPlan} o superior`
      };
    }

    // Check if specific feature access is required
    if (feature && !canAccessFeature(feature)) {
      return {
        allowed: false,
        reason: 'FEATURE_NOT_AVAILABLE',
        message: 'Esta función no está disponible en tu plan actual'
      };
    }

    return {
      allowed: true,
      reason: null,
      message: null
    };
  };

  const getConnectionStatus = (currentConnectionCount) => {
    const limit = getConnectionLimit();
    const canCreate = canCreateConnection(currentConnectionCount);

    return {
      limit,
      current: currentConnectionCount,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentConnectionCount),
      canCreate,
      isUnlimited: limit === -1
    };
  };

  return {
    hasActiveSubscription,
    currentSubscription,
    checkAccess,
    getConnectionStatus,
    canAccessFeature,
    canCreateConnection
  };
};

export default SubscriptionGuard;
