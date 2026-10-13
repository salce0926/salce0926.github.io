// =====================================================================
// おと（BGM・効果音）
//
// ・はじめは かならず オフ。メニューの「おと」で切り替える（localStorageに残す）
// ・音源ファイルは持たず、WebAudioの矩形波・三角波・ノイズでその場で鳴らす
//   （このサイトは純粋な静的サイトなので、ファイルを増やしたくない）
// ・曲は本家の旋律ではなく、FC風の音色で書いた自作のもの。
//   本家のBGMは著作物なので写さない
// =====================================================================
const Sound = (() => {
    const KEY = 'sq1sound';
    let ctx = null, master = null;
    let enabled = false;
    try { enabled = localStorage.getItem(KEY) === 'on'; } catch (e) {}

    let bgmName = null, bgmTimer = null, bgmVoices = [];
    let bgmWanted = null;      // 音がオフの間も「いま鳴らしたい曲」は覚えておく

    // 音名 → 周波数。C4 = 261.63Hz
    const NOTE = {};
    (() => {
        const names = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
        for (let oct = 1; oct <= 7; oct++)
            names.forEach((n, i) => { NOTE[n + oct] = 440 * Math.pow(2, (oct - 4) + (i - 9) / 12); });
    })();

    function ensure() {
        if (ctx) return true;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.18;        // 控えめに
        master.connect(ctx.destination);
        return true;
    }

    // 1音鳴らす。type は square / triangle / noise
    function tone(freq, start, dur, type, vol) {
        if (!ctx) return null;
        const g = ctx.createGain();
        g.connect(master);
        let src;
        if (type === 'noise') {
            const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            src = ctx.createBufferSource(); src.buffer = buf;
        } else {
            src = ctx.createOscillator();
            src.type = type || 'square';
            src.frequency.setValueAtTime(freq, start);
        }
        src.connect(g);
        const v = (vol === undefined ? 1 : vol);
        // FCらしく、立ち上がりは一瞬・切れ際だけ落とす
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(v, start + 0.006);
        g.gain.setValueAtTime(v, start + Math.max(0.01, dur - 0.03));
        g.gain.linearRampToValueAtTime(0, start + dur);
        src.start(start);
        src.stop(start + dur + 0.02);
        return src;
    }

    // 「音名:長さ」を並べた文字列。r は休符
    function parse(seq) {
        return seq.trim().split(/\s+/).map(s => {
            const [n, l] = s.split(':');
            return { note: n, beats: parseFloat(l || 1) };
        });
    }
    function playLine(seq, type, tempo, start, vol) {
        let t = start;
        for (const { note, beats } of parse(seq)) {
            const dur = beats * 60 / tempo;
            if (note !== 'r' && NOTE[note]) tone(NOTE[note], t, dur * 0.92, type, vol);
            t += dur;
        }
        return t - start;
    }

    // ---- 曲（すべて自作）。lead=主旋律 / bass=低音 / tempo=BPM ----
    const SONGS = {
        // 地上。歩きたくなる行進曲
        field: { tempo: 132, lead:
            'g4:1 c5:1 e5:1 g5:1 f5:1 e5:1 d5:2  e5:1 g5:1 c6:1 b5:1 a5:1 g5:1 e5:2 ' +
            'f5:1 a5:1 c6:1 a5:1 g5:1 f5:1 e5:2  d5:1 f5:1 a5:1 g5:1 e5:1 d5:1 c5:2',
            bass: 'c3:2 g3:2 c3:2 g3:2  c3:2 g3:2 c3:2 e3:2  f3:2 c4:2 f3:2 c4:2  g3:2 d4:2 g3:2 g2:2' },
        // 町。ゆっくり
        town: { tempo: 104, lead:
            'e5:1.5 g5:0.5 a5:1 g5:1  e5:1.5 d5:0.5 c5:2  d5:1.5 e5:0.5 f5:1 e5:1  d5:2 g4:2 ' +
            'c5:1.5 e5:0.5 g5:1 e5:1  f5:1.5 a5:0.5 g5:2  e5:1 d5:1 c5:1 d5:1  c5:4',
            bass: 'c3:2 g3:2 a2:2 e3:2  f3:2 c4:2 g3:2 g2:2  c3:2 g3:2 f3:2 c4:2  a2:2 g3:2 c3:4' },
        // 城。おごそか
        castle: { tempo: 88, lead:
            'c5:2 e5:1 g5:1  f5:2 e5:2  d5:2 f5:1 a5:1  g5:4 ' +
            'a5:2 g5:1 f5:1  e5:2 d5:2  c5:2 d5:1 e5:1  c5:4',
            bass: 'c3:4 f3:4 g3:4 c3:4  f3:4 c3:4 g3:4 c3:4' },
        // 洞窟。暗く、音数すくなめ
        cave: { tempo: 76, lead:
            'a4:2 r:1 c5:1  b4:2 r:2  a4:1 g+4:1 a4:2  r:4 ' +
            'd5:2 r:1 f5:1  e5:2 r:2  d5:1 c5:1 b4:2  a4:4',
            bass: 'a2:4 e2:4 a2:4 e2:4  d3:4 a2:4 e3:4 a2:4' },
        // 竜王の城。もっと重く
        darkcastle: { tempo: 84, lead:
            'd4:1 d+4:1 d4:1 a3:1  d4:2 f4:2  e4:1 f4:1 e4:1 c4:1  d4:4 ' +
            'a4:1 g+4:1 a4:1 f4:1  d4:2 a3:2  c4:1 d4:1 d+4:1 e4:1  d4:4',
            bass: 'd2:2 d2:2 d2:2 a2:2  d2:2 d2:2 d2:2 d2:2  d2:2 d2:2 d2:2 a2:2  d2:4 a2:4' },
        // ふつうの戦闘
        battle: { tempo: 160, lead:
            'e5:0.5 e5:0.5 g5:1 e5:0.5 d5:0.5 c5:1  d5:0.5 d5:0.5 f5:1 d5:0.5 c5:0.5 b4:1 ' +
            'c5:0.5 c5:0.5 e5:1 g5:0.5 a5:0.5 g5:1  f5:0.5 e5:0.5 d5:1 e5:2',
            bass: 'a2:1 a2:1 a2:1 a2:1  g2:1 g2:1 g2:1 g2:1  c3:1 c3:1 c3:1 c3:1  e3:1 e3:1 a2:2' },
        // ボス戦
        boss: { tempo: 150, lead:
            'd5:0.5 d+5:0.5 d5:0.5 a4:0.5 d5:1 f5:1  e5:0.5 f5:0.5 e5:0.5 c5:0.5 d5:2 ' +
            'a5:0.5 g+5:0.5 a5:0.5 f5:0.5 d5:1 a4:1  c5:0.5 d5:0.5 d+5:0.5 e5:0.5 d5:2',
            bass: 'd2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 ' +
                  'd2:0.5 d2:0.5 d2:0.5 d2:0.5 a2:0.5 a2:0.5 a2:0.5 a2:0.5 ' +
                  'd2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 d2:0.5 ' +
                  'a2:0.5 a2:0.5 a2:0.5 a2:0.5 d2:0.5 d2:0.5 d3:1' }
    };

    function stopBgm() {
        if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
        bgmVoices.forEach(v => { try { v.stop(); } catch (e) {} });
        bgmVoices = [];
        bgmName = null;
    }

    function loop(name) {
        const song = SONGS[name];
        if (!song || !ctx || !enabled) return;
        const start = ctx.currentTime + 0.05;
        const voices = [];
        const push = (seq, type, vol) => {
            let t = start;
            for (const { note, beats } of parse(seq)) {
                const dur = beats * 60 / song.tempo;
                if (note !== 'r' && NOTE[note]) {
                    const s = tone(NOTE[note], t, dur * 0.92, type, vol);
                    if (s) voices.push(s);
                }
                t += dur;
            }
            return t - start;
        };
        const len = Math.max(push(song.lead, 'square', 0.9),
                             push(song.bass, 'triangle', 0.8));
        bgmVoices = voices;
        bgmTimer = setTimeout(() => { if (bgmName === name) loop(name); }, len * 1000 - 40);
    }

    // ---- 効果音 ----
    const SE = {
        select:   () => { tone(NOTE.e5, ctx.currentTime, 0.05, 'square', 0.5); },
        confirm:  () => { const t = ctx.currentTime; tone(NOTE.c5, t, 0.05, 'square', 0.6); tone(NOTE.g5, t + 0.05, 0.08, 'square', 0.6); },
        cancel:   () => { tone(NOTE.a4, ctx.currentTime, 0.08, 'square', 0.5); },
        attack:   () => { tone(0, ctx.currentTime, 0.07, 'noise', 0.7); },
        critical: () => { const t = ctx.currentTime; tone(0, t, 0.06, 'noise', 0.9); tone(0, t + 0.07, 0.12, 'noise', 0.9); },
        hurt:     () => { const t = ctx.currentTime; tone(NOTE.a3, t, 0.07, 'square', 0.8); tone(NOTE['d+3'], t + 0.07, 0.12, 'square', 0.8); },
        spell:    () => { const t = ctx.currentTime; ['c5','e5','g5','c6'].forEach((n,i)=>tone(NOTE[n], t+i*0.045, 0.06, 'square', 0.6)); },
        heal:     () => { const t = ctx.currentTime; ['g4','c5','e5','g5'].forEach((n,i)=>tone(NOTE[n], t+i*0.06, 0.1, 'triangle', 0.8)); },
        stairs:   () => { const t = ctx.currentTime; ['c5','e5','g5'].forEach((n,i)=>tone(NOTE[n], t+i*0.05, 0.07, 'square', 0.6)); },
        door:     () => { const t = ctx.currentTime; tone(0, t, 0.1, 'noise', 0.5); tone(NOTE.c4, t + 0.1, 0.12, 'square', 0.5); },
        chest:    () => { const t = ctx.currentTime; ['e5','g5','c6','e6'].forEach((n,i)=>tone(NOTE[n], t+i*0.07, 0.1, 'square', 0.7)); },
        levelup:  () => { const t = ctx.currentTime; ['c5','e5','g5','c6','g5','c6'].forEach((n,i)=>tone(NOTE[n], t+i*0.09, 0.12, 'square', 0.8)); },
        win:      () => { const t = ctx.currentTime; ['g4','c5','e5','g5','e5','g5'].forEach((n,i)=>tone(NOTE[n], t+i*0.1, 0.14, 'square', 0.8)); },
        dead:     () => { const t = ctx.currentTime; ['c4','b3','a+3','a3','g+3','g3'].forEach((n,i)=>tone(NOTE[n], t+i*0.16, 0.2, 'triangle', 0.9)); },
        flee:     () => { const t = ctx.currentTime; ['g5','e5','c5'].forEach((n,i)=>tone(NOTE[n], t+i*0.05, 0.06, 'square', 0.6)); }
    };

    return {
        get enabled() { return enabled; },
        // メニューから切り替える。オンにした瞬間は必ず操作直後なので、
        // ブラウザの「音は操作してから」という制限にも引っかからない
        toggle() {
            enabled = !enabled;
            try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {}
            if (!enabled) { stopBgm(); return enabled; }
            if (ensure() && ctx.state === 'suspended') ctx.resume();
            if (bgmWanted) this.bgm(bgmWanted);
            return enabled;
        },
        se(name) {
            if (!enabled || !SE[name]) return;
            if (!ensure()) return;
            if (ctx.state === 'suspended') ctx.resume();
            try { SE[name](); } catch (e) {}
        },
        bgm(name) {
            bgmWanted = name;
            if (!enabled) return;
            if (!ensure()) return;
            if (bgmName === name) return;
            stopBgm();
            bgmName = name;
            if (ctx.state === 'suspended') ctx.resume();
            loop(name);
        },
        stop() { bgmWanted = null; stopBgm(); }
    };
})();

// いまの場所に合う曲を選ぶ
function sceneBgm() {
    if (typeof currentMapId === 'undefined') return 'field';
    if (currentMapId === 'world') return 'field';
    const d = (typeof currentDungeon === 'function') ? currentDungeon() : null;
    if (!d) return 'field';
    if (/^ryuou/.test(currentMapId)) return 'darkcastle';
    if (d.kind === 'town') return /castle/.test(currentMapId) ? 'castle' : 'town';
    return 'cave';
}
function updateSceneBgm() { Sound.bgm(sceneBgm()); }
