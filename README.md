# Parabolic Strength — Personal Training Site

A simple static website. No build step — open `index.html` in a browser, or host the folder anywhere (Netlify, GitHub Pages, Vercel, etc.).

## Pages

- `index.html` — hero with black & white background video, About Me, Testimonials
- `book.html` — booking page (Google Calendar appointment schedule embed)
- `blog.html` — blog listing

## Setup checklist

1. **Hero video** — put your video at `assets/hero.mp4`. Any color footage works; CSS renders it black & white. (Optional: `assets/hero-poster.jpg` as a loading still.)
2. **Your photo** — put it at `assets/about.jpg` and rewrite the About Me text in `index.html`.
3. **Testimonials** — replace the three placeholder quotes in `index.html`.
4. **Google Calendar booking**:
   - In Google Calendar: **Create → Appointment schedule**, set your available hours.
   - Open the schedule → **Share** → copy the booking page link.
   - Paste it into `BOOKING_URL` at the top of `js/main.js`.
5. **Blog posts** — the cards in `blog.html` are placeholders; duplicate a card per post.

## Styling

Colors live at the top of `css/style.css` as CSS variables. The accent is `#01407a` (`--accent`, with `--accent-dark` and `--accent-light` variants); change them in one place to retheme the whole site.

The home-page hero shows a generated black & white training animation (`js/hero-bg.js`) until a real `assets/hero.mp4` exists — the moment the video loads, the animation hides itself.
