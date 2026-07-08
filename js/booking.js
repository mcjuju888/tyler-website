/* ============================================================
   PARABOLIC STRENGTH — booking widget
   Custom calendar + time-slot picker. On submit it opens Google
   Calendar with the session pre-filled (no backend needed).
   When BOOKING_URL in main.js is set, main.js replaces this whole
   widget with the official Google Calendar appointment embed, and
   this script quietly does nothing.
   ============================================================ */

(function () {
  const calGrid = document.getElementById("calGrid");
  if (!calGrid) return; // widget was replaced by the Google embed

  const calTitle = document.getElementById("calTitle");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");
  const slotDay = document.getElementById("slotDay");
  const slotGrid = document.getElementById("slotGrid");
  const form = document.getElementById("bookingForm");
  const summary = document.getElementById("bookingSummary");
  const success = document.getElementById("bookingSuccess");
  const successDetail = document.getElementById("bookingSuccessDetail");
  const againBtn = document.getElementById("bookingAgain");

  /* ---- availability (edit these to match real training hours) ---- */
  const HOURS = {
    weekday: ["06:00", "07:00", "08:00", "09:00", "12:00", "16:00", "17:00", "18:00"],
    saturday: ["08:00", "09:00", "10:00", "11:00"],
    sunday: [], // rest day
  };
  const MAX_DAYS_AHEAD = 90;

  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  function session() {
    const input = document.querySelector('input[name="session"]:checked');
    return { name: input.dataset.name, duration: parseInt(input.dataset.duration, 10) };
  }

  function slotsFor(date) {
    const dow = date.getDay();
    if (dow === 0) return HOURS.sunday;
    if (dow === 6) return HOURS.saturday;
    return HOURS.weekday;
  }

  function fmtDate(date) {
    return DAYS[date.getDay()] + " " + date.getDate() + " " + MONTHS[date.getMonth()].slice(0, 3);
  }

  /* ---- calendar ---- */
  function renderCalendar() {
    calTitle.textContent = MONTHS[viewMonth] + " " + viewYear;
    calGrid.innerHTML = "";

    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // Monday-first offset

    for (let i = 0; i < lead; i++) {
      calGrid.appendChild(document.createElement("span"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = d;

      const unavailable =
        date < today || date > maxDate || slotsFor(date).length === 0;
      if (unavailable) btn.disabled = true;
      if (date.getTime() === today.getTime()) btn.classList.add("today");
      if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        selectedDate = date;
        selectedTime = null;
        renderCalendar();
        renderSlots();
        updateSummary();
      });
      calGrid.appendChild(btn);
    }

    // month nav limits
    calPrev.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    calNext.disabled = viewYear === maxDate.getFullYear() && viewMonth === maxDate.getMonth();
  }

  calPrev.addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  /* ---- time slots ---- */
  function renderSlots() {
    slotGrid.innerHTML = "";
    if (!selectedDate) {
      slotDay.textContent = "Select a day first";
      return;
    }
    slotDay.textContent = fmtDate(selectedDate);

    slotsFor(selectedDate).forEach((time) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn";
      btn.textContent = time;
      if (time === selectedTime) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        selectedTime = time;
        renderSlots();
        updateSummary();
      });
      slotGrid.appendChild(btn);
    });
  }

  document.querySelectorAll('input[name="session"]').forEach((input) =>
    input.addEventListener("change", updateSummary)
  );

  function updateSummary() {
    summary.classList.remove("error");
    if (!selectedDate || !selectedTime) {
      summary.textContent = "No session selected yet — pick a day and time above.";
      return;
    }
    const s = session();
    summary.textContent =
      s.name + " · " + fmtDate(selectedDate) + " at " + selectedTime + " · " + s.duration + " min";
  }

  /* ---- submit → Google Calendar template link ---- */
  function gcalStamp(date) {
    const p = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear() + p(date.getMonth() + 1) + p(date.getDate()) +
      "T" + p(date.getHours()) + p(date.getMinutes()) + "00"
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("bkName").value.trim();
    const email = document.getElementById("bkEmail").value.trim();
    const phone = document.getElementById("bkPhone").value.trim();
    const notes = document.getElementById("bkNotes").value.trim();

    if (!selectedDate || !selectedTime) {
      summary.classList.add("error");
      summary.textContent = "Pick a day and a time before requesting a booking.";
      return;
    }
    if (!name || !email || !form.checkValidity()) {
      summary.classList.add("error");
      summary.textContent = "Please fill in your name and a valid email.";
      return;
    }

    const s = session();
    const [hh, mm] = selectedTime.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start.getTime() + s.duration * 60000);

    const details =
      "Booking request from " + name + " (" + email + ")" +
      (phone ? "\nPhone: " + phone : "") +
      (notes ? "\nNotes: " + notes : "") +
      "\n\nRequested via parabolic-strength website.";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(s.name + " — Parabolic Strength") +
      "&dates=" + gcalStamp(start) + "/" + gcalStamp(end) +
      "&details=" + encodeURIComponent(details) +
      "&location=" + encodeURIComponent("Parabolic Strength Coaching");

    window.open(url, "_blank", "noopener");

    successDetail.textContent =
      s.name + " — " + fmtDate(selectedDate) + " at " + selectedTime + " (" + s.duration + " min) for " + name + ".";
    form.hidden = true;
    document.querySelector(".booking-widget").hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  againBtn.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    document.querySelector(".booking-widget").hidden = false;
    selectedTime = null;
    renderSlots();
    updateSummary();
  });

  renderCalendar();
  renderSlots();
  updateSummary();
})();
