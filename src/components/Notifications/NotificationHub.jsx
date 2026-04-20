import React, { useState, useEffect, createContext, useContext } from 'react';
import { Bell, X, Info, CheckCircle, AlertCircle, ShoppingCart, Tag } from 'lucide-react';
import './NotificationHub.css';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (notif) => {
    const id = Date.now();
    const newNotif = {
      id,
      type: notif.type || 'info', // info, success, error, cart, promo
      title: notif.title,
      message: notif.message,
      duration: notif.duration || 5000
    };

    setNotifications(prev => [...prev, newNotif]);

    if (newNotif.duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotif.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationHub notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationHub = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-hub">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notif-toast ${notif.type} animate-slide-in`}>
          <div className="notif-icon">
            {notif.type === 'info' && <Info size={18} />}
            {notif.type === 'success' && <CheckCircle size={18} />}
            {notif.type === 'error' && <AlertCircle size={18} />}
            {notif.type === 'cart' && <ShoppingCart size={18} />}
            {notif.type === 'promo' && <Tag size={18} />}
          </div>
          <div className="notif-content">
            <div className="notif-title">{notif.title}</div>
            <div className="notif-message">{notif.message}</div>
          </div>
          <button className="notif-close" onClick={() => removeNotification(notif.id)}>
            <X size={14} />
          </button>
          <div className="notif-progress">
             <div className="progress-bar" style={{ animationDuration: `${notif.duration}ms` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationHub;
