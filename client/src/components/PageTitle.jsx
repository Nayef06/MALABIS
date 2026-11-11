import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { policies } from '../pages/legalPolicies';

const pageTitles = {
  '/login': 'Log in',
  '/signup': 'Create an account',
  '/dashboard': 'Dashboard',
  '/account': 'Account',
  '/clothes': 'My closet',
  '/outfits': 'My outfits',
  '/generator': 'Create an outfit',
  '/terms': policies.terms.title,
  '/privacy': policies.privacy.title,
  '/cookies': policies.cookies.title,
  '/cookie-policy': policies.cookies.title,
  '/cookie-settings': 'Cookie settings',
};

export default function PageTitle() {
  const { pathname } = useLocation();
  const pageTitle = pageTitles[pathname.toLowerCase().replace(/\/+$/, '')];

  useEffect(() => {
    const title = (pageTitle || 'Outfit Planner').replace(/\b\w/g, (letter) => letter.toUpperCase());
    document.title = `Malabis - ${title}`;
  }, [pageTitle]);

  return null;
}
