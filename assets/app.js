/* Shared helpers used across all pages */

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

function markActiveNav() {
  const path = location.pathname.replace(/\/$/, "") || "/index.html";
  document.querySelectorAll("nav.mainnav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (path.endsWith(href) || (href === "index.html" && (path === "" || path.endsWith("/")))) {
      a.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", markActiveNav);

/* Builds the photo strip markup for an event card. Accepts ev.images (array) or
   the older single ev.image (string) for backward compatibility. */
function eventPhotoMarkup(ev) {
  const images = ev.images && ev.images.length ? ev.images : (ev.image ? [ev.image] : []);
  if (!images.length) return "";
  const imgs = images.map(src => `<img src="${src}" alt="${ev.title || ""}" loading="lazy" />`).join("");
  const multi = images.length > 1;
  const nav = multi
    ? `<button type="button" class="photo-nav prev" aria-label="Previous photo">‹</button>
       <button type="button" class="photo-nav next" aria-label="Next photo">›</button>
       <div class="photo-dots">${images.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}"></span>`).join("")}</div>`
    : "";
  return `<div class="event-photo"><div class="photo-track">${imgs}</div>${nav}</div>`;
}

/* Wires up the prev/next buttons and scroll-synced dots for every multi-photo
   gallery inside rootEl. Call this after injecting event card HTML into the DOM. */
function initPhotoGalleries(rootEl) {
  (rootEl || document).querySelectorAll(".event-photo").forEach(wrap => {
    const track = wrap.querySelector(".photo-track");
    const dots = wrap.querySelectorAll(".photo-dots .dot");
    if (!track || dots.length < 2) return;
    const updateDots = () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };
    track.addEventListener("scroll", () => window.requestAnimationFrame(updateDots));
    const prev = wrap.querySelector(".photo-nav.prev");
    const next = wrap.querySelector(".photo-nav.next");
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: track.clientWidth, behavior: "smooth" }));
  });
}
