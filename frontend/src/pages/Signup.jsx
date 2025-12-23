import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send data to backend
      await axios.post('https://secured-cricket-platform.onrender.com/api/auth/signup', formData);
      
      // If successful:
      alert('Account Created Successfully!');
      navigate('/login');
      
    } catch (err) {
      // 👇 THIS IS THE FIX: It grabs the real error message from the backend
      const errorMessage = err.response?.data?.message || err.message;
      alert('Signup Failed: ' + errorMessage);
      console.error('Full Error:', err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black/90">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="p-8 glass-panel rounded-2xl w-96 border border-gray-800 bg-slate-900/50 backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Join Platform</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded transition-colors">
            Sign Up
          </button>
        </form>
        
        <Link to="/login" className="block text-center mt-4 text-sm text-gray-400 hover:text-white transition-colors">
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}