/* ============================================================
   Wahnsinn Total – gemeinsame Interaktionen
   Eine Datei fuer alle Seiten, ohne externe Abhaengigkeiten.

   Enthaelt:
     1. Jahreszahl im Footer
     2. Verschleierte Kontaktdaten (Telefon, WhatsApp, E-Mail)
     3. Mobile Navigation
     4. E-Mail-Adresse auf Klick anzeigen (Kontaktseite)
     5. WhatsApp-Freischaltung mit Bot-Schutz (Kontaktseite)
     6. Danke-Hinweis nach dem Formularversand (Kontaktseite)
     7. Schatten am Header, sobald gescrollt wird
     8. Sanftes Einblenden der Abschnitte beim Scrollen
     9. WT.initGalerie()  – Fotogalerie mit Lightbox (Galerieseite)
    10. WT.initVideos()   – Video-Playlist (Galerieseite)

   Die Bild- und Videolisten stehen bewusst NICHT hier, sondern
   unten in galerie.html – dort sind sie leichter zu pflegen.
   ============================================================ */

var WT = (function () {
  'use strict';

  // --- Kontaktdaten, im Quelltext rueckwaerts abgelegt -------------
  // Einfacher Schutz gegen Adress-Sammler: die Angaben stehen nirgends
  // zusammenhaengend im HTML, sondern werden erst zur Laufzeit gebaut.
  var PHONE_REV = '7469444115194+';
  var MAIL_REV  = 'ed.latot-nnisnhaw@ofni';
  var WHATSAPP_TEXT = 'Hallo Wahnsinn Total, ich habe eine Anfrage für einen Auftritt.';

  function entschluesseln(s) {
    return s.split('').reverse().join('');
  }

  var telefon = entschluesseln(PHONE_REV);
  var mail    = entschluesseln(MAIL_REV);

  // ---------------------------------------------------------------
  // 1 + 2: Footer-Jahr und Kontaktlinks
  // ---------------------------------------------------------------
  function kontaktdatenSetzen() {
    var jahr = document.getElementById('year');
    if (jahr) { jahr.textContent = new Date().getFullYear(); }

    var tel = document.getElementById('phone-link');
    if (tel) { tel.href = 'tel:' + telefon; }

    var wa = document.getElementById('whatsapp-header-link');
    if (wa) { wa.href = 'https://wa.me/' + telefon.replace('+', ''); }

    var mailHeader = document.getElementById('mail-header-link');
    if (mailHeader) { mailHeader.href = 'mailto:' + mail; }

    // Footer-Link: Adresse wird hier bewusst ausgeschrieben
    Array.prototype.forEach.call(
      document.querySelectorAll('.mail-link-obf'),
      function (el) {
        el.href = 'mailto:' + mail;
        el.textContent = mail;
      }
    );
  }

  // ---------------------------------------------------------------
  // 3: Mobile Navigation
  // ---------------------------------------------------------------
  function navigationAufbauen() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) { return; }

    function schliessen() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    }

    toggle.addEventListener('click', function () {
      var offen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', offen ? 'true' : 'false');
      toggle.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    });

    // Mit Escape schliessen, und beim Klick auf einen Menuepunkt
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        schliessen();
        toggle.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { schliessen(); }
    });
  }

  // ---------------------------------------------------------------
  // 4: E-Mail-Adresse erst auf Klick zeigen
  // ---------------------------------------------------------------
  function mailFreigabe() {
    var btn = document.getElementById('mail-reveal-btn');
    var wrap = document.getElementById('mail-reveal-wrap');
    if (!btn || !wrap) { return; }

    btn.addEventListener('click', function () {
      var link = document.createElement('a');
      link.href = 'mailto:' + mail;
      link.textContent = mail;
      wrap.innerHTML = '';
      wrap.appendChild(link);
      link.focus();
    });
  }

  // ---------------------------------------------------------------
  // 5: WhatsApp-Freischaltung
  //    Bot-Schutz in drei Stufen:
  //      a) Honeypot-Feld, das nur Bots ausfuellen
  //      b) Mindestverweildauer auf der Seite
  //      c) bewusste Bestaetigung per Checkbox
  //    Die Nummer steht erst NACH der Freischaltung im DOM.
  // ---------------------------------------------------------------
  function whatsappFreigabe() {
    var gate = document.querySelector('.whatsapp-gate');
    if (!gate) { return; }

    var geladen   = Date.now();
    var checkbox  = gate.querySelector('#confirm-human');
    var honeypot  = gate.querySelector('#hp-website');
    var btn       = gate.querySelector('#unlock-whatsapp');
    var status    = gate.querySelector('.gate-status');
    var linkWrap  = gate.querySelector('.whatsapp-link-wrap');
    if (!btn) { return; }

    function melden(text, typ) {
      status.textContent = text;
      status.className = 'gate-status ' + typ;
    }

    btn.addEventListener('click', function () {
      if (honeypot && honeypot.value.trim() !== '') {
        melden('Prüfung fehlgeschlagen.', 'err');
        return;
      }
      if (!checkbox.checked) {
        melden('Bitte zuerst die Bestätigung ankreuzen.', 'err');
        return;
      }
      if (Date.now() - geladen < 1200) {
        melden('Einen Moment bitte – dann noch einmal klicken.', 'err');
        return;
      }

      var url = 'https://wa.me/' + telefon.replace('+', '') +
                '?text=' + encodeURIComponent(WHATSAPP_TEXT);

      var link = document.createElement('a');
      link.className = 'btn btn-whatsapp';
      link.target = '_blank';
      link.rel = 'noopener';
      link.href = url;
      link.textContent = 'WhatsApp öffnen';

      linkWrap.innerHTML = '';
      linkWrap.appendChild(link);

      melden('Freigeschaltet.', 'ok');
      btn.disabled = true;
      checkbox.disabled = true;
      link.focus();
    });
  }

  // ---------------------------------------------------------------
  // 6: Danke-Hinweis nach dem Formularversand
  // ---------------------------------------------------------------
  function dankeHinweis() {
    var hinweis = document.getElementById('danke-hinweis');
    if (!hinweis) { return; }
    if (new URLSearchParams(location.search).get('danke') === '1') {
      hinweis.hidden = false;
      hinweis.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  // ---------------------------------------------------------------
  // 7: Schatten am Header, sobald die Seite gescrollt ist
  //    Der Header klebt oben; ohne Abgrenzung "klebt" der Inhalt
  //    beim Scrollen optisch daran.
  // ---------------------------------------------------------------
  function headerSchatten() {
    var header = document.querySelector('.site-header');
    if (!header) { return; }

    var laeuft = false;

    function pruefen() {
      header.classList.toggle('scrolled', window.scrollY > 12);
      laeuft = false;
    }

    window.addEventListener('scroll', function () {
      // requestAnimationFrame verhindert, dass bei jedem einzelnen
      // Scroll-Ereignis neu gerechnet wird
      if (!laeuft) {
        laeuft = true;
        window.requestAnimationFrame(pruefen);
      }
    }, { passive: true });

    pruefen();
  }

  // ---------------------------------------------------------------
  // 8: Abschnitte beim Scrollen sanft einblenden
  //    Ohne JavaScript oder ohne IntersectionObserver bleibt alles
  //    normal sichtbar – die Klasse wird dann gar nicht erst gesetzt.
  // ---------------------------------------------------------------
  function einblenden() {
    if (!('IntersectionObserver' in window)) { return; }

    var bewegungAus = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (bewegungAus.matches) { return; }

    // Der erste Abschnitt einer Seite ist beim Laden schon sichtbar
    // und wird deshalb ausgenommen.
    var abschnitte = Array.prototype.slice.call(
      document.querySelectorAll('main > section')
    ).slice(1);
    if (!abschnitte.length) { return; }

    abschnitte.forEach(function (el) { el.classList.add('reveal'); });

    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (eintrag.isIntersecting) {
          eintrag.target.classList.add('is-visible');
          beobachter.unobserve(eintrag.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    abschnitte.forEach(function (el) { beobachter.observe(el); });
  }

  // ---------------------------------------------------------------
  // 9: Fotogalerie mit Lightbox
  // ---------------------------------------------------------------
  function initGalerie(bilder) {
    var grid = document.getElementById('galerie-grid');
    var lightbox = document.getElementById('lightbox');
    if (!grid || !lightbox || !bilder || !bilder.length) { return; }

    var bild      = document.getElementById('lightbox-img');
    var zaehler   = document.getElementById('lightbox-counter');
    var btnClose  = lightbox.querySelector('.lightbox-close');
    var btnPrev   = lightbox.querySelector('.lightbox-prev');
    var btnNext   = lightbox.querySelector('.lightbox-next');
    var index     = 0;
    var vorher    = null; // Element, das vor dem Oeffnen den Fokus hatte

    // Kacheln aufbauen
    bilder.forEach(function (b, i) {
      var a = document.createElement('a');
      a.href = b.src;
      a.dataset.index = i;
      a.setAttribute('aria-label', b.alt + ' – groß ansehen');

      var img = document.createElement('img');
      img.src = b.src;
      img.alt = b.alt;
      img.loading = 'lazy';
      img.decoding = 'async';

      a.appendChild(img);
      grid.appendChild(a);
    });

    function aktualisieren() {
      var b = bilder[index];
      bild.src = b.src;
      bild.alt = b.alt;
      zaehler.textContent = (index + 1) + ' / ' + bilder.length;
    }

    function oeffnen(i) {
      vorher = document.activeElement;
      index = i;
      aktualisieren();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      btnNext.focus();
    }

    function schliessen() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (vorher && vorher.focus) { vorher.focus(); }
    }

    function weiter()  { index = (index + 1) % bilder.length; aktualisieren(); }
    function zurueck() { index = (index - 1 + bilder.length) % bilder.length; aktualisieren(); }

    grid.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) { return; }
      e.preventDefault();
      oeffnen(Number(link.dataset.index));
    });

    btnClose.addEventListener('click', schliessen);
    btnNext.addEventListener('click', weiter);
    btnPrev.addEventListener('click', zurueck);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) { schliessen(); }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) { return; }
      if (e.key === 'Escape')     { schliessen(); }
      if (e.key === 'ArrowRight') { weiter(); }
      if (e.key === 'ArrowLeft')  { zurueck(); }
    });

    // Wischen auf Touch-Geraeten: nach links = weiter, nach rechts = zurueck
    var startX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      var diff = e.changedTouches[0].screenX - startX;
      if (Math.abs(diff) > 40) { diff < 0 ? weiter() : zurueck(); }
    }, { passive: true });
  }

  // ---------------------------------------------------------------
  // 10: Video-Playlist
  // ---------------------------------------------------------------
  function initVideos(liste) {
    var player = document.getElementById('main-video');
    var auswahl = document.getElementById('video-list');
    if (!player || !auswahl || !liste || !liste.length) { return; }

    var zaehler = document.getElementById('video-counter');
    var btnPrev = document.getElementById('video-prev');
    var btnNext = document.getElementById('video-next');
    var aktuell = 0;

    liste.forEach(function (v, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-list-item';
      btn.textContent = v.title;
      btn.dataset.index = i;
      btn.addEventListener('click', function () { laden(i, true); });
      auswahl.appendChild(btn);
    });

    function laden(i, abspielen) {
      aktuell = i;
      player.src = liste[aktuell].src;
      if (abspielen) { player.play().catch(function () {}); }

      zaehler.textContent = (aktuell + 1) + ' / ' + liste.length;
      Array.prototype.forEach.call(
        auswahl.querySelectorAll('.video-list-item'),
        function (el, n) {
          el.classList.toggle('active', n === aktuell);
          el.setAttribute('aria-pressed', n === aktuell ? 'true' : 'false');
        }
      );
      btnPrev.disabled = aktuell === 0;
      btnNext.disabled = aktuell === liste.length - 1;
    }

    btnPrev.addEventListener('click', function () {
      if (aktuell > 0) { laden(aktuell - 1, true); }
    });
    btnNext.addEventListener('click', function () {
      if (aktuell < liste.length - 1) { laden(aktuell + 1, true); }
    });
    player.addEventListener('ended', function () {
      if (aktuell < liste.length - 1) { laden(aktuell + 1, true); }
    });

    laden(0, false);
  }

  // ---------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------
  function start() {
    kontaktdatenSetzen();
    navigationAufbauen();
    mailFreigabe();
    whatsappFreigabe();
    dankeHinweis();
    headerSchatten();
    einblenden();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  return { initGalerie: initGalerie, initVideos: initVideos };
})();
