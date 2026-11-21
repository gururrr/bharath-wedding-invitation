/**
 * ==============================================================================
 * BHARATH & MADHUSHRI — WEDDING INVITATION INTERACTIVE LOGIC
 * Features:
 *   1. Smooth Entry Curtain with Gesture-Triggered Audio & Petal Burst
 *   2. HTML5 Canvas 3D Tumbling Rose Petal Physics Engine
 *   3. Ambient Wedding Audio with Web Audio API Synthesizer Fallback
 *   4. Live Multi-Card Wedding Countdown Timer
 *   5. High-Resolution "Save the Date" Canvas Poster Generator & Exporter
 *   6. Add to Calendar (Google Calendar & Apple / Outlook .ics generation)
 *   7. WhatsApp Social Sharing with Formatted Invitation Card
 *   8. Interactive Blessing Wall / Guestbook with Persistent Storage
 *   9. Venue Navigation with Google Maps & 1-Click Clipboard Copy
 * ==============================================================================
 */

(function () {
  "use strict";

  // ----------------------------------------------------------------------------
  // 1. Core Wedding Details State
  // ----------------------------------------------------------------------------
  const weddingState = {
    groom: "Bharath H.B.",
    bride: "Madhushri S. Patil",
    receptionDateStr: "05 December 2026",
    receptionTimeStr: "Evening 7:00 PM onwards",
    muhurthamDateStr: "06 December 2026",
    muhurthamTimeStr: "Morning 8:40 AM to 9:30 AM",
    venueName: "Sri Tirumala Kalyana Mantapa",
    venueCity: "Chitradurga",
    venueAddress: "Near Malappanahatti Circle, Chitradurga, Karnataka - 577501",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sri+Tirumala+Kalyana+Mantapa+Chitradurga",
    // Target Muhurtham Date for Countdown
    targetTimestamp: new Date("2026-12-06T08:40:00+05:30").getTime(),
    blessings: [
      {
        name: "Groom's Parents & Family",
        note: "May Lord Venkateshwara bless Bharath and Madhushri with eternal love, harmony, and joy on this sacred union!"
      },
      {
        name: "Bride's Parents & Family",
        note: "Wishing our beloved daughter Madhushri and son-in-law Bharath a lifetime of endless happiness and companionship!"
      },
      {
        name: "Friends & Well-Wishers",
        note: "Heartiest congratulations Bharath & Madhu! Eagerly looking forward to celebrating your grand wedding in Chitradurga!"
      }
    ]
  };

  // Load saved guestbook blessings from LocalStorage
  const STORAGE_KEY = "bharath_madhu_wedding_blessings_v2";
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        weddingState.blessings = parsed;
      }
    }
  } catch (err) {
    console.warn("Storage access restricted or unavailable:", err);
  }

  function persistBlessings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weddingState.blessings));
    } catch (e) {
      // Local storage full or quota exceeded
    }
  }

  // ----------------------------------------------------------------------------
  // 2. Entry Curtain Unveiling & Interaction
  // ----------------------------------------------------------------------------
  const splashCurtain = document.getElementById("splash-curtain");

  function openCurtain() {
    if (!splashCurtain) return;
    if (!splashCurtain.classList.contains("curtain-open")) {
      splashCurtain.classList.add("curtain-open");
      triggerPetalBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
      startAmbientMusic();
    }
  }

  if (splashCurtain) {
    splashCurtain.addEventListener("click", openCurtain);
    splashCurtain.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCurtain();
      }
    });
  }

  const btnReplay = document.getElementById("btn-replay-curtain");
  if (btnReplay) {
    btnReplay.addEventListener("click", function () {
      if (splashCurtain) {
        splashCurtain.classList.remove("curtain-open");
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Audio Controller (MP3 Audio Element + Web Audio Synthesizer Fallback)
  // ----------------------------------------------------------------------------
  const weddingAudio = document.getElementById("wedding-audio");
  const audioIcon = document.getElementById("audio-icon");
  const audioLabel = document.getElementById("audio-label");
  const soundWave = document.getElementById("sound-wave");
  let isAudioPlaying = false;
  let synthAudioCtx = null;
  let synthInterval = null;

  // Romantic Pentatonic Chime Frequencies (C4, E4, G4, B4, C5, E5, D5, G4)
  const CHIME_NOTES = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 587.33, 392.0];
  let chimeIndex = 0;

  function playSynthChime(freq) {
    if (!synthAudioCtx || !isAudioPlaying) return;
    try {
      const osc = synthAudioCtx.createOscillator();
      const gain = synthAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, synthAudioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, synthAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, synthAudioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, synthAudioCtx.currentTime + 2.2);

      osc.connect(gain);
      gain.connect(synthAudioCtx.destination);
      osc.start();
      osc.stop(synthAudioCtx.currentTime + 2.25);
    } catch (e) {
      // AudioContext error
    }
  }

  function startAmbientMusic() {
    isAudioPlaying = true;
    updateAudioUI(true);

    if (weddingAudio) {
      const playPromise = weddingAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // Fallback to Web Audio Synthesizer
          startSynthMusic();
        });
      }
    } else {
      startSynthMusic();
    }
  }

  function startSynthMusic() {
    if (!synthAudioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      synthAudioCtx = new AudioCtxClass();
    }
    if (synthAudioCtx.state === "suspended") {
      synthAudioCtx.resume();
    }
    if (synthInterval) clearInterval(synthInterval);
    playSynthChime(CHIME_NOTES[chimeIndex % CHIME_NOTES.length]);
    chimeIndex++;
    synthInterval = setInterval(function () {
      if (isAudioPlaying) {
        playSynthChime(CHIME_NOTES[chimeIndex % CHIME_NOTES.length]);
        chimeIndex++;
      }
    }, 1400);
  }

  function stopAmbientMusic() {
    isAudioPlaying = false;
    updateAudioUI(false);
    if (weddingAudio) {
      weddingAudio.pause();
    }
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function updateAudioUI(playing) {
    if (audioIcon) audioIcon.textContent = playing ? "🎵" : "🔇";
    if (audioLabel) audioLabel.textContent = playing ? "Music On" : "Music Off";
    if (soundWave) {
      if (playing) {
        soundWave.classList.add("playing");
      } else {
        soundWave.classList.remove("playing");
      }
    }
  }

  const btnAudioToggle = document.getElementById("btn-audio-toggle");
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener("click", function () {
      if (isAudioPlaying) {
        stopAmbientMusic();
      } else {
        startAmbientMusic();
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 4. HTML5 Canvas 3D Tumbling Rose Petal Physics Simulation
  // ----------------------------------------------------------------------------
  const petalCanvas = document.getElementById("petal-canvas");
  const pCtx = petalCanvas.getContext("2d");
  let petals = [];
  let burstPetals = [];

  const PETAL_PALETTE = [
    { fill: "#F4C2C2", stroke: "#E298A3" }, // Soft Blush Pink
    { fill: "#D896A7", stroke: "#B97286" }, // Dusty Rose
    { fill: "#FADADD", stroke: "#E6B5BE" }, // Pale Petal Blush
    { fill: "#C88EA7", stroke: "#9F657E" }, // Rose Mauve
    { fill: "#E6C9A8", stroke: "#C9A982" }  // Champagne Gold Accent
  ];

  function resizePetalCanvas() {
    petalCanvas.width = window.innerWidth;
    petalCanvas.height = window.innerHeight;
  }

  function createPetal(randomY) {
    const colorObj = PETAL_PALETTE[Math.floor(Math.random() * PETAL_PALETTE.length)];
    const size = 7 + Math.random() * 9;
    return {
      x: Math.random() * petalCanvas.width,
      y: randomY ? Math.random() * petalCanvas.height : -30 - Math.random() * 80,
      size: size,
      speedY: 0.55 + Math.random() * 1.1,
      speedX: 0.2 + Math.random() * 0.6,
      swayAmp: 0.6 + Math.random() * 1.3,
      swayFreq: 0.012 + Math.random() * 0.018,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.015 + Math.random() * 0.025,
      color: colorObj,
      opacity: 0.55 + Math.random() * 0.35
    };
  }

  function syncPetals() {
    const target = 32;
    while (petals.length < target) {
      petals.push(createPetal(true));
    }
  }

  function triggerPetalBurst(originX, originY, count) {
    const cx = originX || window.innerWidth / 2;
    const cy = originY || window.innerHeight / 2;
    const total = count || 30;
    for (let i = 0; i < total; i++) {
      const colorObj = PETAL_PALETTE[Math.floor(Math.random() * PETAL_PALETTE.length)];
      const theta = Math.random() * Math.PI * 2;
      const velocity = 2.2 + Math.random() * 5.2;
      burstPetals.push({
        x: cx,
        y: cy,
        vx: Math.cos(theta) * velocity,
        vy: Math.sin(theta) * velocity - 2.4,
        size: 7 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.08,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.04 + Math.random() * 0.04,
        color: colorObj,
        alpha: 1.0
      });
    }
  }

  function renderCurvedPetal(ctx, p, flipVal, alphaVal) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.scale(1, Math.max(0.24, Math.abs(Math.cos(flipVal))));
    ctx.globalAlpha = alphaVal;

    const s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 1.15, s * 0.5, -s * 1.25, -s * 0.7, -s * 0.25, -s);
    ctx.quadraticCurveTo(0, -s * 0.72, s * 0.25, -s);
    ctx.bezierCurveTo(s * 1.25, -s * 0.7, s * 1.15, s * 0.5, 0, s);
    ctx.closePath();

    ctx.fillStyle = p.color.fill;
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = p.color.stroke;
    ctx.stroke();
    ctx.restore();
  }

  function animatePetals() {
    pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.phase += p.swayFreq;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * p.swayAmp;
      p.angle += p.spin;
      p.flip += p.flipSpeed;

      if (p.y > petalCanvas.height + 35) {
        p.y = -25;
        p.x = Math.random() * petalCanvas.width;
      }
      if (p.x > petalCanvas.width + 35) {
        p.x = -25;
      } else if (p.x < -35) {
        p.x = petalCanvas.width + 25;
      }

      renderCurvedPetal(pCtx, p, p.flip, p.opacity);
    }

    for (let j = burstPetals.length - 1; j >= 0; j--) {
      const bp = burstPetals[j];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += 0.12; // gentle gravity
      bp.vx *= 0.985;
      bp.angle += bp.spin;
      bp.flip += bp.flipSpeed;
      bp.alpha -= 0.013;

      if (bp.alpha <= 0) {
        burstPetals.splice(j, 1);
      } else {
        renderCurvedPetal(pCtx, bp, bp.flip, bp.alpha);
      }
    }

    requestAnimationFrame(animatePetals);
  }

  resizePetalCanvas();
  syncPetals();
  animatePetals();
  window.addEventListener("resize", resizePetalCanvas);

  // ----------------------------------------------------------------------------
  // 5. Live Multi-Box Wedding Countdown
  // ----------------------------------------------------------------------------
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");
  const cdContainer = document.getElementById("countdown-timer");

  function updateCountdown() {
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;
    const now = Date.now();
    const distance = weddingState.targetTimestamp - now;

    if (distance <= 0) {
      if (cdContainer) {
        cdContainer.innerHTML =
          '<div style="font-family:var(--font-serif-display);font-size:18px;font-weight:600;color:var(--berry);padding:14px;">' +
          '🌸 The Auspicious Wedding Celebrations Have Begun! May Bharath & Madhushri be blessed forever! 🌸' +
          '</div>';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    cdDays.textContent = String(days).padStart(2, "0");
    cdHours.textContent = String(hours).padStart(2, "0");
    cdMins.textContent = String(minutes).padStart(2, "0");
    cdSecs.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ----------------------------------------------------------------------------
  // 6. Generic Modal Architecture
  // ----------------------------------------------------------------------------
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      closeModal(el.getAttribute("data-close"));
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal:not(.hidden)").forEach(function (m) {
        m.classList.add("hidden");
      });
      document.body.style.overflow = "";
    }
  });

  // ----------------------------------------------------------------------------
  // 7. Venue Modal & Clipboard Copy
  // ----------------------------------------------------------------------------
  const btnSeeVenue = document.getElementById("btn-see-venue");
  if (btnSeeVenue) {
    btnSeeVenue.addEventListener("click", function () {
      openModal("venue-modal");
    });
  }

  const btnCopyVenue = document.getElementById("btn-copy-venue");
  if (btnCopyVenue) {
    btnCopyVenue.addEventListener("click", async function () {
      const textToCopy = weddingState.venueName + ", " + weddingState.venueAddress;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = textToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }
        const toast = document.getElementById("copy-venue-toast");
        if (toast) {
          toast.classList.remove("hidden");
          setTimeout(function () {
            toast.classList.add("hidden");
          }, 2200);
        }
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 8. Interactive Blessing Wall / Guestbook
  // ----------------------------------------------------------------------------
  const btnBlessingPill = document.getElementById("btn-blessing-pill");
  const blessingCounterBadge = document.getElementById("blessing-counter-badge");
  const blessingListContainer = document.getElementById("blessing-list");
  const blessingForm = document.getElementById("blessing-form");
  const blessingToast = document.getElementById("blessing-toast");
  let toastTimer = null;

  function renderBlessings() {
    if (blessingCounterBadge) {
      const count = weddingState.blessings.length;
      blessingCounterBadge.textContent = count + (count === 1 ? " Blessing" : " Blessings");
    }
    if (blessingListContainer) {
      blessingListContainer.innerHTML = weddingState.blessings
        .slice()
        .reverse()
        .map(function (item) {
          const nameSafe = escapeHtml(item.name);
          const noteSafe = escapeHtml(item.note);
          return (
            '<div class="blessing-item">' +
            '<strong>' + nameSafe + '</strong>' +
            '<span>' + noteSafe + '</span>' +
            '</div>'
          );
        })
        .join("");
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (btnBlessingPill) {
    btnBlessingPill.addEventListener("click", function (e) {
      if (blessingToast) {
        blessingToast.classList.add("hidden");
      }
      triggerPetalBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 28);
      renderBlessings();
      openModal("blessing-modal");
    });
  }

  if (blessingForm) {
    blessingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("blessing-guest-name");
      const noteInput = document.getElementById("blessing-guest-note");
      const nameVal = nameInput ? nameInput.value.trim() : "";
      const noteVal = noteInput ? noteInput.value.trim() : "";

      if (nameVal && noteVal) {
        weddingState.blessings.push({ name: nameVal, note: noteVal });
        persistBlessings();
        renderBlessings();

        // Shower celebratory petals
        triggerPetalBurst(window.innerWidth / 2, window.innerHeight / 2, 45);

        // Show confirmation toast
        if (blessingToast) {
          blessingToast.classList.remove("hidden");
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(function () {
            blessingToast.classList.add("hidden");
          }, 4500);
        }

        if (nameInput) nameInput.value = "";
        if (noteInput) noteInput.value = "";
      }
    });
  }

  renderBlessings();

  // ----------------------------------------------------------------------------
  // 9. High-Resolution "Save the Date" Canvas Poster Generator
  // ----------------------------------------------------------------------------
  const ganeshaPosterImg = new Image();
  ganeshaPosterImg.src = "assets/img/ganesha-emblem.png";
  ganeshaPosterImg.onload = function () {
    drawSaveTheDatePoster();
  };

  function drawSaveTheDatePoster() {
    const poster = document.getElementById("poster-canvas");
    if (!poster) return;
    const ctx = poster.getContext("2d");
    const W = poster.width;
    const H = poster.height;

    // Helper: auto-scale text to fit within max allowable width
    function drawFittedText(text, x, y, maxW, baseSize, fontFam, color) {
      ctx.save();
      ctx.fillStyle = color;
      let size = baseSize;
      ctx.font = size + "px " + fontFam;
      let measured = ctx.measureText(text).width;
      while (measured > maxW && size > 22) {
        size -= 2;
        ctx.font = size + "px " + fontFam;
        measured = ctx.measureText(text).width;
      }
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // Background Gradient (Radiant Warm Ivory to Soft Blush)
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, H * 0.72);
    bgGrad.addColorStop(0, "#FFFFFF");
    bgGrad.addColorStop(0.65, "#FDF6F6");
    bgGrad.addColorStop(1, "#F5E4E7");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Outer Champagne Gold Border
    ctx.strokeStyle = "#D9C39A";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Inner Dusty Rose Hairline Border
    ctx.strokeStyle = "#C88EA7";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(52, 52, W - 104, H - 104);

    // Subtle Corner Filigree Accents
    ctx.strokeStyle = "#D9C39A";
    ctx.lineWidth = 1.2;
    const corners = [
      { x: 58, y: 58, dx: 1, dy: 1 },
      { x: W - 58, y: 58, dx: -1, dy: 1 },
      { x: 58, y: H - 58, dx: 1, dy: -1 },
      { x: W - 58, y: H - 58, dx: -1, dy: -1 }
    ];
    corners.forEach(function (c) {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * 26);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * 26, c.y);
      ctx.stroke();
    });

    const cx = W / 2;

    // Header 1: Ganesha Emblem
    if (ganeshaPosterImg.complete && ganeshaPosterImg.naturalWidth > 0) {
      const gw = 66;
      const gh = (ganeshaPosterImg.naturalHeight / ganeshaPosterImg.naturalWidth) * gw;
      ctx.drawImage(ganeshaPosterImg, cx - gw / 2, 74, gw, gh);
    }

    // Header 2: Auspicious Sanskrit Chant
    ctx.textAlign = "center";
    ctx.fillStyle = "#A86D87";
    ctx.font = "600 18px 'Playfair Display', Georgia, serif";
    ctx.fillText("॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥", cx, 168);

    // Header 3: Blessing Line
    ctx.fillStyle = "#7A5C61";
    ctx.font = "600 17px 'Playfair Display', Georgia, serif";
    ctx.fillText("WITH THE BLESSINGS OF OUR FAMILIES", cx, 202);

    // Header 4: SAVE THE DATE
    ctx.fillStyle = "#633740";
    ctx.font = "700 38px 'Playfair Display', Georgia, serif";
    ctx.fillText("SAVE THE DATE", cx, 252);

    // Botanical Garland Circle around Couple Names
    const cy = 495;
    const r = 195;

    ctx.save();
    ctx.strokeStyle = "#8FA89B";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#D9C39A";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r + 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wreath Eucalyptus Leaves
    for (let a = 0; a < 28; a++) {
      const theta = (a / 28) * Math.PI * 2;
      const lx = cx + Math.cos(theta) * r;
      const ly = cy + Math.sin(theta) * r;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(theta + Math.PI / 2);
      ctx.fillStyle = a % 2 === 0 ? "#8FA89B" : "#A8C0B4";
      ctx.beginPath();
      ctx.ellipse(0, -8, 5.5, 13, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4 Rose Clusters on Wreath Corners
    const roseAngles = [-Math.PI / 4, (Math.PI * 3) / 4, Math.PI / 4, (-Math.PI * 3) / 4];
    roseAngles.forEach(function (ang) {
      const rx = cx + Math.cos(ang) * r;
      const ry = cy + Math.sin(ang) * r;
      ctx.fillStyle = "#E8A5B8";
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#F4C2C2";
      ctx.beginPath();
      ctx.arc(rx - 2, ry - 2, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#D9C39A";
      ctx.beginPath();
      ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Couple Names inside Garland (Harmoniously Centered & Auto-Fitted)
    drawFittedText(weddingState.groom, cx, cy - 42, 330, 56, "'Allura', cursive, Georgia", "#633740");

    ctx.fillStyle = "#C88EA7";
    ctx.font = "42px 'Allura', cursive, Georgia";
    ctx.fillText("&", cx, cy + 6);

    drawFittedText(weddingState.bride, cx, cy + 56, 330, 56, "'Allura', cursive, Georgia", "#633740");

    // Formal Invitation Subtitle (Two Balanced Lines for Clean Mobile Alignment)
    ctx.fillStyle = "#7A5C61";
    ctx.font = "600 16px 'Playfair Display', Georgia, serif";
    ctx.fillText("REQUEST THE HONOUR OF YOUR PRESENCE", cx, 745);

    ctx.fillStyle = "#8C586B";
    ctx.font = "italic 23px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("at their wedding celebrations", cx, 778);

    // Event 1: Reception
    ctx.fillStyle = "#633740";
    ctx.font = "700 24px 'Playfair Display', Georgia, serif";
    ctx.fillText("RECEPTION: " + weddingState.receptionDateStr.toUpperCase(), cx, 842);
    ctx.fillStyle = "#7A5C61";
    ctx.font = "21px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(weddingState.receptionTimeStr, cx, 874);

    // Event 2: Muhurtham
    ctx.fillStyle = "#633740";
    ctx.font = "700 24px 'Playfair Display', Georgia, serif";
    ctx.fillText("MUHURTHAM: " + weddingState.muhurthamDateStr.toUpperCase(), cx, 938);
    ctx.fillStyle = "#7A5C61";
    ctx.font = "21px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(weddingState.muhurthamTimeStr, cx, 970);

    // Elegant Divider Line
    ctx.strokeStyle = "#C88EA7";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 120, 1018);
    ctx.lineTo(cx + 120, 1018);
    ctx.stroke();

    // Venue Block
    ctx.fillStyle = "#7D4E57";
    ctx.font = "700 18px 'Playfair Display', Georgia, serif";
    ctx.fillText("VENUE", cx, 1058);

    ctx.fillStyle = "#633740";
    ctx.font = "600 27px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(weddingState.venueName + ", " + weddingState.venueCity, cx, 1094);

    ctx.fillStyle = "#7A5C61";
    ctx.font = "20px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("Near Malappanahatti Circle, Chitradurga", cx, 1126);

    // Closing Note
    ctx.fillStyle = "#C88EA7";
    ctx.font = "34px 'Allura', cursive, Georgia";
    ctx.fillText("dinner & celebrations to follow ♥", cx, 1202);
  }

  // Automatic redraw once Google Fonts are rasterized by browser (vital on mobile)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      drawSaveTheDatePoster();
    });
  }

  const btnViewPoster = document.getElementById("btn-view-poster");
  if (btnViewPoster) {
    btnViewPoster.addEventListener("click", function () {
      drawSaveTheDatePoster();
      openModal("poster-modal");
    });
  }

  const btnDownloadPoster = document.getElementById("btn-download-poster");
  if (btnDownloadPoster) {
    btnDownloadPoster.addEventListener("click", function () {
      drawSaveTheDatePoster();
      const poster = document.getElementById("poster-canvas");
      if (!poster) return;
      const link = document.createElement("a");
      link.download = "bharath-madhushri-wedding-invitation-poster.png";
      link.href = poster.toDataURL("image/png");
      link.click();
      triggerPetalBurst(window.innerWidth / 2, window.innerHeight / 2, 24);
    });
  }

  // ----------------------------------------------------------------------------
  // 10. Add to Calendar (Google Calendar & .ics Download)
  // ----------------------------------------------------------------------------
  window.addToCalendar = function (eventType, targetService) {
    if (!targetService) {
      openModal("calendar-modal");
      return;
    }

    const isReception = eventType === "reception";
    const title = isReception
      ? "Wedding Reception: Bharath H.B. & Madhushri S. Patil"
      : "Wedding Muhurtham: Bharath H.B. & Madhushri S. Patil";

    const desc = isReception
      ? "Wedding Reception celebrations for Bharath H.B. & Madhushri S. Patil. Dinner & celebrations to follow!"
      : "Sacred Muhurtham ceremony of Bharath H.B. & Madhushri S. Patil. Your gracious presence is our blessing!";

    const location = weddingState.venueName + ", " + weddingState.venueAddress;

    // ISO Times in UTC for Google Calendar & iCalendar
    // Reception: 05 Dec 2026, 7:00 PM IST (13:30 UTC) to 11:00 PM IST (17:30 UTC)
    // Muhurtham: 06 Dec 2026, 8:40 AM IST (03:10 UTC) to 11:30 AM IST (06:00 UTC)
    const startUtc = isReception ? "20261205T133000Z" : "20261206T031000Z";
    const endUtc = isReception ? "20261205T173000Z" : "20261206T060000Z";

    if (targetService === "google") {
      const gUrl =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(title) +
        "&dates=" + startUtc + "/" + endUtc +
        "&details=" + encodeURIComponent(desc) +
        "&location=" + encodeURIComponent(location);
      window.open(gUrl, "_blank", "noopener,noreferrer");
    } else if (targetService === "ics") {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Bharath & Madhushri Wedding Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:" + (isReception ? "bharath-reception-20261205" : "bharath-muhurtham-20261206") + "@wedding.invitation",
        "DTSTAMP:" + startUtc,
        "DTSTART:" + startUtc,
        "DTEND:" + endUtc,
        "SUMMARY:" + title,
        "DESCRIPTION:" + desc,
        "LOCATION:" + location,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const icsLink = document.createElement("a");
      icsLink.href = window.URL.createObjectURL(blob);
      icsLink.download = (isReception ? "bharath-madhushri-reception" : "bharath-madhushri-muhurtham") + ".ics";
      document.body.appendChild(icsLink);
      icsLink.click();
      document.body.removeChild(icsLink);
    }
  };

  const btnOpenCalModal = document.getElementById("btn-open-calendar-modal");
  if (btnOpenCalModal) {
    btnOpenCalModal.addEventListener("click", function () {
      openModal("calendar-modal");
    });
  }

  // ----------------------------------------------------------------------------
  // 11. WhatsApp Social Sharing
  // ----------------------------------------------------------------------------
  function shareOnWhatsApp() {
    const siteUrl = window.location.href;
    const message =
      "🌸 *Wedding Invitation* 🌸\n\n" +
      "With the blessings of our families, we cordially invite you to the wedding celebrations of\n" +
      "*" + weddingState.groom + " & " + weddingState.bride + "*\n\n" +
      "✨ *Reception:* Saturday, 05 December 2026 (Evening 7:00 PM onwards)\n" +
      "✨ *Muhurtham:* Sunday, 06 December 2026 (Morning 8:40 AM to 9:30 AM)\n" +
      "📍 *Venue:* " + weddingState.venueName + ", Chitradurga\n\n" +
      "We eagerly look forward to your gracious presence & blessings!\n\n" +
      "👉 Tap to view our online wedding invitation:\n" + siteUrl;

    const waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(message);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    triggerPetalBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
  }

  const btnShareWhatsApp = document.getElementById("btn-share-whatsapp");
  if (btnShareWhatsApp) {
    btnShareWhatsApp.addEventListener("click", shareOnWhatsApp);
  }

  const btnQuickShare = document.getElementById("btn-quick-share");
  if (btnQuickShare) {
    btnQuickShare.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share({
          title: weddingState.groom + " & " + weddingState.bride + " — Wedding Invitation",
          text: "You are cordially invited to the wedding celebrations of Bharath H.B. & Madhushri S. Patil on 05 & 06 Dec 2026 in Chitradurga!",
          url: window.location.href
        }).catch(function () {
          shareOnWhatsApp();
        });
      } else {
        shareOnWhatsApp();
      }
    });
  }

  // Initial draw of poster for readiness
  window.addEventListener("load", function () {
    drawSaveTheDatePoster();
  });

})();
