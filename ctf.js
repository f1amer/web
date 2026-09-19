(() => {
  'use strict';

  const grid = document.querySelector('#arcadeMenu .arcade-game-grid');
  const content = document.querySelector('.arcade-content');
  const overlay = document.querySelector('#cyberArcadeOverlay');
  const homeBtn = document.querySelector('#arcadeHome');
  if (!grid || !content || !overlay || !homeBtn) return;

  grid.insertAdjacentHTML('beforeend', `
    <button class="arcade-game-card ctf-card" type="button" id="openCtfGame">
      <span class="game-no">GAME_03 // CAPTURE THE FLAG</span>
      <h3>Ghost Node: CTF</h3>
      <p>Enter a simulated hacker terminal. Recon the target, trace hidden clues, analyse logs, decode artifacts and capture the final flag.</p>
      <span class="play-tag">BREACH THE LAB →</span>
    </button>`);

  content.insertAdjacentHTML('beforeend', `
    <section class="arcade-screen" id="ctfScreen">
      <div class="arcade-game-top">
        <div class="arcade-game-name"><span>03</span><h3>GHOST NODE // CAPTURE THE FLAG</h3></div>
        <div class="arcade-hud">
          <div class="arcade-stat">LEVEL <b>HARD</b></div>
          <div class="arcade-stat">PROGRESS <b id="ctfProgress">0/5</b></div>
          <div class="arcade-stat">SCORE <b id="ctfScore">6000</b></div>
        </div>
      </div>

      <div class="ctf-game-area">
        <div class="ctf-shell">
          <aside class="ctf-sidebar">
            <div class="ctf-kicker">// OPERATION_GHOST_NODE</div>
            <h4>Incident Brief</h4>
            <p>A fictional SOC sensor detected unusual traffic from an isolated training host. Your job is to investigate the simulated machine and recover the flag.</p>
            <div class="ctf-warning">SIMULATION ONLY // No real network requests or external systems are touched.</div>

            <div class="ctf-progress-list">
              <div class="ctf-objective" data-ctf-step="0"><b>01</b><span>Recon the target host</span></div>
              <div class="ctf-objective" data-ctf-step="1"><b>02</b><span>Find the hidden web route</span></div>
              <div class="ctf-objective" data-ctf-step="2"><b>03</b><span>Identify the compromised account</span></div>
              <div class="ctf-objective" data-ctf-step="3"><b>04</b><span>Decode and use the vault key</span></div>
              <div class="ctf-objective" data-ctf-step="4"><b>05</b><span>Capture and submit the flag</span></div>
            </div>

            <div class="ctf-scorebox">
              <div><span>TIME</span><strong id="ctfTime">00:00</strong></div>
              <div><span>HINTS</span><strong id="ctfHints">0/3</strong></div>
              <div><span>ERRORS</span><strong id="ctfErrors">0</strong></div>
              <div><span>BEST</span><strong id="ctfBest">—</strong></div>
            </div>
          </aside>

          <div class="ctf-terminal-wrap">
            <div class="ctf-terminal-head"><span>ghost@training-node:~$</span><em>ISOLATED LAB // HARD MODE</em></div>
            <div class="ctf-terminal" id="ctfTerminal" aria-live="polite"></div>
            <form class="ctf-prompt" id="ctfForm">
              <span>ghost@lab:$</span>
              <input class="ctf-input" id="ctfInput" autocomplete="off" spellcheck="false" aria-label="CTF terminal command" placeholder="type help if you need it">
              <button class="ctf-enter" type="submit">EXECUTE</button>
            </form>
            <div class="ctf-toolbar">
              <button class="ctf-tool" type="button" data-ctf-command="help">HELP</button>
              <button class="ctf-tool" type="button" data-ctf-command="status">STATUS</button>
              <button class="ctf-tool" type="button" data-ctf-command="hint">HINT</button>
              <button class="ctf-tool" type="button" data-ctf-command="clear">CLEAR</button>
              <button class="ctf-tool" type="button" data-ctf-command="reset">RESET MISSION</button>
            </div>
          </div>
        </div>

        <div class="ctf-win" id="ctfWin">
          <div class="ctf-win-card">
            <div class="ctf-win-code">// FLAG_CAPTURE_CONFIRMED</div>
            <h3>ACCESS GRANTED</h3>
            <p>You completed the Ghost Node investigation and captured the flag.</p>
            <p>Final score: <strong id="ctfFinalScore">0</strong> · Time: <strong id="ctfFinalTime">00:00</strong></p>
            <button class="arcade-action" id="ctfReplay" type="button">RUN MISSION AGAIN</button>
          </div>
        </div>
      </div>
    </section>`);

  const screen = document.querySelector('#ctfScreen');
  const terminal = document.querySelector('#ctfTerminal');
  const input = document.querySelector('#ctfInput');
  const form = document.querySelector('#ctfForm');
  const win = document.querySelector('#ctfWin');
  const FLAG_ENCODED = 'FUVFUVE{tubfg_va_gur_ybtf}';
  const VAULT_HEX = '4e45542d47484f53542d3432';
  const LOG_POINTER_B64 = 'L3Zhci9sb2cvYXV0aC5sb2c=';
  const TARGET = '10.13.37.7';

  const state = {
    started: false,
    startTime: 0,
    penalty: 0,
    hints: 0,
    errors: 0,
    steps: new Set(),
    history: [],
    historyIndex: 0,
    unlocked: false,
    won: false,
    timer: null
  };

  function rot13(value) {
    return value.replace(/[a-zA-Z]/g, ch => {
      const base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  function decodeHex(value) {
    const clean = value.replace(/\s+/g, '');
    if (!/^[0-9a-f]+$/i.test(clean) || clean.length % 2) throw new Error('invalid hex');
    return clean.match(/.{2}/g).map(x => String.fromCharCode(parseInt(x, 16))).join('');
  }

  function line(text = '', cls = 'dim') {
    const el = document.createElement('div');
    el.className = `ctf-line ${cls}`;
    el.textContent = text;
    terminal.appendChild(el);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function commandLine(text) {
    line(`ghost@lab:$ ${text}`, 'cmd');
  }

  function elapsedSeconds() {
    if (!state.started) return 0;
    return Math.floor((Date.now() - state.startTime) / 1000) + state.penalty;
  }

  function formatTime(total) {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function currentScore() {
    return Math.max(500, 6000 - elapsedSeconds() * 6 - state.hints * 400 - state.errors * 35);
  }

  function updateHud() {
    document.querySelector('#ctfProgress').textContent = `${state.steps.size}/5`;
    document.querySelector('#ctfScore').textContent = currentScore();
    document.querySelector('#ctfTime').textContent = formatTime(elapsedSeconds());
    document.querySelector('#ctfHints').textContent = `${state.hints}/3`;
    document.querySelector('#ctfErrors').textContent = state.errors;
    const best = Number(localStorage.getItem('shishirCtfBest') || 0);
    document.querySelector('#ctfBest').textContent = best ? best : '—';
    document.querySelectorAll('[data-ctf-step]').forEach(el => {
      el.classList.toggle('done', state.steps.has(Number(el.dataset.ctfStep)));
    });
  }

  function markStep(n) {
    if (!state.steps.has(n)) {
      state.steps.add(n);
      line(`[OBJECTIVE ${n + 1}/5 COMPLETE]`, 'ok');
      updateHud();
    }
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (state.started && !state.won) updateHud();
    }, 1000);
  }

  function bootMessage() {
    line('SHISHIR CYBER // GHOST NODE TRAINING ENVIRONMENT', 'info');
    line('Difficulty: HARD', 'bad');
    line('Mission: recover the flag from a fictional isolated host.', 'dim');
    line(`Target intelligence: ${TARGET}`, 'info');
    line('Everything in this terminal is simulated locally in your browser.', 'dim');
    line('Type help to view the small command set. The challenge will not tell you the exact command sequence.', 'dim');
    line('');
  }

  function resetMission() {
    state.started = true;
    state.startTime = Date.now();
    state.penalty = 0;
    state.hints = 0;
    state.errors = 0;
    state.steps.clear();
    state.history = [];
    state.historyIndex = 0;
    state.unlocked = false;
    state.won = false;
    win.classList.remove('show');
    terminal.innerHTML = '';
    bootMessage();
    updateHud();
    startTimer();
    setTimeout(() => input.focus(), 50);
  }

  function openCtf() {
    document.querySelectorAll('.arcade-screen').forEach(el => el.classList.remove('active'));
    screen.classList.add('active');
    homeBtn.hidden = false;
    if (!state.started || state.won) resetMission();
    else setTimeout(() => input.focus(), 50);
  }

  function fail(message) {
    state.errors += 1;
    line(message, 'bad');
    updateHud();
  }

  function printHelp() {
    line('Available lab commands:', 'info');
    line('  help                         show this list', 'dim');
    line('  status                       mission progress', 'dim');
    line('  scan <host>                  simulated service enumeration', 'dim');
    line('  nmap <host>                  alias for scan', 'dim');
    line('  curl <url>                   request a simulated web resource', 'dim');
    line('  ls <path>                    list a simulated directory', 'dim');
    line('  cat <file>                   read a simulated file', 'dim');
    line('  grep <term> <file>           search a simulated text file', 'dim');
    line('  decode base64 <text>         decode base64 locally', 'dim');
    line('  decode hex <text>            decode hexadecimal locally', 'dim');
    line('  decode rot13 <text>          decode ROT13 locally', 'dim');
    line('  unlock <key>                 attempt to unlock the protected user vault', 'dim');
    line('  submit <flag>                submit the recovered flag', 'dim');
    line('  hint                         use one of three hints (score penalty)', 'dim');
    line('  clear                        clear terminal', 'dim');
    line('  reset                        restart mission', 'dim');
  }

  function printStatus() {
    const names = ['Recon target', 'Hidden route', 'Compromised account', 'Vault key', 'Flag'];
    names.forEach((name, i) => line(`${state.steps.has(i) ? '[✓]' : '[ ]'} ${name}`, state.steps.has(i) ? 'ok' : 'dim'));
    line(`Score ${currentScore()} // Time ${formatTime(elapsedSeconds())} // Hints ${state.hints}/3 // Errors ${state.errors}`, 'info');
  }

  function useHint() {
    if (state.hints >= 3) return fail('No hints remaining. Continue investigating the artifacts you already found.');
    const hints = [
      !state.steps.has(0) ? `Start with service enumeration against the target ${TARGET}.` :
      !state.steps.has(1) ? 'The web service may expose a standard crawler-control file.' :
      !state.steps.has(2) ? 'The hidden web route points to encoded data. Decode it, then search the referenced log for an accepted authentication event.' :
      !state.steps.has(3) ? 'The accepted log entry contains a hexadecimal token. Decode it and use the resulting value with the unlock command.' :
      'After unlocking, inspect the user directory carefully. Hidden filenames begin with a dot and the final artifact tells you its encoding.',
      'Useful mindset: enumeration → web clue → decode → log filtering → key → hidden file.',
      'Remember: ls can target a path, grep accepts a search term and a file, and decode supports base64, hex and rot13.'
    ];
    line(`HINT ${state.hints + 1}: ${hints[state.hints]}`, 'info');
    state.hints += 1;
    updateHud();
  }

  function doScan(host) {
    if (!host) return fail('Usage: scan <host>');
    if (host !== TARGET) return fail(`Host ${host} is outside this isolated training scenario.`);
    line(`Scanning ${TARGET} ...`, 'dim');
    line('22/tcp     closed    ssh', 'dim');
    line('8080/tcp   open      http-alt', 'ok');
    line('31337/tcp  filtered  unknown', 'dim');
    line('Hint from banner: "public web node / crawler policy enabled"', 'info');
    markStep(0);
  }

  function doCurl(target) {
    if (!target) return fail('Usage: curl <url>');
    const clean = target.replace(/\/$/, '');
    if (clean === `http://${TARGET}:8080/robots.txt` || clean === `${TARGET}:8080/robots.txt`) {
      line('HTTP/1.1 200 OK', 'ok');
      line('User-agent: *', 'dim');
      line('Disallow: /vault/ops-7/', 'flag');
      line('# archived incident route — not indexed', 'dim');
      markStep(1);
      return;
    }
    if (clean === `http://${TARGET}:8080/vault/ops-7` || clean === `${TARGET}:8080/vault/ops-7`) {
      line('HTTP/1.1 200 OK', 'ok');
      line('ARCHIVE NODE // artifact pointer follows', 'info');
      line(`pointer=${LOG_POINTER_B64}`, 'flag');
      line('encoding=base64', 'dim');
      return;
    }
    if (clean === `http://${TARGET}:8080` || clean === `${TARGET}:8080`) {
      line('HTTP/1.1 200 OK', 'ok');
      line('<h1>Ghost Node</h1>', 'dim');
      line('Nothing useful on the landing page.', 'dim');
      return;
    }
    fail('HTTP 404 // resource not found in the simulated web node.');
  }

  function doLs(path = '.') {
    if (path === '.' || path === '~' || path === '/home/ghost') {
      line('README.txt  tools/', 'dim');
      return;
    }
    if (path === '/home/svc_backup') {
      if (!state.unlocked) return fail('Permission denied: protected vault is locked.');
      line('.shadow_flag  .notes  backup_manifest.txt', 'flag');
      return;
    }
    if (path === '/var/log') {
      line('auth.log  kernel.log  syslog', 'dim');
      return;
    }
    fail(`ls: cannot access '${path}': no such simulated directory`);
  }

  const authLog = [
    'Sep 19 03:11:08 node sshd[771]: FAIL user=admin src=10.13.37.31 reason=bad_password',
    'Sep 19 03:11:11 node sshd[775]: FAIL user=root src=10.13.37.31 reason=bad_password',
    'Sep 19 03:12:44 node web[801]: INFO route=/health status=200',
    `Sep 19 03:14:22 node sshd[824]: ACCEPT user=svc_backup src=10.13.37.42 token=${VAULT_HEX}`,
    'Sep 19 03:15:02 node cron[900]: INFO job=backup-sync user=svc_backup',
    'Sep 19 03:16:17 node sshd[918]: FAIL user=test src=10.13.37.31 reason=unknown_user'
  ];

  function doCat(path) {
    if (!path) return fail('Usage: cat <file>');
    if (path === '/var/log/auth.log') {
      authLog.forEach(x => line(x, 'dim'));
      line('The file is noisy. Filtering for a successful authentication may help.', 'info');
      return;
    }
    if (path === '/home/ghost/README.txt' || path === 'README.txt') {
      line('Ghost Node training shell. Investigate only the fictional target supplied in the mission brief.', 'dim');
      return;
    }
    if (path === '/home/svc_backup/.notes') {
      if (!state.unlocked) return fail('Permission denied: protected vault is locked.');
      line('Operator note: legacy flag payload is stored with ROT13 encoding.', 'info');
      return;
    }
    if (path === '/home/svc_backup/.shadow_flag') {
      if (!state.unlocked) return fail('Permission denied: protected vault is locked.');
      line(FLAG_ENCODED, 'flag');
      line('The payload is not the submitted flag yet. Determine its encoding.', 'dim');
      return;
    }
    if (path === '/home/svc_backup/backup_manifest.txt') {
      if (!state.unlocked) return fail('Permission denied: protected vault is locked.');
      line('daily.tar.gz', 'dim');
      line('weekly.tar.gz', 'dim');
      line('No flag here.', 'dim');
      return;
    }
    fail(`cat: '${path}' does not exist in this simulated filesystem.`);
  }

  function doGrep(term, file) {
    if (!term || !file) return fail('Usage: grep <term> <file>');
    if (file !== '/var/log/auth.log') return fail(`grep: ${file}: no searchable simulated artifact`);
    const matches = authLog.filter(x => x.toLowerCase().includes(term.toLowerCase()));
    if (!matches.length) return line('No matches.', 'dim');
    matches.forEach(x => line(x, x.includes('ACCEPT') ? 'flag' : 'dim'));
    if (matches.some(x => x.includes('ACCEPT'))) {
      line('Evidence: successful authentication belongs to svc_backup.', 'ok');
      markStep(2);
    }
  }

  function doDecode(kind, payload) {
    if (!kind || !payload) return fail('Usage: decode <base64|hex|rot13> <text>');
    try {
      let decoded = '';
      if (kind === 'base64') decoded = atob(payload.trim());
      else if (kind === 'hex') decoded = decodeHex(payload.trim());
      else if (kind === 'rot13') decoded = rot13(payload);
      else return fail('Supported decoders: base64, hex, rot13');
      line(decoded, 'flag');
      if (kind === 'hex' && payload.replace(/\s+/g, '').toLowerCase() === VAULT_HEX.toLowerCase()) {
        line('Decoded token looks like a vault key.', 'info');
      }
      if (kind === 'rot13' && payload.trim() === FLAG_ENCODED) {
        line('Flag material recovered. Submit it exactly as shown.', 'ok');
      }
    } catch (_) {
      fail(`decode: invalid ${kind} payload`);
    }
  }

  function doUnlock(key) {
    if (!key) return fail('Usage: unlock <key>');
    const expected = decodeHex(VAULT_HEX);
    if (key !== expected) return fail('Vault rejected the key.');
    state.unlocked = true;
    line('VAULT STATUS: UNLOCKED', 'ok');
    line('Protected directory available: /home/svc_backup', 'info');
    markStep(3);
  }

  function doSubmit(flag) {
    if (!flag) return fail('Usage: submit <flag>');
    const expectedFlag = rot13(FLAG_ENCODED);
    if (flag !== expectedFlag) {
      state.penalty += 15;
      fail('FLAG REJECTED // +15 second penalty');
      return;
    }
    markStep(4);
    state.won = true;
    clearInterval(state.timer);
    const score = currentScore();
    const previous = Number(localStorage.getItem('shishirCtfBest') || 0);
    if (score > previous) localStorage.setItem('shishirCtfBest', String(score));
    updateHud();
    line('FLAG ACCEPTED // INCIDENT CONTAINED', 'ok');
    line(`Final score: ${score}`, 'flag');
    document.querySelector('#ctfFinalScore').textContent = score;
    document.querySelector('#ctfFinalTime').textContent = formatTime(elapsedSeconds());
    setTimeout(() => win.classList.add('show'), 450);
  }

  function execute(raw) {
    const text = raw.trim();
    if (!text) return;
    commandLine(text);
    state.history.push(text);
    state.historyIndex = state.history.length;

    const parts = text.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const cmd = (parts.shift() || '').toLowerCase();
    const args = parts.map(x => x.replace(/^"|"$/g, ''));

    if (cmd === 'help' || cmd === '?') printHelp();
    else if (cmd === 'clear') terminal.innerHTML = '';
    else if (cmd === 'status') printStatus();
    else if (cmd === 'hint') useHint();
    else if (cmd === 'reset') resetMission();
    else if (cmd === 'whoami') line('ghost', 'ok');
    else if (cmd === 'pwd') line('/home/ghost', 'dim');
    else if (cmd === 'scan' || cmd === 'nmap') doScan(args[0]);
    else if (cmd === 'curl') doCurl(args[0]);
    else if (cmd === 'ls') doLs(args[0] || '.');
    else if (cmd === 'cat') doCat(args[0]);
    else if (cmd === 'grep') doGrep(args[0], args[1]);
    else if (cmd === 'decode') doDecode((args.shift() || '').toLowerCase(), args.join(' '));
    else if (cmd === 'unlock') doUnlock(args.join(' '));
    else if (cmd === 'submit') doSubmit(args.join(' '));
    else if (cmd === 'about') line('This is a browser-only fictional CTF. Commands operate only on predefined local challenge data.', 'info');
    else fail(`command not found: ${cmd}. Type help for the allowed lab commands.`);

    updateHud();
  }

  document.querySelector('#openCtfGame').addEventListener('click', openCtf);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    execute(value);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!state.history.length) return;
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      input.value = state.history[state.historyIndex] || '';
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
      input.value = state.history[state.historyIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const starters = ['help','status','scan ','curl ','ls ','cat ','grep ','decode ','unlock ','submit ','hint'];
      const found = starters.find(x => x.startsWith(input.value.toLowerCase()));
      if (found) input.value = found;
    }
  });

  document.querySelectorAll('[data-ctf-command]').forEach(btn => {
    btn.addEventListener('click', () => execute(btn.dataset.ctfCommand));
  });

  document.querySelector('#ctfReplay').addEventListener('click', resetMission);

  homeBtn.addEventListener('click', () => screen.classList.remove('active'));
  document.querySelectorAll('[data-open-game="fight"],[data-open-game="smash"]').forEach(btn => {
    btn.addEventListener('click', () => screen.classList.remove('active'));
  });
  document.querySelector('#cyberArcadeFab')?.addEventListener('click', () => screen.classList.remove('active'));
  document.querySelector('#arcadePopPlay')?.addEventListener('click', () => screen.classList.remove('active'));
  document.querySelector('#arcadeClose')?.addEventListener('click', () => input.blur());
  overlay.addEventListener('click', e => { if (e.target === overlay) input.blur(); });

  updateHud();
})();
