import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext';

// const { getAuthHeader, userId, userRole } = useAuth();

const NotificationList = () => {
   
    const { getAuthHeader, userId, userRole } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      axios.get(`http://localhost:5001/notifications?userId=${userId}`)
        .then(response => {
            console.log(response.data);

            
            
          setNotifications(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        });
    }, []);
  
    // const markAsRead = (notificationId) => {
    //   axios.put(`http://localhost:5000/notifications/${notificationId}/read`)
    //     .then(response => {
    //       // Update the state with the new "read" status
    //       setNotifications(notifications.map(notification => 
    //         notification._id === notificationId ? { ...notification, read: true } : notification
    //       ));
    //     })
    //     .catch(error => {
    //       console.error('Error marking notification as read:', error);
    //     });
    // };
  
    if (loading) {
      return <p>Loading notifications...</p>;
    }
  
    return (
      <div>
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <ul>
            {notifications.map(notification => (
              
              <li key={notification._id}>
                <h3>From:{notification.from}</h3>
                <p>{notification.message}</p>
                <small>{new Date(notification.date).toLocaleString()}</small>
                {/* {!notification.read && (
                  <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                )} */}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  

export default NotificationList;
