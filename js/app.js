(function () {
  const TESTS = window.TESTS, TREE = window.TREE, FAMILIES = window.FAMILIES, UNIVERSAL = window.UNIVERSAL;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const familyLabel = (id) => (FAMILIES.find((f) => f.id === id) || {}).label || "";

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  // Wizard state: current node, answers so far, and the standard test to fall back to at the framework step.
  const wiz = { node: "start", history: [], classic: null, finished: null };

  const main = $("#main");
  const nav = $("#catalogue");

  // ---------- Catalogue ----------
  function renderCatalogue(filter) {
    const f = (filter || "").trim().toLowerCase();
    const current = location.hash.slice(1);
    let html = "";
    FAMILIES.forEach((fam) => {
      const items = Object.entries(TESTS).filter(([id, t]) => t.family === fam.id &&
        (!f || (t.name + " " + t.short + " " + t.useWhen).toLowerCase().includes(f)));
      if (!items.length) return;
      html += `<div class="cat-group"><h3>${esc(fam.label)}</h3><ul>` +
        items.map(([id, t]) => `<li><a href="#${id}"${id === current ? ' aria-current="page"' : ""}>${esc(t.name)}</a></li>`).join("") +
        `</ul></div>`;
    });
    nav.innerHTML = html || `<p class="empty">No test matches “${esc(filter)}”. Try a broader word such as “survival” or “proportion”.</p>`;
  }

  // ---------- Wizard ----------
  function renderWizard() {
    const node = TREE[wiz.node];
    const step = wiz.history.length + 1;
    const trail = wiz.history.map((h, i) =>
      `<li><button type="button" class="trail-btn" data-back="${i}"><span class="trail-q">${esc(TREE[h.node].q)}</span><span class="trail-a">${esc(h.label)}</span></button></li>`
    ).join("");

    main.innerHTML = `
      <section class="wizard" aria-labelledby="wiz-q">
        <header class="wiz-head">
          <p class="eyebrow">Find the right test</p>
          <p class="wiz-intro">Answer a few questions about your study. You will get the recommended test, a checklist of its assumptions, and guidance on interpreting and reporting it.</p>
        </header>
        ${trail ? `<ol class="trail" aria-label="Your answers so far">${trail}</ol>` : ""}
        <div class="qcard">
          ${stepper(step)}
          <h2 id="wiz-q">${esc(node.q)}</h2>
          ${node.help ? `<p class="qhelp">${esc(node.help)}</p>` : ""}
          <div class="options">
            ${node.options.map((o, i) => `
              <button type="button" class="opt" data-opt="${i}">
                <span class="opt-label">${esc(o.label)}</span>
                ${o.sub ? `<span class="opt-sub">${esc(o.sub)}</span>` : ""}
              </button>`).join("")}
          </div>
          <div class="wiz-actions">
            ${wiz.history.length ? `<button type="button" class="ghost" id="wiz-back">← Previous question</button><button type="button" class="ghost" id="wiz-reset">Start over</button>` : ""}
          </div>
        </div>
      </section>`;

    main.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => choose(+b.dataset.opt)));
    main.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => goBack(+b.dataset.back)));
    const back = $("#wiz-back"); if (back) back.addEventListener("click", () => goBack(wiz.history.length - 1));
    const reset = $("#wiz-reset"); if (reset) reset.addEventListener("click", resetWizard);
    const first = main.querySelector(".opt"); if (first && wiz.history.length) first.focus({ preventScroll: true });
  }

  // Longest possible number of questions from a node to a result, counting the framework question.
  function depth(nodeId) {
    return 1 + Math.max(...TREE[nodeId].options.map((o) => o.next ? depth(o.next) : o.fw ? depth("fw_" + o.fw) : 0));
  }

  function stepper(step) {
    const total = step - 1 + depth(wiz.node);
    const dots = Array.from({ length: total }, (_, i) =>
      `<span class="pip ${i < step - 1 ? "done" : i === step - 1 ? "now" : "todo"}"></span>`).join("");
    const more = total - step;
    return `<div class="stepper" aria-label="Question ${step}${more ? `, up to ${more} more` : ", last question"}">
        <div class="pips" aria-hidden="true">${dots}</div>
        <p class="step">Question ${step}${more ? ` · up to ${more} more` : " · last question"}</p>
      </div>`;
  }

  function choose(i) {
    const node = TREE[wiz.node];
    const o = node.options[i];
    wiz.history.push({ node: wiz.node, label: o.label });
    if (o.fw) { wiz.classic = o.result; wiz.node = "fw_" + o.fw; renderWizard(); window.scrollTo({ top: 0 }); return; }
    if (o.next) { wiz.node = o.next; renderWizard(); window.scrollTo({ top: 0 }); return; }
    const id = o.result === "$classic" ? wiz.classic : o.result;
    wiz.finished = { id, path: wiz.history.slice() };
    if (location.hash.slice(1) === id) route(); else location.hash = id;
  }

  function goBack(idx) {
    const h = wiz.history[idx];
    wiz.history = wiz.history.slice(0, idx);
    wiz.node = h.node;
    renderWizard();
  }

  function resetWizard() {
    wiz.node = "start"; wiz.history = []; wiz.classic = null; wiz.finished = null;
    if (location.hash && location.hash !== "#start") location.hash = "start"; else renderWizard();
  }

  // ---------- Test page ----------
  const STATES = [["met", "Met"], ["not", "Not met"], ["unsure", "Unsure"]];

  function renderTest(id) {
    const t = TESTS[id];
    const checks = store.get("csn:check:" + id, {});
    const path = wiz.finished && wiz.finished.id === id ? wiz.finished.path : null;

    const pathHtml = path ? `
      <div class="yourpath">
        <h3>Your answers led here</h3>
        <ol>${path.map((p) => `<li><span class="yp-q">${esc(TREE[p.node].q)}</span> <span class="yp-a">${esc(p.label)}</span></li>`).join("")}</ol>
        <button type="button" class="ghost small" id="change-answers">Change my answers</button>
      </div>` : "";

    const assumptions = t.assumptions.map((a, i) => {
      const s = checks[i] || "";
      const alt = a.alt && TESTS[a.alt] ? ` <a class="altlink" href="#${a.alt}">Go to ${esc(TESTS[a.alt].name)} →</a>` : "";
      return `
        <li class="chk" data-state="${s}" data-i="${i}">
          <div class="chk-top">
            <span class="chk-mark" aria-hidden="true"></span>
            <p class="chk-t">${esc(a.t)}</p>
          </div>
          <p class="chk-how"><span class="lbl">How to check</span>${esc(a.how)}</p>
          <div class="seg" role="radiogroup" aria-label="Status: ${esc(a.t)}">
            ${STATES.map(([v, l]) => `<button type="button" role="radio" aria-checked="${s === v}" data-v="${v}">${l}</button>`).join("")}
          </div>
          <div class="chk-fail"${s === "not" || s === "unsure" ? "" : " hidden"}>
            <span class="lbl">${s === "unsure" ? "If it turns out not to be met" : "What to do instead"}</span>${esc(a.fail)}${alt}
          </div>
        </li>`;
    }).join("");

    const related = (t.related || []).filter((r) => TESTS[r]).map((r) =>
      `<a class="chip" href="#${r}">${esc(TESTS[r].name)}</a>`).join("");

    const links = (window.APP_LINKS || {})[id] || [];
    const calc = links.length ? `
        <section class="calc" aria-labelledby="calc-h">
          <h2 id="calc-h">Calculate it</h2>
          <p class="calc-note">Check the assumptions below, then run the test in ${links.length > 1 ? "either of these web apps" : "this web app"}. Each link opens in a new tab.</p>
          <ul class="calc-list">${links.map((l) => {
            const a = window.APPS[l.app];
            return `<li class="calc-item">
              <a class="calc-btn" href="${a.url}" target="_blank" rel="noopener">Open ${esc(a.name)} <span aria-hidden="true">↗</span></a>
              <div class="calc-where"><span class="lbl">Go to</span><strong>${esc(l.where)}</strong></div>
              <p class="calc-how">${esc(l.how)}</p>
            </li>`;
          }).join("")}</ul>
        </section>` : `
        <section class="calc calc-none" aria-labelledby="calc-h">
          <h2 id="calc-h">Calculate it</h2>
          <p class="calc-note">This test is not yet available in Statis, Statis Gravity or Bayesian Estimation. Run it in a general statistics package instead: <strong>R</strong> (free), <strong>jamovi</strong> or <strong>JASP</strong> (free, point-and-click), <strong>SPSS</strong>, <strong>Stata</strong>, or <strong>Python</strong> (statsmodels, scipy, lifelines). The commands are under <button type="button" class="linklike" data-jump="sec-software">Run it in software</button>.</p>
        </section>`;

    main.innerHTML = `
      <article class="test">
        <header class="test-head">
          <p class="eyebrow">${esc(familyLabel(t.family))}</p>
          <h1>${esc(t.name)}</h1>
          <p class="lede">${esc(t.short)}</p>
          <dl class="facts">
            <div><dt>Use when</dt><dd>${esc(t.useWhen)}</dd></div>
            <div><dt>Clinical example</dt><dd>${esc(t.example)}</dd></div>
          </dl>
        </header>
${calc}

        <nav class="jump" aria-label="Sections">
          ${[["why", "Why this test"], ["assumptions", "Assumptions"], ["pitfalls", "Pitfalls"], ["interpret", "Interpreting"], ["report", "Reporting"], ["software", "Software"]]
            .map(([k, l]) => `<button type="button" data-jump="sec-${k}">${l}</button>`).join("")}
        </nav>

        <section id="sec-why" class="sec">
          <h2>Why this test</h2>
          <p>${esc(t.why)}</p>
          ${pathHtml}
        </section>

        <section id="sec-assumptions" class="sec">
          <div class="sec-head">
            <h2>Assumptions checklist</h2>
            <p class="tally" id="tally"></p>
          </div>
          <p class="sec-note">Check each assumption before you trust the result, and mark its status. Your marks are saved in this browser.</p>
          <ol class="checklist">${assumptions}</ol>
          <div class="chk-actions">
            <button type="button" class="primary" id="copy-sum">Copy checklist summary</button>
            <button type="button" class="ghost" id="reset-chk">Clear marks</button>
            <span class="copy-msg" id="copy-msg" role="status"></span>
          </div>
          <textarea id="copy-fallback" class="copy-fallback" readonly hidden></textarea>
          <details class="universal">
            <summary>Checks that apply to every analysis</summary>
            <ul>${UNIVERSAL.map((u) => `<li><strong>${esc(u.t)}.</strong> ${esc(u.how)}</li>`).join("")}</ul>
          </details>
        </section>

        <details id="sec-pitfalls" class="sec sec-d" open>
          <summary><h2>Pitfalls to avoid</h2></summary>
          <ul class="pitfalls">${t.pitfalls.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </details>

        <details id="sec-interpret" class="sec sec-d" open>
          <summary><h2>Interpreting the results</h2></summary>
          <ol class="steps">${t.interpret.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
        </details>

        <details id="sec-report" class="sec sec-d" open>
          <summary><h2>How to report it</h2></summary>
          <p class="sec-note">An example sentence for a results section. The numbers are illustrative; replace them with your own.</p>
          <blockquote class="report">${esc(t.report)}</blockquote>
        </details>

        <details id="sec-software" class="sec sec-d" open>
          <summary><h2>Run it in software</h2></summary>
          <dl class="sw">${t.software.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd><pre><code>${esc(v)}</code></pre></dd></div>`).join("")}</dl>
        </details>

        ${related ? `<section class="sec"><h2>Related tests</h2><div class="chips">${related}</div></section>` : ""}

        <footer class="test-foot">
          <button type="button" class="primary" id="new-search">Find a test for another question</button>
          <p class="disclaimer">This guide supports, and does not replace, advice from a statistician. Involve one at the design stage whenever you can.</p>
        </footer>
      </article>`;

    updateTally(id);

    main.querySelectorAll(".chk .seg button").forEach((b) => b.addEventListener("click", () => {
      const li = b.closest(".chk"); const i = +li.dataset.i;
      const c = store.get("csn:check:" + id, {});
      const v = c[i] === b.dataset.v ? "" : b.dataset.v;
      if (v) c[i] = v; else delete c[i];
      store.set("csn:check:" + id, c);
      li.dataset.state = v;
      li.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-checked", String(x.dataset.v === v)));
      const fail = li.querySelector(".chk-fail");
      fail.hidden = !(v === "not" || v === "unsure");
      fail.querySelector(".lbl").textContent = v === "unsure" ? "If it turns out not to be met" : "What to do instead";
      memo[id] = c; updateTally(id);
    }));

    main.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => {
      const el = document.getElementById(b.dataset.jump);
      if (el && el.tagName === "DETAILS") el.open = true;
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }));

    $("#copy-sum").addEventListener("click", () => copySummary(id));
    $("#reset-chk").addEventListener("click", () => { store.set("csn:check:" + id, {}); memo[id] = {}; renderTest(id); });
    $("#new-search").addEventListener("click", resetWizard);
    const ch = $("#change-answers");
    if (ch) ch.addEventListener("click", () => { const last = wiz.finished.path.length - 1; location.hash = "start"; goBack(last); });
  }

  const memo = {};
  function currentChecks(id) { return memo[id] || store.get("csn:check:" + id, {}); }

  function updateTally(id) {
    const t = TESTS[id]; const c = currentChecks(id);
    const n = t.assumptions.length;
    const met = Object.values(c).filter((v) => v === "met").length;
    const not = Object.values(c).filter((v) => v === "not").length;
    const uns = Object.values(c).filter((v) => v === "unsure").length;
    const el = $("#tally"); if (!el) return;
    let cls = "tally", msg;
    if (not) { cls += " is-bad"; msg = `${not} not met: see alternatives below`; }
    else if (met === n) { cls += " is-ok"; msg = `All ${n} assumptions met`; }
    else if (uns) { cls += " is-warn"; msg = `${met} of ${n} met, ${uns} unsure`; }
    else msg = `${met} of ${n} checked`;
    el.className = cls; el.textContent = msg;
  }

  function copySummary(id) {
    const t = TESTS[id]; const c = currentChecks(id);
    const label = { met: "Met", not: "NOT MET", unsure: "Unsure" };
    const lines = [`Assumption check: ${t.name} (${new Date().toISOString().slice(0, 10)})`, ""];
    t.assumptions.forEach((a, i) => {
      lines.push(`[${label[c[i]] || "Not checked"}] ${a.t}`);
      if (c[i] === "not") lines.push(`    Action: ${a.fail}`);
    });
    const text = lines.join("\n");
    const msg = $("#copy-msg");
    const fallback = () => {
      const ta = $("#copy-fallback"); ta.hidden = false; ta.value = text; ta.focus(); ta.select();
      msg.textContent = "Press Ctrl/⌘ + C to copy the selected text.";
    };
    try {
      navigator.clipboard.writeText(text).then(() => { msg.textContent = "Copied to clipboard."; }, fallback);
    } catch (e) { fallback(); }
  }

  // ---------- Routing ----------
  function route() {
    const id = location.hash.slice(1);
    if (TESTS[id]) { renderTest(id); document.title = TESTS[id].name + " · Statis Clinical Stats Navigator"; }
    else { renderWizard(); document.title = "Statis Clinical Stats Navigator"; }
    renderCatalogue($("#search").value);
    window.scrollTo({ top: 0 });
    document.body.classList.remove("nav-open");
  }

  $("#search").addEventListener("input", (e) => renderCatalogue(e.target.value));
  $("#home-link").addEventListener("click", (e) => { e.preventDefault(); resetWizard(); });
  $("#nav-toggle").addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    $("#nav-toggle").setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("hashchange", route);
  route();
})();
