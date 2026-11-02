/*
 * Loam Real Estate IQ — site configuration
 * ----------------------------------------
 * Everything that is specific to the business lives here so the HTML never
 * needs to be touched for routine updates.
 *
 * TODO before launch:
 *   1. whatsapp  — international format, digits only (e.g. "9647701234567").
 *                  Leave empty to hide every WhatsApp button; the contact
 *                  form then falls back to email, then Instagram DM.
 *   2. email     — public sales inbox. Leave empty if you do not want one shown.
 *   3. phone     — display version of the sales-centre phone (e.g. "+964 770 123 4567").
 *   4. mapUrl    — Google Maps share link for the Al-Mansour sales centre.
 *   5. social    — verify the Facebook / TikTok / Threads handles.
 */
window.LOAM_CONFIG = {
  brand: {
    name: "Loam Real Estate IQ",
    nameAr: "لوم للعقارات العراق",
    parentName: "Loam Real Estate L.L.C.",
    parentUrl: "https://loamrealestate.com",
    siteUrl: "https://loam.iq",
    foundedYear: 2021
  },

  contact: {
    whatsapp: "",            // e.g. "9647701234567"
    email: "",               // e.g. "sales@loam.iq"
    phone: "",               // e.g. "+964 770 123 4567"
    mapUrl: "",              // e.g. "https://maps.app.goo.gl/..."
    address: {
      en: "Sales Centre, Al-Mansour, Baghdad, Iraq",
      ar: "مركز المبيعات، المنصور، بغداد، العراق"
    }
  },

  social: {
    instagram: "https://www.instagram.com/loam.iq",
    instagramHandle: "loam.iq",
    facebook: "https://www.facebook.com/loamrealestate",
    tiktok: "https://www.tiktok.com/@loamrealestate",
    threads: "https://www.threads.net/@loam.iq",
    linktree: "https://linktr.ee/loam.iq1"
  },

  /* Default language when a visitor has no saved preference: "en" or "ar". */
  defaultLang: "en"
};
