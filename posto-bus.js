/* Pronti Partenza Viaggi — piantina posti bus.
   Caricato da Google Tag Manager (GTM-KPS549XS) su tutte le pagine, ma si attiva SOLO
   sulla pagina /posto-bus: cerca il paragrafo segnaposto che inizia con "Non vedi la piantina?"
   e lo sostituisce con la piantina cliccabile. Su tutte le altre pagine non fa nulla. */
(function () {
  if (window.__ppvPiantina) return;
  window.__ppvPiantina = true;
  var ORIGINE = "https://prontipartenzaviaggi-art.github.io";
  var SRC = ORIGINE + "/sito-strumenti/piantina-bus.html";
  var SEGNAPOSTO = "Non vedi la piantina?";
  var frame = null;

  function monta() {
    if (!/^\/posto-bus\/?$/.test(location.pathname)) return;
    if (frame && document.body.contains(frame)) return;
    var nodi = document.querySelectorAll("p");
    for (var i = 0; i < nodi.length; i++) {
      var el = nodi[i];
      if (el.textContent.trim().indexOf(SEGNAPOSTO) === 0) {
        frame = document.createElement("iframe");
        frame.src = SRC;
        frame.title = "Scegli il tuo posto in bus";
        frame.loading = "lazy";
        frame.style.cssText = "display:block;width:100%;border:0;height:900px;";
        el.replaceWith(frame);
        return;
      }
    }
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== ORIGINE || !frame || !e.data || !e.data.ppvAltezza) return;
    frame.style.height = Math.ceil(e.data.ppvAltezza) + "px";
  });

  var attesa = null;
  new MutationObserver(function () {
    if (attesa) return;
    attesa = setTimeout(function () { attesa = null; monta(); }, 300);
  }).observe(document.documentElement, { childList: true, subtree: true });
  monta();
})();
