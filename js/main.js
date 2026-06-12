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

        applicationForm.reset();
        setStatus('Thank you. Your application has been submitted for NOVA Collective review.', 'success');
      } catch (error) {
        console.error('Application submission error:', error);
        setStatus('We could not submit the application right now. Please try again, or contact NOVA Collective directly.', 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
        }
      }
    });
  }
})();
