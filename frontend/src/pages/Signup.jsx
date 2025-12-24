import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🚀 Attempting Signup...");

    try {
      const res = await axios.post('https://secured-cricket-platform.onrender.com/api/auth/signup', formData);
      console.log("✅ Server Response:", res.data);
      alert('Signup Successful! Check your email.');
      navigate('/login');
    } catch (err) {
      console.error("❌ Signup Error:", err);
      alert('Signup Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black/90 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-slate-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Join Platform</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-3 rounded bg-slate-800 text-white border border-gray-700 outline-none focus:border-green-500" 
            onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded bg-slate-800 text-white border border-gray-700 outline-none focus:border-green-500" 
            onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-slate-800 text-white border border-gray-700 outline-none focus:border-green-500" 
            onChange={e => setFormData({...formData, password: e.target.value})} required />
          <button 
            disabled={loading}
            className={`w-full font-bold p-3 rounded transition-all ${loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white`}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <Link to="/login" className="block text-center mt-4 text-sm text-gray-400 hover:text-white transition-colors">Already have an account? Login</Link>
      </motion.div>
    </div>
  );
}