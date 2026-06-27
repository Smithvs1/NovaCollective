// NOVA Collective shared JavaScript
(function () {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const primaryNav = document.querySelector('#primary-nav');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    primaryNav.addEventListener('click', (event) => {
      if (event.target.matches('a') && primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // Interest list form (index / coming-soon page)
  const interestForm = document.querySelector('#interest-form');
  const interestStatus = document.querySelector('#interest-status');

  if (interestForm) {
    interestForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = interestForm.querySelector('button[type="submit"]');
      const formData = new FormData(interestForm);
      const payload = Object.fromEntries(formData.entries());

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      try {
        const response = await fetch('/api/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Interest signup failed with status ${response.status}`);
        }

        window.location.href = 'interest-success.html';
      } catch (error) {
        console.error('Interest signup error:', error);
        if (interestStatus) {
          interestStatus.textContent = 'We could not submit your information right now. Please try again.';
          interestStatus.className = 'form-status error';
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Notify Me';
        }
      }
    });
  }

  // Suite inspiration carousel
  const carousel = document.querySelector('.suite-carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    let current = 0;
    let autoInterval;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      var dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    }

    function startAuto() {
      autoInterval = setInterval(function () { goTo(current + 1); }, 4500);
    }

    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    });

    startAuto();
  }

  // Application form (apply page)
  const applicationForm = document.querySelector('#application-form');
  const formStatus = document.querySelector('#form-status');

  function setStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }

  if (applicationForm) {
    applicationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = applicationForm.querySelector('button[type="submit"]');
      const formData = new FormData(applicationForm);
      const payload = Object.fromEntries(formData.entries());
      payload.status = 'new';
      payload.created_display = new Date().toISOString();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Application request failed with status ${response.status}`);
        }

        if (submitButton) {
          submitButton.textContent = 'Application Saved!';
        }
        setStatus('Application saved. Please choose your payment method below.', 'success');

        const overlay = document.getElementById('payment-method-overlay');
        if (overlay) {
          overlay.classList.add('active');
          overlay.scrollIntoView({ behavior: 'smooth' });

          async function startCheckout(method) {
            overlay.querySelectorAll('button').forEach(b => { b.disabled = true; });
            try {
              const checkoutResponse = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method: method }),
              });
              if (!checkoutResponse.ok) {
                const errData = await checkoutResponse.json().catch(() => ({}));
                throw new Error(errData.error || 'Could not create checkout session');
              }
              const checkoutData = await checkoutResponse.json();
              window.location.href = checkoutData.url;
            } catch (err) {
              console.error('Checkout error:', err);
              alert('Payment setup failed: ' + err.message + '. Please try again or contact support@novacollective.vip');
              overlay.querySelectorAll('button').forEach(b => { b.disabled = false; });
            }
          }

          document.getElementById('pay-ach').addEventListener('click', () => startCheckout('ach'));
          document.getElementById('pay-card').addEventListener('click', () => startCheckout('card'));
        }
      } catch (error) {
        console.error('Application submission error:', error);
        setStatus('We could not complete the process right now. Please try again, or contact NOVA Collective directly.', 'error');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
        }
      }
    });
  }
})();
