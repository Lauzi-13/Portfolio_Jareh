// ===== Nav scroll state + mobile toggle =====
const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 600);
}, { passive: true });

navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Lightbox gallery =====
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[currentIndex];
  const img = item.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showRelative(offset) {
  currentIndex = (currentIndex + offset + galleryItems.length) % galleryItems.length;
  const img = galleryItems[currentIndex].querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showRelative(-1));
lightboxNext.addEventListener('click', () => showRelative(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showRelative(1);
  if (e.key === 'ArrowLeft') showRelative(-1);
});

// ===== Back to top =====
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Booking form -> Supabase =====
const bookingForm = document.getElementById('bookingForm');
const bookingSubmit = document.getElementById('bookingSubmit');
const bookingSubmitLabel = document.getElementById('bookingSubmitLabel');
const formStatus = document.getElementById('formStatus');

function setFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status' + (type ? ' ' + type : '');
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: if this hidden field got filled, silently pretend success.
    const honeypot = bookingForm.querySelector('#company').value.trim();
    if (honeypot) {
      bookingForm.reset();
      setFormStatus("Thanks! Your enquiry has been sent.", 'success');
      return;
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('date').value || null;
    const message = document.getElementById('message').value.trim();

    if (!name || !phone) {
      setFormStatus("Please fill in your name and phone number.", 'error');
      return;
    }

    if (!supabaseClient) {
      setFormStatus("Booking system isn't connected yet — please message on WhatsApp instead.", 'error');
      return;
    }

    bookingSubmit.disabled = true;
    bookingSubmitLabel.textContent = 'Sending...';
    setFormStatus('', '');

    const { error } = await supabaseClient.from('bookings').insert([
      {
        name,
        phone,
        event_type: eventType,
        event_date: eventDate,
        message,
      },
    ]);

    bookingSubmit.disabled = false;
    bookingSubmitLabel.textContent = 'Send Enquiry';

    if (error) {
      console.error('Booking submission failed:', error);
      setFormStatus("Something went wrong sending your enquiry. Please try WhatsApp instead.", 'error');
      return;
    }

    bookingForm.reset();
    setFormStatus("Thanks, " + name.split(' ')[0] + "! Your enquiry has been sent — I'll get back to you soon.", 'success');
  });
}
