/** Language-independent contact data (no content imports, so client components can use it). Localized labels live in i18n. */
export const contact = {
  phoneHref: "tel:+302105593900",
  mobileHref: "tel:+306974660774",
  email: "sales@alfaglass.gr",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=ALFA+GLASS+Ασπρόπυργος",
};

/**
 * An email that already knows what the visitor wants: a `mailto:` with a prefilled subject and, optionally, a body
 * (the cut list of the estimator). Greek is percent-encoded, so every mail program gets it right.
 */
export function enquiryHref({ subject, body }: { subject: string; body?: string }) {
  const query = [`subject=${encodeURIComponent(subject)}`, ...(body ? [`body=${encodeURIComponent(body)}`] : [])].join("&");
  return `mailto:${contact.email}?${query}`;
}
