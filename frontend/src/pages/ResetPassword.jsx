import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // useParams gets the token
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams(); // 👈 GRABS THE TOKEN FROM URL
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send token + new password to backend
      await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      toast.success('Password Reset Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token Expired or Invalid');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Set New Password</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Your token is active. Enter a new password.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Strong Password" 
            className="w-full p-3 border rounded-lg bg-gray-50 text-black outline-none focus:border-blue-500"
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}