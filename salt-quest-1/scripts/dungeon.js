// =====================================================================
// ダンジョン（地下マップ）
// =====================================================================
// 本家FC版のダンジョンをそのまま移植したもの（いわやま／ぬまち）。
// 地形は way78.com/dq1/fc/dn02.html・dn03.html のマップ画像から読み取った。
// 出現モンスターは Ryan8bit "Dragon Warrior Formula Guide"(GameFAQs) の
// ゾーン表と dqwiz.net の出現場所表が一致した値（B1=ゾーン19 / B2=ゾーン14）。
// 宝箱の中身・たいまつ/レミーラの仕様も上記2資料どおり。
// =====================================================================

// ダンジョンで使うタイル番号（tileset.png の通し番号）。
// 本家FC版のダンジョン画面と絵柄を1ドット単位で照合して決めた
// （pidlio.com の実画面マップと tileset.png を突き合わせ）:
//   床＝茶色いレンガ／壁＝灰色の石ブロック／階段・宝箱・とびらはレンガ縁の版。
//   階段は上りと下りで絵がちがう（本家の各階のマップで確認）
const D_FLOOR = 3;    // 床（茶色いレンガ）
const D_WALL  = 1;    // 壁（灰色の石ブロック）
const D_STAIR_DOWN = 6;   // 下り階段（段が左から右へ下がる絵）
const D_STAIR_UP   = 7;   // 上り階段（段が左から右へ上がる絵）
const D_CHEST = 4;    // 宝箱
const D_DOOR  = 5;    // かぎのかかった とびら

// 町で使うタイル番号（本家の町の実画面と絵柄を照合して決めた）
const T_GRASS = 27, T_STONE = 1, T_BRICK = 3, T_TREE = 28, T_WATER = 50,
      T_SAND = 33, T_SIGN_SHOP = 9, T_SIGN_INN = 10, T_BRIDGE = 35,
      T_COUNTER = 2,      // みせの カウンター（本家の町に宝箱は無い）
      T_POISON = 34,      // どくの ぬまち（ドムドーラ・マイラ）
      T_BARRIER = 8;      // 竜王の城の ななめ縞のゆか（本家の実画面で歩けることを確認）
// 町の記号 → タイル。ダンジョンとは別の対応表を使う
const TOWN_TILES = {
    '.': T_GRASS, '#': T_STONE, 'B': T_BRICK, 'T': T_TREE, '~': T_WATER,
    's': T_SAND, 'C': T_COUNTER, 'D': D_DOOR, 'W': T_SIGN_SHOP, 'I': T_SIGN_INN,
    '?': T_BRIDGE, 'p': T_POISON, 'x': T_BARRIER,
    'K': D_CHEST,       // みせの たな。宝箱と同じ絵だが開かない（本家の店の飾り）
    'v': D_STAIR_DOWN,  // 下りていく場所。中身は events で決める
    'E': T_BRICK, 'e': T_GRASS, 'y': T_SAND, 'b': T_BRICK   // 町の出入口。見た目はそのままで目印だけ置く
};
// 町で通れないもの。木と砂は本家でも歩ける（世界地図の森・砂漠と同じ）
const TOWN_BLOCKED = [T_STONE, T_WATER, T_SIGN_SHOP, T_SIGN_INN, T_COUNTER];

