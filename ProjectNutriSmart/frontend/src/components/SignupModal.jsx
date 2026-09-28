import React, { useState } from 'react';

export default function SignupModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    display_name: '' 
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    alert(data.msg);
    if (data.ok) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-content">
        <h3>Sign Up</h3>
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Username" 
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required 
          />
          <input 
            placeholder="Email" 
            type="email" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            placeholder="Password" 
            type="password" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <input 
            placeholder="Display Name (optional)" 
            onChange={e => setFormData({...formData, display_name: e.target.value})} 
          />
          <button type="submit" className="btn">Sign Up</button>
          <button type="button" onClick={onClose} className="ghost">Cancel</button>
        </form>
      </div>
    </div>
  );
}