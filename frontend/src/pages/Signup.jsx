import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://secured-cricket-platform.onrender.com/api/auth/signup', formData);
      alert('Signup Successful! Check your email for welcome message.');
      navigate('/login');
    } catch (err) {
      alert('Signup Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black/90">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-slate-900 border border-gray-800 rounded-2xl w-96 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Join Platform</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-3 rounded bg-slate-800 text-white" 
            onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded bg-slate-800 text-white" 
            onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-slate-800 text-white" 
            onChange={e => setFormData({...formData, password: e.target.value})} required />
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded">Sign Up</button>
        </form>
        <Link to="/login" className="block text-center mt-4 text-sm text-gray-400">Already have an account? Login</Link>
      </motion.div>
    </div>
  );
}