// マップ記号  # 壁 ／ . 床 ／ a b c 階段 ／ < > 地上への出入口 ／ 1〜5 宝箱
//             + とびら ／ D ドラゴン ／ P ローラ姫
const DUNGEONS = {
    // 本家「ロトのどうくつ」。地形は pidlio.com の実画面マップ(03-01/03-02)を10×10で読み取った。
    // 本家どおり敵が出ず、宝箱も石板ひとつ、かぎの扉もない「たいまつの使い方を覚える」洞窟。
    // ラダトームから北北西（gcgx.games）＝地上(36,20)
    roto1: {
        name: 'ロトの どうくつ',
        floorName: 'ちか1かい',
        depth: 1,
        noEncounter: true,          // 本家: 洞窟内では一切モンスターが出現しない
        rows: [
            '<.#....##.', '#.#.##....', '.......##.', '#.###.##..', '..#...#..#',
            '.####...##', '......#.#.', '##.#.##...', '#.....#.#.', '#.#.#...#a'
        ],
        links: { '<': ['world', 36, 20], a: ['roto2', 'a'] }
    },
    roto2: {
        name: 'ロトの どうくつ',
        floorName: 'ちか2かい',
        depth: 2,
        noEncounter: true,
        rows: [
            '..........', '.#####.###', '.....#.#..', '###.##...6', '....#.##..',
            '.#.##.#.##', '.##.#.....', '....##.##.', '#.#..#.#..', '...#...#a.'
        ],
        links: { a: ['roto1', 'a'] }
    },
    iwayama1: {
        name: 'いわやまの どうくつ',
        floorName: 'ちか1かい',
        depth: 1,
        zone: 19,
        rows: [
            'a...####......',
            '.##......#.##.',
            '.#.#######.#..',
            '.........#.#..',
            '####.#####.#..',
            '.....#b....#.1',
            '##.##.########',
            '<........#...#',
            '##.#####...#.#',
            '.....#...#....',
            '.###.#.#.###.#',
            '.......#......',
            '.#.#.###.#..c.',
            '.........#....'
        ],
        links: { a: ['iwayama2', 'a'], b: ['iwayama2', 'b'], c: ['iwayama2', 'c'],
                 '<': ['world', 37, 65] }
    },
    iwayama2: {
        name: 'いわやまの どうくつ',
        floorName: 'ちか2かい',
        depth: 2,
        zone: 14,
        rows: [
            'a.#...........',
            '..#.#.#.##.##.',
            '##23#.#.#...#.',
            '.###..###.....',
            '.....#..##.###',
            '####.#b.......',
            '.5.#.#..##.##.',
            '...#.####..#..',
            '#.##....#..#..',
            '...###....4##.',
            '.###...####.##',
            '.#...#...#....',
            '.#######.#.#c.',
            '.........#....'
        ],
        links: { a: ['iwayama1', 'a'], b: ['iwayama1', 'b'], c: ['iwayama1', 'c'] }
    },
    // 本家「ぬまちのどうくつ」。地形は way78.com/dq1/fc/dn03.html のマップ画像を6×30で読み取った。
    // 北口(0,0)＝地上(112,52)／南口(0,29)＝地上(112,57)。左端の縦通路がリムルダールへの近道で、
    // ドラゴンを避けて通り抜けられる。姫のいる区画へはドラゴンのマスを必ず通る（本家どおり）
    // =================================================================
    // 本家「ラダトーム城」。1F／2F（玉座の間）／B1（たいようのいし）の3フロア。
    // 地形は pidlio.com の実画面マップ 01-01/01-02/01-03.png を1マスずつ読み取った
    // （tileset.png と総当たりで突き合わせ、再描画して元画像と見比べて詰めてある）。
    // 人物の立ち位置とドット絵は character.png のスプライトと完全一致で特定した。
    // 宝箱の中身は pidlio の「ラダトーム城で入手できるアイテム」より。
    // マップ外が黒でなく草なのは、実機のスクリーンショット（城の最南東(31,31)の
    // 階段に立った画面）でマップ外に草原が描かれていることを確認したため
    rcastle1: {
        kind: 'town',
        name: 'ラダトームの しろ',
        floorName: '1かい',
        depth: 0,
        bright: true,
        noEncounter: true,
        start: { x: 11, y: 30 },      // 南の門を入ったところ
        exitTo: { x: 51, y: 51 },
        outside: T_GRASS,             // マップの外は草原（実機のスクリーンショットで確認）
        doorFlags: { '19,7': 'castleDoorB1', '5,14': 'castleDoorTreasure' },
        rows: [
            '................................', '.#######........#######.###.T...', '.#BBBBB#.T.TT.T.#BBBBB#.#.#.....', '.#BBBBB#........#BBBBB#.#C#.....',
            '.#BB#BB####BB####BB#BB#...TT....', '.#BBBBBBBBBBBBBBBBBBBB#.TTT.....', '.#BBBBB##########BBBBB#.........', '.#####B#BBBBBBBB###D#####B###...',
            '.#BBB#B#aBBBBB#B#BBBBBBBBBBB#...', '.#BBBBB#BBBBBBBB#BBBBBBBBBBB#...', '.#BBB#B###BBBB############BB#...', '.#####B#TTBBBBTT#BB#BB#BB#BB#...',
            '.#BBB#B#TTBBBBTT#BB#BB#BB#BB#...', '.#BBB#B#T.BBBB.T#BBBBBBBBBBB#...', '.#7BBDB#..BBBB..#BBBBBBBBBBB#...', '.#B7B#B#..BBBB..#BB#BB#BB#BB#...',
            '.#7B7#B#.BBBBBB.#BB#BB#BB#BB#...', '.#####B#.B~~~~B.##########B##...', '.#BBBBBBBB~~~~BBBBBBBB#BBBBB#...', '.#BBBBBBBB~~~~BBBBBBBB#BBBBB#...',
            '.###BB###B~~~~B##BBBBB#BBBBB#...', '.#BBBBBB#BBBBBB#BBBBBB#BBBBB#...', '.#BBBBBB##BBBB######BB#BBBBB#~..', '.#BB#BBBB#BBBB#BBBBBBB#######~..',
            '.#BBBBBBB#BBBB#BBBBBBB#~~~~~~~..', '.#B~~BB#B#BBBB#BB######~~~~~~~..', '.#~~~~BBB#BBBB#BB#BB#B#~~~~~~~..', '.#~~~~BBB##BB##BBBBBCB#~~~~~~~..',
            '.#~~~~~BB#BBBB#BB#BB#B#~~~~~~~..', '.##########BB##########~~~~~~~..', '.~~........EB........~~~~~~~~~b.', '................................'
        ],
        npcs: [
            { x: 9, y: 14, sprite: 22, lines: () => (getGameFlag('roraLove') || getGameFlag('roraRescued'))
                ? ['おんな「ひめを たすけだしてくれて', '　　　　ありがとうございます。」']
                : ['おんな「ああ ローラひめは', '　　　　いったい どこに…」'] },
            { x: 20, y: 3, sprite: 13, lines: ['へいし「とびらを あけるには カギが', '　　　　ひつようだ。」'] },
            { x: 12, y: 12, sprite: 26, lines: ['おとこ「ここ ラダトームは そのむかし', '　　　　らくえん でした。 それを', '　　　　まものたちが…」'] },
            { x: 18, y: 12, sprite: 19, lines: [['ろうじん「ゆうしゃのため', '　　　　　いのりましょう。」'], ['ろうじん「ひかりが そなたと ともに', '　　　　　ありますように…」']] },
            { x: 5, y: 22, sprite: 23, lines: ['しょうにん「わたしたちは たびの しょうにん', '　　　　　　です。 おおくのなかまが', '　　　　　　まものたちに', '　　　　　　ころされました。」'] },
            { x: 26, y: 12, sprite: 18, lines: ['けんし「わたしは ちかしつを さがしている。', '　　　　おしろの どこかに あるらしいが…」'] },
            { x: 19, y: 19, sprite: 13, lines: ['へいし「どうくつに はいるときは', '　　　　たいまつを もってゆけよ。」'] },
            { x: 3, y: 13, sprite: 13, lines: ['へいし「まことの ゆうしゃなら ぬすみなど', '　　　　せぬはずだ。」'] },
            { x: 7, y: 26, sprite: 23, lines: ['しょうにん「うわさでは まものたちに', '　　　　　　ほろぼされた まちも', '　　　　　　あるらしいです。」'] },
            { x: 25, y: 22, sprite: 18, lines: ['けんし「ガライのはかは ガライのまちに。', '　　　　まちに はいり くらやみのかべを', '　　　　おすがよい。」'] },
            { x: 25, y: 2, sprite: 23, shop: 'castle:key', name: 'かぎや', fixed: true },
            { x: 28, y: 6, sprite: 22, lines: ['おんな「あめと たいようが あわさるとき', '　　　　にじのはしが できる。」'], fixed: true },
            { x: 9, y: 7, sprite: 13, lines: ['へいし「ふっかつのじゅもんが あれば', '　　　　それをきいたときの じょうたいで', '　　　　よみがえることが できるだろう。」'], fixed: true },
            { x: 3, y: 9, sprite: 26, lines: [['おとこ「まものたちと たたかって けいけんを', '　　　　つんでください。」'], ['おとこ「そうすれば ゆうしゃとしての', '　　　　レベルが つぎつぎとあがり', '　　　　つよくなってゆくでしょう。」']], fixed: true },
            { x: 9, y: 9, sprite: 13, lines: ['へいし「たびをいちど やめたいときは', '　　　　おうにあい ふっかつのじゅもんを', '　　　　きいておくことだな。」'], fixed: true },
            { x: 27, y: 16, sprite: 13, lines: ['へいし「たいりょくに じしんが あるなら', '　　　　はいるがよい。」'], fixed: true },
            { x: 16, y: 21, sprite: 13, lines: () => (getGameFlag('roraLove') || getGameFlag('roraRescued'))
                ? ['へいし「ああ いとしのローラひめ…', `　　　　わたしは ${player.name}が にくい。」`]
                : ['へいし「ああ ローラひめは', '　　　　いったい どこに…」'], fixed: true },
            { x: 21, y: 27, sprite: 19, lightBe: true, name: 'ろうじん', fixed: true },
            { x: 10, y: 28, sprite: 13, lines: ['へいし「ラダトームの おしろに ようこそ！」'], fixed: true },
            { x: 13, y: 28, sprite: 13, lines: ['へいし「ラダトームの おしろに ようこそ！」'], fixed: true }
        ],
        links: { E: ['world', 51, 51], a: ['rcastle2', 'a'], b: ['rcastleB1', 'a'] }
    },
    rcastle2: {
        kind: 'town',
        name: 'ラダトームの しろ',
        floorName: 'たまざの ま',
        depth: -1,                    // 1階より「うえ」。階段の絵の向きに使う
        bright: true,
        noEncounter: true,
        outside: 0,                   // 玉座の間の外は石づくり（pidlio の実画面マップどおり）
        doorFlags: { '4,7': 'castleDoorThrone' },
        rows: [
            '##########', '#BBBBB9BB#', '#BCCCCCCB#', '#BCCCCBCB#', '#BBB83BBB#',
            '#BBBBBBBB#', '#BBBBBBBB#', '####D#####', '#BBBBBBBa#', '##########'
        ],
        npcs: [
            { x: 7, y: 5, sprite: 13, lines: () => (getGameFlag('roraLove') || getGameFlag('roraRescued')) ? [`へいし「おお ${player.name}！`, '　　　　すばらしき ゆうしゃよ！」'] : null,
              ask: () => (getGameFlag('roraLove') || getGameFlag('roraRescued')) ? null : ({
                  q: ['へいし「ローラひめのことを ごぞんじか？」'],
                  yes: [[`へいし「${player.name}！`, '　　　　どうか ひめを', '　　　　たすけだして ください！」']],
                  no: [['へいし「ひめさまが まものたちに', '　　　　さらわれて はんとしになる…」'],
                       ['へいし「おうさまは なにも', '　　　　おっしゃらないが', '　　　　とても くるしんでいるはず。」'],
                       [`へいし「${player.name}！`, '　　　　どうか ひめを', '　　　　たすけだして ください！」']] }) },
            { x: 3, y: 3, sprite: 11, king: true, name: 'おうさま', fixed: true },
            { x: 3, y: 6, sprite: 13, lines: [['へいし「おかねが たまったら ぶきや', '　　　　よろいを たかいものに', '　　　　かいかえることだな。」'], ['へいし「そうすれば もっと つよく', '　　　　なるだろう。」']], fixed: true },
            { x: 5, y: 6, sprite: 13, lines: ['へいし「ひとびとの はなしに みみを', '　　　　かたむけることだ。 きっと', '　　　　やくにたつだろう。」'], fixed: true },
            { x: 6, y: 3, sprite: 22, lora: true, name: 'ローラ', fixed: true }
        ],
        links: { a: ['rcastle1', 'a'] }
    },
    rcastleB1: {
        kind: 'town',
        name: 'ラダトームの しろ',
        floorName: 'ちか1かい',
        depth: 1,
        bright: true,
        noEncounter: true,
        outside: T_STONE,
        rows: [
            '##############', '##############', '###BBBBBBBB###', '##B#BBBBBB#B##',
            '##BBBBBBBBBB##', '##BBB####BBB##', '##aBB#BB#BBB##', '##BBB#*B#BBB##',
            '##BBB#BB#BBB##', '##BBBBBBBBBB##', '##B#BBBBBB#B##', '###BBBBBBBB###',
            '##############'
        ],
        npcs: [
            { x: 6, y: 8, sprite: 19, sage: true, name: 'けんじゃ', fixed: true }
        ],
        links: { a: ['rcastle1', 'b'] }
    },
    // 本家「ガライのまち」。地形は pidlio.com の実画面マップ(04-01.png)を22×22で読み取った。
    // 町の北がわ（ガライの墓への入口がある）へは、(18,11)の かぎの とびら を
    // 開けないと行けない＝本家の「鍵を持ってくることで町の北側へ入れる」と一致する
    garai: {
        kind: 'town',
        name: 'ガライの まち',
        floorName: '',
        bright: true,
        noEncounter: true,
        start: { x: 14, y: 20 },
        exitTo: { x: 10, y: 10 },
        outside: T_GRASS,
        doorFlags: { '18,11': 'garaiDoor' },   // 墓へ続く とびら だけ じゅもんに残す
        links: { e: ['world', 10, 10], t: ['garaiTomb1', '<'] },
        rows: [
            '......................', '.~~#BBBBBBBBBBBBB~~#t.', '.~~#BsssssssssssBB?BB.', '.###B#############~##.',
            '.#BBBBBBBBBBBB####~~~.', '.#B#####BBBBBB~~~#~##.', '.#B#BBB#BG3BBB#~~~~~#.', '.#B##D##B1BBBB#~#~#~#.',
            '.#BBBBBBBBBBBBBBBBBB#.', '.#BBBBBBBBBBBBBBBBBB#.', '.################BBB#.', '.~#BB#B#TTTTTTTT##D##.',
            '.~#BBCB#TT.BBB.TTTBTT.', '.##B####T..BTBBBBBBBB.', '...B.....BBBBB..B.....', '.BBBBBBBBB.B...IB###T.',
            '.TTT.B.T...BW..#BCB##.', '.####B#Ts##B##.#B####.', '.~#BBB##s#BCB#.#B#BB#.', '.~#####~##BBB#.#BBBB#.',
            '.~~~~~~~~#####e######.', '......................'
        ],
        npcs: [
            { x: 13, y: 5, sprite: 22, lines: ['おんな「おとこなんて きらいよ。', '　　　　しっしっ。」'] },
            { x: 13, y: 13, sprite: 22, lines: ['おんな「むかしがたりのまち ガライに', '　　　　ようこそ！」'] },
            { x: 13, y: 9, sprite: 19, lines: ['ろうじん「うわさでは どこかに ゆうしゃ', '　　　　　ロトのきていた よろいが', '　　　　　あるらしい。」'] },
            { x: 3, y: 11, sprite: 19, lines: ['ろうじん「ふるい いいつたえでは いだいな', '　　　　　ぎんゆう しじん ガライが', '　　　　　このまちを つくったそうじゃ。」'] },
            { x: 12, y: 8, sprite: 26, lines: ['おとこ「はるか みなみに ドムドーラの', '　　　　まちが ありました。 いまも', '　　　　あるのでしょうか……。」'] },
            { x: 19, y: 13, sprite: 26, lines: ['おとこ「わたしは きいた！ なんと ひめを', '　　　　さらったまものが ひがしのほうに', '　　　　とびさったとか！」'] },
            { x: 8, y: 18, sprite: 18, lines: ['けんし「おれは みやおうだ。 キムこうを', '　　　　さがしている。」'] },
            { x: 15, y: 2, sprite: 19, lines: ['ろうじん「たてごとは まものたちを', '　　　　　よびよせる。 ガライのはかに', '　　　　　ちかよるな！」'], fixed: true },
            { x: 4, y: 6, sprite: 13, lines: ['へいし「わたしは いそがしい。', '　　　　となりのやつに きいてくれ。」'], fixed: true },
            { x: 6, y: 6, sprite: 13, lines: ['へいし「わたしは いそがしい。', '　　　　となりのやつに きいてくれ。」'], fixed: true },
            { x: 10, y: 7, sprite: 23, lines: ['しょうにん「えーい もってけ！ どろぼう！」'], fixed: true },
            { x: 6, y: 12, sprite: 23, shop: 'garai:tools', name: 'どうぐや', fixed: true },
            { x: 18, y: 16, sprite: 23, shop: 'garai:inn', name: 'やどや', fixed: true },
            { x: 3, y: 18, sprite: 19, lines: [['ろうじん「うわさでは ローラひめは どこかの', '　　　　　どうくつに とじこめ', '　　　　　られたそうじゃ。」'], ['ろうじん「もう たすけだされたのかのお…」']], fixed: true },
            { x: 11, y: 19, sprite: 23, shop: 'garai:weapons', name: 'ぶきや', fixed: true }
        ]
    },
    // 本家「マイラのむら」。地形は pidlio.com の実画面マップ(06-01.png)を26×26で読み取った。
    // 本家どおり、ようせいのふえ は おんせん(10,3)から 南に4マス の地面に落ちている
    maira: {
        kind: 'town',
        name: 'マイラの むら',
        floorName: '',
        bright: true,
        noEncounter: true,
        start: { x: 20, y: 24 },      // 南東の すなの みち から入る
        exitTo: { x: 112, y: 18 },
        outside: T_TREE,

        events: { '10,7': 'fairyFlute' },
        links: { y: ['world', 112, 18] },
        rows: [
            'TTTTTTTTTTTTTTTTTTTTTTTTTT', 'T###.TTT#####TTTTTTTT####T', 'T#B#..TT#BBB#TTTTTT#I#BB#T', 'T#C#p.TTBB~BBssssssBBBBB#T',
            'TpBpp.TT#BBB#TsTTTT#C####T', 'Tppp..####B##TsTTTT#B#TTTT', 'T.p...#TTTTTTTsTTTT###TTTT', 'T....T#TTTTTTTsTTTTTTTT.TT',
            'TT..TT#TTTTTTTsTTTTT....TT', 'TTT######TTTTsssTTT...T..T', 'TTTTTTTT#TTTsssssTTT.T..TT', 'T#####TT#TTsssssssT######T',
            'T#BBB#TT#Tsssssssss#BB#B#T', 'T#BBB#TsDssssssssssBBBCB#T', 'T#BBB#Ts#Tsssssssss#BB#B#T', 'T#D###Bs#TTsssssssT######T',
            'T#B#BBBB#TTTsssssTTTTTTTTT', 'T#B#B#######TsssTTTTTTTTTT', 'T#BBB#BBBBB#TTsTTTT####TTT', 'T#B#B#B.B.B#TTssssssss#TTT',
            'T#B#BBBBBBB#T#####Tsss#TTT', 'T#BBB#BBBBB###BBK#Tsss#TTT', 'T##B##B.B.BBBBCBK#TTsTTTTT', 'TT...#BBBBB###BBK#TTsTTTTT',
            'TTT..#######T#####TTyTTTTT', 'TTTTTTTTTTTTTTTTTTTTTTTTTT'
        ],
        npcs: [
            { x: 15, y: 14, sprite: 26, lines: [['おとこ「みなみのしまは とても こわい', '　　　　ところです。」'], ['おとこ「じゅうぶんに ちからをつけてから', '　　　　いかないと いきて', '　　　　もどれないでしょう。」']] },
            { x: 6, y: 13, sprite: 26, lines: ['おとこ「おまえが ロトの ちをひくもの？', '　　　　なにか しょうこが あるのか？」'] },
            { x: 13, y: 11, sprite: 13, lines: ['へいし「ゴーレムは ふえのね が', '　　　　にがてだときく。」'] },
            { x: 3, y: 13, sprite: 19, lines: null, ask: { q: ['ろうじん「ふえを てにいれたか？」'], yes: [['ろうじん「メルキドのまちに ゆくがよい！」']], no: [['ろうじん「よしりーんが もっていたが', '　　　　　リムルダールにいくといって', '　　　　　むらをでて', '　　　　　それっきりかえらぬ。」']] } },
            { x: 21, y: 20, sprite: 19, lines: ['ろうじん「ここは マイラの むらです。」'] },
            { x: 7, y: 8, sprite: 18, lines: ['けんし「おれは ゆうていだ。 キムこうを', '　　　　さがしている。」'] },
            { x: 12, y: 15, sprite: 22, lines: ['おんな「どうか まものたちを たおして', '　　　　ください。」'] },
            { x: 8, y: 20, sprite: 23, lines: null, ask: { q: ['しょうにん「みなみの しまに', '　　　　　　いきましたか？」'], yes: [['しょうにん「なんと！ とても つよい', '　　　　　　まものたちが', '　　　　　　いるとききましたが」']], no: [['しょうにん「みなみには リムルダールという', '　　　　　　まちが あるらしいです。」']] } },
            { x: 21, y: 9, sprite: 19, lines: ['ろうじん「ふるい いいつたえでは', '　　　　　ようせいたちは ゴーレムを', '　　　　　ねむらせた そうじゃ。」'] },
            { x: 2, y: 2, sprite: 19, lines: () => player.weapon === 'ロトのつるぎ'
                ? [[`ろうじん「ついに てにいれたな。`, `　　　　　ゆうしゃ ${player.name}よ！」`]]
                : [['ろうじん「ロトの ちをひく ゆうしゃよ！', '　　　　　しかし そのぶきでは', '　　　　　りゅうおうを たおせまいぞ！」'],
                   ['ろうじん「また くるがよい！」']], fixed: true },
            { x: 13, y: 2, sprite: 22, lines: [['おんな「ここは ろてんぶろで', '　　　　ございまーす。」'], ['おんな「こうようは りゅうまちで', '　　　　ございまーす。」']], fixed: true },
            { x: 20, y: 5, sprite: 23, shop: 'maira:inn', name: 'やどや', fixed: true },
            { x: 23, y: 13, sprite: 23, shop: 'maira:weapons', name: 'ぶきや', fixed: true },
            { x: 21, y: 14, sprite: 18, lines: ['けんし「ドムドーラの はるかひがしに', '　　　　すばらしいぶきを うっているまちが', '　　　　あるらしい。」'], fixed: true },
            { x: 15, y: 22, sprite: 23, shop: 'maira:tools', name: 'どうぐや', fixed: true },
            { x: 2, y: 24, sprite: 13, lines: ['へいし「うわさでは リムルダールに', '　　　　カギをうるみせが あるらしい。」'], fixed: true }
        ]
    },
    // 本家「あめのほこら」。地形は pidlio.com の実画面マップ(05-01.png)を14×14で読み取った。
    // ロトの血をひく老人が、ぎんのたてごと と ひきかえに あまぐものつえ をくれる
    amehoko: {
        kind: 'town',
        name: 'あめの ほこら',
        floorName: '',
        bright: true,
        noEncounter: true,
        outside: T_STONE,
        rows: [
            '##############', '##############', '###BBBBBBBB###', '##BBBBBBBBBB##', '##BB######BB##',
            '##BB#BB#B#BB##', '##BB#rBBBBBB##', '##BB#BB#B#BB##', '##BB######BB##', '##BBBBBBBBBB##',
            '###BBBBBBBB###', '######<B######', '##############', '##############'
        ],
        npcs: [
            { x: 6, y: 6, sprite: 19, rainCloud: true, name: 'ろうじん', fixed: true }
        ],
        links: { '<': ['world', 89, 9] }
    },
    // 本家「せいなるほこら」。地形は pidlio.com の実画面マップ(10-01.png)を14×14で読み取った。
    // たいようのいし・あまぐものつえ・ロトのしるし を持っていくと にじのしずく をくれる
    seihoko: {
        kind: 'town',
        name: 'せいなる ほこら',
        floorName: '',
        bright: true,
        noEncounter: true,
        outside: T_STONE,
        rows: [
            '##############', '##############', '###BBBBBBBBB##', '###BB#B#B#BB##', '###B##BBB##B##',
            '###BBB###BBB##', '##<B#B#B#B#B##', '##BB#BBB#B#B##', '###BBB###BBB##', '###B##BBB##B##',
            '###BB#B#B#BB##', '###BBBBBBBBB##', '##############', '##############'
        ],
        npcs: [
            { x: 6, y: 7, sprite: 19, rainbowDrop: true, name: 'ろうじん', fixed: true }
        ],
        links: { '<': ['world', 116, 117] }
    },
    // 本家「リムルダールのまち」。地形は pidlio.com の実画面マップ(09-01.png)を32×31で
    // 読み取った。湖に囲まれた島の町で、かぎやへは町の外周を回って行く（本家どおり）
    rimuldar: {
        kind: 'town',
        name: 'リムルダールの まち',
        floorName: '',
        bright: true,
        noEncounter: true,
        start: { x: 30, y: 15 },
        exitTo: { x: 110, y: 80 },
        setFlagOnEnter: 'magicKey',   // ここで まほうのかぎ が買えると分かる
        outside: T_GRASS,
        rows: [
            '................................', '................................', '....~~~~~~~~~~~~~~~.............', '..~~~###TT........~~~~..........',
            '..?..BB#T.....TTT...T~~~~.......', '.~~..BB#....BBBBBBBBTT..~~~~....', '.~T#BBB#.T..B.T.BssB.....TT~....', '.~T##C##..##B###B##B..#####~....',
            '.~.#BBB#..#BBB#BBB#B..#BBB#~~...', '.~.#####..#BBB#BBB#BT.##C##s~...', '.~........#########BBBBBBB#s~...', '.~......~~T.....T..B.W#BBB#s~...',
            '.~.T.~~~~~~...BBBBBBB.#BBB#s~~..', '.~s.~~TTT~~.TBBBBBBBB.#####T.~..', '.~s~~T..T~..BBB....BB....TTTT~..', '.~sssT.T~~.BBB..T..BBBBBBBBBB?b.',
            '.~s~~TT~~..BB..TT..BBBBBBBBBB?B.', '.~s.~~~~...BB.TT.#IB..TT..TTT~..', '.~.T....T..BB..T###B#######T.~..', '.~.....TTT.BB.TT#BCB#BB#BB#.~~..',
            '.~.########BB#.T###BBBBBBB#.~...', '.~.#BBBBBBBBB#..#BBBBBB#BB#T~...', '.~.#BBBB#BBBB#.T##B###D####T~...', '.~.###BB#BBBB#.s#BBB#BB#BB#~~...',
            '.~T#BCBBBB##B#.s#BBB#BBDBw#~....', '.~T###BB#BBBB#.s###########~....', '.~~#BBBB#BBBB#TssssT..TT~~~~....', '..~#BBBBBBBBB#TT..T..~~~~.......',
            '..~###########TTTT~~~~..........', '....~~~~~~~~~~~~~~~.............', '................................'
        ],
        npcs: [
            { x: 7, y: 22, sprite: 22, lines: ['おんな「やがて このまちも まものたちに……', '　　　　ああ カミさま……」'] },
            { x: 12, y: 9, sprite: 26, lines: ['おとこ「おまえが ロトの ちをひくもの？', '　　　　なにか しょうこが あるのか？」'] },
            { x: 7, y: 24, sprite: 26, lines: ['おとこ「みなみに いっては いけません。', '　　　　もっともっと つよいまものが', '　　　　すんでいる そうです。」'] },
            { x: 23, y: 15, sprite: 22, lines: ['おんな「おいで ぼうや。', '　　　　ぱふぱふしてほしいなら', '　　　　50ゴールドよ。」'] },
            { x: 6, y: 26, sprite: 18, lines: ['けんし「りゅうおうの からだを つらぬける', '　　　　つるぎが このよに', '　　　　あるのだろうか……」'] },
            { x: 24, y: 12, sprite: 18, lines: ['けんし「りゅうおうの うろこは', '　　　　はがねのように かたいらしいぜ。」'] },
            { x: 15, y: 12, sprite: 26, lines: ['おとこ「リムルダールのまちに ようこそ！」'] },
            { x: 17, y: 27, sprite: 18, lines: () => getGameFlag('warriorRingWorn')
                ? ['けんし「ゆびわなどして', '　　　　おまえは はずかしいやつだなあ。」']
                : ['けんし「ゆびわは せんしの たしなみだ。」'] },
            { x: 9, y: 17, sprite: 13, lines: ['へいし「うわさでは ラダトームのおしろに', '　　　　たいようのいしが あるらしい。 もう', '　　　　てにいれたか？」'] },
            { x: 25, y: 20, sprite: 18, lines: () => [`けんし「いよお ${player.name}！ ${player.name}じゃないか！`, '　　　　ひさしぶりだなあ。」'] },
            { x: 28, y: 1, sprite: 26, lines: ['おとこ「ちゅん でーす。 かのじょを', '　　　　まっています。」'], fixed: true },
            { x: 3, y: 5, sprite: 23, lines: ['しょうにん「いらっしゃいませ！」'], fixed: true },
            { x: 5, y: 8, sprite: 19, shop: 'rimuldar:key', name: 'かぎや', fixed: true },
            { x: 24, y: 8, sprite: 23, shop: 'rimuldar:weapons', name: 'ぶきや', fixed: true },
            { x: 16, y: 9, sprite: 22, lines: ['おんな「あなた だれ？ でてゆかないと', '　　　　ひとをよぶわよ！」'], fixed: true },
            { x: 7, y: 14, sprite: 19, lines: [['ろうじん「ふるい いいつたえでは ロトは', '　　　　　このしまの にしのはずれに', '　　　　　にじをかけたそうじゃ。」'], ['ろうじん「そして まおうの へやの', '　　　　　かくされたる いりぐちより', '　　　　　やみにはいったときく。」']], fixed: true },
            { x: 17, y: 19, sprite: 23, shop: 'rimuldar:inn', name: 'やどや', fixed: true },
            { x: 4, y: 24, sprite: 19, lines: null, ask: { q: ['ろうじん「ここは よげんじょ。 せいなる', '　　　　　ほこらをみつけたか？」'], yes: [['ろうじん「あめと たいようが あわさる', '　　　　　ほこらじゃ。」']], no: [['ろうじん「みなみに ゆくがよい。」']] }, fixed: true },
            { x: 21, y: 24, sprite: 19, lines: ['ろうじん「わたしは よしりーん。', '　　　　　マイラのおふろから みなみに4つ', '　　　　　あるき しらべるがよい。」'], fixed: true },
            { x: 1, y: 27, sprite: 22, lines: ['おんな「もう ちゅんさまったら', '　　　　おそいわねえ。 ぷんぷん。」'], fixed: true }
        ],
        links: { b: ['world', 110, 80] }
    },
    // 本家「ドムドーラのまち」。地形は pidlio.com の実画面マップ(12-01.png)を22×22で
    // 読み取った。竜王に滅ぼされた廃墟で、本家どおり町の中でもモンスターが出る
    // （出現表は pidlio の一覧と一致するゾーン16）。ロトのよろいは東の毒沼の先の森
    domdora: {
        kind: 'town',
        name: 'ドムドーラの まち',
        floorName: '',
        bright: true,
        zone: 13,
        start: { x: 17, y: 20 },
        exitTo: { x: 33, y: 97 },
        outside: T_SAND,
        events: { '19,13': 'rotoArmor' },
        rows: [
            'ssssssssssssssssssssss', 's##ss.##s#######BB#p#s', 's#ss.T#sBBCB#T..sBpp#s', 'ssssT.##BB#B#...Bpps#s',
            'ss...pp##B###.p.BBpsss', 'sss...pp.B...T..BB.s#s', 's#.BBBspsBBBssBBsB..#s', 's#.BBBBsBBsssBBBBB.T.s',
            's..BB.sss.T......B..Ts', 's#.BB.s####s#BBB#B##.s', 'sBBsB.#BBBss#p.#BCp#ss', 'sBsBB.###C###.p#Bpp#ps',
            'sTTBBT#ssBBB#T.##p#pps', 'sT.sBT#s#B#s#TTssppT#s', 's#.BsT#BBBsssTs.####ss', 's#.BB.##BB###s..#sss#s',
            's#psB.ssTBsBBBBsBBCs#s', 'sppBB..s.BT.....#B#sss', 'sspBsBBBBs...p..#####s', 's#ppp.......ppp.ssssss',
            'sssp####.#pppp###y###s', 'ssssssssssssssssssssss'
        ],
        npcs: [],
        links: { y: ['world', 33, 97] }
    },
    // 本家「メルキドのまち」。地形は pidlio.com の実画面マップ(13-01.png)を30×31で
    // 読み取った。ゴーレムを倒さないと入れない城塞都市で、店が7つある
    melkido: {
        kind: 'town',
        name: 'メルキドの まち',
        floorName: '',
        bright: true,
        noEncounter: true,
        start: { x: 9, y: 29 },
        exitTo: { x: 81, y: 110 },
        outside: T_BRICK,
        rows: [
            'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'B###BB########BBWssssssssB###B', 'B#BBBB#BB#BBB#BBss######sB#B#B', 'B###BB#BB#BBB#BBTT#BB#B#sB#B#B',
            'BBBBBB##C#B###BBBBBBBCB#sBBBBB', 'BBBBBB#BBBBBB#BBBBBBBCB#sB###B', 'B###BB##B##BB#BBTT#BB#B#sB#B#B', 'B#BCBBsIss#BB#BBss######sB#C#B',
            'B###BBssss####BBsssssssssB#B#B', 'BBBBBBBBBBBBBBBBBBBBBBBBBBDB#B', 'BBBBBBBBBBBBBBBBBBBBBBBBB##B#B', 'B###BB###BB.~~~....BB#####BB#B',
            'B#BCBBC.#BB~~~~~...BB#B#BCBB#B', 'B###BB###BB~~T~~~..BBCB#B#BB#B', 'B#BCBBBBBBB.~~~.~~.BB########B', 'B###B####BB......?.BBBBBBBBBBB',
            'B#BBB#BB#BB......~.BBBBBBBBBBB', 'B#BBBBBB#BB.....~~.BB###BB###B', 'B########BB...~~~~~BBCB#BBBB#B', 'BBBBBBBBBBB..~~~T~~BB###BB#B#B',
            'BBBBBBBBBBB.~~~TT~~BBBBBBB###B', 'B###D####BB.~~TT~~.BB###BBBBBB', 'B#ssssss#BB..~~~~..BB#B####B#B', 'B#ssssss#BB...~~...BB#C#BBBB#B',
            'B#####ss#BBB#BBBB#BBB#B##B###B', 'B#BBB#ssDB####DD####BBB#BB#K#B', 'B#BBBCss#B#BBBBBBBB#B#BBBBCB#B', 'B#KBB#ss#B#B######B#B#B#BB#K#B',
            'B########B#BBBBBBBB#B########B', 'BBBBBBBBBb##########BBBBBBBBBB', 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
        ],
        npcs: [
            { x: 20, y: 15, sprite: 26, lines: ['おとこ「えーん。 あてが まいごの キムこう', '　　　　だす。」'] },
            { x: 5, y: 6, sprite: 13, lines: null, ask: { q: ['へいし「りゅうおうの つめは てつを', '　　　　ひきさき そして はく ほのおは', '　　　　いわをも とかすという。」'], yes: [['へいし「おお！ あなたこそ まことの', '　　　　ゆうしゃだ！」']], no: [['へいし「それが いい。 だれも おまえを', '　　　　おくびょうとは いわないだろう。」']] } },
            { x: 25, y: 17, sprite: 23, lines: [['しょうにん「むかし うちのじいさんが よく', '　　　　　　いってました。」'], ['しょうにん「ともだちの ゆきのふは', '　　　　　　じぶんのみせの うらの きに', '　　　　　　なにか うめたらしいと…」']] },
            { x: 4, y: 14, sprite: 22, lines: ['おんな「こんやの おかずは なんに', '　　　　しようかしら……」'] },
            { x: 22, y: 5, sprite: 23, shop: 'melkidoW1:weapons', name: 'ぶきや' },
            { x: 9, y: 16, sprite: 22, lines: ['おんな「ねえ わたしの ぽーとぴあと', '　　　　あなたの ドラゴンくえすとを', '　　　　かえっこしてよ。」'] },
            { x: 14, y: 28, sprite: 19, elder: true, name: 'ちょうろう' },
            { x: 15, y: 6, sprite: 13, lines: ['へいし「じょうさいのまち メルキドに', '　　　　ようこそ！」'] },
            { x: 3, y: 26, sprite: 23, lines: [['しょうにん「わたしの いえは そのむかし', '　　　　　　ドムドーラのまちで みせやを', '　　　　　　していたとか。」'], ['しょうにん「みせは まちのひがしに あり', '　　　　　　ゆきのふじいさんのとき まちが', '　　　　　　まものたちに おそわれ…」'], ['しょうにん「このまちまで', '　　　　　　にげてきました。」']] },
            { x: 22, y: 9, sprite: 13, lines: [['へいし「うわさでは ロトのよろいは ひとから', '　　　　ひとへ。」'], ['へいし「ゆきのふ というおとこの てに', '　　　　わたったそうだ。」']] },
            { x: 8, y: 3, sprite: 23, shop: 'melkido:inn', name: 'やどや', fixed: true },
            { x: 27, y: 6, sprite: 19, shop: 'melkidoKey:key', name: 'かぎや', fixed: true },
            { x: 2, y: 7, sprite: 26, shop: 'melkidoT1:tools', name: 'どうぐや', fixed: true },
            { x: 2, y: 12, sprite: 23, lines: ['しょうにん「まいど！ きょうは だいこんが', '　　　　　　やすいよ！」'], fixed: true },
            { x: 7, y: 12, sprite: 23, shop: 'melkidoT2:tools', name: 'どうぐや', fixed: true },
            { x: 24, y: 12, sprite: 13, shop: 'melkidoW2:weapons', name: 'ぶきや', fixed: true },
            { x: 22, y: 13, sprite: 22, shop: 'melkidoWater:water', name: 'せいすいや', fixed: true },
            { x: 15, y: 16, sprite: 19, lines: ['ろうじん「そなたが しるしをもとめるなら', '　　　　　このまちの しんでんにすむ', '　　　　　ちょうろうを たずねるがよい。」'], fixed: true },
            { x: 22, y: 22, sprite: 19, lines: ['ろうじん「ふるい いいつたえでは', '　　　　　ゆうしゃロトのつかった つるぎは', '　　　　　はがねをも くだいたそうじゃ。」'], fixed: true },
            { x: 27, y: 26, sprite: 23, shop: 'melkidoW3:weapons', name: 'ぶきや', fixed: true }
        ],
        links: { b: ['world', 81, 110] }
    },
    // 本家「ガライのはか」。地形は pidlio.com の実画面マップ(11-01〜04.png)を
    // 読み取った。階段の対応（A〜H）はマップ画像の青丸ラベルを1つずつ読んで確かめた。
    // 出現モンスターは pidlio の一覧12種が ゾーン7＋14＋15 の和集合と完全一致した。
    // ガライの町の北(20,1)の階段から入る。本家どおり かぎ と たいまつ が要る
    garaiTomb1: {
        name: 'ガライの はか',
        floorName: 'ちか1かい',
        depth: 1,
        zone: 14,
        rows: [
            '########################', '########################', '##........#.#1g7#....###', '##.######...#.....##..##',
            '##.#....#.#.#...#...#.##', '##.#.##...#.#.#####.#.##', '##.#....###.###.#.#...##', '##.####...#...#.#.#.#.##',
            '##....#####.#.#.#.#.#.##', '##.#..#...............##', '##.#.##.###.#####.###.##', '##.#.#......#.....#...##',
            '##.#.#.#.##.#####.....##', '##.#...#<...#...#.##..##', '##.#.#.#....#.#...##.###', '##.#.######.#####..#..##',
            '##.#...#........#####.##', '######.######.#.#.#.#.##', '##...###........#.....##', '##..#.#..#.########+####',
            '##.a..######.#...#....##', '##.............#...#..##', '########################', '########################'
        ],
        links: { '<': ['garai', 't'], a: ['garaiTomb2', 'a'] }
    },
    garaiTomb2: {
        name: 'ガライの はか',
        floorName: 'ちか2かい',
        depth: 2,
        zone: 7,
        rows: [
            '##################', '##################', '##..............##', '##.e#.#######.b.##',
            '##.##.......#a..##', '##..#######.###.##', '##..#.........#.##', '##..#.#.#.#.#.#.##',
            '##..#..f..#.#.#.##', '##..#.#.#.#####.##', '##..#.....#.....##', '##.############.##',
            '##.d#........#c.##', '##..............##', '##################', '##################'
        ],
        links: { a: ['garaiTomb1', 'a'], b: ['garaiTomb3', 'B'], c: ['garaiTomb3', 'c'],
                 d: ['garaiTomb3', 'd'], e: ['garaiTomb3', 'e'], f: ['garaiTomb3', 'f'] }
    },
    garaiTomb3: {
        name: 'ガライの はか',
        floorName: 'ちか3かい',
        depth: 3,
        zone: 15,
        rows: [
            '########################', '########################', '##...#...#........#...##', '##.k.#.....#.#.#e.#.B.##',
            '##...#.#####......#...##', '##.###.#.#.#############', '##.#...#....##...##...##', '##.#.###.#.g#.....###.##',
            '##...#...####..h..#.#.##', '##.###.#.#.##.....#.#.##', '##.#.#.#.#.#.....##...##', '##.#.#...#.#H.#####.#.##',
            '##.#.#.###.####.#...#.##', '##.#.#.#f.......#..##.##', '##.#.#.###########.#..##', '##.#.#.#....#......#c.##',
            '##.#...#..#.#.###.###.##', '##.##..#..#.#.....#...##', '##.#..#####.#####.#.#.##', '##.#d.......#.....#.#.##',
            '##.##############.###.##', '##....................##', '########################', '########################'
        ],
        links: { B: ['garaiTomb2', 'b'], c: ['garaiTomb2', 'c'], d: ['garaiTomb2', 'd'],
                 e: ['garaiTomb2', 'e'], f: ['garaiTomb2', 'f'],
                 g: ['garaiTomb4', 'g'], H: ['garaiTomb4', 'H'] }
    },
    garaiTomb4: {
        name: 'ガライの はか',
        floorName: 'ちか4かい',
        depth: 4,
        zone: 15,
        rows: [
            '###############', '###############', '#######.#######', '######...######', '#####..#..#####',
            '####..###..####', '##g..##H.....##', '####..###..####', '#####..#..#####', '######...######',
            '#######.#######', '###############', '###############'
        ],
        links: { g: ['garaiTomb3', 'g'], H: ['garaiTomb3', 'H'] }
    },
    // 本家「ラダトームのまち」。地形は pidlio.com の実画面マップ(02-01.png)を32×32で
    // 読み取り、本作のタイルで再現して元画像と見比べて詰めた。
    // 外周1マスに出ると町の外（地上の(56,49)）へ出る＝本家と同じ
    radatome: {
        kind: 'town',
        name: 'ラダトームの まち',
        floorName: '',
        bright: true,          // 町は明るい。たいまつもレミーラも要らない
        noEncounter: true,     // 町の中では敵が出ない
        start: { x: 15, y: 2 },// 北の門から入ったところ
        exitTo: { x: 56, y: 49 },
        rows: [
            '................................', '.#############sBBs#############.', '.#TTT....TTTTssEBssTTTTTTTTTTT#.', '.#TT......T.T.sBBs..T########T#.',
            '.#T.#####......BB...T#BB#B~~#T#.', '.#T.#BBB#......BBs...#BBCB~~#T#.', '.#T.#BCB#......BBs.T.#BB#B~~#T#.', '.#T.##B##..ss..BBssT.#D######.#.',
            '.#T...BW..ssss.BBs.T....T..T..#.', '.#TT..B..ssTss.BBs.....TTTTTT.#.', '.#T...B..sTTTssBB..#########T.#.', '.#T...B.sssTTTsBB..#BBB#BBB#..#.',
            '.#....B.ssTTTs.BB..#BBB#BBB#..#.', '.#TT..B..sssss.BB..##B###B##.T#.', '.TT...B....ss..BB....B...B...TT.', '.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.',
            '.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.', '.TT......B....T.B...T.....~~~TT.', '.#TT.....B...TT.B.TTTT.~~~~~~~T.', '.#T......B..TT..BTTT..~~~~~~~~~.',
            '.#.....#IB#.....B.T..~~~~~~~~~~.', '.#.######B###...BT..~~~~..~~~~~.', '.#.#BB#BBBCB#...B..~~.......~~~.', '.#.#BB#B#####.T.BBB?..........~.',
            '.#.#BBDBBBBB#.T....~..#B####T.~.', '.#.#B##B##BB#.TT..~~..#BB#B#T.~.', '.#.#BB#BB#BB#TTTT.~~~.#BBCB#.~~.', '.#.#BB#BB#BB#.TT..~~..#BB#B#.T~.',
            '.#.##########.T..~~~~.######TT~.', '.#..............~~~~~.....~~T~~.', '.####################~~~~~~~~~~.', '................................'
        ],
        // 本家のNPCの立ち位置をそのまま使う。せりふは本作のもの
        npcs: [
            { x: 10, y: 5, sprite: 19, lines: ['ろうじん「どくのぬまちに きをつけなされ。', '　　　　　ぬまちを あるくときは', '　　　　　たいりょくに', '　　　　　きをつかうようにな」'] },
            { x: 13, y: 20, sprite: 18, lines: () => [['けんし「おおくのゆうしゃが まちから', '　　　　とおくに たびにでて そして', '　　　　しんだ。」'], [`けんし「ゆうしゃ ${player.name}よ おまえを`, '　　　　しなせたくないものだな」']] },
            { x: 16, y: 10, sprite: 23, lines: ['しょうにん「どうか まものたちを たおして', '　　　　　　ください。」'] },
            { x: 26, y: 23, sprite: 26, lines: [['おとこ「ラダトームのおしろのみなみから', '　　　　うみのむこうに おしろが', '　　　　みえるでしょう。」'], ['おとこ「りゅうおうは そのしろに', '　　　　いるとか…。おお こわい…。」']] },
            { x: 11, y: 15, sprite: 26, lines: ['おとこ「このまちの ずっと きたにいき', '　　　　うみべを にしにあるくと', '　　　　ガライのまちが あるそうです。」'] },
            { x: 25, y: 5, sprite: 22, shop: 'radatomeWater:water', name: 'せいすいや' },
            { x: 27, y: 16, sprite: 13, lines: ['へいし「たたかいで けいけんを つみ', '　　　　レベルが あがったときは おうさまに', '　　　　あいに いけよ。」'] },
            { x: 16, y: 25, sprite: 22, lines: ['おんな「いーえ わたしは', '　　　　ローラひめじゃないわ。」'] },
            { x: 20, y: 19, sprite: 18, lines: ['けんし「おまえが ロトの ちをひくもの？', '　　　　なにか しょうこが あるのか？」'] },
            { x: 4, y: 27, sprite: 18, lines: ['けんし「うわさでは ガライのはかに', '　　　　ぎんのたてごとが あるらしい…」'] },
            { x: 6, y: 5, sprite: 23, shop: 'radatome:weapons', name: 'ぶきや', fixed: true },
            { x: 29, y: 2, sprite: 18, lines: [['けんし「はしに きをつけろ！」'], ['けんし「はしをわたって とおくにいくほど', '　　　　おそろしい まものたちが', '　　　　あらわれるだろう。」']], fixed: true },
            { x: 5, y: 8, sprite: 22, lines: ['おんな「いらっしゃいませ。 なかにすすみ', '　　　　つくえ ごしに', '　　　　はなしかけてくださいな。」'], fixed: true },
            { x: 21, y: 11, sprite: 26, lines: ['おとこ「うわさでは どこかに まほうの', '　　　　カギをうってる まちが', '　　　　あるらしいですよ。」'], fixed: true },
            { x: 25, y: 11, sprite: 19, cure: true, name: 'ろうじん', fixed: true },
            { x: 2, y: 14, sprite: 26, lines: ['おとこ「ラダトームのまちに ようこそ。」'], fixed: true },
            { x: 11, y: 22, sprite: 23, shop: 'radatome:inn', name: 'やどや', fixed: true },
            { x: 21, y: 24, sprite: 26, lines: ['おとこ「そこの へこんだところから なかへ', '　　　　すすんでください。」'], fixed: true },
            { x: 26, y: 26, sprite: 23, shop: 'radatome:tools', name: 'どうぐや', fixed: true },
            { x: 11, y: 27, sprite: 13, lines: () => (getGameFlag('roraLove') || getGameFlag('roraRescued'))
                ? [['へいし「わたしに さわるのは だれだ？', '　　　　もう なにも みえぬ…', '　　　　もう なにも きこえぬ…」']]
                : [['へいし「おうさまに つたえてくれ', '　　　　ローラひめの そうさくたいは', '　　　　ぜんめつしたと…」'],
                   ['へいし「わたしも もう だめだ… ぐぶっ…」']], fixed: true }
        ],
        links: { E: ['world', 56, 49] }
    },
    numachi: {
        name: 'ぬまちの どうくつ',
        floorName: 'ちか1かい',
        depth: 1,
        zone: 19,
        rows: [
            '<.....', '.##.##', '.#..#.', '.##...', '....#.',
            '.#.##.', '..##..', '.##...', '....#.', '.#.##.',
            '.#....', '.#..#.', '.#.##.', '.#....', '.###D#',
            '.#....', '.#.###', '.#.#..', '.#.#.P', '.#.#..',
            '.#.##+', '.#....', '.#####', '....#.', '.##.#.',
            '..#...', '#...##', '###...', '..#.#.', '>...#.'
        ],
        links: { '<': ['world', 112, 52], '>': ['world', 112, 57] }
    },

    // =================================================================
    // りゅうおうの しろ（1かい〜ちか7かい）
    // 地形は pidlio.com の実画面マップ 14-01〜14-08 を16pxタイルで読み取り、
    // famicom-database.com の実機マップ(DUNJEON_5_1〜8)と突き合わせて確定した。
    // 階段のつながりは pidlio の A〜U のラベル、出現モンスターは両サイトの
    // フロア別リストがゾーン16/17/18とちょうど一致する。
    // =================================================================
    ryuou1: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: '1かい',
        depth: 0,
        zone: 16,
        outside: T_TREE,
        start: { x: 10, y: 20 },
        exitTo: { x: 56, y: 56 },
        rows: [
            'TTTTTTTTTTTTTTTTTTTTTT', 'TTT###TT###########TTT', 'TT##B##T#xxAxx#BBB##TT', 'T##BBB###xCCCx#B#BB##T',
            'T#BB#BBB#xCxCx#BBBBB#T', 'T#B####B#xxxxx##B##B#T', 'T#B#BBBB#xxxxx#BBB#B#T', 'T#B##B#B##BBB##B#BBB#T',
            'T#B#BBBBB##x##BBBBBB#T', 'T#B#####B#BBB######B#T', 'T#B#xxx#B##x###xxx#B#T', 'T#B#x#x#B#BBB##x#x#B#T',
            'T#B#xxx#B##x###xxx#B#T', 'T#B#x#x#BBBBB##x#x#B#T', 'T#B#xxx########xxx#B#T', 'T#B##c##BBBBBB##f##B#T',
            'T#BB###BB#BB#BB###BB#T', 'T##BBBBBBBBBBBBBBBB##T', 'TT##BBB###BB###BBB##TT', 'TTT#####T#BB#T#####TTT',
            'TTTTTTTTT#EB#TTTTTTTTT', 'TTTTTTTTTTTTTTTTTTTTTT'
        ],
        links: { A: ['ryuouB1','A'], c: ['ryuouB1','c'], f: ['ryuouB1','f'], E: ['world', 56, 56] }
    },
    ryuouB1: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか1かい',
        depth: 1,
        zone: 16,
        outside: T_STONE,
        rows: [
            '########################', '########################', '##BBBBBBBB#A#BBB#BBBBB##', '##B#####BB#BBB#B#i###B##',
            '##B#BBB##B#####B###BBB##', '##B#BBBB#BBBBBBB##BB#B##', '##B#lB#B##BBBBB##BB#####', '##B####BB#######BB##BB##',
            '##BBBB##B#BBBB#BB##BBB##', '####BB#BB##BB##FB#BB#m##', '##B##B#B##BBBB####BB####', '##BBBB#B#BB##BB#H##B#B##',
            '##B####B#BB##BB#BB#B#B##', '##B#BBBB##BBBB##BB#.#.##', '##B#B#BBB##BB##BB##B#B##', '##B#B###B#cBBB#BBBBB#B##',
            '##B#o#BBB########B###B##', '##B###B###BBBBBBBB#fBB##', '##B#BBBBBBB####B###BBB##', '##B#BB####BBB#BBBB#BBB##',
            '##B####BB###B####BBB#B##', '##BBBBBBBBJ#BBBBBB#BBB##', '########################', '########################'
        ],
        links: { A: ['ryuou1','A'], c: ['ryuou1','c'], f: ['ryuou1','f'],
                 i: ['ryuouB2','i'], l: ['ryuouB2','l'], F: ['ryuouB2','F'], m: ['ryuouB2','m'],
                 H: ['ryuouB2','H'], o: ['ryuouB2','o'], J: ['ryuouB2','J'] }
    },
    ryuouB2: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか2かい',
        depth: 2,
        zone: 17,
        outside: T_STONE,
        rows: [
            '##############', '##############', '##lB#q#JB#iB##', '##o##B##B##L##',
            '####BBB#BB####', '##BBB####BBB##', '##B###FB#B#B##', '##B#B#BS###B##',
            '##BBB####BBB##', '####BB#BBB####', '##M##B##B##m##', '##BN#BBBB#HB##',
            '##############', '##############'
        ],
        links: { i: ['ryuouB1','i'], l: ['ryuouB1','l'], F: ['ryuouB1','F'], m: ['ryuouB1','m'],
                 H: ['ryuouB1','H'], o: ['ryuouB1','o'], J: ['ryuouB1','J'],
                 q: ['ryuouB3','q'], L: ['ryuouB3','L'], M: ['ryuouB3','M'], N: ['ryuouB3','N'] }
    },
    ryuouB3: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか3かい',
        depth: 3,
        zone: 17,
        outside: T_STONE,
        rows: [
            '##############', '##############', '##BBBBBB#qBB##', '##B###BB###B##',
            '##B#L#BBBBBB##', '##B#B###B##B##', '##B#BB#MBB#B##', '##B##B###B#B##',
            '##BO#BBB###B##', '#######BBP#B##', '##BBBB#####B##', '##NB#BBBBBBB##',
            '##############', '##############'
        ],
        links: { q: ['ryuouB2','q'], L: ['ryuouB2','L'], M: ['ryuouB2','M'], N: ['ryuouB2','N'],
                 O: ['ryuouB4','O'], P: ['ryuouB4','P'] }
    },
    ryuouB4: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか4かい',
        depth: 4,
        zone: 17,
        outside: T_STONE,
        rows: [
            '##############', '##############', '##BBBBBBBBBB##', '##B######BQB##',
            '##B#RBBBBBBB##', '##B####BBB#B##', '##BBBB#BBB#B##', '##B##B###B#B##',
            '####BBBB#B#B##', '###BBB#B#P#B##', '##BBB##B###B##', '##OB##BBBBBB##',
            '##############', '##############'
        ],
        links: { O: ['ryuouB3','O'], P: ['ryuouB3','P'], Q: ['ryuouB5','Q'], R: ['ryuouB5','R'] }
    },
    ryuouB5: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか5かい',
        depth: 5,
        zone: 18,
        outside: T_STONE,
        rows: [
            '##############', '##############', '##t#B#QBBB#R##', '##B#B####B#B##',
            '##B#BBBB#B#B##', '##B#B##B#B#B##', '##B#B#BB#B#B##', '##B#B#Bu#B#B##',
            '##B#B####B#B##', '##B#BBBBBB#B##', '##B########B##', '##BBBBBBBBBB##',
            '##############', '##############'
        ],
        links: { Q: ['ryuouB4','Q'], R: ['ryuouB4','R'], t: ['ryuouB6','t'], u: ['ryuouB6','u'] }
    },
    ryuouB6: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか6かい',
        depth: 6,
        zone: 18,
        outside: T_STONE,
        stairKind: { Z: 'down' },   // 本家の「ループ階段」。降りても同じ階に戻る
        rows: [
            '##############', '##############', '##uBBBBBBBBZ##', '##############', '##############', '##############', '###BBBBBBBB###',
            '###BBBBBBBB###', '##tBBBBBBBBU##', '###BBBBBBBB###', '###BBBBBBBB###', '##############', '##############', '##############'
        ],
        links: { t: ['ryuouB5','t'], u: ['ryuouB5','u'], U: ['ryuouB7','U'], Z: ['ryuouB6','u'] }
    },
    ryuouB7: {
        kind: 'town',
        dark: true,          // 本家どおり まっくら。たいまつ／レミーラが要る
        name: 'りゅうおうの しろ',
        floorName: 'ちか7かい',
        depth: 7,
        zone: 18,
        outside: T_WATER,
        rows: [
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', '~~~~####~~~~~~~#########~###~~~~', '~~~##BB#########BBB#BBB###B##~~~',
            '~~##BBBB##BBBB#BBBBBBBBB#BBB##~~', '~~#BBBBBB##BB##BBBB#BBBB#B#BB#~~', '~~#BB#BBB#BBBBBBBB###BBBBBBBB#~~', '~~#BBBBBB#BBBB#####B#####B#BB#~~',
            '~~##BBBB##BBBB#BBB###BBB#BBB##~~', '~~~##BB##BBBBB##BBBBBBB###B##s~~', '~~~~#B##BB#######BB#BB##s#B#ss~~', '~~~~#BBBBB#BBBBB##BBB##ssssss~~~',
            '~~~~#B#####B1BBB###B##ss~sss~~~~', '~~~~#B#BBB#Bd9BBBBDB#ss~~~~s?s~~', '~~~~#B#B#B#Bwj1B###B##s~~~~~~.~~', '~~~~#B#BBB#BBBBB##BBB#~~.s~~T.~~',
            '~~~~#B#B#B#######BBB##~s~Ts?s~~~', '~~~~#B#BBB##BBBBBBB##~~~~..~~~~~', '~~~~#B#B#B#BBB###B##~~~s~~Ts~~~~', '~~~~#B#BBB#BB##~###~~~ss~sT.~s~~',
            '~~~~#B#B#B#B##~~~~~~~ss~~ss.ss~~', '~~~~#B#BBB#B#~~~###~~~~~ssTTs~~~', '~~~##B##B##B##~##B##~~~ss..Tss~~', '~~##BBB#B#BBB###BBB##~~s##B##s~~',
            '~~#BBBBBBBBBB##BCCBB#####BBB#s~~', '~~#BB#BB##BBB#BBCBBBBBBBBBBB#.~~', '~~#BBBBB###B###BCCBB#####BBB#.~~', '~~##BBB##~#B#~##BBB##~~T#####s~~',
            '~~~##B##~~#B#~~##B##~~~ssTTTss~~', '~~~~###~~T#B#T~~###~~~~~sssss~~~', '~~~~~~~~TT#U#TT~~~~~~~~~~~~~~~~~', '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
            '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
        ],
        npcs: [
            { x: 17, y: 25, sprite: 27, dragonLord: true, name: 'りゅうおう', fixed: true }
        ],
        links: { U: ['ryuouB6','U'] }
    }
};

