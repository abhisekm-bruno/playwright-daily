import { el } from './dom.js';

/**
 * Web Push setup, written for iOS first.
 *
 * The iOS rules that shape this file:
 *   - Push only works in a Home Screen web app. In a Safari tab the
 *     Notification API is not even defined.
 *   - Permission must be requested from a real user gesture, so everything
 *     hangs off a button rather than running on load.
 *   - Requires iOS 16.4 or newer.
 */

// Public half of the VAPID pair. Public by design; the private key signs
// outgoing pushes and lives outside the repo.
export const VAPID_PUBLIC_KEY = 'BHxFX8Z3PE57hh8bHBtZpvJd_NcTQao3bqtngnoafe9oSEWMNlJ24wJRAzwKOk3zhn2_J6TUj2gqtTOxXVmfWmk';

const urlBase64ToUint8Array = (base64) => {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const hasPushApi = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function readState() {
  const state = {
    standalone: isStandalone(),
    ios: isIOS(),
    supported: hasPushApi(),
    permission: 'Notification' in window ? Notification.permission : 'unavailable',
    subscription: null,
  };

  if (state.supported) {
    const registration = await navigator.serviceWorker.ready;
    state.subscription = await registration.pushManager.getSubscription();
  }

  return state;
}

/**
 * Permission and push registration are separate concerns and fail separately.
 * Getting permission but failing to register still leaves notifications
 * working on this device, so the two are reported independently rather than
 * collapsing into one error.
 */
async function enable() {
  const registration = await navigator.serviceWorker.ready;

  // Once denied, the prompt never reappears, so asking again would look like
  // the button is broken. Send them to Settings instead.
  if (Notification.permission === 'denied') {
    throw new Error('Notifications are blocked for this app. Re-enable them in Settings > Notifications > PW Daily, then come back.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked for this app. Re-enable them in Settings > Notifications > PW Daily, then come back.'
        : 'Permission was dismissed. Tap the button again when you are ready.'
    );
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) return { subscription: existing, pushError: null };

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return { subscription, pushError: null };
  } catch (error) {
    return { subscription: null, pushError: `${error.name}: ${error.message}` };
  }
}

// Surfaced on re-render so a failed registration is explained rather than lost.
let lastPushError = null;

async function sendTestNotification() {
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Playwright Daily', {
    body: 'This is how your 9:00 PM nudge will look.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'test-notification',
    data: { url: '/#reminders' },
  });
}

/* ─────────────────────────── rendering ─────────────────────────── */

const statusRow = (label, value, good) =>
  el(
    'li',
    {},
    el('span', { className: 'task-num', textContent: good ? '\u2713' : '\u00b7' }),
    el('span', {}, el('strong', { textContent: label + ': ' }), value)
  );

