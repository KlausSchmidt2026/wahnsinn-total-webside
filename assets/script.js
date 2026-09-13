// Wahnsinn Total – kleine Interaktionen, ohne externe Abhängigkeiten

document.addEventListener('DOMContentLoaded', function () {

  // Mobile Navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // ---- WhatsApp-Freischaltung ----
  // Einfacher Bot-Schutz ohne Cloudflare:
  // 1) Honeypot-Feld, das nur Bots ausfüllen
  // 2) Mindestverweildauer auf der Seite, bevor die Prüfung möglich ist
  // 3) Manuelle Bestätigung per Checkbox
  // Die WhatsApp-Nummer/URL steht dabei erst NACH Freischaltung im DOM,
  // damit simple Scraper sie nicht direkt aus dem HTML lesen können.

  var WHATSAPP_NUMBER = '4915114449647'; // 015114449647, ohne führende 0, mit Ländercode 49
  var WHATSAPP_TEXT = 'Hallo Wahnsinn Total, ich habe eine Anfrage für einen Auftritt.';

  var pageLoadTime = Date.now();
  var gate = document.querySelector('.whatsapp-gate');
  if (gate) {
    var checkbox = gate.querySelector('#confirm-human');
    var honeypot = gate.querySelector('#hp-website');
    var unlockBtn = gate.querySelector('#unlock-whatsapp');
    var status = gate.querySelector('.gate-status');
    var linkWrap = gate.querySelector('.whatsapp-link-wrap');

    unlockBtn.addEventListener('click', function () {
      var elapsed = Date.now() - pageLoadTime;

      if (honeypot.value.trim() !== '') {
        // Bot hat das versteckte Feld ausgefüllt
        status.textContent = 'Prüfung fehlgeschlagen.';
        status.className = 'gate-status err';
        return;
      }

      if (!checkbox.checked) {
        status.textContent = 'Bitte zuerst die Bestätigung ankreuzen.';
        status.className = 'gate-status err';
        return;
      }

      if (elapsed < 1200) {
        status.textContent = 'Einen Moment bitte, noch mal klicken.';
        status.className = 'gate-status err';
        return;
      }

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_TEXT);
      linkWrap.innerHTML = '<a class="btn btn-whatsapp" target="_blank" rel="noopener" href="' + url + '">WhatsApp öffnen</a>';
      status.textContent = 'Freigeschaltet.';
      status.className = 'gate-status ok';
      unlockBtn.disabled = true;
      checkbox.disabled = true;
    });
  }
});
