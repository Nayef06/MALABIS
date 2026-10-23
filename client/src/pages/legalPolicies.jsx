import React from 'react';
import { Link } from 'react-router-dom';

export const LEGAL_EMAIL = 'nayef.jaber10@gmail.com';
export const POLICY_DATE = 'October 22, 2026';
const email = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

export const policies = {
  terms: {
    label: 'Terms',
    title: 'Terms of Service',
    intro: 'The agreement for using your digital wardrobe. Please read these terms before creating an account or using Malabis.',
    summary: [
      ['Your wardrobe, your content', 'You keep ownership of the clothing photos and outfit content you add.'],
      ['Use it responsibly', 'Protect your account and upload only content you have permission to use.'],
      ['You are in control', 'Manage your profile, remove pieces, or delete your account in My corner.'],
    ],
    sections: [
      {
        id: 'agreement', title: 'About Malabis & this agreement',
        body: <><p>Malabis is a personal wardrobe organizer and outfit planning service operated by Nayef, an individual based in California, United States. In these terms, "I" and "me" refer to Nayef. These Terms of Service govern the Malabis website, accounts, wardrobe tools, image uploads, outfit canvas, and outfit generator (the "Service"). "You" means the person using the Service.</p><p>By creating an account or using the Service, you agree to these terms. If you do not agree, do not use the Service. The <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link> explain information practices; they do not waive your rights under applicable law.</p></>,
      },
      {
        id: 'eligibility', title: 'Eligibility & permitted purpose',
        body: <><p>You must be at least 13 years old and meet any higher minimum age required where you live. If you are below the age at which you can enter a binding agreement, a parent or legal guardian must review and agree to these terms and supervise your use. Malabis is not intended for children under 13.</p><p>You may use the Service for personal wardrobe organization and outfit planning, subject to these terms and applicable law. You must have the authority to accept these terms and must not use the Service where access is prohibited by law.</p></>,
      },
      {
        id: 'account', title: 'Your account & security',
        body: <><p>Registration requires a username, display name, and password. Provide information you are entitled to use, do not impersonate another person, and keep your credentials confidential. Use a unique password, log out on shared devices, and contact me promptly if you suspect unauthorized access. You are responsible for activity you authorize through your account.</p><p>You can change your display name and password in <Link to="/account">My corner</Link>. Malabis does not currently collect an account recovery email or offer automated password reset, so recovery may not be possible if you lose access. I may need to verify ownership before helping with an account and cannot guarantee recovery.</p></>,
      },
      {
        id: 'features', title: 'Outfit suggestions & feature limitations',
        body: <><p>Malabis lets you categorize clothing, mark favorites, arrange items on a canvas, save outfits, and generate combinations from your inventory. The generator selects from available clothing using your selected categories, locked pieces, and accessory preferences. It does not assess fit, weather, dress codes, garment care, or the protective qualities of clothing.</p><p>Suggestions are for personal inspiration. Use your own judgment before relying on them, especially for weather, workplace, medical, or safety requirements. Malabis does not provide professional safety, medical, or other regulated advice. Displayed colors and proportions may differ from the actual garment.</p><p>Background removal and other image processing may be imperfect. Canvas arrangements and unsaved work may be temporary; a saved outfit stores the supported outfit data and may not preserve every visual adjustment. Keep copies of important content.</p></>,
      },
      {
        id: 'content', title: 'Your content & permission to process it',
        body: <><p>You retain ownership rights you have in the photos, names, clothing details, and outfit content you provide ("Your Content"). You grant me, as the operator of Malabis, a non-exclusive, worldwide, royalty-free permission to host, store, reproduce, resize, transform, transmit, and display Your Content as reasonably needed to provide, secure, maintain, and troubleshoot the Service. This includes allowing infrastructure and image-processing providers to perform those tasks to operate the Service.</p><p>This permission does not transfer ownership or authorize selling your photos or using them in unrelated advertising. It lasts while the content is used to provide the Service, subject to the storage and deletion limits in the Privacy Policy and retention required by law.</p><p>You confirm that you have the rights and permissions needed to upload and process Your Content, including permission from identifiable people where needed. Do not upload identity documents, intimate images, or sensitive information unrelated to clothing.</p></>,
      },
      {
        id: 'uploads', title: 'Uploads, image visibility & backups',
        body: <><p>Clothing images are processed and hosted through Cloudinary. Uploads currently have a 5 MB file limit. Supported formats, processing limits, and transformations may change. Background removal is performed when requested; uploads or transformations can fail or produce unexpected results.</p><p><strong>Hosted image URLs are not private storage.</strong> Although wardrobe records require account access, someone who obtains an image URL may be able to view that image outside your account. External image links are controlled by their hosts. Do not upload content requiring confidential storage.</p><p>Keep your own copies of original images and important wardrobe information. Malabis is not a backup or archival service and does not guarantee permanent storage or restoration of lost data.</p></>,
      },
      {
        id: 'acceptable-use', title: 'Acceptable use',
        body: <><p>You must use the Service lawfully and respect other people. You must not:</p><ul><li>Upload unlawful, exploitative, infringing, threatening, or abusive content, or violate another person's privacy.</li><li>Access another person's account, guess credentials, bypass access controls, or obtain data without authorization.</li><li>Introduce malware or malicious files or links, or interfere with the Service, its providers, or other users.</li><li>Send excessive automated requests, scrape data at an unreasonable scale, or circumvent upload or technical limits.</li><li>Misrepresent your identity, commit fraud, or help another person violate these terms.</li></ul><p>I may investigate suspected misuse and restrict access or remove content when reasonably necessary to address a violation, security risk, or legal obligation.</p></>,
      },
      {
        id: 'intellectual-property', title: 'Intellectual property & content complaints',
        body: <><p>Except for Your Content and rights held by third parties, the Malabis name, branding, interface, software, and materials belong to their respective owners. You receive limited permission to access and use the Service for its intended purpose while complying with these terms. These terms do not give ownership of Malabis branding or permission to resell the Service or imply affiliation.</p><p>Separate licenses, including applicable open source licenses, govern materials covered by them. Third-party brand names or garment images do not imply endorsement, sponsorship, or affiliation with Malabis.</p><p>If you believe content infringes your rights, email {email} with your contact details, a description of the protected work or right, the relevant image URL or other identifying information, and an explanation of the issue and your authority to report it. I may request additional information, review the complaint, and remove or restrict content as appropriate. Do not submit false or misleading complaints.</p></>,
      },
      {
        id: 'providers', title: 'Third-party services & links',
        body: <><p>Malabis uses providers for website and API hosting, database storage, sessions, optional caching, and image delivery and processing. External services may have their own terms and privacy notices. Malabis does not control external websites, image hosts, or their availability, content, and policies.</p><p>Using a provider does not guarantee that its service will always be available. See the <Link to="/privacy#sharing">Privacy Policy</Link> for information about providers handling your data.</p></>,
      },
      {
        id: 'pricing', title: 'Pricing & Service changes',
        body: <><p>The current Service does not include a checkout or paid subscription. These terms do not authorize a charge. If paid features are introduced, prices and applicable payment terms must be presented before you choose to purchase them.</p><p>Features, supported formats, storage limits, and availability may change. I may maintain, modify, suspend, or discontinue parts of the Service. Where reasonably practicable, I will give advance notice of a material reduction or discontinuation affecting active accounts, except where urgent security, legal, or operational needs require earlier action.</p></>,
      },
      {
        id: 'deletion', title: 'Deleting content & ending your account',
        body: <><p>You may stop using Malabis at any time, delete individual items or outfits, or permanently delete your account from <Link to="/account">My corner</Link>. Account deletion removes your profile and associated clothing and outfit records from the active database and requests deletion of Cloudinary images tracked as uploaded by your account, including uploads that were never attached to a saved item. It cannot be undone through the app. Deleting a clothing item may also remove its reference from saved outfits, but does not itself delete its hosted image.</p><p>If hosted-image deletion fails, account deletion does not complete and you can try again. Images uploaded before upload tracking was added may not be identified automatically. Provider caches, backups, and legally required records may also remain. To request removal of an older image, email {email} with your username and relevant image URLs, if available. Never send your password. Read the <Link to="/privacy#retention">retention and deletion details</Link> before deleting your account.</p></>,
      },
      {
        id: 'suspension', title: 'Suspension & termination',
        body: <><p>I may restrict or end access if you materially violate these terms, create a security or legal risk, or harm the Service's operation or other people. Where reasonable and lawful, I will explain the issue and provide an opportunity to resolve it. Immediate restrictions may be necessary for serious misuse or urgent risks.</p><p>Email me if you believe a restriction was applied in error. Provisions that by their nature should continue after access ends, including ownership, accrued obligations, liability limitations, and dispute provisions, continue to apply.</p></>,
      },
      {
        id: 'disclaimers', title: 'Availability & warranty disclaimers',
        body: <><p>To the extent permitted by applicable law, the Service is provided "as is" and "as available," without express or implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. Uninterrupted access, error-free or accurate results, permanent storage, and successful image processing are not guaranteed.</p><p>You are responsible for your device, internet connection, saved originals, and decisions based on outfit suggestions. No informal response or suggestion creates an additional warranty. Nothing in these terms excludes statutory warranties or consumer protections that cannot lawfully be excluded.</p></>,
      },
      {
        id: 'liability', title: 'Limits on liability & consumer rights',
        body: <><p>To the extent permitted by applicable law, Malabis and its operator are not liable for indirect, incidental, special, consequential, or punitive losses arising from use of, or inability to use, the Service, including lost profits or business opportunities.</p><p>These limits apply only where lawful. Nothing excludes or limits liability for fraud, willful misconduct, gross negligence, or any liability that cannot legally be excluded or limited. Nothing takes away mandatory consumer rights. Some jurisdictions do not allow certain warranty exclusions or liability limitations, so those provisions may not apply to you.</p></>,
      },
      {
        id: 'disputes', title: 'Governing law & resolving concerns',
        body: <><p>These terms are governed by California law, excluding its conflict-of-law rules, except where mandatory laws of your place of residence require otherwise. They do not deprive you of protections or court access provided by applicable consumer law.</p><p>Please email {email} to describe a concern so I can try to resolve it. Contacting me does not prevent you from pursuing remedies available under applicable law. These terms do not require mandatory arbitration or waive class action rights.</p></>,
      },
      {
        id: 'updates-contact', title: 'Updates, general terms & contact',
        body: <><p>These terms may be revised as the Service changes. The effective date above identifies the current version. For material changes, I will provide a prominent notice in the Service before they take effect where reasonably practicable, and obtain agreement where legally required. Continued use after revised terms take effect constitutes acceptance to the extent permitted by law. You may stop using the Service if you disagree.</p><p>If a provision is unenforceable, the remainder continues to apply to the extent lawful. Failure to enforce a provision is not a waiver of the right to enforce it later. These terms form the agreement about your use of the Service, subject to additional terms expressly agreed with you.</p><p>Contact Nayef, the individual operator of Malabis, based in California, United States, at {email} for legal questions, account concerns, or content complaints. Include the relevant details, but never your password.</p></>,
      },
    ],
  },
  privacy: {
    label: 'Privacy',
    title: 'Privacy Policy',
    intro: 'How information moves through your digital wardrobe: what Malabis collects, why it is used, which providers help process it, and the choices available to you.',
    summary: [
      ['Information for your wardrobe', 'Account details, clothing photos, wardrobe records, and technical service data.'],
      ['No sale or targeted ads', 'Malabis does not sell personal information or use it for cross-site targeted advertising.'],
      ['Practical privacy controls', 'Manage your account and browser choices, or email Nayef about your data.'],
    ],
    sections: [
      {
        id: 'scope', title: 'Who is responsible & what this covers',
        body: <><p>Malabis is operated by Nayef, an individual based in California, United States. Nayef is responsible for the personal information processed to operate Malabis and is the controller where that term applies. Contact: {email}.</p><p>This policy covers the Malabis website, accounts, wardrobe tools, image uploads, outfit canvas, and generator. It describes current practices. Third-party websites and independently operated image hosts have their own privacy practices. The <Link to="/cookies">Cookie Policy</Link> gives further details about browser storage.</p></>,
      },
      {
        id: 'account-data', title: 'Account information you provide',
        body: <><p>Malabis collects your username, display name, and password when you register. The password is processed for authentication and stored as a bcrypt hash rather than readable text. Accounts also have internal identifiers and references to clothing and outfits.</p><p>Registration does not currently ask for an email address, phone number, birth date, payment information, or postal address. Personal information you include in free-text fields becomes part of the record you submit. If you email me, I receive your email address, message, attachments, and information needed to respond.</p></>,
      },
      {
        id: 'wardrobe-data', title: 'Clothing, photos & outfit information',
        body: <><p>Malabis stores clothing names, categories, colors, image URLs, favorites, and their association with your account. It also stores Cloudinary identifiers for images uploaded by your account so they can be deleted with the account. Saved outfits contain a name, references to selected clothing, and a favorite status. The generator processes selected categories, locked-item selections, and accessory counts alongside your inventory.</p><p>Uploaded images pass through the server for conversion and are sent to Cloudinary for hosting, resizing, optimization, and background removal when selected. Photos may contain personal details beyond the garment. Crop out faces, documents, addresses, and unnecessary information before uploading.</p><p>Malabis does not request access to your entire photo library, contacts, microphone, or precise device location. Choosing a file makes that selected file available for upload.</p></>,
      },
      {
        id: 'technical-data', title: 'Technical data & operational reporting',
        body: <><p>Delivering a website involves technical information such as IP addresses, browser and device information, request times, requested URLs, responses, and error details. Hosting and infrastructure providers may process this information for delivery, security, diagnostics, and service logs. Malabis also logs certain server errors.</p><p>Restricted administrator reporting uses existing account and wardrobe records to show usernames and service statistics, including account, upload, outfit, and favorite counts, clothing category and color totals, and outfit-size summaries. This operational reporting is separate from optional browser analytics and does not depend on an analytics cookie.</p></>,
      },
      {
        id: 'purposes', title: 'How & why information is used',
        body: <><p>Malabis uses information to:</p><ul><li><strong>Provide accounts:</strong> register users, verify sign-ins, maintain sessions, and apply profile changes.</li><li><strong>Run wardrobe tools:</strong> display images, organize inventory, save outfits and favorites, and generate requested combinations.</li><li><strong>Process images:</strong> host and transform photos and remove backgrounds when requested.</li><li><strong>Maintain the Service:</strong> cache records, investigate errors, understand use through operational reports, and improve reliability.</li><li><strong>Protect people and the Service:</strong> address misuse, investigate security issues, handle complaints, and enforce the Terms of Service.</li><li><strong>Respond and comply:</strong> answer messages and privacy requests, meet legal obligations, and establish or defend claims.</li></ul><p>The outfit generator selects combinations from inventory; it does not send your wardrobe to a generative AI model. It does not make decisions producing legal or similarly significant effects about you.</p></>,
      },
      {
        id: 'legal-bases', title: 'Legal bases where required',
        body: <><p>Where a legal basis is required, account authentication, wardrobe storage, and requested outfit or image features are processed to provide the Service under the Terms of Service. Security, troubleshooting, limited operational reporting, and responding to enquiries are processed for legitimate interests in running and protecting the Service, subject to your rights and interests.</p><p>I rely on legal obligations where processing is necessary to comply with law. Where consent is required for an optional use, I will request it. You may withdraw consent for future processing without affecting processing that was lawful before withdrawal. Required account information is needed to provide account features; those features cannot be supplied without it.</p></>,
      },
      {
        id: 'storage', title: 'Cookies & browser storage',
        body: <><p>Malabis uses the <code>malabis.sid</code> cookie to maintain sign-in, session storage to cache profile and wardrobe records within a tab session, and local storage to remember browser preferences. The session cookie is configured for 24 hours, with expiry potentially renewed by activity. The app clears its tab cache on logout or account deletion; browser session restoration may preserve tab data.</p><p>Optional analytics and personalization choices default to off. The current app records those choices but does not load optional analytics or personalization trackers. These controls do not turn off essential storage, infrastructure logs, or operational reporting from existing records.</p><p>Read the <Link to="/cookies">Cookie Policy</Link> for storage names, purposes, lifetimes, and third-party considerations. Change optional preferences in <Link to="/cookie-settings">Cookie settings</Link>. Blocking essential storage can prevent sign-in. Choices apply to this browser and do not automatically carry across devices.</p></>,
      },
      {
        id: 'sharing', title: 'Who receives information',
        body: <><p>Information is processed by me and the providers needed to run Malabis:</p><ul><li><strong>Cloudinary:</strong> receives uploaded images and related upload data for storage, transformation, and delivery. See <a href="https://cloudinary.com/privacy" target="_blank" rel="noreferrer">Cloudinary's Privacy Policy</a>.</li><li><strong>Website and API hosting:</strong> the app is configured for Vercel hosting. Hosting providers process requests and may keep operational and security logs. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel's Privacy Policy</a>.</li><li><strong>Database and sessions:</strong> MongoDB-based infrastructure stores account, wardrobe, outfit, and server-session records. If external database hosting is used, that provider processes the records.</li><li><strong>Optional cache:</strong> when configured, Redis infrastructure temporarily caches wardrobe and outfit records to speed up reads.</li><li><strong>Email:</strong> messages to the contact address are processed by the services involved in delivering and storing correspondence.</li></ul><p>I may disclose information when reasonably necessary to comply with valid legal requirements, investigate abuse, protect rights or safety, or establish or defend a legal claim. A transfer of the Service may involve transferring relevant information, subject to applicable law and notice of material changes in its use.</p><p>Malabis does not sell or rent personal information, disclose it for cross-context behavioral advertising, or run third-party advertising trackers in the current app.</p></>,
      },
      {
        id: 'image-visibility', title: 'Image visibility & external content',
        body: <><p>Clothing and outfit records are accessed through authenticated account features; there is no public wardrobe directory. This does not make images confidential. Cloudinary image URLs may be accessed outside your account by anyone who obtains a URL. Avoid uploading photos that require private storage.</p><p>When your browser loads an image from Cloudinary or another external URL, it connects to that host, which may receive your IP address, browser information, and request details. That host controls its own logs, availability, and retention. Sharing URLs or copies can make images available beyond Malabis.</p></>,
      },
      {
        id: 'retention', title: 'Retention & the limits of deletion',
        body: <><p>Account and wardrobe records remain while your account is active to support the Service. You can delete items and outfits individually. Deleting your account in <Link to="/account">My corner</Link> requests deletion of Cloudinary images tracked as uploaded by your account, including unsaved uploads, then removes your profile and associated clothing and outfit records from the active database, invalidates associated server caches, and ends the current session. If a hosted-image deletion fails, account deletion stops and you can retry.</p><p><strong>Older uploads may need help.</strong> Images uploaded before Malabis began recording their Cloudinary identifiers may not be found by the automatic account deletion process. Email {email} with your username and relevant image URLs, if available, to request removal. I may need to verify ownership and identify the assets. Deleting an individual clothing record does not delete its hosted image; tracked images are removed when the account is deleted.</p><p>Provider caches, logs, and backups may retain copies after active records are removed. Cloudinary cache invalidation may take time to propagate. Retention depends on provider configuration and applicable obligations; a fixed deletion time for every provider copy cannot be guaranteed. Security investigations, legal obligations, or claims may require longer retention for the relevant purpose. Correspondence is retained as needed to handle enquiries and related obligations.</p><p>Local preferences remain until changed or cleared. Copies saved by you or others outside Malabis are outside the account deletion process.</p></>,
      },
      {
        id: 'security', title: 'Security & protecting your account',
        body: <><p>Safeguards include password hashing, authenticated access to account records, ownership checks for wardrobe operations, and protected session cookies. Administrator reporting is access-restricted. These measures reduce risk, but no website, network, or provider can guarantee absolute security.</p><p>Use a unique password, protect your device, avoid confidential uploads, and log out on shared computers. Email me about suspected unauthorized access or security issues without sending passwords or unnecessary sensitive information. Where legally required, I will provide notice of a personal information breach.</p></>,
      },
      {
        id: 'rights', title: 'Your controls & privacy rights',
        body: <><p>Use <Link to="/account">My corner</Link> to update your display name or password or delete your account. You can remove individual clothing items and outfits, and use <Link to="/cookie-settings">Cookie settings</Link> for optional browser choices.</p><p>Depending on your location and whether the relevant law applies, you may have rights to access or obtain a copy of information, correct inaccuracies, request deletion or portability, restrict processing, withdraw consent, or object to processing based on legitimate interests. <strong>You may object to legitimate-interest processing where applicable law provides that right.</strong> Exceptions may apply, including for legal obligations and other people's rights.</p><p>Send requests to {email} with your username and an explanation; never send your password. I may request proportionate information to verify identity or an authorized agent's authority. I will respond within applicable legal deadlines and explain if a request cannot be fulfilled. The app does not currently provide a bulk download control.</p><p>You may complain to your local data protection authority where that right applies. If applicable law provides an appeal right, reply to the contact address and request review. I do not unlawfully discriminate against you for exercising protected privacy rights.</p></>,
      },
      {
        id: 'california', title: 'California residents & tracking signals',
        body: <><p>Information categories include account identifiers, user-provided content, and technical internet activity. Sources, purposes, recipients, and retention are described above. Malabis does not sell information or share it for cross-context behavioral advertising.</p><p>California rights depend on the law and its applicability to the operator. Where the California Consumer Privacy Act applies, eligible residents may request access or knowledge, correction, or deletion, use an authorized agent subject to verification, and exercise rights without unlawful discrimination. This notice does not claim that statutory business-size thresholds have been met.</p><p>The current app does not implement a separate response to Do Not Track or Global Privacy Control signals. It does not sell personal information, share it for cross-context behavioral advertising, or load optional advertising trackers, so there is no such activity to opt out of in the current Service. See the <Link to="/cookies">Cookie Policy</Link> for browser controls.</p></>,
      },
      {
        id: 'international', title: 'International processing',
        body: <><p>The operator is in the United States. Infrastructure and providers may process information in the United States or other countries where they operate, which may have different data protection rules from your country.</p><p>Where applicable law requires safeguards for an international transfer, those requirements apply, including appropriate contractual or other lawful transfer protections. This notice does not itself constitute transfer consent or replace a required safeguard. Contact me for information about providers and transfer arrangements relevant to your data.</p></>,
      },
      {
        id: 'children', title: 'Children & minimum age',
        body: <><p>Malabis is not directed to children under 13 or intended for anyone below the minimum age required in their location. Malabis does not knowingly collect personal information from children under 13.</p><p>If you believe a child below the applicable minimum age has provided information, contact {email} so I can investigate and take appropriate steps to remove it. Users unable to enter a binding agreement must have the involvement described in the <Link to="/terms#eligibility">Terms of Service</Link>.</p></>,
      },
      {
        id: 'updates-contact', title: 'Policy updates & contacting Nayef',
        body: <><p>This policy may be updated for changes to the Service, providers, or legal requirements. The date above identifies this version. I will provide prominent notice of material changes where required and obtain consent before a new use where legally required. A policy update does not override your privacy rights.</p><p>For privacy questions, data requests, hosted-image removal, or concerns, contact {email}. Your contact is Nayef, the individual operator of Malabis, based in California, United States. Include your username and relevant details so the request can be located and reviewed.</p></>,
      },
    ],
  },
  cookies: {
    label: 'Cookies',
    title: 'Cookie Policy',
    intro: 'What Malabis stores in your browser, what each item does, how long it stays, and how to manage your choices.',
    summary: [
      ['A cookie for signing in', 'An essential session cookie connects your browser to your account.'],
      ['Storage for a smoother visit', 'Tab storage caches your wardrobe; local storage remembers your choices.'],
      ['Optional tracking is inactive', 'No optional analytics, personalization, or advertising trackers load in the current app.'],
    ],
    sections: [
      {
        id: 'about-cookies', title: 'Cookies & similar technologies',
        body: <><p>This policy applies to the Malabis website operated by Nayef, based in California, United States. Cookies are small values that a website asks your browser to store and send with relevant requests. Browser local storage and session storage also save information on your device, but are not automatically sent with every request.</p><p>Malabis uses these technologies for authentication, loading account data efficiently, and remembering preferences. Read this policy with the <Link to="/privacy">Privacy Policy</Link>, which covers account data, service providers, operational logs, and your rights.</p></>,
      },
      {
        id: 'storage-details', title: 'What is stored & for how long',
        body: <><p>The current application sets or writes the following items:</p><div className="legal-table-wrap" role="region" aria-label="Browser storage details" tabIndex={0}><table className="legal-storage-table"><caption>Malabis browser storage inventory</caption><thead><tr><th scope="col">Item & technology</th><th scope="col">Purpose & information</th><th scope="col">Lifetime & controls</th></tr></thead><tbody><tr><th scope="row"><code>malabis.sid</code><span>Session cookie · necessary</span></th><td>Contains a signed session identifier that connects requests to your server-side sign-in session. It is not your password or a copy of your wardrobe.</td><td>Configured for 24 hours; session activity may renew expiry. Logging out ends the current session and clears the cookie. Browser settings can remove or block it.</td></tr><tr><th scope="row"><code>malabis:data-cache:v1</code><span>Session storage · functional</span></th><td>Caches profile details, wardrobe records, outfit records, and image links in the tab so pages need fewer repeated requests. Passwords are not included.</td><td>Lasts for the tab's browser session; session restoration may preserve it. The app clears it on logout or account deletion. You can clear site data in browser settings.</td></tr><tr><th scope="row"><code>malabis:cookie-preferences:v1</code><span>Local storage · preference record</span></th><td>Saves your analytics and personalization choices and the time you saved them. Both optional choices default to off.</td><td>No automatic expiry is set. Remains until you save new choices, clear site data, or the browser removes it. It is specific to that browser and site origin.</td></tr></tbody></table></div><p>The cookie is configured as HttpOnly, so browser scripts cannot read it, with SameSite=Lax and the Secure flag in production. Browser storage is separate from server-side account records and does not replace your saved wardrobe in the database.</p></>,
      },
      {
        id: 'necessary', title: 'Necessary functionality',
        body: <><p>The sign-in cookie is needed for authenticated account and wardrobe features. It is set for an authenticated session, rather than being an advertising identifier. Cookie settings therefore shows the necessary category as always on. You may block it in your browser, but sign-in and account features may not work.</p><p>The tab cache supports core page loading and navigation. It is a performance copy of account data, not an analytics tracker. On shared devices, log out and close your tab; clearing site data provides an additional way to remove browser-held copies. Preference storage remembers the choices you explicitly save.</p></>,
      },
      {
        id: 'optional', title: 'Optional categories & their current status',
        body: <><p><strong>Analytics:</strong> the setting records whether you allow a future optional browser measurement feature. The current app does not load an optional analytics tracker or set an analytics cookie.</p><p><strong>Personalization:</strong> the setting records whether you allow optional browser preferences beyond the core wardrobe features. The current app does not load a separate optional personalization technology.</p><p><strong>Advertising:</strong> Malabis does not currently use advertising cookies, advertising pixels, or cross-site advertising trackers. There is no advertising category to enable.</p><p>Enabling an optional setting does not activate a tracker that is not present. Before introducing a new optional technology, I will update the relevant disclosures and obtain consent where required. A saved preference is not blanket permission for unrelated uses.</p></>,
      },
      {
        id: 'manage', title: 'Saving, changing & withdrawing choices',
        body: <><p>Open <Link to="/cookie-settings">Cookie settings</Link> at any time. Select the optional categories you want and choose "Save choices," or choose "Necessary only" to turn both optional categories off. Changes are saved when you press a save button. Optional settings start off in a browser with no saved choices.</p><p>You can withdraw an optional choice by turning it off and saving again. Preferences are browser-specific: repeat your choices on other browsers or devices. Clearing local storage removes saved choices and returns optional categories to their default off state. If browser storage is blocked, choices may not persist after your visit.</p><p>Optional settings do not delete your account, change server-side records, or turn off hosting logs or administrator reporting based on existing account data. Use <Link to="/account">My corner</Link> or contact me for those separate account and privacy matters.</p></>,
      },
      {
        id: 'browser-controls', title: 'Browser controls & tracking signals',
        body: <><p>Your browser's privacy or site settings can show and delete cookies, clear local and session storage, block storage, or restrict third-party content. Look for cookies, site data, or website permissions in your browser settings. Blocking or deleting necessary items can sign you out, remove preferences, or interrupt features.</p><p>Malabis does not currently implement a separate technical response to Do Not Track or Global Privacy Control signals. It does not sell personal information or share it for cross-context behavioral advertising, and the current app has no optional advertising trackers. Applicable legal opt-out rights remain available regardless of these browser controls.</p></>,
      },
      {
        id: 'third-parties', title: 'Providers, images & server-side activity',
        body: <><p>Cloudinary delivers uploaded images, and external image URLs may load content from other hosts. When loading those resources, your browser sends requests to the relevant provider, which may receive your IP address, browser details, and request information. Providers or external hosts may use their own storage or security technologies according to their policies and your browser settings. They are distinct from the Malabis items listed above.</p><p>The application does not embed third-party advertising or optional browser analytics scripts. Infrastructure providers may maintain request logs, and restricted administrator reporting uses existing account usernames and wardrobe statistics. Those server-side activities are not cookies and are not disabled by the optional analytics switch. See <Link to="/privacy#technical-data">technical data and reporting</Link> and <Link to="/privacy#sharing">service providers</Link> in the Privacy Policy.</p></>,
      },
      {
        id: 'updates-contact', title: 'Updates & cookie questions',
        body: <><p>This policy may change when storage technologies, providers, or legal requirements change. The effective date above identifies the current version. I will provide notice and seek consent for changes where required by applicable law.</p><p>For cookie or privacy questions, contact Nayef, the individual operator of Malabis, based in California, United States, at {email}. Do not include your password or session cookie in a message.</p></>,
      },
    ],
  },
};