export async function renderReminders(container, { onNavigate }) {
  const state = await readState();

  container.replaceChildren();
  container.append(
    el('div', { className: 'eyebrow', textContent: 'Settings' }),
    el('h2', { textContent: 'Daily reminder' })
  );

  const meta = el('div', { className: 'meta-row' });
  meta.append(el('span', { className: 'pill', textContent: state.standalone ? 'Installed app' : 'Browser tab' }));
  if (state.subscription) meta.append(el('span', { className: 'pill accent', textContent: 'Subscribed' }));
  container.append(meta);

  // iOS in a browser tab cannot do any of this. Say so plainly instead of
  // showing a button that will fail.
  if (state.ios && !state.standalone) {
    container.append(
      el(
        'div',
        { className: 'callout' },
        el('strong', { textContent: 'Add this to your Home Screen first' }),
        el('div', {
          innerHTML:
            'iOS only allows notifications for installed web apps, never for a Safari tab. Tap the Share button and choose <strong>Add to Home Screen</strong>. Then open Playwright Daily from the new icon and come back here.',
        })
      )
    );
  }

  container.append(
    el(
      'div',
      { className: 'card' },
      el('h3', { textContent: 'Status' }),
      el(
        'ul',
        { className: 'task-list' },
        statusRow('Running as an installed app', state.standalone ? 'yes' : 'no, this is a browser tab', state.standalone),
        statusRow('Push supported here', state.supported ? 'yes' : 'no', state.supported),
        statusRow('Permission', state.permission, state.permission === 'granted'),
        statusRow('Subscription', state.subscription ? 'active' : 'none yet', !!state.subscription)
      )
    )
  );

  const message = el('p', { className: 'planned-note', textContent: '' });

  const enableBtn = el('button', {
    className: 'btn primary',
    type: 'button',
    textContent: state.subscription ? '\u2713 Reminders enabled' : 'Enable reminders',
    disabled: !state.supported || (state.ios && !state.standalone),
  });

  if (state.subscription) enableBtn.classList.add('is-done');

  enableBtn.addEventListener('click', async () => {
    enableBtn.disabled = true;
    message.textContent = 'Asking for permission\u2026';
    try {
      const { pushError } = await enable();
      lastPushError = pushError;
      await renderReminders(container, { onNavigate });
    } catch (error) {
      enableBtn.disabled = false;
      message.textContent = error.message;
    }
  });

  const testBtn = el('button', {
    className: 'btn',
    type: 'button',
    textContent: 'Send a test notification',
    disabled: state.permission !== 'granted',
  });

  testBtn.addEventListener('click', async () => {
    message.textContent = '';
    try {
      await sendTestNotification();
      message.textContent =
        'Sent. On iPhone, notifications only appear when the app is in the background \u2014 swipe home to see it.';
    } catch (error) {
      message.textContent = 'Could not show the notification: ' + error.message;
    }
  });

  container.append(
    el(
      'div',
      { className: 'card' },
      el('h3', { textContent: 'Turn it on' }),
      el('p', {
        textContent:
          'Grants notification permission and registers this device with the push service. Nothing is sent to any server of mine \u2014 the subscription stays on this device until you wire up a sender.',
      }),
      el('div', { className: 'footer-actions', style: 'margin-top:8px;padding-top:0;border-top:none' }, enableBtn, testBtn),
      message
    )
  );

  if (state.permission === 'granted' && !state.subscription && lastPushError) {
    container.append(
      el(
        'div',
        { className: 'callout' },
        el('strong', { textContent: 'Notifications work, but push registration failed' }),
        el('div', {
          innerHTML:
            'This device can show notifications \u2014 the test button below will prove it \u2014 but it could not register with a push service, so a scheduled reminder could not reach it yet. ' +
            'Desktop Chromium builds without Google API keys always fail this way; on a real iPhone it usually means no network at the moment you tapped enable.',
        }),
        el('div', { className: 'code-head', style: 'margin-top:10px', textContent: lastPushError })
      )
    );
  }

  if (state.subscription) {
    const json = JSON.stringify(state.subscription.toJSON(), null, 2);

    const copyBtn = el('button', { className: 'btn', type: 'button', textContent: 'Copy subscription' });
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(json);
      copyBtn.textContent = 'Copied';
      setTimeout(() => (copyBtn.textContent = 'Copy subscription'), 1400);
    });

    const details = el('details', {}, el('summary', { textContent: 'Show subscription JSON' }), el('pre', {}, el('code', { textContent: json })));

    container.append(
      el(
        'div',
        { className: 'card' },
        el('h3', { textContent: 'Scheduling the 9:00 PM nudge' }),
        el('p', {
          textContent:
            'Your phone cannot wake itself up, so the actual reminder has to be sent by something running on a schedule. That part is not built yet.',
        }),
        el('p', {
          textContent:
            'When you are ready, this subscription is the piece the sender needs. Copy it then, not now \u2014 it changes if you reinstall the app.',
        }),
        el('div', { className: 'footer-actions', style: 'margin-top:8px;padding-top:0;border-top:none' }, copyBtn),
        details
      )
    );
  }

  const back = el('button', { className: 'btn', type: 'button', textContent: '\u2190 Back to lessons' });
  back.addEventListener('click', () => onNavigate());
  container.append(el('div', { className: 'footer-actions' }, back));
}
