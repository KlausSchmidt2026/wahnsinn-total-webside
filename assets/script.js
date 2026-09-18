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
    11. WT.initTermine()  – Terminliste aus termine.xlsx (Startseite, Terminseite)

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
  // Die Lightbox wird von der Foto- UND der Event-Galerie genutzt.
  // Sie kennt keine feste Bildliste, sondern bekommt beim Oeffnen
  // uebergeben, welche Bilder gerade durchblaettert werden sollen.
  var Lightbox = (function () {
    var lightbox, bild, zaehler, btnClose, btnPrev, btnNext;
    var aktuelleBilder = [];
    var index = 0;
    var vorher = null;
    var bereit = false;

    function aufbauen() {
      lightbox = document.getElementById('lightbox');
      if (!lightbox) { return false; }
      bild     = document.getElementById('lightbox-img');
      zaehler  = document.getElementById('lightbox-counter');
      btnClose = lightbox.querySelector('.lightbox-close');
      btnPrev  = lightbox.querySelector('.lightbox-prev');
      btnNext  = lightbox.querySelector('.lightbox-next');

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

      bereit = true;
      return true;
    }

    function aktualisieren() {
      var b = aktuelleBilder[index];
      bild.src = b.src;
      bild.alt = b.alt || '';
      zaehler.textContent = (index + 1) + ' / ' + aktuelleBilder.length;
    }

    function oeffnen(bilder, startIndex) {
      if (!bereit && !aufbauen()) { return; }
      if (!bilder || !bilder.length) { return; }
      aktuelleBilder = bilder;
      index = startIndex || 0;
      vorher = document.activeElement;
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

    function weiter()  { index = (index + 1) % aktuelleBilder.length; aktualisieren(); }
    function zurueck() { index = (index - 1 + aktuelleBilder.length) % aktuelleBilder.length; aktualisieren(); }

    return { oeffnen: oeffnen };
  })();

  function kachelBauen(b, i, bilder) {
    var a = document.createElement('a');
    a.href = b.src;
    a.setAttribute('aria-label', (b.alt || 'Foto') + ' – groß ansehen');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      Lightbox.oeffnen(bilder, i);
    });

    var img = document.createElement('img');
    img.src = b.src;
    img.alt = b.alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';

    a.appendChild(img);
    return a;
  }

  function initGalerie(bilder) {
    var grid = document.getElementById('galerie-grid');
    if (!grid || !bilder || !bilder.length) { return; }
    bilder.forEach(function (b, i) {
      grid.appendChild(kachelBauen(b, i, bilder));
    });
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
  // 11: Terminliste aus termine.xlsx
  //     Liest die Excel-Datei im Browser aus (Bibliothek: SheetJS,
  //     lokal unter assets/xlsx.full.min.js -- siehe termine.html).
  //     Spalten in der Excel-Datei: Datum | Uhrzeit | Ort | Veranstaltung | Info
  //     Zeigt nur Termine ab heute, aufsteigend sortiert.
  // ---------------------------------------------------------------
  var WOCHENTAGE = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  var MONATE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  var MONATE_KURZ = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

  function termineDatumParsen(wert) {
    if (wert instanceof Date && !isNaN(wert)) return wert;
    if (typeof wert === 'string') {
      var m = wert.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
      if (m) {
        var tag = Number(m[1]), monat = Number(m[2]) - 1, jahr = Number(m[3]);
        if (m[3].length === 2) jahr += 2000;
        return new Date(jahr, monat, tag);
      }
    }
    return null;
  }

  function termineDatumFormatieren(d) {
    return WOCHENTAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()] + ' ' + d.getFullYear();
  }

  function termineTextSchuetzen(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function termineKarteHtml(t) {
    var d = t.datum;
    var aktuellesJahr = new Date().getFullYear();
    // Jahr nur zeigen, wenn der Termin nicht im laufenden Jahr liegt
    var jahrZusatz = d.getFullYear() !== aktuellesJahr
      ? '<span class="termin-jahr">' + d.getFullYear() + '</span>' : '';

    // Zeile mit Wochentag und Uhrzeit, zusammengesetzt aus dem, was da ist
    var zeile = [WOCHENTAGE[d.getDay()]];
    if (t.uhrzeit) zeile.push(termineTextSchuetzen(t.uhrzeit));

    var teile = [
      '<article class="termin-karte">',
      '  <div class="termin-blatt" aria-hidden="true">',
      '    <span class="termin-tag">' + d.getDate() + '</span>',
      '    <span class="termin-monat">' + MONATE_KURZ[d.getMonth()] + '</span>',
      '    ' + jahrZusatz,
      '  </div>',
      '  <div class="termin-inhalt">',
      '    <span class="visually-hidden">' + termineDatumFormatieren(d) + '</span>'
    ];

    if (t.veranstaltung) {
      teile.push('    <h3 class="termin-veranstaltung">' + termineTextSchuetzen(t.veranstaltung) + '</h3>');
    }
    if (t.ort) {
      teile.push('    <p class="termin-ort">' + termineTextSchuetzen(t.ort) + '</p>');
    }
    teile.push('    <p class="termin-zeile">' + zeile.join(' · ') + '</p>');
    if (t.info) {
      teile.push('    <p class="termin-info">' + termineTextSchuetzen(t.info) + '</p>');
    }

    teile.push('  </div>');
    teile.push('</article>');
    return teile.join('\n');
  }

  function initTermine(containerId, optionen) {
    var container = document.getElementById(containerId);
    if (!container) return;
    optionen = optionen || {};
    var maxAnzahl = optionen.anzahl || null;

    if (typeof XLSX === 'undefined') {
      container.innerHTML = '<p class="termin-hinweis">Termine konnten nicht geladen werden.</p>';
      return;
    }

    fetch('termine.xlsx')
      .then(function (resp) {
        if (!resp.ok) throw new Error('termine.xlsx nicht gefunden (' + resp.status + ')');
        return resp.arrayBuffer();
      })
      .then(function (buf) {
        var wb = XLSX.read(buf, { type: 'array', cellDates: true });
        var blatt = wb.Sheets[wb.SheetNames[0]];
        var zeilen = XLSX.utils.sheet_to_json(blatt, { defval: '' });

        var heute = new Date();
        heute.setHours(0, 0, 0, 0);

        var termine = zeilen.map(function (z) {
          return {
            datum: termineDatumParsen(z['Datum']),
            uhrzeit: String(z['Uhrzeit'] || '').trim(),
            ort: String(z['Ort'] || '').trim(),
            veranstaltung: String(z['Veranstaltung'] || '').trim(),
            info: String(z['Info'] || '').trim()
          };
        }).filter(function (t) { return t.datum && t.datum >= heute; })
          .sort(function (a, b) { return a.datum - b.datum; });

        if (maxAnzahl) termine = termine.slice(0, maxAnzahl);

        if (termine.length === 0) {
          container.innerHTML = '<p class="termin-hinweis">Aktuell sind keine Termine eingetragen – schaut bald wieder vorbei!</p>';
          return;
        }
        container.innerHTML = termine.map(termineKarteHtml).join('\n');
      })
      .catch(function (err) {
        container.innerHTML = '<p class="termin-hinweis">Termine konnten nicht geladen werden.</p>';
        if (window.console) console.error('Termine:', err);
      });
  }

  // ---------------------------------------------------------------
  // 12: Event-Galerie – Fotos vergangener Auftritte
  //
  //     SO PFLEGT MAN SIE (kein Eingriff in den Seitenquelltext noetig):
  //     Bei GitHub im Ordner  assets/events/  einen Unterordner anlegen
  //     und die Fotos hineinladen. Der Ordnername wird zur Ueberschrift.
  //
  //       assets/events/2026-09-18 Weinfest Remagen/foto1.jpg
  //       assets/events/2026-10-03 Kirmes Unkelbach/foto1.jpg
  //
  //     Beginnt der Ordnername mit einem Datum (JJJJ-MM-TT), wird das
  //     Datum abgetrennt und angezeigt, und die Events werden danach
  //     sortiert (neueste zuerst). Ohne Datum: alphabetisch am Ende.
  //
  //     Technisch: Die Seite fragt den Dateibaum ueber die oeffentliche
  //     GitHub-Schnittstelle ab (ein einziger Aufruf) und merkt sich das
  //     Ergebnis 30 Minuten im Browser, damit nicht bei jedem Aufruf neu
  //     angefragt wird.
  // ---------------------------------------------------------------
  var EVENT_REPO   = 'KlausSchmidt2026/wahnsinn-total-webside';
  var EVENT_BRANCH = 'main';
  var EVENT_ORDNER = 'assets/events';
  var EVENT_CACHE_MINUTEN = 30;
  var BILD_ENDUNGEN = /\.(jpe?g|png|webp|gif)$/i;

  function eventBaumHolen() {
    var cacheSchluessel = 'wt-eventbaum';
    // Zwischengespeichertes Ergebnis nutzen, solange es frisch genug ist
    try {
      var roh = sessionStorage.getItem(cacheSchluessel);
      if (roh) {
        var gecacht = JSON.parse(roh);
        var alterMinuten = (Date.now() - gecacht.zeit) / 60000;
        if (alterMinuten < EVENT_CACHE_MINUTEN) {
          return Promise.resolve(gecacht.pfade);
        }
      }
    } catch (e) { /* kein Cache verfuegbar, dann eben frisch laden */ }

    var url = 'https://api.github.com/repos/' + EVENT_REPO +
              '/git/trees/' + EVENT_BRANCH + '?recursive=1';

    return fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('GitHub-Abfrage fehlgeschlagen (' + resp.status + ')');
        return resp.json();
      })
      .then(function (daten) {
        var pfade = (daten.tree || [])
          .filter(function (eintrag) {
            return eintrag.type === 'blob' &&
                   eintrag.path.indexOf(EVENT_ORDNER + '/') === 0 &&
                   BILD_ENDUNGEN.test(eintrag.path);
          })
          .map(function (eintrag) { return eintrag.path; });

        try {
          sessionStorage.setItem(cacheSchluessel, JSON.stringify({ zeit: Date.now(), pfade: pfade }));
        } catch (e) { /* Speichern nicht moeglich, nicht weiter schlimm */ }

        return pfade;
      });
  }

  function eventNameZerlegen(ordnername) {
    // "2026-09-18 Weinfest Remagen" -> Datum + "Weinfest Remagen"
    var m = ordnername.match(/^(\d{4})-(\d{2})-(\d{2})[ _-]+(.*)$/);
    if (m) {
      return {
        datum: new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
        titel: m[4].trim()
      };
    }
    return { datum: null, titel: ordnername };
  }

  function eventsAusPfaden(pfade) {
    var nachOrdner = {};
    pfade.forEach(function (pfad) {
      var rest = pfad.slice(EVENT_ORDNER.length + 1);
      var teile = rest.split('/');
      if (teile.length < 2) { return; }  // Bild liegt direkt im events-Ordner
      var ordner = teile[0];
      if (!nachOrdner[ordner]) { nachOrdner[ordner] = []; }
      nachOrdner[ordner].push(pfad);
    });

    return Object.keys(nachOrdner).map(function (ordner) {
      var info = eventNameZerlegen(ordner);
      return {
        titel: info.titel,
        datum: info.datum,
        bilder: nachOrdner[ordner].sort().map(function (pfad) {
          return {
            // Leerzeichen und Sonderzeichen im Ordnernamen fuer die URL kodieren
            src: pfad.split('/').map(encodeURIComponent).join('/'),
            alt: info.titel
          };
        })
      };
    }).sort(function (a, b) {
      if (a.datum && b.datum) { return b.datum - a.datum; }  // neueste zuerst
      if (a.datum) { return -1; }
      if (b.datum) { return 1; }
      return a.titel.localeCompare(b.titel, 'de');
    });
  }

  function eventUeberschrift(ev) {
    if (!ev.datum) { return ev.titel; }
    return ev.titel + ' <span class="event-datum">' +
           ev.datum.getDate() + '. ' + MONATE[ev.datum.getMonth()] + ' ' +
           ev.datum.getFullYear() + '</span>';
  }

  function initEventGalerie(containerId) {
    var container = document.getElementById(containerId);
    if (!container) { return; }

    eventBaumHolen()
      .then(function (pfade) {
        var events = eventsAusPfaden(pfade);

        if (!events.length) {
          container.innerHTML = '<p class="event-hinweis">Hier erscheinen bald Fotos vergangener Auftritte.</p>';
          return;
        }

        container.innerHTML = '';
        events.forEach(function (ev) {
          var block = document.createElement('section');
          block.className = 'event-block';

          var h = document.createElement('h3');
          h.className = 'event-titel';
          h.innerHTML = eventUeberschrift(ev);
          block.appendChild(h);

          var grid = document.createElement('div');
          grid.className = 'gallery-grid';
          ev.bilder.forEach(function (b, i) {
            grid.appendChild(kachelBauen(b, i, ev.bilder));
          });
          block.appendChild(grid);

          container.appendChild(block);
        });
      })
      .catch(function (err) {
        container.innerHTML = '<p class="event-hinweis">Die Fotos vergangener Auftritte konnten gerade nicht geladen werden.</p>';
        if (window.console) console.error('Event-Galerie:', err);
      });
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

  return {
    initGalerie: initGalerie,
    initVideos: initVideos,
    initTermine: initTermine,
    initEventGalerie: initEventGalerie
  };
})();
