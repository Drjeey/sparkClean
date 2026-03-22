/* ═══════════════════════════════════════════════════════════════
   SparkClean Pro — Main JS
   Handles: header scroll, nav, reveal animations, scroll-to-top
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── HEADER SCROLL ──────────────────────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ─── MOBILE NAV TOGGLE ──────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── REVEAL ANIMATIONS ──────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  // ─── SCROLL TO TOP BUTTON ────────────────────────────────────
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ─── LIGHTBOX ────────────────────────────────────────────────
  const lightbox = document.querySelector('.lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');
  if (lightbox) {
    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => lightbox.classList.add('open'));
    });
    lightboxClose?.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('open');
    });
  }

  // ─── GALLERY FILTER ──────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // ─── BOOKING FORM ────────────────────────────────────────────
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    const fields = {
      name: { el: bookingForm.querySelector('#b-name'), rule: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
      phone: { el: bookingForm.querySelector('#b-phone'), rule: v => /^[\d\s\+\-\(\)]{7,}$/.test(v), msg: 'Please enter a valid phone number.' },
      service: { el: bookingForm.querySelector('#b-service'), rule: v => v !== '', msg: 'Please select a service.' },
      location: { el: bookingForm.querySelector('#b-location'), rule: v => v.trim().length >= 3, msg: 'Please enter your suburb or address.' },
      date: {
        el: bookingForm.querySelector('#b-date'),
        rule: v => {
          if (!v) return false;
          const d = new Date(v);
          const today = new Date(); today.setHours(0,0,0,0);
          return d >= today;
        },
        msg: 'Please select a date from today onwards.'
      },
    };

    // Set min date
    const dateInput = bookingForm.querySelector('#b-date');
    if (dateInput) {
      const today = new Date();
      dateInput.min = today.toISOString().split('T')[0];
    }

    // Live validation
    Object.values(fields).forEach(({ el, rule, msg }) => {
      if (!el) return;
      el.addEventListener('blur', () => validateField(el, rule, msg));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(el, rule, msg);
      });
    });

    function validateField(el, rule, msg) {
      const errEl = el.parentElement.querySelector('.form-error');
      const valid = rule(el.value);
      el.classList.toggle('error', !valid);
      el.classList.toggle('success', valid);
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.toggle('visible', !valid);
      }
      return valid;
    }

    function validateAll() {
      return Object.values(fields).every(({ el, rule, msg }) => el ? validateField(el, rule, msg) : true);
    }

    const submitBtn = bookingForm.querySelector('[type="submit"]');
    const successAlert = bookingForm.querySelector('.alert-success');
    const errorAlert = bookingForm.querySelector('.alert-error');

    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateAll()) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';

      const payload = {
        name: fields.name.el?.value || '',
        phone: fields.phone.el?.value || '',
        service: fields.service.el?.value || '',
        location: fields.location.el?.value || '',
        preferred_date: fields.date.el?.value || '',
        notes: bookingForm.querySelector('#b-notes')?.value || '',
        status: 'pending',
      };

      try {
        // Supabase insert — replace with your actual URL and key
        const SUPABASE_URL = 'YOUR_SUPABASE_URL';
        const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

        if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Booking failed');
        }

        successAlert?.classList.add('visible');
        errorAlert?.classList.remove('visible');
        bookingForm.reset();
        Object.values(fields).forEach(({ el }) => { el?.classList.remove('error', 'success'); });
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (err) {
        errorAlert?.classList.add('visible');
        successAlert?.classList.remove('visible');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Booking';
      }
    });
  }

  // ─── CONTACT FORM ────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const successAlert = contactForm.querySelector('.alert-success');
    const errorAlert = contactForm.querySelector('.alert-error');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Sending…';

      await new Promise(r => setTimeout(r, 1200)); // Simulate API call

      successAlert?.classList.add('visible');
      errorAlert?.classList.remove('visible');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    });
  }

  // ─── SERVICES ACCORDION ──────────────────────────────────────
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

});