// 宝箱の中身（本家 dn02.html より）
//   1 やくそう ／ 2 せんしのゆびわ ／ 3 たいまつ
//   4 10〜17ゴールド ／ 5 100〜131ゴールド（1/32で しのくびかざり）
const CHEST_TABLE = {
    '1': () => ({ tool: 'herb', name: 'やくそう' }),
    '2': () => ({ item: 'せんしのゆびわ', flag: 'warriorRing' }),
    '3': () => ({ tool: 'torch', name: 'たいまつ' }),
    // 岩山の洞窟 B2 のゴールド。pidlio の一覧は「10〜17G」（way78 は実測の一例として15G）
    '4': () => ({ gold: 10 + Math.floor(Math.random() * 8) }),
    // ラダトーム城（pidlio.com の「ラダトーム城で入手できるアイテム」より）
    //   1F の4つはどれも 6〜13ゴールド／2F は 120ゴールド・たいまつ・かぎ／B1 はたいようのいし
    '7': () => ({ gold: 6 + Math.floor(Math.random() * 8) }),
    '8': () => ({ gold: 120 }),
    '9': () => ({ tool: 'key', name: 'まほうのかぎ' }),
    '*': () => ({ item: 'たいようのいし', flag: 'sunStone' }),
    // ガライの町（10〜17ゴールド）／リムルダールの町（キメラのつばさ）
    'G': () => ({ gold: 10 + Math.floor(Math.random() * 8) }),
    'w': () => ({ tool: 'wing', name: 'キメラのつばさ' }),
    // ほこらの宝箱。本家では老人が前に立ちはだかっていて、条件を満たすと
    // 老人が消えて自分で開ける。攻略サイトの文章は雨・聖どちらも「老人にもらえる」と
    // 要約しているが、pidlio の実画面マップ(05-01/10-01)には老人の隣に宝箱が写っている。
    // 雨は老人の左、聖は老人の右。文章だけ見て「もらう」に変えないこと
    // ガライの墓（pidlio.com の「ガライの墓で入手できるアイテム」より）
    'g': () => ({ gold: 5 + Math.floor(Math.random() * 16) }),
    'k': () => ({ item: 'のろいのベルト', flag: 'cursedBelt' }),
    'h': () => ({ item: 'ぎんのたてごと', flag: 'silverHerp' }),
    'r': () => ({ item: 'あまぐものつえ', flag: 'rainCloudStuff' }),
    'n': () => ({ item: 'にじのしずく',   flag: 'rainbowDrop' }),
    // 本家ROM(search.j の case $0E)は rand&$1F==0 ＝ 1/32。1/16 は誤りだった
    '5': () => (!getGameFlag('deathNecklace') && Math.floor(Math.random() * 32) === 0)
              ? { item: 'しのくびかざり', flag: 'deathNecklace' }
              : { gold: 100 + Math.floor(Math.random() * 32) },
    // 竜王の城（pidlio.com／famicom-database.com の「竜王の城で入手できるアイテム」より）
    //   B2 ロトのつるぎ ／ B7 やくそう2・500〜755G・キメラのつばさ・まほうのかぎ・のろいのベルト
    'S': () => ({ weapon: 'ロトのつるぎ', flag: 'rotoSword' }),
    'd': () => ({ gold: 500 + Math.floor(Math.random() * 256) }),
    'j': () => ({ item: 'のろいのベルト', flag: 'cursedBelt2' }),
    // ロトの洞窟の石板。本家どおり、読むだけでアイテムにはならない
    '6': () => ({ read: [
        ['たからばこの なかには', 'いしばんが おさめられていた'],
        ['「わたしの なは ロト', '　わたしの ちを ひきし ものよ'],
        ['　ラダトームから みえる まのしま', '　そこへ わたるには', '　3つのものが ひつようだった'],
        ['　わたしは それらを あつめ', '　まのしまへ わたり', '　まおうを たおした'],
        ['　いま その3つの しんぴを', '　3にんの けんじゃに たくす'],
        ['　かれらの しそんが', '　それらを まもってゆくだろう」']
    ] })
};

