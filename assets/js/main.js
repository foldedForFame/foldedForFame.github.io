/**
 * Folded for Fame | South Daddy Productions
 * Single-page behavior adapted from BootstrapMade Workfolio.
 * https://bootstrapmade.com/workfolio-bootstrap-portfolio-template/
 */

(() => {
  'use strict';

  const body = document.body;
  const toggle = document.querySelector('.mobile-nav-toggle');
  const toggleIcon = toggle?.querySelector('i');
  const nav = document.getElementById('navmenu');
  const navList = document.getElementById('navmenu-list');
  const scrollTop = document.getElementById('scroll-top');
  const navLinks = [...document.querySelectorAll('#navmenu a[href^="#"]')];

  function setMobileNav(open) {
    body.classList.toggle('mobile-nav-active', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
    toggleIcon?.classList.toggle('bi-list', !open);
    toggleIcon?.classList.toggle('bi-x', open);
  }

  toggle?.addEventListener('click', () => {
    setMobileNav(!body.classList.contains('mobile-nav-active'));
  });

  navLinks.forEach(link => link.addEventListener('click', () => setMobileNav(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('mobile-nav-active')) {
      setMobileNav(false);
      toggle?.focus();
    }
  });

  nav?.addEventListener('click', event => {
    if (body.classList.contains('mobile-nav-active') && navList && !navList.contains(event.target) && !toggle?.contains(event.target)) {
      setMobileNav(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200 && body.classList.contains('mobile-nav-active')) setMobileNav(false);
  });

  function updateScrollState() {
    const scrollY = window.scrollY;
    body.classList.toggle('scrolled', scrollY > 100);
    scrollTop?.classList.toggle('active', scrollY > 100);

    let activeId = '';
    for (const link of navLinks) {
      const id = link.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (section && scrollY + 170 >= section.offsetTop) activeId = id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }

  document.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('load', updateScrollState);
  updateScrollState();

  scrollTop?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Scroll effects are a progressive enhancement. Show content without AOS, too.
  if (window.AOS?.init) {
    window.AOS.init({ duration: 650, easing: 'ease-out-cubic', once: true, mirror: false });
  } else {
    document.querySelectorAll('[data-aos]').forEach(element => element.classList.add('aos-animate'));
  }

  const copyrightYear = document.getElementById('copyright-year');
  if (copyrightYear) copyrightYear.textContent = String(new Date().getFullYear());

  // Formspark: submit without leaving the page. The HTML POST still works without JS.
  const applicationForm = document.getElementById('fff-application-form');
  const applicationSuccess = document.getElementById('application-success');
  const applicationError = document.getElementById('application-error');
  const submitButton = applicationForm?.querySelector('button[type="submit"]');
  let submitting = false;
  let submitted = false;

  applicationForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || submitted || !applicationForm.reportValidity()) return;

    submitting = true;
    if (submitButton) submitButton.disabled = true;
    if (applicationError) applicationError.hidden = true;

    // Native HTML posts use dotted field names; Formspark AJAX expects nested _email.
    const fields = Object.fromEntries(new FormData(applicationForm).entries());
    const subject = fields['_email.subject'];
    const from = fields['_email.from'];
    delete fields['_email.subject'];
    delete fields['_email.from'];
    const payload = { ...fields, _email: { subject, from } };

    try {
      const response = await fetch(applicationForm.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Formspark HTTP ${response.status}`);

      submitted = true;
      applicationForm.hidden = true;
      if (applicationSuccess) {
        applicationSuccess.hidden = false;
        applicationSuccess.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'application_success', { form_name: 'folded_for_fame_casting' });
      }
    } catch (error) {
      // Do not automatically retry: the server may have received an ambiguous request.
      console.error('Folded for Fame application submission could not be confirmed.', error);
      if (applicationError) applicationError.hidden = false;
    } finally {
      submitting = false;
      if (submitButton && !submitted) submitButton.disabled = false;
    }
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-track]');
    if (!link || typeof window.gtag !== 'function') return;
    const external = new URL(link.href, window.location.href).origin !== window.location.origin;
    window.gtag('event', external ? 'outbound_channel_click' : 'casting_cta_click', {
      link_context: link.dataset.track,
      link_url: link.href
    });
  });
})();
