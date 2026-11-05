# Loam Real Estate IQ — website

Marketing website for **Loam Real Estate IQ** ([@loam.iq](https://www.instagram.com/loam.iq)), the Iraq
operation of Dubai-based Loam Real Estate. Sales centre: Al-Mansour, Baghdad.

The site is a single, fast static page with no build step and no framework:

- **Bilingual** — English and Arabic with full right-to-left layout. The toggle in the header switches
  languages; the choice is remembered, and `?lang=ar` / `?lang=en` link straight to a language.
- **Sections** — hero, about, services, portfolio (with filters), market insight, process, contact, footer.
- **Contact form without a backend** — submissions open WhatsApp with a pre-filled message. If no WhatsApp
  number is configured it falls back to email, then to Instagram DM (the message is copied to the clipboard).
- **SEO ready** — meta tags, Open Graph / Twitter card image, `RealEstateAgent` structured data, `robots.txt`.
- **Accessible and responsive** — semantic HTML, keyboard-friendly navigation, reduced-motion support,
  tested at phone and desktop widths.

## Files

```
index.html          page structure (text is swapped in by js/i18n.js)
css/styles.css      all styling; the palette lives in the :root block at the top
js/config.js        business details: contact, social links, default language  ← edit this first
js/i18n.js          every piece of copy in English and Arabic, plus the portfolio entries
js/main.js          language switching, portfolio filters, contact form, navigation
assets/             favicon, Apple touch icon, social-share image, project photos (assets/img/)
```

## Before launch

Open `js/config.js` and fill in:

| Key | What it is |
| --- | --- |
| `contact.whatsapp` | Sales WhatsApp number, digits only with country code, e.g. `9647701234567`. Enables every WhatsApp button and the floating chat bubble. |
| `contact.email` | Public sales inbox (optional). |
| `contact.phone` | Display phone number (optional). |
| `contact.mapUrl` | Google Maps share link for the sales centre (optional, shows an "Open in Maps" link). |
| `social.*` | Verify the Facebook, TikTok and Threads handles. Instagram and Linktree are confirmed. |
| `defaultLang` | `"en"` or `"ar"` for first-time visitors. |

Then replace the representative portfolio cards in `js/i18n.js` (`window.LOAM_PROJECTS`) with real projects.
Each entry has an English and Arabic title, location, description and spec list. Set `image` to a photo path
such as `assets/img/project-name.jpg` and the photo replaces the line illustration.

If the live domain is not `loam.iq`, update `brand.siteUrl` in `js/config.js` and the `og:image` /
JSON-LD URLs in the `<head>` of `index.html`.

## Running locally

Any static server works, for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to Netlify

`netlify.toml` already holds the settings Netlify needs (publish the repo root, no build command, security
headers, and `/ar` / `/en` short links).

1. Sign in at [app.netlify.com](https://app.netlify.com) and choose **Add new site → Import an existing project**.
2. Pick **GitHub**, authorise Netlify if asked, and select the `dev-zayn/loam.iq` repository.
3. Leave the build settings as detected (build command empty, publish directory `.`) and click **Deploy**.
   The site goes live on a `*.netlify.app` address within a minute, and every push to the chosen branch
   redeploys it automatically.
4. To use your own domain: **Domain management → Add a domain**, then point the domain's DNS at Netlify as
   the dashboard instructs (either Netlify DNS name servers, or an A record to Netlify's load balancer plus a
   `www` CNAME). Netlify issues the HTTPS certificate automatically once DNS resolves.

If you ever switch hosts, the site still works anywhere that serves static files (GitHub Pages, Vercel,
Cloudflare Pages, or any web host via FTP). Only the headers and short links in `netlify.toml` are Netlify
specific.
