import React from 'react';
import '../Modal.css'; // Optional, for styling the modal

const Modal = ({ isOpen, onClose, onSubmit, orderId, currentRating }) => {
  if (!isOpen) return null;  // Don't render modal if it's not open

  // Handle form submission
  const handleSubmit = () => {
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    onSubmit(orderId, rating);  // Pass orderId and rating to parent
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate Your Order</h2>
        <p>Order ID: {orderId}</p>
        <div>
          <h4>Select Rating</h4>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((rate) => (
              <label key={rate}>
                <input
                  type="radio"
                  name="rating"
                  value={rate}
                  defaultChecked={currentRating === rate.toString()}
                />
                {rate}
              </label>
            ))}
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
          <button onClick={handleSubmit}>Submit Review</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