// ダンジョンごとの、その場所で起きること
const DUNGEON_EVENTS = { D: 'dragon', P: 'rora' };
// とびらは「開けた」ことをじゅもんに残すのでフラグで持つ
const DUNGEON_DOORS = { numachi: 'numachiDoor' };   // それ以外のとびらは出るまで覚える

// 記号の並びから、描画用のタイル配列・階段・宝箱・とびら・イベントの位置を組み立てる
function buildDungeon(d, id) {
    d.grid = []; d.marks = {}; d.chestAt = {}; d.doorAt = {}; d.eventAt = {};
    if (d.kind === 'town') {                       // 町・城は記号の対応表がちがう
        d.rows.forEach((row, y) => {
            const line = [];
            [...row].forEach((ch, x) => {
                const at = x + ',' + y;
                if (CHEST_TABLE[ch] && ch !== '.') { line.push(D_CHEST); d.chestAt[at] = ch; return; }
                // 階段・門。TOWN_TILES にある記号は見た目をそのままにして目印だけ置く
                if (d.links && d.links[ch]) {
                    d.marks[ch] = { x, y };
                    if (TOWN_TILES[ch] !== undefined) { line.push(TOWN_TILES[ch]); return; }
                    const forced = (d.stairKind || {})[ch];
                    if (forced) { line.push(forced === 'down' ? D_STAIR_DOWN : D_STAIR_UP); return; }
                    const link = d.links[ch];
                    const toDepth = (link[0] === 'world') ? 0 : (DUNGEONS[link[0]].depth || 0);
                    line.push(toDepth > (d.depth || 0) ? D_STAIR_DOWN : D_STAIR_UP);
                    return;
                }
                if (ch === 'D') { line.push(D_DOOR); d.doorAt[at] = (d.doorFlags || {})[at]; return; }
                line.push(TOWN_TILES[ch] !== undefined ? TOWN_TILES[ch] : T_GRASS);
            });
            d.grid.push(line);
        });
        d.npcAt = {};
        (d.npcs || []).forEach(n => { d.npcAt[n.x + ',' + n.y] = n; });
        Object.assign(d.eventAt, d.events || {});
        return;
    }
    d.rows.forEach((row, y) => {
        const line = [];
        [...row].forEach((ch, x) => {
            const at = x + ',' + y;
            if (ch === '#') line.push(D_WALL);
            else if (ch === '.') line.push(D_FLOOR);
            else if (CHEST_TABLE[ch] && !(d.links && d.links[ch])) { line.push(D_CHEST); d.chestAt[at] = ch; }
            else if (ch === '+') { line.push(D_DOOR); d.doorAt[at] = DUNGEON_DOORS[id]; }
            else if (DUNGEON_EVENTS[ch]) { line.push(D_FLOOR); d.eventAt[at] = DUNGEON_EVENTS[ch]; }
            else {
                // 本家は上りと下りで絵がちがう。行き先が今より浅ければ上り
                const link = d.links[ch];
                const toDepth = (!link || link[0] === 'world') ? 0 : (DUNGEONS[link[0]].depth || 0);
                line.push(toDepth > (d.depth || 0) ? D_STAIR_DOWN : D_STAIR_UP);
                d.marks[ch] = { x, y };
            }
        });
        d.grid.push(line);
    });
}
for (const id in DUNGEONS) buildDungeon(DUNGEONS[id], id);

