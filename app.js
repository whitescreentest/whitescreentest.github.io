/* WhiteScreen tool — pick a color, view it full screen, or download it as a PNG. */
(function () {
  /* Mobile menu (hamburger) — runs on every page, even without the tool. */
  var menuBtn = document.getElementById('menuBtn');
  var mainNav = document.querySelector('nav.main');
  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var COLORS = {
    white:  { name: 'White background',  hex: '#FFFFFF' },
    black:  { name: 'Black background',  hex: '#000000' },
    red:    { name: 'Red background',    hex: '#FF0000' },
    green:  { name: 'Green background',  hex: '#00FF00' },
    blue:   { name: 'Blue background',   hex: '#0000FF' },
    yellow: { name: 'Yellow background', hex: '#FFFF00' },
    orange: { name: 'Orange background', hex: '#FFA500' },
    pink:   { name: 'Pink background',   hex: '#FFC0CB' },
    grey:   { name: 'Grey background',   hex: '#808080' },
    zoom:   { name: 'Zoom Light',        hex: '#FFF3E0' },
    ring:   { name: 'Ring Light',        hex: '#000000', ring: true }
  };
  var state = { key: 'white', hex: '#FFFFFF', ring: false, custom: false };

  var $ = function (id) { return document.getElementById(id); };
  var preview = $('preview'), cname = $('colorName'), hexInput = $('hexInput'),
      colorInput = $('colorInput'), resSelect = $('resSelect'),
      widthInput = $('widthInput'), heightInput = $('heightInput'),
      downloadBtn = $('downloadBtn'), fsBtn = $('fsBtn');
  if (!preview) return; // not the tool page

  function markSelected(key) {
    document.querySelectorAll('[data-color]').forEach(function (el) {
      el.classList.toggle('selected', el.getAttribute('data-color') === key);
    });
  }

  function applyColor(key, hex, name, ring) {
    state.key = key; state.hex = hex; state.ring = !!ring; state.custom = (key === 'custom');
    preview.style.background = hex;
    preview.classList.toggle('ring-mode', !!ring);
    cname.textContent = name;
    hexInput.value = hex.toUpperCase();
    colorInput.value = hex;
    markSelected(key);
  }

  function select(key) {
    var c = COLORS[key];
    if (!c) return;
    applyColor(key, c.hex, c.name, c.ring);
  }

  document.querySelectorAll('[data-color]').forEach(function (el) {
    el.addEventListener('click', function () { select(el.getAttribute('data-color')); });
  });

  // Custom color picker + hex text field
  colorInput.addEventListener('input', function () {
    applyColor('custom', colorInput.value, 'Custom color', false);
  });
  hexInput.addEventListener('change', function () {
    var v = hexInput.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) applyColor('custom', v, 'Custom color', false);
    else hexInput.value = state.hex.toUpperCase();
  });

  // Full screen: click the preview or the expand button
  function goFullscreen() {
    var el = preview;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }
  preview.addEventListener('click', function (e) { if (e.target !== fsBtn) goFullscreen(); });
  fsBtn.addEventListener('click', function (e) { e.stopPropagation(); goFullscreen(); });

  // Resolution presets
  var PRESETS = { '720p': [1280, 720], '1080p': [1920, 1080], '4k': [3840, 2160] };
  resSelect.addEventListener('change', function () {
    var p = PRESETS[resSelect.value];
    if (p) { widthInput.value = p[0]; heightInput.value = p[1]; }
  });
  [widthInput, heightInput].forEach(function (input) {
    input.addEventListener('input', function () { resSelect.value = 'custom'; });
  });

  // Download the current color as a PNG at the chosen size
  downloadBtn.addEventListener('click', function () {
    var w = Math.max(1, Math.min(8000, parseInt(widthInput.value, 10) || 1920));
    var h = Math.max(1, Math.min(8000, parseInt(heightInput.value, 10) || 1080));
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (state.ring) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      var r = Math.min(w, h) * 0.32;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(8, Math.min(w, h) * 0.06);
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = Math.min(w, h) * 0.08;
      ctx.stroke();
    } else {
      ctx.fillStyle = state.hex;
      ctx.fillRect(0, 0, w, h);
    }
    var name = (state.key === 'custom' ? 'custom-color' : state.key) + '-screen-' + w + 'x' + h + '.png';
    canvas.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  });

  // Keyboard: Esc exits full screen natively; F also toggles full screen on the preview.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') goFullscreen();
  });

  applyColor('white', '#FFFFFF', 'White background', false);
})();
