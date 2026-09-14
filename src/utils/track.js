import API_BASE_URL from '../apiConfig.js';

// ─── Session Management ─────────────────────────────────────────────────────
// A unique session ID is created per browser tab and persists for 30 minutes
// of inactivity. All tracking events are tagged with this session ID.

const SESSION_KEY   = 'a2p_session_id';
const SESSION_START = 'a2p_session_start';
const SESSION_PAGES = 'a2p_session_pages';
const SESSION_TTL   = 30 * 60 * 1000; // 30 minutes

const generateSessionId = () =>
  `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

/**
 * Gets or creates a valid session ID.
 * If the last activity was more than 30 minutes ago, a new session is started.
 */
export const getOrCreateSession = () => {
  const now = Date.now();
  const existingId    = sessionStorage.getItem(SESSION_KEY);
  const lastActive    = parseInt(sessionStorage.getItem('a2p_last_active') || '0', 10);
  const sessionExpired = (now - lastActive) > SESSION_TTL;

  if (!existingId || sessionExpired) {
    // New session
    const newId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY,   newId);
    sessionStorage.setItem(SESSION_START, now.toString());
    sessionStorage.setItem(SESSION_PAGES, '0');
    console.log(`[Session] New session started: ${newId}`);
  }

  sessionStorage.setItem('a2p_last_active', now.toString());
  return sessionStorage.getItem(SESSION_KEY);
};

/**
 * Returns session analytics: ID, duration (seconds), pages visited.
 */
export const getSessionInfo = () => {
  const id       = sessionStorage.getItem(SESSION_KEY) || 'unknown';
  const start    = parseInt(sessionStorage.getItem(SESSION_START) || Date.now().toString(), 10);
  const pages    = parseInt(sessionStorage.getItem(SESSION_PAGES) || '0', 10);
  const duration = Math.floor((Date.now() - start) / 1000); // seconds
  return { id, duration, pages };
};

/**
 * Increments the page view counter for the current session.
 * Call this on every route change.
 */
export const incrementSessionPage = () => {
  const current = parseInt(sessionStorage.getItem(SESSION_PAGES) || '0', 10);
  sessionStorage.setItem(SESSION_PAGES, (current + 1).toString());
  sessionStorage.setItem('a2p_last_active', Date.now().toString());
};

// ─── Activity Tracker ────────────────────────────────────────────────────────

/**
 * Tracks customer behaviour events and saves them to the backend
 * customer_activity database, tagged with the current session ID.
 *
 * @param {string} type        - Event type: 'View', 'Cart', 'Wishlist', 'Search', 'PageView'
 * @param {string} productName - Product or page name related to the event
 * @param {number} [customerId]- Optional customer ID (auto-resolved via cookie on backend)
 */
export const trackUserActivity = async (type, productName, customerId = null) => {
  try {
    const sessionId   = getOrCreateSession();
    const sessionInfo = getSessionInfo();

    const payload = {
      type,
      product_name: productName || '',
      customer_id:  customerId,
      session_id:   sessionId,
      session_duration: sessionInfo.duration,
      pages_in_session: sessionInfo.pages,
      page_url:     window.location.pathname,
      referrer:     document.referrer || 'direct',
      user_agent:   navigator.userAgent.substring(0, 120),
    };

    // Console log for easy verification
    console.log(
      `[Tracking Event] ${type} | Session: ${sessionId.substring(0, 18)}… | Pages: ${sessionInfo.pages} | Duration: ${sessionInfo.duration}s`,
      { product: productName }
    );

    await fetch(`${API_BASE_URL}/customers/activity/track`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      credentials: 'include',
    });
  } catch (error) {
    console.error('[Tracking Error]', error);
  }
};
