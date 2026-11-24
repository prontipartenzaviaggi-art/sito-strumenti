/* Pronti Partenza Viaggi — piantina posti bus.
   Caricato da Google Tag Manager (GTM-KPS549XS) su tutte le pagine.
   1) Sulle pagine dei viaggi (/dettaglio/...) si ricorda l'ultimo viaggio guardato (nome + data),
      nel browser per 3 ore (localStorage, vale anche tra schede diverse), così la piantina può precompilare il viaggio.
   2) Sulla pagina /posto-bus cerca il paragrafo segnaposto che inizia con "Non vedi la piantina?"
      e lo sostituisce con la piantina cliccabile, passandole il viaggio.
   Si può anche linkare /posto-bus?viaggio=Nome%20del%20viaggio per forzare il viaggio. */
(function () {
  if (window.__ppvPiantina) return;
  window.__ppvPiantina = true;
  var ORIGINE = "https://prontipartenzaviaggi-art.github.io";
  var SRC = ORIGINE + "/sito-strumenti/piantina-bus.html";
  var SEGNAPOSTO = "Non vedi la piantina?";
  var CHIAVE = "ppvUltimoViaggio";
  var MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  var frame = null;

  function dataDaSoluzione() {
    var m = location.search.match(/solution=[^&]*?-(20\d{2})(\d{2})(\d{2})-/);
    if (!m) return "";
    var g = parseInt(m[3], 10), me = parseInt(m[2], 10) - 1;
    return (me >= 0 && me < 12) ? g + " " + MESI[me] + " " + m[1] : "";
  }

  function ricorda() {
    if (location.pathname.indexOf("/dettaglio/") !== 0) return;
    if (/\/dettaglio\/vacanze\//.test(location.pathname)) return; // villaggi e pacchetti con volo: niente bus
    var nome = (document.title || "").split("|")[0].trim();
    if (!nome || /pronti partenza/i.test(nome)) return;
    var d = dataDaSoluzione();
    try { localStorage.setItem(CHIAVE, JSON.stringify({ v: nome + (d ? ", " + d : ""), t: Date.now() })); } catch (e) {}
  }

  function viaggioDaPassare() {
    var q = new URLSearchParams(location.search).get("viaggio");
    if (q) return q;
    try {
      var s = JSON.parse(localStorage.getItem(CHIAVE) || "null");
      if (s && s.v && Date.now() - s.t < 3 * 3600 * 1000) return s.v;
    } catch (e) {}
    return "";
  }

  function monta() {
    if (!/^\/posto-bus\/?$/.test(location.pathname)) return;
    if (frame && document.body.contains(frame)) return;
    var nodi = document.querySelectorAll("p");
    for (var i = 0; i < nodi.length; i++) {
      var el = nodi[i];
      if (el.textContent.trim().indexOf(SEGNAPOSTO) === 0) {
        var v = viaggioDaPassare();
        frame = document.createElement("iframe");
        frame.src = SRC + (v ? "?viaggio=" + encodeURIComponent(v) : "");
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
  function controlla() { ricorda(); monta(); }
  new MutationObserver(function () {
    if (attesa) return;
    attesa = setTimeout(function () { attesa = null; controlla(); }, 300);
  }).observe(document.documentElement, { childList: true, subtree: true });
  controlla();
})();
