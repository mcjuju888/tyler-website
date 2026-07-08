/* ============================================================
   PARABOLIC STRENGTH — site scripts
   ============================================================ */

/* ---- BOOKING SETUP ----
   Paste your Google Calendar appointment-schedule booking link
   between the quotes below. Get it from:
   Google Calendar > Create > Appointment schedule > Share > copy link
   It looks like:
   https://calendar.google.com/calendar/appointments/schedules/AcZss...
*/
const BOOKING_URL = "";

/* ---- Logo (SVG recreation of the brand mark) ----
   Injected into every element with .logo-mark (sphere + barbell)
   or .logo-full (adds the circular PARABOLIC / STRENGTH COACHING text).
   The original raster file lives at assets/logo.png. */

const RINGS_SVG = `
  <g stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.9">
    <circle r="100"/>
    <ellipse rx="100" ry="78" transform="rotate(18)"/>
    <ellipse rx="100" ry="60" transform="rotate(-32)"/>
    <ellipse rx="100" ry="42" transform="rotate(63)"/>
    <ellipse rx="100" ry="88" transform="rotate(-64)"/>
    <ellipse rx="100" ry="50" transform="rotate(8)"/>
    <ellipse rx="100" ry="68" transform="rotate(44)"/>
    <ellipse rx="100" ry="28" transform="rotate(-12)"/>
  </g>`;

const BARBELL_SVG = `
  <g fill="currentColor">
    <rect x="-88" y="-4" width="176" height="8" rx="4"/>
    <rect x="-59" y="-28" width="9" height="56" rx="3"/>
    <rect x="-73" y="-40" width="11" height="80" rx="3"/>
    <rect x="-84" y="-20" width="9" height="40" rx="3"/>
    <rect x="50" y="-28" width="9" height="56" rx="3"/>
    <rect x="62" y="-40" width="11" height="80" rx="3"/>
    <rect x="75" y="-20" width="9" height="40" rx="3"/>
  </g>`;

const MARK_SVG = `<svg viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${RINGS_SVG}${BARBELL_SVG}</svg>`;

const LOGO_SVG = `<svg viewBox="-172 -172 344 344" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Parabolic Strength Coaching">
  <defs>
    <path id="logoArcTop" d="M -138 0 A 138 138 0 0 1 138 0"/>
    <path id="logoArcBottom" d="M -138 0 A 138 138 0 0 0 138 0"/>
  </defs>
  ${RINGS_SVG}${BARBELL_SVG}
  <text font-family="Oswald, sans-serif" font-size="36" font-weight="600" letter-spacing="13" fill="currentColor">
    <textPath href="#logoArcTop" startOffset="50%" text-anchor="middle">PARABOLIC</textPath>
  </text>
  <text font-family="Oswald, sans-serif" font-size="29" font-weight="600" letter-spacing="5" fill="currentColor">
    <textPath href="#logoArcBottom" startOffset="50%" text-anchor="middle">STRENGTH COACHING</textPath>
  </text>
</svg>`;

/* rings only — used as faint background line work */
const DECO_SVG = `<svg viewBox="-104 -104 208 208" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${RINGS_SVG}</svg>`;

document.querySelectorAll(".logo-mark").forEach((el) => { el.innerHTML = MARK_SVG; });
document.querySelectorAll(".logo-full").forEach((el) => { el.innerHTML = LOGO_SVG; });
document.querySelectorAll(".deco-sphere").forEach((el) => { el.innerHTML = DECO_SVG; });

/* ---- Scroll reveal ---- */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const groups = document.querySelectorAll(
    ".about-photo, .about-text, .testimonial-card, .blog-card, .cta-band .container, .booking-embed"
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  groups.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 90 + "ms";
    io.observe(el);
  });
}

/* ---- Hero video: if assets/hero.mp4 loads, hide the generated backdrop ---- */
const heroVideo = document.querySelector(".hero-video-wrap video");
if (heroVideo) {
  heroVideo.addEventListener("canplay", () => {
    document.body.classList.add("has-hero-video");
  });
}

/* ---- Navbar: solid background after scrolling past the hero ---- */
const navbar = document.getElementById("navbar");
if (navbar && !navbar.classList.contains("solid")) {
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---- Mobile menu toggle ---- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navToggle.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );
}

/* ---- Testimonial carousel arrows ---- */
const track = document.getElementById("testimonialTrack");
const prevBtn = document.getElementById("testimonialPrev");
const nextBtn = document.getElementById("testimonialNext");
if (track && prevBtn && nextBtn) {
  const step = () => track.clientWidth * 0.8;
  prevBtn.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  nextBtn.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
}

/* ---- Booking embed: swap setup notice for the calendar iframe ---- */
const bookingEmbed = document.getElementById("bookingEmbed");
if (bookingEmbed && BOOKING_URL) {
  const iframe = document.createElement("iframe");
  iframe.src = BOOKING_URL;
  iframe.title = "Book a session";
  iframe.loading = "lazy";
  bookingEmbed.replaceChildren(iframe);
}