// =====================================================================
// 現在いるマップ
// =====================================================================
var worldMapData = (typeof mapData !== 'undefined') ? mapData : null;
let currentMapId = 'world';

function currentDungeon() { return currentMapId === 'world' ? null : DUNGEONS[currentMapId]; }
function inDungeon() { return currentMapId !== 'world'; }
// 町は「地上ではないが暗くもない」。たいまつ・レミーラ・リレミトは効かない
// 町の記号で組んだマップか（タイルの意味・移動・人との会話に使う）
function isTownMap() { const d = currentDungeon(); return !!(d && d.kind === 'town'); }
// 「あかるい町」か（たいまつ・レミーラ・リレミトが要らない場所）。
// 竜王の城は町の記号で組んであるが本家どおり まっくら なので町あつかいにしない
function inTown() { const d = currentDungeon(); return !!(d && d.kind === 'town' && !d.dark); }
function inCave() { return inDungeon() && !inTown(); }
// 町の人。足元ではなく「隣に立って話しかける」
function npcAt(x, y) {
    const d = currentDungeon();
    if (!d || !d.npcAt) return null;
    if (hiddenNpcs.has(currentMapId + ':' + x + ',' + y)) return null;
    const n = d.npcAt[x + ',' + y] || null;
    // ローラ姫は、城へ連れ帰ったあとだけ玉座の横に現れる
    if (n && n.lora && !getGameFlag('roraLove')) return null;
    return n;
}
// =====================================================================
// 町の人が歩く（本家どおり）
// 本家の町人はその場をうろうろ歩き回る。実画面マップで人の位置が
// 妙な場所（カウンターの奥・湖の対岸）に写っているのは、たまたまその
// 瞬間を捉えた一枚だから。
// 役目のある人（店・王様・けんじゃ・のろいを解く老人・ほこらの老人・
// りゅうおう）と、カウンターや玉座の上に立っている人は動かない。
// =====================================================================
function npcWanders(d, n) {
    // 本家ROMは「歩く人(mobile)」と「立つ人(static)」を別の表で持っている。
    // fixed は static の人（tbl_npcs.s の tbl_npcs_static 側）
    if (n.fixed || n.lora) return false;
    if (n.shop || n.king || n.sage || n.cure || n.lightBe
        || n.rainCloud || n.rainbowDrop || n.dragonLord) return false;
    const t = d.grid[n.y] && d.grid[n.y][n.x];
    if (t === T_COUNTER) return false;        // カウンター・玉座の上の人は動かない
    // カウンター越しに話しかける人も動かない。動かれると、
    // 「カウンターの1マス先を見る」判定から外れて一生話せなくなる
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]])
        if (d.grid[n.y + dy] && d.grid[n.y + dy][n.x + dx] === T_COUNTER) return false;
    // 本家の配置どおり、袋小路や一本道に立っている人はそのまま動かさない
    // （そこから歩き出すと、せまい所をふさいだまま戻れなくなる）
    const h = n.home || n;
    if (npcStandLevel(d, h.x, h.y) < 2) return false;
    return true;
}
// 町の人が立ってよいマスか。0=だめ ／ 1=急ぎのときだけ ／ 2=いつでも
// 「そこに人が立つと通れる範囲が分断されるマス」や行き止まりに入られると、
// 勇者の行く手をふさいだまま動けなくなる（階段前の一本道など）。
// 判定は人が実際に歩ける範囲で行う。人は町の外周（踏むと町の外）や
// 階段・とびら・宝箱のマスには入れないので、そこは道として数えない。
// 地形だけで決まるので、マップごとに一度だけ調べて覚えておく
function npcStandLevel(d, x, y) {
    if (!d.standable) {
        const g = d.grid, H = g.length, W = g[0].length;
        const edge = d.exitTo ? 1 : 0;
        const walk = (px, py) => {
            if (px < edge || py < edge || px >= W - edge || py >= H - edge) return false;
            const t = g[py][px];
            if (t === undefined || TOWN_BLOCKED.includes(t)) return false;
            if (t === D_CHEST || t === D_DOOR || t === D_STAIR_DOWN || t === D_STAIR_UP) return false;
            for (const m in d.marks) if (d.marks[m].x === px && d.marks[m].y === py) return false;
            return true;
        };
        const cells = [];
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (walk(xx, yy)) cells.push([xx, yy]);
        // 1マスふさいだ状態で、startから何マス行けるか
        const fill = (start, skipX, skipY) => {
            const seen = new Set([start.join(',')]); const q = [start];
            while (q.length) {
                const [cx, cy] = q.pop();
                for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                    const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny;
                    if (seen.has(k) || (nx === skipX && ny === skipY) || !walk(nx, ny)) continue;
                    seen.add(k); q.push([nx, ny]);
                }
            }
            return seen;
        };
        // とびらや階段で仕切られた部屋は人から見ると別の区画。区画ごとに数える
        const area = {};
        for (const [cx, cy] of cells) {
            if (area[cx + ',' + cy] !== undefined) continue;
            const seen = fill([cx, cy], -1, -1);
            for (const k of seen) area[k] = seen.size;
        }
        d.standable = {};
        for (const [cx, cy] of cells) {
            const open = [];
            for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]])
                if (walk(cx + dx, cy + dy)) open.push([cx + dx, cy + dy]);
            // 行き止まりは論外。ふさいでも区画がつながったままなら、いつでも立ってよい
            d.standable[cx + ',' + cy] = open.length < 2 ? 0
                : (fill(open[0], cx, cy).size === area[cx + ',' + cy] - 1 ? 2 : 1);
        }
    }
    return d.standable[x + ',' + y] || 0;
}
// そのマスへ歩いて入れるか（人どうし・勇者とは重ならない）
function npcCanStep(d, mapId, x, y, allowTight) {
    const g = d.grid;
    if (!g[y] || g[y][x] === undefined) return false;
    if (TOWN_BLOCKED.includes(g[y][x])) return false;
    if ([D_DOOR, D_CHEST, D_STAIR_DOWN, D_STAIR_UP].includes(g[y][x])) return false;  // 出入口はふさがない
    if (d.marks && Object.values(d.marks).some(m => m.x === x && m.y === y)) return false;
    if (d.exitTo) {                            // 外周は踏ませない（町から出てしまう）
        const W = g[0].length, H = g.length;
        if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) return false;
    }
    if (d.npcAt[x + ',' + y]) return false;
    if (mapId === currentMapId && playerPosition.x === x && playerPosition.y === y) return false;
    // ふだんは「通り道を分断しないマス（level 2）」にしか立たない。
    // allowTight のときだけ level 1（通り道を分断するが行き止まりではないマス）も許す。
    // level 0（行き止まり）はどんなときも入れない。入ると出られなくなるため
    if (npcStandLevel(d, x, y) < (allowTight ? 1 : 2)) return false;
    return true;
}
const NPC_STEP_MIN = 40, NPC_STEP_MAX = 110;   // 次に動くまでのフレーム数
const NPC_ROAM = 2;                            // もとの場所からこのマス数までで うろつく（本家も部屋の中をうろうろする程度）
// 全滅して玉座の間へ運ばれたときなど、決まった場所に置かれると
// そこに町の人が立っていることがある。重なったままにせず、すぐ どいてもらう。
// どかすのは歩き回る人だけ（店の人やほこらの老人は立ち位置に意味がある）
function npcMakeWayForPlayer() {
    const d = currentDungeon();
    if (!d || !d.npcAt) return;
    const here = d.npcAt[playerPosition.x + ',' + playerPosition.y];
    if (!here) return;
    if (hiddenNpcs.has(currentMapId + ':' + here.x + ',' + here.y)) return;
    if (here.home === undefined) { here.home = { x: here.x, y: here.y }; here.wait = 0; here.roams = npcWanders(d, here); }
    if (!here.roams) return;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = here.x + dx, ny = here.y + dy;
        if (!npcCanStep(d, currentMapId, nx, ny, true)) continue;
        delete d.npcAt[here.x + ',' + here.y];
        here.x = nx; here.y = ny; d.npcAt[nx + ',' + ny] = here;
        return;
    }
}
function stepTownNpcs() {
    const d = currentDungeon();
    if (!d || !d.npcs) return;
    npcMakeWayForPlayer();
    for (const n of d.npcs) {
        if (n.home === undefined) { n.home = { x: n.x, y: n.y }; n.wait = 0; n.roams = npcWanders(d, n); }
        if (!n.roams) continue;
        if (hiddenNpcs.has(currentMapId + ':' + n.x + ',' + n.y)) continue;
        if (--n.wait > 0) continue;
        n.wait = NPC_STEP_MIN + Math.floor(Math.random() * (NPC_STEP_MAX - NPC_STEP_MIN));
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]].sort(() => Math.random() - 0.5);
        // 勇者がすぐ隣にいるなら、その人は道をふさいでいる可能性が高い。
        // うろつく範囲も「広い場所だけ」の決まりも外して、とにかく どく。
        // 今いるマスが狭い（通り道を分断する）ときも同じ。ここを許さないと、
        // どいた先の狭いマスから二度と出られず、一本道で勇者を永久にふさぐ
        // ——マイラの北の小道(9,2)で実際に起きた
        const tight = npcStandLevel(d, n.x, n.y) < 2;
        const blocking = Math.abs(n.x - playerPosition.x) + Math.abs(n.y - playerPosition.y) === 1;
        const near = [], far = [];
        for (const [dx, dy] of dirs) {
            const nx = n.x + dx, ny = n.y + dy;
            if (!npcCanStep(d, currentMapId, nx, ny, tight || blocking)) continue;
            if (Math.abs(nx - n.home.x) > NPC_ROAM || Math.abs(ny - n.home.y) > NPC_ROAM) far.push([nx, ny]);
            else near.push([nx, ny]);
        }
        // 狭いマスにいるときは、広いマスへ抜けられる向きを先に選ぶ
        if (tight) {
            const wide = c => npcStandLevel(d, c[0], c[1]) === 2 ? 1 : 0;
            near.sort((a, b) => wide(b) - wide(a));
            far.sort((a, b) => wide(b) - wide(a));
        }
        const pick = near.length ? near[0] : ((tight || blocking) && far.length ? far[0] : null);
        if (!pick) continue;
        const [nx, ny] = pick;
        delete d.npcAt[n.x + ',' + n.y];
        n.x = nx; n.y = ny;
        d.npcAt[nx + ',' + ny] = n;
    }
}

