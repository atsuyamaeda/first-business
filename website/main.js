(() => {
  // Loader
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), 800));

  // Nav scroll
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');
  const check = () => nav.classList.toggle('scrolled', window.scrollY > hero.offsetHeight - 80);
  window.addEventListener('scroll', check, { passive: true });
  check();

  // Scroll animations — staggered per section
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sec = e.target.closest('[data-anim]');
      if (sec && !sec.dataset.done) {
        sec.dataset.done = '1';
        sec.querySelectorAll('.anim-child').forEach((c, i) =>
          setTimeout(() => c.classList.add('in'), i * 100)
        );
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-anim] .anim-child').forEach(el => io.observe(el));

  // Hero text — immediate stagger
  document.querySelectorAll('.hero-left .anim-child').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 800 + i * 120);
  });

  // Waitlist form
  const form = document.getElementById('wl-form');
  const thanks = document.getElementById('wl-thanks');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input').value;
    if (!email) return;
    console.log('Waitlist:', email);
    form.hidden = true;
    thanks.hidden = false;
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();
