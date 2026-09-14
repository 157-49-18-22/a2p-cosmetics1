// Google Analytics 4 Integration Helper
const GA_MEASUREMENT_ID = 'G-A2PCOSMETIC'; // Placeholder Measurement ID

/**
 * Initializes Google Analytics 4 on the page
 */
export const initGA = () => {
  if (window.gtag) return; // already initialized

  // Create script tag for gtag
  const scriptNode = document.createElement('script');
  scriptNode.async = true;
  scriptNode.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(scriptNode);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true
  });
  
  console.log(`[Google Analytics 4] Initialized with ID: ${GA_MEASUREMENT_ID}`);
};

/**
 * Sends a custom event to Google Analytics 4
 * @param {string} eventName - e.g., 'view_item', 'add_to_cart', 'search'
 * @param {object} params - Event metadata (value, items, search_term)
 */
export const logGAEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
  // Console logging for verification
  console.log(`[GA4 Event Logged] "${eventName}":`, params);
};
