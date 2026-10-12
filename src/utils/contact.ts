/**
 * WhatsApp chat link
 * @param {string} phone - International phone number
 * @param {string} text - Prefilled message
 * @return {string} - Chat URL
 */

export const whatsappLinkOf = (phone: string, text: string): string =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

/**
 * Mail link
 * @param {string} address - Recipient
 * @param {string} subject - Subject line
 * @return {string} - Mailto URL
 */

export const mailLinkOf = (address: string, subject: string): string =>
  `mailto:${address}?subject=${encodeURIComponent(subject)}`
