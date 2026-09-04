import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { getProfile } from '../dataCache';
import './AccountPage.css';

export default function DashboardPage(){
  const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);const navigate=useNavigate();
  useEffect(()=>{getProfile().then(setUser).catch(()=>navigate('/login')).finally(()=>setLoading(false))},[navigate]);
  if(loading)return <div className="utility-loading">Waking up your wardrobe…</div>;
  return <div className="page welcome-page"><section className="welcome-note"><p className="eyebrow">A note on your door</p><h1>Hello, {user?.displayName||'you'}.</h1><p>Your small fashion world is ready when you are. Start with what you own, or let chance make the first move.</p><div className="button-row"><Link className="button button--rose" to="/clothes"><Icon name="hanger"/>Open my closet</Link><Link className="button button--paper" to="/generator"><Icon name="sparkle"/>Make a look</Link></div><span className="welcome-note__tape"/></section></div>
}
