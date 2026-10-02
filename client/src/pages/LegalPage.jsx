import React from 'react';
import LegalShell from '../components/LegalShell';
import './LegalPage.css';

const policies = {
  terms: {
    eyebrow: 'The house rules',
    title: 'Terms of Service',
    intro: 'These terms explain the simple agreement between you and Malabis when you use the wardrobe service.',
    sections: [
      ['Using Malabis', 'You may use Malabis to organize clothing, create outfits, and manage your personal wardrobe. You must provide accurate account information, keep your password private, and use the service only in a lawful way.'],
      ['Your account', 'You are responsible for activity under your account. You may update your profile or permanently delete your account from My corner. We may suspend access when needed to protect the service, other people, or comply with law.'],
      ['Your content', 'You keep ownership of the names, images, clothing details, and outfits you add. You give Malabis permission to store, process, and display that content only as needed to operate and improve the service. Do not upload content you do not have the right to use.'],
      ['Acceptable use', 'Do not misuse the service, attempt unauthorized access, disrupt its operation, upload malicious material, scrape it at unreasonable scale, or use it to violate another person’s rights.'],
      ['Service changes', 'Malabis may add, change, or remove features and may experience interruptions. We aim to keep the service useful and available, but it is provided “as is” without a promise that it will always be uninterrupted or error-free.'],
      ['Liability', 'To the extent permitted by law, Malabis is not liable for indirect, incidental, special, or consequential losses arising from use of the service. Nothing in these terms limits rights or liabilities that cannot legally be limited.'],
      ['Changes to these terms', 'We may update these terms as the service evolves. The effective date below will change when we make a material revision. Continuing to use Malabis after an update means you accept the revised terms.'],
    ],
  },
  privacy: {
    eyebrow: 'What stays in your wardrobe',
    title: 'Privacy Policy',
    intro: 'This policy describes what Malabis collects, why it is used, and the choices you have over your information.',
    sections: [
      ['Information you provide', 'We collect your username, display name, and password in hashed form. We also store the clothing details, image links, favorites, and outfits you choose to add. If you upload an image, it is processed by our image-hosting provider so it can appear in your wardrobe.'],
      ['How we use information', 'We use this information to create and secure your account, show your wardrobe, save your outfits, provide requested features, troubleshoot problems, and maintain the service. We do not sell your personal information.'],
      ['Cookies and browser storage', 'Malabis uses a required session cookie to keep you signed in. The browser also stores a short-lived wardrobe cache for performance and saves your cookie choices locally. Optional analytics and personalization categories remain off unless you enable them.'],
      ['Sharing and service providers', 'Information may be processed by hosting, database, caching, and image-hosting providers that help run Malabis. We may also disclose information when required by law, to protect rights and safety, or as part of a business transfer.'],
      ['Retention and deletion', 'We keep account information while your account is active and as needed for legitimate operational or legal purposes. You can permanently delete your account and its wardrobe records from My corner. Limited backup or security records may persist temporarily before routine deletion.'],
      ['Security', 'We use reasonable technical and organizational measures, including hashed passwords and protected session cookies. No online service can guarantee absolute security, so use a unique password and protect your sign-in details.'],
      ['Your choices', 'You can change your display name and password, manage optional cookie preferences, log out, or delete your account. Depending on where you live, you may also have legal rights to access, correct, or delete personal information.'],
      ['Children', 'Malabis is not directed to children under 13, and we do not knowingly collect personal information from children under 13.'],
      ['Policy updates', 'We may revise this policy when the service or applicable requirements change. Material updates will be reflected by a new effective date.'],
    ],
  },
};

export default function LegalPage({ type }) {
  const policy = policies[type];
  return (
    <LegalShell>
      <main className="legal-page">
        <header className="legal-hero">
          <p className="eyebrow">{policy.eyebrow}</p>
          <h1>{policy.title}</h1>
          <p>{policy.intro}</p>
          <small>Effective October 1, 2026</small>
        </header>
        <article className="legal-paper">
          {policy.sections.map(([title, copy], index) => (
            <section key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h2>{title}</h2><p>{copy}</p></div>
            </section>
          ))}
        </article>
      </main>
    </LegalShell>
  );
}