function adjacentNpc() {
    if (!isTownMap()) return null;
    const g = currentDungeon().grid;
    const found = [];
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const x = playerPosition.x + dx, y = playerPosition.y + dy;
        const n = npcAt(x, y);
        if (n) found.push(n);
        // 本家の店はカウンター越しに話す。1マス先も見る
        if (g[y] && g[y][x] === T_COUNTER) {
            const far = npcAt(x + dx, y + dy);
            if (far) found.push(far);
        }
    }
    if (!found.length) return null;
    // 何人も近くにいるときは、用のある人（店・王様・けんじゃ）を先に拾う
    return found.find(n => n.shop || n.king || n.sage || n.cure || n.lightBe
                        || n.rainCloud || n.rainbowDrop) || found[0];
}
// 町は外周1マスに出ると外へ出る（本家と同じ）
function townEdgeExit(x, y) {
    const d = currentDungeon();
    if (!d || d.kind !== 'town') return null;
    const W = d.grid[0].length, H = d.grid.length;
    // 階段の上では外へ出さない（城の外れにある地下への階段が外周に近い）
    for (const m in d.marks) if (d.marks[m].x === x && d.marks[m].y === y) return null;
    return (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) ? d.exitTo : null;
}
function mapWraps() { return currentMapId === 'world'; }   // 地上だけ端がつながっている

