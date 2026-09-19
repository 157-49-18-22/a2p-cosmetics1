import React from 'react';
import './WhatsAppWidget.css';

const WhatsAppWidget = () => {
  const phoneNumber = '918130525001';
  const defaultMessage = encodeURIComponent('Hi A2P Cosmetics! I have a inquiry regarding your products.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="global-whatsapp-float"
      title="Chat with us on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      <div className="whatsapp-pulse" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="34"
        height="34"
        fill="#ffffff"
      >
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825.737 5.607 2.137 8.048l-2.137 7.952 8.147-2.135c2.375 1.299 5.061 1.983 7.853 1.983 8.837 0 16-7.163 16-16s-7.163-16-16-16zm0 29.333c-2.427 0-4.808-.63-6.912-1.822l-.496-.282-5.138 1.347 1.371-5.093-.31-.494c-1.309-2.091-2.001-4.517-2.001-7.001 0-7.355 5.978-13.333 13.333-13.333s13.333 5.978 13.333 13.333-5.978 13.333-13.333 13.333zm7.323-9.98c-.401-.201-2.373-1.171-2.741-1.305-.368-.134-.636-.201-.904.201s-1.038 1.305-1.272 1.573c-.234.268-.468.301-.869.101-.401-.201-1.696-.625-3.23-1.993-1.194-1.064-2.001-2.378-2.235-2.779-.234-.401-.025-.618.175-.817.18-.179.401-.468.602-.702.201-.234.268-.401.401-.669.134-.268.067-.502-.033-.702-.101-.201-.904-2.175-1.238-2.977-.325-.781-.655-.675-.904-.687-.234-.012-.502-.012-.769-.012s-.702.101-1.07.502c-.368.401-1.405 1.372-1.405 3.346s1.439 3.882 1.639 4.15c.201.268 2.832 4.324 6.862 6.063.958.413 1.707.66 2.29.845 1.002.318 1.914.273 2.635.165.803-.12 2.373-.97 2.708-1.908.335-.937.335-1.741.234-1.908-.101-.166-.368-.267-.769-.468z" />
      </svg>
    </a>
  );
};

export default WhatsAppWidget;
