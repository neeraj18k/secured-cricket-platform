import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// ✅ DIRECT URL (No download needed)
const viratImg = "https://i.pinimg.com/736x/bd/c2/07/bdc2072b88aed737f1af554a70f21843.jpg";

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Login Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="abstract-bg flex items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl w-full max-w-6xl h-[80vh] overflow-hidden flex relative z-10 border border-white/40"
      >
        
        {/* LEFT SIDE: Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center h-full relative">
          
          {/* Logo Brand */}
          <div className="absolute top-10 left-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">aw.</span>
            </div>
            <span className="font-bold text-gray-700 tracking-wide">Abstract World</span>
          </div>

          <div className="mt-12 mb-8">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Welcome Back</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Login to Account</h1>
            <p className="text-gray-500">Please enter your credentials to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            
            {/* Email Input */}
            <div className="relative group">
              <input 
                type="email" 
                required
                className="w-full py-4 px-1 bg-transparent border-b-2 border-gray-200 text-gray-800 text-lg outline-none focus:border-blue-600 transition-colors placeholder-transparent peer"
                id="email"
                placeholder="Email"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <label 
                htmlFor="email" 
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input 
                type="password" 
                required
                className="w-full py-4 px-1 bg-transparent border-b-2 border-gray-200 text-gray-800 text-lg outline-none focus:border-blue-600 transition-colors placeholder-transparent peer"
                id="password"
                placeholder="Password"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <label 
                htmlFor="password" 
                className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Password
              </label>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500 text-sm hover:text-gray-700">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                Remember me
              </label>
              
              {/* 👇 THIS IS THE LINE I ADDED/UPDATED 👇 */}
              <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800">Forgot Password?</Link>
              
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 mt-8">
              <button className="flex-1 bg-blue-600 text-white h-14 rounded-full font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300">
                Login
              </button>
              <Link to="/signup" className="flex-1 border-2 border-gray-200 text-gray-600 h-14 rounded-full font-bold text-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                Sign Up
              </Link>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: Image Section */}
        <div className="hidden lg:block w-1/2 h-full relative">
          <img 
            src={viratImg} 
            alt="Virat Kohli" 
            className="w-full h-full object-cover object-top"
          />
          
          {/* Overlay Gradient & Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent flex flex-col justify-end p-16">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-white text-6xl font-black leading-tight mb-4 drop-shadow-2xl">
                Think<br />
                <span className="text-blue-400">Outside</span><br />
                The Box.
              </h2>
              <p className="text-gray-300 text-lg max-w-sm">
                Experience cricket analytics like never before. Dive deep into the data that defines the game.
              </p>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}