// 明かり。たいまつは一度つければダンジョンを出るまで消えない（本家どおり）
let torchLit = false;
let radiantSteps = 0;          // レミーラの残り歩数（本家は合計200歩）
const RADIANT_STEPS = 200;
const AUTO_LIGHT = 8;          // オート中の見え方（画面いっぱい。開発用の便宜）
function lightRadius() {
    const d = currentDungeon();
    if (d && d.bright) return Infinity;      // 町は明るい
    // オート中は真っ暗だと何をしているか分からないので、明かり無しでも見えるようにする。
    // 手で遊ぶときは本家どおり真っ暗
    if (typeof autoPilot !== 'undefined' && autoPilot.on) return AUTO_LIGHT;
    let r = torchLit ? 1 : 0;
    // 本家: 半径3が80歩 → 半径2が60歩 → 半径1が60歩
    if (radiantSteps > 120) r = Math.max(r, 3);
    else if (radiantSteps > 60) r = Math.max(r, 2);
    else if (radiantSteps > 0) r = Math.max(r, 1);
    return r;
}

// 開けた宝箱。本家どおり、ダンジョンを出るとまた閉まっている
let openedChests = new Set();
// 開けたとびらのうち、じゅもんに残さないもの（家の中のとびらなど）。
// フラグの桁が足りないので、進行に関わるとびらだけ gameFlags に持たせている
let openedDoors = new Set();
// その場からいなくなった人（ほこらの老人）。本家どおり、外へ出ると戻ってくる
let hiddenNpcs = new Set();

function switchMap(id, x, y) {
    currentMapId = id;
    mapData = (id === 'world') ? worldMapData : DUNGEONS[id].grid;
    mapWidth = mapData[0].length;
    mapHeight = mapData.length;
    playerPosition.x = x;
    playerPosition.y = y;
    resetTownNpcs(id);          // 本家はマップに入り直すと町の人が最初の位置に戻る
    npcMakeWayForPlayer();      // 置かれた先に人が立っていたら どいてもらう
}

// そのマップの町の人を本家の初期位置に戻す。
// 本家は町や階を出入りするたびにマップを読み直すので、歩き回っていた人も
// 元の位置に戻る。これをやらないと、全滅・ふっかつのじゅもん・やり直しの
// あとも前回うろついた場所から始まってしまう
function resetTownNpcs(id) {
    const d = DUNGEONS[id];
    if (!d || !Array.isArray(d.npcs)) return;
    let moved = false;
    for (const n of d.npcs) {
        if (!n.home || (n.x === n.home.x && n.y === n.home.y)) continue;
        n.x = n.home.x; n.y = n.home.y; moved = true;
    }
    // 索引は作り直す。1マスずつ付け替えると、ある人の元の位置に別の人が
    // 移っていた場合に索引だけ消えてしまう
    if (moved) { d.npcAt = {}; for (const n of d.npcs) d.npcAt[n.x + ',' + n.y] = n; }
}

// 地上へ戻る（出口・リレミト・全滅・つばさ など共通）
function leaveDungeon(x, y) {
    const exit = dungeonExit();
    switchMap('world', x !== undefined ? x : exit.x, y !== undefined ? y : exit.y);
    torchLit = false;          // たいまつはダンジョンを出ると効果が切れる
    radiantSteps = 0;
    openedChests = new Set();  // 宝箱が復活する
    openedDoors = new Set();
    hiddenNpcs = new Set();
}

// 入ってきた地上の出入口。リレミトや全滅のときの戻り先に使う
let dungeonEnteredFrom = { x: 37, y: 65 };
function dungeonExit() { return dungeonEnteredFrom; }

// 地上のこのマスに入ったらダンジョンへ、という対応表
const DUNGEON_ENTRANCES = {
    '56,49':  ['radatome', 'E'],    // ラダトームのまち（北の門）
    '51,51':  ['rcastle1', 'E'],    // ラダトーム城（南の門）
    '10,10':  ['garai', 'e'],       // ガライのまち
    '112,18': ['maira', 'y'],       // マイラのむら
    '89,9':   ['amehoko', '<'],     // あめのほこら
    '116,117':['seihoko', '<'],     // せいなるほこら
    '110,80': ['rimuldar', 'b'],    // リムルダールのまち
    '33,97':  ['domdora', 'y'],     // ドムドーラのまち（廃墟）
    '81,110': ['melkido', 'b'],   // メルキド（入口。ゴーレムは2マス北の(81,108)に立つ）
    '56,56':  ['ryuou1', 'E'],      // りゅうおうの しろ（虹の橋の先）
    '36,20':  ['roto1', '<'],       // ロトの洞窟（ラダトームから北北西）
    '37,65':  ['iwayama1', '<'],
    '112,52': ['numachi', '<'],     // 北口（本土側）
    '112,57': ['numachi', '>']      // 南口（リムルダール側）
};

// とびら。開けるまでは壁と同じ扱い
// とびらの開き方。flag があればじゅもんに残り、無ければそのマップを出るまで
function doorStateAt(mapId, x, y) {
    const d = DUNGEONS[mapId];
    if (!d || !d.doorAt) return null;
    const at = x + ',' + y;
    if (!(at in d.doorAt)) return null;
    const f = d.doorAt[at];
    return f ? { flag: f } : { tmp: mapId + ':' + at };
}
// 別のマップのとびらが開いているか（オートの計画づくり用）
function doorLockedOn(mapId, x, y) {
    const st = doorStateAt(mapId, x, y);
    if (!st) return false;
    return st.flag ? !getGameFlag(st.flag) : !openedDoors.has(st.tmp);
}
function openDoorAt(mapId, x, y) {
    const st = doorStateAt(mapId, x, y);
    if (!st) return;
    if (st.flag) setGameFlag(st.flag); else openedDoors.add(st.tmp);
}
function chestOpenedOn(mapId, x, y) { return openedChests.has(mapId + ':' + x + ',' + y); }

// 町の中で、そのマスから歩いて行けるマス（オートが店へ行けるか調べるのに使う）。
// ignoreDoors=true なら かぎのとびら は開いているものとして数える
function townReachable(mapId, from, ignoreDoors) {
    const d = DUNGEONS[mapId];
    const seen = new Set([from.x + ',' + from.y]);
    const q = [[from.x, from.y]];
    while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
            if (seen.has(k)) continue;
            const isDoor = d.doorAt && (nx + ',' + ny) in d.doorAt;
            if (!(ignoreDoors && isDoor) && !dungeonPassable(mapId, nx, ny, true)) continue;
            seen.add(k); q.push([nx, ny]);
        }
    }
    return seen;
}

