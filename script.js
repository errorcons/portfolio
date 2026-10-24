// ========================================
// Mobile navigation
// ========================================

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function closeNavigation() {
  if (!menuToggle || !navLinks) return;

  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });
}

// ========================================
// Footer year
// ========================================

const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}

// ========================================
// Active navigation links
// ========================================

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navItems.forEach((item) => {
          const matchesSection =
            item.getAttribute('href') === `#${entry.target.id}`;

          item.classList.toggle('active', matchesSection);
        });
      });
    },
    {
      rootMargin: '-35% 0px -55% 0px'
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// ========================================
// Top notification
// ========================================

let notification = document.querySelector('#messageNotification');

if (!notification) {
  notification = document.createElement('div');
  notification.id = 'messageNotification';
  document.body.appendChild(notification);
}

notification.classList.add('message-notification');
notification.setAttribute('role', 'status');
notification.setAttribute('aria-live', 'polite');
notification.setAttribute('aria-atomic', 'true');
notification.hidden = true;

let notificationText = notification.querySelector('#messageNotificationText');

if (!notificationText) {
  notificationText = document.createElement('span');
  notificationText.id = 'messageNotificationText';
  notification.appendChild(notificationText);
}

let closeNotificationButton = notification.querySelector('#closeNotification');

if (!closeNotificationButton) {
  closeNotificationButton = document.createElement('button');
  closeNotificationButton.id = 'closeNotification';
  closeNotificationButton.type = 'button';
  closeNotificationButton.setAttribute('aria-label', 'Dismiss notification');
  closeNotificationButton.textContent = '×';
  notification.appendChild(closeNotificationButton);
}

let notificationTimer;

function hideNotification() {
  notification.hidden = true;
  clearTimeout(notificationTimer);
}

function showNotification(message, isError = false) {
  clearTimeout(notificationTimer);

  notificationText.textContent = message;
  notification.classList.toggle('error', isError);
  notification.hidden = false;

  notificationTimer = setTimeout(hideNotification, 8000);
}

closeNotificationButton.addEventListener('click', hideNotification);

// ========================================
// Contact modal
// ========================================

const contactModal = document.querySelector('#contactModal');
const openModalButtons = document.querySelectorAll('.open-contact-modal');
const closeModalElements = document.querySelectorAll('[data-close-modal]');
const contactForm = document.querySelector('#contactForm');

let lastFocusedElement = null;
let previousOverflow = '';

function openContactModal() {
  if (!contactModal) return;
  if (contactModal.classList.contains('show')) return;

  lastFocusedElement = document.activeElement;
  previousOverflow = document.body.style.overflow;

  closeNavigation();

  contactModal.classList.add('show');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const firstInput = contactModal.querySelector('input');

  if (firstInput) {
    firstInput.focus();
  }
}

function closeContactModal() {
  if (!contactModal) return;
  if (!contactModal.classList.contains('show')) return;

  if (
    lastFocusedElement instanceof HTMLElement &&
    lastFocusedElement.isConnected
  ) {
    lastFocusedElement.focus();
  }

  contactModal.classList.remove('show');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = previousOverflow;
}

openModalButtons.forEach((button) => {
  button.addEventListener('click', openContactModal);
});

closeModalElements.forEach((element) => {
  element.addEventListener('click', closeContactModal);
});

document.addEventListener('keydown', (event) => {
  if (!contactModal) return;
  if (!contactModal.classList.contains('show')) return;

  if (event.key === 'Escape') {
    closeContactModal();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = Array.from(
    contactModal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]'
    )
  ).filter((element) => element.getClientRects().length > 0);

  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

// ========================================
// Send contact message through FormSubmit
// ========================================

const FORMSUBMIT_EMAIL = 'rhespaulin@gmail.com';

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const nameInput = contactForm.querySelector('#visitorName');
  const emailInput = contactForm.querySelector('#visitorEmail');
  const messageInput = contactForm.querySelector('#visitorMessage');

  let isSending = false;

  if (submitButton) {
    submitButton.innerHTML =
      'Send message <span aria-hidden="true">↗</span>';
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSending) return;

    if (!nameInput || !emailInput || !messageInput) {
      showNotification(
        'The contact form is incomplete. Please check its HTML.',
        true
      );
      return;
    }

    nameInput.value = nameInput.value.trim();
    emailInput.value = emailInput.value.trim();
    messageInput.value = messageInput.value.trim();

    if (!contactForm.reportValidity()) return;

    if (!nameInput.value || !emailInput.value || !messageInput.value) {
      showNotification(
        'Please complete your name, email, and message.',
        true
      );
      return;
    }

    isSending = true;
    hideNotification();

    const originalButtonContent = submitButton
      ? submitButton.innerHTML
      : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    contactForm.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/rhespaulin@gmail.com`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            visitorName: nameInput.value,
            visitorEmail: emailInput.value,
            visitorMessage: messageInput.value,
            _subject: `New portfolio message from ${nameInput.value}`,
            _replyto: emailInput.value,
            _template: 'table',
            _captcha: 'false'
          })
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error(
          'FormSubmit did not return a valid response. Please try again later.'
        );
      }

      const submissionAccepted =
        result.success === true || result.success === 'true';

      if (!response.ok || !submissionAccepted) {
        if (
          response.status === 403 ||
          (result.message || '').toLowerCase().includes('activate')
        ) {
          throw new Error(
            'FormSubmit needs activation. Check rhespaulin@gmail.com, including Spam, then click the confirmation email.'
          );
        }

        throw new Error(
          result.message || 'Unable to submit your message. Please try again.'
        );
      }

      contactForm.reset();
      closeContactModal();

      showNotification('Message submitted! Thank you for reaching out.');
    } catch (error) {
      console.error('Contact form submission failed:', error);

      let errorMessage =
        error.message || 'Unable to submit your message. Please try again.';

      if (error.name === 'TypeError') {
        errorMessage =
          'Could not connect to FormSubmit. Make sure your website is opened through Live Server or hosted online, not directly through file://.';
      }

      showNotification(errorMessage, true);
    } finally {
      isSending = false;
      contactForm.removeAttribute('aria-busy');

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    }
  });
}