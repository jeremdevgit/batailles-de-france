/* SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit — voir LICENSE */
/* Batailles de France — client réseau : relie le jeu au serveur de jeu (app/main.py).
   - use('room') : salons de partie (WebSocket /ws?salon=bdl-…) + salle d'accueil avec présence (salon « accueil »,
     sert à la recherche d'adversaire du mode classé) ;
   - use('db')   : classement (/api/classement), seule la collection « ranked » existe ;
   - use('user') : identité anonyme liée au navigateur (jeton aléatoire gardé dans localStorage). */
(function () {
  "use strict";
  var CLE_JETON = "bdf-jeton";

  function jeton() {
    var j = null;
    try { j = localStorage.getItem(CLE_JETON); } catch (e) {}
    if (!j || !/^[a-f0-9]{48}$/.test(j)) {
      var a = new Uint8Array(24); crypto.getRandomValues(a);
      j = Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      try { localStorage.setItem(CLE_JETON, j); } catch (e) {}
    }
    return j;
  }
  var JETON = jeton();

  function urlWs(salon) {
    return (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws?salon=" + encodeURIComponent(salon) + "&jeton=" + JETON;
  }

  /* ---------- connexion à un salon ---------- */
  function connecter(nomSalon) {
    return new Promise(function (ok, ko) {
      var ws, moi = null, pairs = new Map(), ecoutes = new Map(), ecoutesPairs = [], fini = false, pret = false;
      try { ws = new WebSocket(urlWs(nomSalon)); } catch (e) { ko({ code: "connexion" }); return; }
      function pair(p) { return { peer: p.p, by: p.by, sameTab: false, kind: "viewer", presence: p.pr || null }; }
      function liste() {
        var l = [{ peer: moi.p, by: moi.by, sameTab: true, kind: "viewer", presence: moi.pr || null }];
        pairs.forEach(function (p) { l.push(pair(p)); });
        return l;
      }
      function prevenir(joined, left) {
        var ch = { joined: joined, left: left, peers: liste() };
        ecoutesPairs.forEach(function (f) { try { f(ch); } catch (e) {} });
      }
      var salon = {
        emit: function (sujet, data) {
          if (fini || ws.readyState !== 1) return Promise.reject({ code: "ferme" });
          try { ws.send(JSON.stringify({ s: sujet, d: data })); } catch (e) { return Promise.reject({ code: "envoi" }); }
          return Promise.resolve();
        },
        presence: function (obj) {
          if (fini || ws.readyState !== 1) return Promise.reject({ code: "ferme" });
          var pr = Object.create(null);
          for (var k in obj) if (obj[k] !== null && obj[k] !== undefined) pr[k] = obj[k];
          moi.pr = pr;
          try { ws.send(JSON.stringify({ t: "presence", d: pr })); } catch (e) { return Promise.reject({ code: "envoi" }); }
          prevenir([], []);
          return Promise.resolve();
        },
        on: function (sujet, f) { var handlers = ecoutes.get(sujet) || []; handlers.push(f); ecoutes.set(sujet, handlers); return function () { ecoutes.set(sujet, (ecoutes.get(sujet) || []).filter(function (g) { return g !== f; })); }; },
        onPeers: function (f) { ecoutesPairs.push(f); return function () { ecoutesPairs = ecoutesPairs.filter(function (g) { return g !== f; }); }; },
        peers: function () { return moi ? liste() : []; },
        leave: function () { fini = true; try { ws.close(1000); } catch (e) {} return Promise.resolve(); },
        _ferme: function () { return fini; }
      };
      ws.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.t === "bienvenue") {
          moi = { p: m.moi, by: m.by, pr: null }; pairs = new Map();
          (m.pairs || []).forEach(function (p) { pairs.set(p.p, p); });
          pret = true; ok(salon);
          // signe de vie : le serveur coupe un salon de partie resté muet 2 min
          var vie = setInterval(function () { if (fini || ws.readyState !== 1) { clearInterval(vie); return; } try { ws.send('{"t":"ping"}'); } catch (e) {} }, 30000);
        } else if (m.t === "pairs") {
          var j = [], l = [];
          (m.partis || []).forEach(function (id) { if (pairs.has(id)) { l.push(pair(pairs.get(id))); pairs.delete(id); } });
          (m.arrives || []).forEach(function (p) { if (!pairs.has(p.p)) { pairs.set(p.p, p); j.push(pair(p)); } });
          (m.maj || []).forEach(function (p) { var known = pairs.get(p.p); if (known) known.pr = p.pr; });
          prevenir(j, l);
        } else if (m.t === "msg") {
          (ecoutes.get(m.s) || []).forEach(function (f) { try { f({ peer: m.p, by: m.by, sameTab: false, data: m.d }); } catch (e) {} });
        } else if (m.t === "erreur" && !pret) { fini = true; ko({ code: m.code || "refus" }); }
      };
      ws.onerror = function () { if (!pret) { fini = true; ko({ code: "serveur injoignable" }); } };
      ws.onclose = function () {
        if (!pret) { if (!fini) ko({ code: "serveur injoignable" }); fini = true; return; }
        if (!fini) {
          fini = true;
          var l = []; pairs.forEach(function (p) { l.push(pair(p)); });
          pairs = new Map(); prevenir([], l);
          if (salon._perdu) salon._perdu();
        }
      };
    });
  }

  /* ---------- salle d'accueil (présence, reconnexion automatique) ---------- */
  var accueil = { salon: null, ecoutes: [], presence: null, essai: null };
  function accueilConnecter() {
    if (accueil.essai) return;
    accueil.essai = connecter("accueil").then(function (s) {
      accueil.salon = s; accueil.essai = null;
      s.onPeers(function (ch) { accueil.ecoutes.forEach(function (f) { try { f(ch); } catch (e) {} }); });
      s._perdu = function () { accueil.salon = null; setTimeout(accueilConnecter, 3000); };
      if (accueil.presence) s.presence(accueil.presence).catch(function () {});
      var ch = { joined: [], left: [], peers: s.peers() };
      accueil.ecoutes.forEach(function (f) { try { f(ch); } catch (e) {} });
    }, function () { accueil.essai = null; setTimeout(accueilConnecter, 5000); });
  }
  var room = {
    join: function (nom) { return connecter(String(nom)); },
    presence: function (obj) {
      var pr = Object.create(null); for (var k in obj) if (obj[k] !== null && obj[k] !== undefined) pr[k] = obj[k];
      accueil.presence = pr;
      if (accueil.salon) return accueil.salon.presence(pr);
      accueilConnecter(); return Promise.resolve();
    },
    peers: function () { return accueil.salon ? accueil.salon.peers() : []; },
    onPeers: function (f) {
      accueil.ecoutes.push(f); accueilConnecter();
      return function () { accueil.ecoutes = accueil.ecoutes.filter(function (g) { return g !== f; }); };
    }
  };

  /* ---------- classement ---------- */
  function api(methode, chemin, corps) {
    var o = { method: methode, headers: { "X-Jeton": JETON }, cache: "no-store" };
    if (corps !== undefined) { o.headers["Content-Type"] = "application/json"; o.body = JSON.stringify(corps); }
    return fetch(chemin, o).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw { code: j.code || ("http_" + r.status) }; });
      return r.json();
    });
  }
  function instantane(d) { return { id: d.id, exists: true, data: function () { return d; } }; }
  var abonnes = [];        // fonctions de rafraîchissement
  function rafraichir() { abonnes.forEach(function (f) { try { f(); } catch (e) {} }); }
  setInterval(function () { if (!document.hidden) rafraichir(); }, 15000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) rafraichir(); });

  function idDoc(chemin) {
    var m = /^ranked\/([a-f0-9]{16})$/.exec(String(chemin));
    return m ? m[1] : null;
  }
  var db = {
    collection: function (nom) {
      var limite = 50;
      var req = {
        orderBy: function () { return req; },
        limit: function (n) { limite = Math.max(1, Math.min(50, n | 0)); return req; },
        onSnapshot: function (cb, err) {
          if (nom !== "ranked") { if (err) err({ code: "introuvable" }); return function () {}; }
          var actif = true;
          function charger() {
            api("GET", "/api/classement?limite=" + limite).then(function (l) {
              if (actif) cb({ docs: (l || []).map(instantane) });
            }, function (e) { if (actif && err) err(e); });
          }
          abonnes.push(charger); charger();
          return function () { actif = false; abonnes = abonnes.filter(function (f) { return f !== charger; }); };
        }
      };
      return req;
    },
    doc: function (chemin) {
      var id = idDoc(chemin);
      function lire() {
        if (!id) return Promise.resolve({ id: id, exists: false, data: function () { return null; } });
        return api("GET", "/api/classement/" + id).then(function (d) {
          return d ? instantane(d) : { id: id, exists: false, data: function () { return null; } };
        });
      }
      return {
        get: lire,
        set: function (data) {
          if (!id) return Promise.reject({ code: "invalid_argument" });
          return api("PUT", "/api/classement/" + id, data).then(function () { rafraichir(); });
        },
        onSnapshot: function (cb, err) {
          var actif = true;
          function charger() { lire().then(function (s) { if (actif) cb(s); }, function (e) { if (actif && err) err(e); }); }
          abonnes.push(charger); charger();
          return function () { actif = false; abonnes = abonnes.filter(function (f) { return f !== charger; }); };
        }
      };
    }
  };

  /* ---------- identité ---------- */
  var monId = null;
  var user = {
    id: function () {
      if (monId) return Promise.resolve(monId);
      return api("GET", "/api/moi").then(function (r) { monId = r && r.id; return monId; });
    },
    profiles: function () { return Promise.resolve({}); }   // pas de profils : le jeu affiche le nom de guerre
  };

  window.claude = window.claude || {};
  window.claude.use = function (nom) {
    if (nom === "room") return Promise.resolve(room);
    if (nom === "db") return Promise.resolve(db);
    if (nom === "user") return Promise.resolve(user);
    return Promise.reject(new Error("non disponible"));
  };
})();
