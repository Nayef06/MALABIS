import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LegalShell from '../components/LegalShell';
import { Icon } from '../components/Icons';
import { LEGAL_EMAIL, policies, POLICY_DATE } from './legalPolicies';
import './LegalPage.css';

export default function LegalPage({ type }) {
  const policy = policies[type];
  const [activeSection, setActiveSection] = useState(policy.sections[0].id);
  const [contentsOpen, setContentsOpen] = useState(false);
  const relatedType = type === 'terms' ? 'privacy' : type === 'privacy' ? 'cookies' : 'privacy';

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = `${policy.title} | Malabis`;
    if (description) description.content = policy.intro;
    setActiveSection(policy.sections[0].id);
    setContentsOpen(false);

    const frame = requestAnimationFrame(() => {
      const target = policy.sections.find((section) => `#${section.id}` === window.location.hash);
      if (target) document.getElementById(target.id)?.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-10% 0px -65% 0px' });
    policy.sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.title = previousTitle;
      if (description) description.content = previousDescription;
    };
  }, [policy]);

  return (
    <LegalShell>
      <main id="legal-main" className="legal-page" tabIndex={-1}>
        <header className="legal-hero" id="legal-top">
          <p className="eyebrow">Malabis / Legal</p>
          <h1>{policy.title}</h1>
          <p className="legal-intro">{policy.intro}</p>
          <div className="legal-meta">
            <span><span className="legal-status-dot" aria-hidden="true" />Effective <time dateTime="2026-10-19">{POLICY_DATE}</time></span>
            <span>Operated by Nayef · California, USA</span>
            <button type="button" onClick={() => window.print()}>Print / save PDF <Icon name="save" size={15} /></button>
          </div>
        </header>

        <section className="legal-overview" aria-labelledby="legal-overview-title">
          <div className="legal-overview__heading"><Icon name={type === 'privacy' ? 'lock' : type === 'cookies' ? 'cookie' : 'layers'} size={18} /><h2 id="legal-overview-title">At a glance</h2><span>A quick guide. Full details below.</span></div>
          <div className="legal-overview__grid">{policy.summary.map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div>
        </section>

        <div className="legal-layout">
          <aside className="legal-sidebar">
            <div className="legal-toc">
              <div className="legal-toc__heading"><h2 id="legal-contents-title">On this page</h2><span>{policy.sections.length} sections</span></div>
              <button className="legal-toc__toggle" type="button" aria-expanded={contentsOpen} aria-controls="legal-contents" onClick={() => setContentsOpen(!contentsOpen)}>On this page <span>{contentsOpen ? '−' : '+'}</span></button>
              <nav id="legal-contents" aria-labelledby="legal-contents-title" className={contentsOpen ? 'is-open' : ''}>
                <ol>{policy.sections.map(({ id, title }, index) => <li key={id}><a href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => { setActiveSection(id); setContentsOpen(false); }}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{title}</a></li>)}</ol>
              </nav>
            </div>
            <div className="legal-help"><p>Questions about {type === 'privacy' ? 'your data' : type === 'cookies' ? 'cookies' : 'these terms'}?</p><a href={`mailto:${LEGAL_EMAIL}`}>Contact Nayef <Icon name="arrow" size={16} /></a><small>{LEGAL_EMAIL}</small></div>
          </aside>

          <div className="legal-document">
            <article className="legal-paper" aria-label={policy.title}>
              {policy.sections.map(({ id, title, body }, index) => <section className="legal-section" id={id} key={`${type}-${id}`} aria-labelledby={`${id}-title`}><span className="legal-section__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`${id}-title`}>{title}</h2><div className="legal-section__body">{body}</div></div></section>)}
            </article>
            <div className="legal-document__end"><span>Last updated {POLICY_DATE}</span><a href="#legal-top">Back to top ↑</a></div>
            <Link className="legal-related" to={`/${relatedType}`}><div><span>Continue reading</span><h2>{policies[relatedType].title}</h2><p>{relatedType === 'cookies' ? 'See what is stored in your browser and why.' : 'Understand how your information is handled.'}</p></div><Icon name="arrow" size={24} /></Link>
          </div>
        </div>
      </main>
    </LegalShell>
  );
}
