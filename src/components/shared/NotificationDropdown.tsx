'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Archive, AlertCircle, Info, Trophy, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  
  // Mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Best in Show Finalist!', message: 'Maximus has advanced to the final round of the National Championship.', time: '2 mins ago', type: 'competition', isRead: false },
    { id: 2, title: 'Payment Successful', message: 'Your entry fee of ₹1,500 has been received.', time: '1 hour ago', type: 'payment', isRead: false },
    { id: 3, title: 'System Maintenance', message: 'JuzDog will undergo scheduled maintenance tonight at 2 AM.', time: '5 hours ago', type: 'system', isRead: false },
    { id: 4, title: 'Welcome to JuzDog', message: 'Your profile is 100% complete. Register your first dog!', time: '1 day ago', type: 'info', isRead: true },
  ]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'competition': return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-brand-orange" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'competition': return 'bg-yellow-100';
      case 'payment': return 'bg-green-100';
      case 'system': return 'bg-red-100';
      default: return 'bg-orange-50';
    }
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-input transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-foreground text-xs font-bold flex items-center justify-center rounded-full border-2 border-border">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-card/90 backdrop-blur-xl border border-border rounded-[2rem] shadow-2xl z-50 overflow-hidden premium-hover"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-card/50">
                <h3 className="text-lg font-extrabold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm font-bold text-brand-orange hover:text-orange-600 flex items-center gap-1 transition-colors">
                    <Check className="w-4 h-4" /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-card transition-colors cursor-pointer flex gap-4 ${!notification.isRead ? 'bg-orange-50/30' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <span className="text-[10px] font-bold text-muted-foreground mt-2 block">{notification.time}</span>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-card/50 text-center">
                <Button variant="ghost" className="w-full rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-gray-200">
                  View All Notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
