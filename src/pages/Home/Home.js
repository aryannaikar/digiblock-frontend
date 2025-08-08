import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './home.css'
export default function Home() {
  const { user} = useAuth();
  return (
    <div className='home-container'>
            
        
      <h1>Welcome {user.username}!</h1>
 
      
      <h2>Welcome to DigiLocker Dashboard</h2>
      
   
    </div>
  );
} 
