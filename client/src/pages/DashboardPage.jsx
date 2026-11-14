import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { DashboardSkeleton } from '../components/LoadingSkeletons';
import { getProfile } from '../dataCache';
import './AccountPage.css';

export default function DashboardPage(){
  const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);const navigate=useNavigate();
  useEffect(()=>{getProfile().then(setUser).catch(()=>navigate('/login')).finally(()=>setLoading(false))},[navigate]);
  if(loading)return <DashboardSkeleton/>;
  return <div className="page welcome-page"><section className="welcome-note"><p className="eyebrow">Dashboard</p><h1>{user?.displayName ? `Hi, ${user.displayName}.` : 'Welcome back.'}</h1><p>Manage your clothes or create an outfit from your closet.</p><div className="button-row"><Link className="button button--rose" to="/clothes"><Icon name="hanger"/>Open my closet</Link><Link className="button button--paper" to="/generator"><Icon name="sparkle"/>Create an outfit</Link></div><span className="welcome-note__tape"/></section></div>
}
