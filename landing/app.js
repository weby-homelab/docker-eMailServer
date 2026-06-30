// JavaScript for Docker eMailServer Landing Page

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Language Switcher
  const langBtns = document.querySelectorAll('.lang-btn');
  
  function setLanguage(lang) {
    document.body.className = document.body.className.replace(/\blang-\w+\b/g, '');
    document.body.classList.add(`lang-${lang}`);
    
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    try {
      localStorage.setItem('preferred-lang', lang);
    } catch (e) {
      console.warn('localStorage is disabled or restricted:', e);
    }
    
    // Update document title dynamically
    if (lang === 'ua') {
      document.title = "Docker eMailServer — Захищений та Сучасний Поштовий Сервер у Docker 📧";
      document.documentElement.setAttribute('lang', 'uk');
    } else {
      document.title = "Docker eMailServer — Hardened & Modern Mail Server Stack in Docker 📧";
      document.documentElement.setAttribute('lang', 'en');
    }
  }
  
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
  
  // Set default language (UA by default, or saved setting)
  let savedLang = 'ua';
  try {
    savedLang = localStorage.getItem('preferred-lang') || 'ua';
  } catch (e) {
    console.warn('localStorage is disabled or restricted:', e);
  }
  setLanguage(savedLang);

  // 3. Copy to Clipboard Functionality
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      
      const textToCopy = targetEl.textContent.trim().replace(/^\$\s*/, '');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Show tooltip/feedback
        const tooltip = btn.querySelector('.copy-tooltip');
        if (tooltip) {
          tooltip.classList.add('show');
          const originalHTML = btn.innerHTML;
          // Temporarily show green check icon
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="color: #10b981;"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg><div class="copy-tooltip show">${tooltip.innerHTML}</div>`;
          
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            const newTooltip = btn.querySelector('.copy-tooltip');
            if (newTooltip) newTooltip.classList.remove('show');
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });

  // 4. Interactive DNS Config Generator
  const domainInput = document.getElementById('dns-domain-input');
  const dkimKeyInput = document.getElementById('dns-dkim-input');
  
  const mxVal = document.getElementById('dns-mx-val');
  const spfVal = document.getElementById('dns-spf-val');
  const dkimHostVal = document.getElementById('dns-dkim-host-val');
  const dkimKeyVal = document.getElementById('dns-dkim-key-val');
  const dmarcHostVal = document.getElementById('dns-dmarc-host-val');
  const dmarcVal = document.getElementById('dns-dmarc-val');

  function updateDNS() {
    let domain = domainInput.value.trim() || 'weby.guru';
    domain = domain.toLowerCase();
    
    let dkimKey = dkimKeyInput.value.trim() || 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0y...';
    
    // Update elements
    if (mxVal) mxVal.textContent = `10 mail.${domain}.`;
    if (spfVal) spfVal.textContent = `v=spf1 mx ip4:YOUR_SERVER_IP -all`;
    if (dkimHostVal) dkimHostVal.textContent = `mail._domainkey.${domain}.`;
    if (dkimKeyVal) dkimKeyVal.textContent = dkimKey;
    if (dmarcHostVal) dmarcHostVal.textContent = `_dmarc.${domain}.`;
    if (dmarcVal) dmarcVal.textContent = `v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; fo=1`;
  }

  if (domainInput) {
    domainInput.addEventListener('input', updateDNS);
  }
  if (dkimKeyInput) {
    dkimKeyInput.addEventListener('input', updateDNS);
  }
  
  // Init DNS records
  updateDNS();

  // 5. Scrollspy & Smooth Navigation Link Highlight
  const navLinks = document.querySelectorAll('nav a, .btn-panel-trigger');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Handle click on nav links for smooth scroll offset
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.getElementById(targetId.substring(1));
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