function isDoorLocked(x, y) { return doorLockedOn(currentMapId, x, y); }
// 隣にある閉じたとびら（本家の「とびら」コマンドは隣のマスに使う）
function adjacentLockedDoor() {
    if (!inDungeon()) return null;
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const x = playerPosition.x + dx, y = playerPosition.y + dy;
        if (!mapData[y] || mapData[y][x] === undefined) continue;
        if (isDoorLocked(x, y)) return { x, y };
    }
    return null;
}

// 足元で起きること（ドラゴン・ローラ姫）
function dungeonEventHere() {
    const d = currentDungeon();
    if (!d || !d.eventAt) return null;
    return d.eventAt[playerPosition.x + ',' + playerPosition.y] || null;
}

// 足元が階段・出入口かどうか（動かさずに調べるだけ）
function stairsHere() {
    const x = playerPosition.x, y = playerPosition.y;
    const d = currentDungeon();
    if (!d) { const e = DUNGEON_ENTRANCES[x + ',' + y]; return !!e && (!e[2] || e[2]()); }
    for (const mark in d.marks) {
        if (d.marks[mark].x === x && d.marks[mark].y === y && d.links[mark]) return true;
    }
    return false;
}

// 階段・出入口に乗ったときの移動。移動したら true
function useStairs(x, y) {
    const d = currentDungeon();
    if (!d) return false;
    for (const mark in d.marks) {
        if (d.marks[mark].x !== x || d.marks[mark].y !== y) continue;
        const link = d.links[mark];
        if (!link) return false;
        if (link[0] === 'world') { leaveDungeon(link[1], link[2]); return true; }
        const to = DUNGEONS[link[0]].marks[link[1]];
        switchMap(link[0], to.x, to.y);
        return true;
    }
    return false;
}

// 地上の洞窟の入口に乗ったとき
function enterDungeonAt(x, y) {
    const e = DUNGEON_ENTRANCES[x + ',' + y];
    if (!e || (e[2] && !e[2]())) return false;
    const to = e[1] === null ? DUNGEONS[e[0]].start : DUNGEONS[e[0]].marks[e[1]];
    torchLit = false; radiantSteps = 0; openedChests = new Set(); openedDoors = new Set(); hiddenNpcs = new Set();
    dungeonEnteredFrom = { x, y };
    switchMap(e[0], to.x, to.y);
    if (DUNGEONS[e[0]].setFlagOnEnter) setGameFlag(DUNGEONS[e[0]].setFlagOnEnter);
    return true;
}

// 足元の宝箱の番号（無ければ null）
function chestHere() {
    const d = currentDungeon();
    if (!d) return null;
    const at = playerPosition.x + ',' + playerPosition.y;
    const id = d.chestAt[at];
    if (!id) return null;
    // 開けたかどうかは「場所」で覚える。同じ中身の宝箱が同じ階に複数あるため
    return openedChests.has(currentMapId + ':' + at) ? null : id;
}

// =====================================================================
// オート用: ダンジョンの経路探索と巡回計画
// =====================================================================
// そのマスを歩けるか（壁と、まだ開けていないとびらは通れない）
// ignoreNpc=true のときは人のいるマスも通れる扱いにする。
// 本家どおり町の人が歩き回るようになったので、計画を立てるときに人を
// 壁とみなすと「通路をふさがれた＝永久に通れない」と誤認して進まなくなる。
// 人はすぐどくので、計画では無視し、実際に歩くときだけぶつかって待つ
function dungeonPassable(mapId, x, y, ignoreNpc) {
    const d = DUNGEONS[mapId], g = d.grid;
    if (y < 0 || x < 0 || y >= g.length || x >= g[0].length) return false;
    if (d.kind === 'town') {
        if (TOWN_BLOCKED.includes(g[y][x])) return false;
        // 宝箱の絵でも、中身の無い「みせの たな」は通れない
        if (g[y][x] === D_CHEST && !(d.chestAt && d.chestAt[x + ',' + y])) return false;
        // 城や家の とびら は町あつかいのマップでも かぎ を使うまで通れない
        if (doorLockedOn(mapId, x, y)) return false;
        // 外周は踏むと町の外へ出てしまう。経路としては使わない
        // （人が歩くぶんには isMoveAllowed の townEdgeExit 側で通している）
        if (d.exitTo) {
            const W = g[0].length, H = g.length;
            if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) return false;
        }
        // 人のいるマスは通れない（いなくなった人は除く）
        const who = d.npcAt && d.npcAt[x + ',' + y];
        if (!who || hiddenNpcs.has(mapId + ':' + x + ',' + y)) return true;
        // 計画づくりのときは「歩き回る人」だけ無視する。いずれどいてくれるため。
        // 店の人やけんじゃのように動かない人は、どかないので壁と同じに扱う
        return ignoreNpc && (who.roams !== undefined ? who.roams : npcWanders(d, who));
    }
    if (g[y][x] === D_WALL) return false;
    return !doorLockedOn(mapId, x, y);
}

// 同じ階の中だけを歩く経路。地上とちがって端はつながっていない
function dungeonWalk(mapId, from, to) {
    if (from.x === to.x && from.y === to.y) return [];
    const prev = new Map([[from.x + ',' + from.y, null]]);
    const q = [[from.x, from.y]];
    while (q.length) {
        const [x, y] = q.shift();
        if (x === to.x && y === to.y) break;
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy;
            if (!dungeonPassable(mapId, nx, ny, true)) continue;
            const k = nx + ',' + ny;
            if (prev.has(k)) continue;
            prev.set(k, [x + ',' + y, { x: nx, y: ny }]);
            q.push([nx, ny]);
        }
    }
    const goal = to.x + ',' + to.y;
    if (!prev.has(goal)) return null;
    const out = []; let cur = goal;
    while (prev.get(cur)) { out.unshift(prev.get(cur)[1]); cur = prev.get(cur)[0]; }
    return out;
}

// 階段でつながった別の階もひとつづきのグラフとして探索する。
// 返り値は「このマップのこのマスまで歩いて、着いたらAを押す」の並び
function dungeonRoute(fromMap, from, toMap, to) {
    const key = (m, x, y) => m + ':' + x + ',' + y;
    const startK = key(fromMap, from.x, from.y), goalK = key(toMap, to.x, to.y);
    if (startK === goalK) return { legs: [], cost: 0 };
    const prev = new Map([[startK, null]]);
    const dist = new Map([[startK, 0]]);
    const q = [[fromMap, from.x, from.y]];
    while (q.length) {
        const [m, x, y] = q.shift();
        if (key(m, x, y) === goalK) break;
        const d = DUNGEONS[m];
        const here = key(m, x, y);
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            const nx = x + dx, ny = y + dy;
            if (!dungeonPassable(m, nx, ny, true)) continue;
            const k = key(m, nx, ny);
            if (prev.has(k)) continue;
            prev.set(k, [here, { kind: 'walk' }]);
            dist.set(k, dist.get(here) + 1);
            q.push([m, nx, ny]);
        }
        for (const mark in d.marks) {
            const p = d.marks[mark];
            if (p.x !== x || p.y !== y) continue;
            const link = d.links[mark];
            if (!link || link[0] === 'world') continue;       // 地上への出口はここでは使わない
            const t = DUNGEONS[link[0]].marks[link[1]];
            const k = key(link[0], t.x, t.y);
            if (prev.has(k)) continue;
            prev.set(k, [here, { kind: 'stairs', map: m, x, y }]);
            dist.set(k, dist.get(here) + 1);
            q.push([link[0], t.x, t.y]);
        }
    }
    if (!prev.has(goalK)) return null;
    const steps = []; let cur = goalK;
    while (prev.get(cur)) { steps.unshift(prev.get(cur)[1]); cur = prev.get(cur)[0]; }
    const legs = [];
    for (const s of steps) if (s.kind === 'stairs') legs.push({ map: s.map, x: s.x, y: s.y, act: 'stairs' });
    legs.push({ map: toMap, x: to.x, y: to.y, act: null });
    return { legs, cost: dist.get(goalK) };
}

// 入口から入って、行ける宝箱を近い順に全部あけて、出口から出るまでの計画。
// from を渡すとその場所から作り直す（全滅したあとや、途中でオートを入れたとき用）
function planDungeonTour(opt) {
    opt = opt || {};
    // 入口は「探索したいダンジョン」の出入口。中から始めるときは入ってきた口を使う
    const entranceKey = opt.entranceKey || '37,65';
    const ent = DUNGEON_ENTRANCES[entranceKey];
    if (!ent) return [];
    const [ex, ey] = entranceKey.split(',').map(Number);
    const startMap = ent[0], startPos = DUNGEONS[startMap].marks[ent[1]];
    const plan = [];
    let cur;
    if (opt.fromMap && opt.fromMap !== 'world') {
        cur = { map: opt.fromMap, x: opt.x, y: opt.y };
    } else {
        plan.push({ map: 'world', x: ex, y: ey, act: 'enter' });
        cur = { map: startMap, x: startPos.x, y: startPos.y };
    }
    if (!opt.exitOnly) {
        const left = [];
        for (const id in DUNGEONS) for (const k in DUNGEONS[id].chestAt) {
            if (openedChests.has(id + ':' + k)) continue;
            const [x, y] = k.split(',').map(Number);
            left.push({ map: id, x, y });
        }
        while (left.length) {
            let best = null, bestRoute = null;
            for (const c of left) {
                const r = dungeonRoute(cur.map, cur, c.map, c);
                if (r && (!bestRoute || r.cost < bestRoute.cost)) { best = c; bestRoute = r; }
            }
            if (!best) break;                                  // 行けない宝箱は諦める
            bestRoute.legs[bestRoute.legs.length - 1].act = 'chest';
            plan.push(...bestRoute.legs);
            cur = best;
            left.splice(left.indexOf(best), 1);
        }
    }
    const back = dungeonRoute(cur.map, cur, startMap, startPos);
    if (back) {
        // 出入口の上に立っていても必ず「出る」区間を1つ置く
        if (!back.legs.length) plan.push({ map: startMap, x: startPos.x, y: startPos.y, act: 'exit' });
        else { plan.push(...back.legs); plan[plan.length - 1].act = 'exit'; }
    }
    return plan;
}

// 地上のある出入口から入って、別の出入口へ抜けるまでの計画（沼地の洞窟の通り抜け用）
function planTraverse(fromKey, toKey) {
    const a = DUNGEON_ENTRANCES[fromKey], b = DUNGEON_ENTRANCES[toKey];
    if (!a || !b || a[0] !== b[0]) return null;
    const [fx, fy] = fromKey.split(',').map(Number);
    const start = DUNGEONS[a[0]].marks[a[1]], goal = DUNGEONS[b[0]].marks[b[1]];
    const r = dungeonRoute(a[0], start, b[0], goal);
    if (!r || !r.legs.length) return null;
    const plan = [{ map: 'world', x: fx, y: fy, act: 'enter' }, ...r.legs];
    plan[plan.length - 1].act = 'exit';
    return plan;
}

// いまダンジョンの中にいる状態から、残りの目的地を回って出口へ出るまでの計画
function planFromHere(targets, exitKey) {
    const plan = [];
    let cur = { map: currentMapId, x: playerPosition.x, y: playerPosition.y };
    for (const t of targets || []) {
        const r = dungeonRoute(cur.map, cur, t.map, t);
        if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
        plan.push({ map: t.map, x: t.x, y: t.y, act: t.act || null });
        cur = { map: t.map, x: t.x, y: t.y };
    }
    const ex = DUNGEON_ENTRANCES[exitKey];
    const ep = DUNGEONS[ex[0]].marks[ex[1]];
    const r = dungeonRoute(cur.map, cur, ex[0], ep);
    if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
    plan.push({ map: ex[0], x: ep.x, y: ep.y, act: 'exit' });
    return plan;
}

// 目的地までの計画（ローラ姫の救出など、ダンジョン内の1点へ行って戻ってくる用）
function planErrand(fromKey, targets, backKey) {
    const a = DUNGEON_ENTRANCES[fromKey];
    if (!a) return null;
    const [fx, fy] = fromKey.split(',').map(Number);
    const plan = [{ map: 'world', x: fx, y: fy, act: 'enter' }];
    let cur = { map: a[0], ...DUNGEONS[a[0]].marks[a[1]] };
    // 経路は「階をまたぐ区間」を挟むために引くだけ。まだ開けていない扉の先など、
    // いま引けなくても実行時に引き直せばよいので、行き先だけは必ず積む
    for (const t of targets) {
        const r = dungeonRoute(cur.map, cur, t.map, t);
        if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
        plan.push({ map: t.map, x: t.x, y: t.y, act: t.act || null });
        cur = { map: t.map, x: t.x, y: t.y };
    }
    const back = DUNGEON_ENTRANCES[backKey || fromKey];
    const bp = DUNGEONS[back[0]].marks[back[1]];
    const r = dungeonRoute(cur.map, cur, back[0], bp);
    if (r && r.legs.length > 1) plan.push(...r.legs.slice(0, -1));
    plan.push({ map: back[0], x: bp.x, y: bp.y, act: 'exit' });
    return plan;
}
