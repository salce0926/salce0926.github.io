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
      T_POISON = 34;      // どくの ぬまち（ドムドーラ・マイラ）
// 町の記号 → タイル。ダンジョンとは別の対応表を使う
const TOWN_TILES = {
    '.': T_GRASS, '#': T_STONE, 'B': T_BRICK, 'T': T_TREE, '~': T_WATER,
    's': T_SAND, 'C': T_COUNTER, 'D': D_DOOR, 'W': T_SIGN_SHOP, 'I': T_SIGN_INN,
    '?': T_BRIDGE, 'p': T_POISON,
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
            { x: 25, y: 2,  sprite: 23, shop: 'castle:key', name: 'かぎや' },
            { x: 21, y: 27, sprite: 19, lightBe: true,     name: 'ろうじん' },
            { x: 20, y: 3,  sprite: 13, lines: ['へいし「おうさまは 2かいの', '　　　　たまざの まに おられる」'] },
            { x: 28, y: 6,  sprite: 22, lines: ['じょちゅう「しろの きたひがしに', '　　　　　　まほうのかぎを うる みせが', '　　　　　　あるそうですよ」'] },
            { x: 9,  y: 7,  sprite: 13, lines: ['へいし「この かいだんは', '　　　　たまざの まへ つづいておる」'] },
            { x: 9,  y: 9,  sprite: 13, lines: ['へいし「ラダトームの まちは', '　　　　しろの ひがしじゃ」'] },
            { x: 18, y: 12, sprite: 19, lines: ['ろうじん「かぎのかかった とびらは', '　　　　　まほうのかぎでしか あかぬ」'] },
            { x: 23, y: 12, sprite: 17, lines: ['おとこ「きたひがしの とびらの おくを', '　　　　ぬけた さきに ちかへ おりる', '　　　　かいだんが ある」'] },
            { x: 9,  y: 15, sprite: 22, lines: ['おんな「ローラひめが さらわれてから', '　　　　おうさまは おやつれに なられて…」'] },
            { x: 27, y: 16, sprite: 12, lines: ['へいし「りゅうおうの しろは', '　　　　うみの むこうに みえておる」'] },
            { x: 7,  y: 19, sprite: 22, lines: ['おんな「たからの へやの とびらも', '　　　　かぎが いるのよ」'] },
            { x: 15, y: 19, sprite: 13, lines: ['へいし「ぶきも よろいも', '　　　　まちの みせで ととのえるのだ」'] },
            { x: 16, y: 21, sprite: 13, lines: ['へいし「よるの たびは きけんだぞ」'] },
            { x: 25, y: 22, sprite: 17, lines: ['おとこ「ちかに けんじゃが おられる', '　　　　たいようの いしを もっておるとか」'] },
            { x: 10, y: 28, sprite: 13, lines: ['へいし「ごぶじで おかえりなさいませ」'] },
            { x: 13, y: 28, sprite: 13, lines: ['へいし「いってらっしゃいませ」'] }
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
            { x: 3, y: 3, sprite: 11, king: true, name: 'おうさま' },
            { x: 6, y: 5, sprite: 12, lines: ['へいし「おうさまの おおせの とおりに」'] },
            { x: 3, y: 6, sprite: 12, lines: ['へいし「たからばこの なかみは', '　　　　ゆうしゃさまの ものです」'] },
            { x: 5, y: 6, sprite: 12, lines: ['へいし「とびらは かぎで あきます」'] }
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
            { x: 6, y: 8, sprite: 19, sage: true, name: 'けんじゃ' }
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
        events: { '20,1': 'garaiTomb' },
        links: { e: ['world', 10, 10] },
        rows: [
            '......................', '.~~#BBBBBBBBBBBBB~~#v.', '.~~#BssssssssssBBB?BB.', '.###B#############~##.',
            '.#BBBBBBBBBBBB####~~~.', '.#B#####BBDBBB~~~#~##.', '.#B#BBB#BG3BBB#~~~~~#.', '.#B##D##B1BBBB#~#~#~#.',
            '.#BBBBBBBBBBBBBBBBBB#.', '.#BBBBBBBBBBBBBBBBBB#.', '.################BBB#.', '.~#BB#B#TTTTTTTT##D##.',
            '.~#BBCB#TT.BBB.TTTBTT.', '.##B####T..BTBBBBBBBB.', '...B.....BBBBB..B.....', '.BBBBBBBBB.B...IB###T.',
            '.TTT.B.T...BW..#BCB##.', '.####B#Ts##B##.#B####.', '.~#BBB##s#BCB#.#B#BB#.', '.~#####~##BBB#.#BBBB#.',
            '.~~~~~~~~#####e######.', '......................'
        ],
        npcs: [
            { x: 6,  y: 12, sprite: 23, shop: 'garai:tools',   name: 'どうぐや' },
            { x: 11, y: 19, sprite: 24, shop: 'garai:weapons', name: 'ぶきや' },
            { x: 18, y: 16, sprite: 24, shop: 'garai:inn',     name: 'やどや' },
            { x: 15, y: 2,  sprite: 19, lines: ['ろうじん「この まちは むかし', '　　　　　ぎんゆうしじん ガライの', '　　　　　すまいだったのじゃ」'] },
            { x: 4,  y: 6,  sprite: 12, lines: ['へいし「きたの はかには', '　　　　まものが すんでおる」'] },
            { x: 6,  y: 6,  sprite: 12, lines: ['へいし「かぎが なければ', '　　　　きたへは とおせぬ」'] },
            { x: 10, y: 7,  sprite: 23, lines: ['しょうにん「たからばこは ごじゆうに', '　　　　　　どうせ すぐ もどってくる」'] },
            { x: 15, y: 8,  sprite: 25, lines: ['おとこ「ガライの はかには', '　　　　ぎんの たてごとが あるらしい」'] },
            { x: 11, y: 9,  sprite: 19, lines: ['ろうじん「ぎんの たてごとは', '　　　　　あめを よぶ しなものと', '　　　　　ひきかえに なるという」'] },
            { x: 12, y: 9,  sprite: 19, lines: ['ろうじん「はかの なかは ひろいぞ」'] },
            { x: 3,  y: 11, sprite: 19, lines: ['ろうじん「まほうのかぎは', '　　　　　リムルダールで うっておる」'] },
            { x: 14, y: 13, sprite: 22, lines: ['おんな「ガライの たてごとの ねいろは', '　　　　まものを よびよせるとか」'] },
            { x: 16, y: 14, sprite: 26, lines: ['おとこ「きたの とびらの むこうが', '　　　　ガライの はかじゃ」'] },
            { x: 9,  y: 16, sprite: 17, lines: ['たびびと「マイラの むらの おんせんは', '　　　　　ひがしの はてに ある」'] },
            { x: 3,  y: 18, sprite: 19, lines: ['ろうじん「ロトの どうくつは', '　　　　　ここから みなみの ほうじゃ」'] }
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
            'T#BBB#TT#ssssssssss#BB#B#T', 'T#BBB#TsDssssssssssBBBCB#T', 'T#BBB#Ts#Tsssssssss#BB#B#T', 'T#D###Bs#TTsssssssT######T',
            'T#B#BBBB#TTTsssssTTTTTTTTT', 'T#B#B#######TsssTTTTTTTTTT', 'T#BBB#BBBBB#TTsTTTT####TTT', 'T#B#B#B.B.B#TTssssssss#TTT',
            'T#B#BBBBBBB#T#####Tsss#TTT', 'T#BBB#BBBBB###BBK#Tsss#TTT', 'T##B##B.B.BBBBCBK#TTsTTTTT', 'TT...#BBBBB###BBK#TTsTTTTT',
            'TTT..#######T#####TTyTTTTT', 'TTTTTTTTTTTTTTTTTTTTTTTTTT'
        ],
        npcs: [
            { x: 2,  y: 2,  sprite: 20, lines: ['ろうじん「この むらは もりに かこまれ', '　　　　　まものも よりつかぬ」'] },
            { x: 23, y: 13, sprite: 24, shop: 'maira:weapons', name: 'ぶきや' },
            { x: 20, y: 5,  sprite: 24, shop: 'maira:inn',     name: 'やどや' },
            { x: 13, y: 2,  sprite: 21, lines: ['むすめ「マイラの おんせんは', '　　　　たびの つかれを いやします」'] },
            { x: 6,  y: 10, sprite: 26, lines: ['おとこ「おんせんから みなみへ 4ほ', '　　　　なにか うまっておるらしい」'] },
            { x: 15, y: 10, sprite: 20, lines: ['ろうじん「ようせいの ふえは', '　　　　　ゴーレムを ねむらせる」'] },
            { x: 14, y: 11, sprite: 26, lines: ['おとこ「みなみひがしの たいりくへは', '　　　　ぬまちの どうくつを ぬける」'] },
            { x: 15, y: 11, sprite: 13, lines: ['へいし「この むらに しろは ない」'] },
            { x: 9,  y: 12, sprite: 18, lines: ['おとこ「おんせんは いい ものだ」'] },
            { x: 2,  y: 14, sprite: 20, lines: ['ろうじん「リムルダールでは', '　　　　　まほうのかぎが かえる」'] },
            { x: 21, y: 14, sprite: 18, lines: ['おとこ「メルキドは みなみの はて', '　　　　ゴーレムが もんを まもっておる」'] },
            { x: 9,  y: 15, sprite: 21, lines: ['むすめ「おんせんには はいれませんの」'] },
            { x: 10, y: 15, sprite: 13, lines: ['へいし「ゆだんは きんもつだ」'] },
            { x: 15, y: 22, sprite: 24, shop: 'maira:tools',   name: 'どうぐや' },
            { x: 2,  y: 24, sprite: 13, lines: ['へいし「きを つけて いってらっしゃい」'] }
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
            { x: 6, y: 6, sprite: 20, rainCloud: true, name: 'ろうじん' }
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
            '###BBB###BBB##', '##<B#B#B#B#B##', '##BB#BBn#B#B##', '###BBB###BBB##', '###B##BBB##B##',
            '###BB#B#B#BB##', '###BBBBBBBBB##', '##############', '##############'
        ],
        npcs: [
            { x: 6, y: 7, sprite: 20, rainbowDrop: true, name: 'ろうじん' }
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
            '..?..BB#......TTT...T~~~~.......', '.~~..BB#....BBBBBBBBTT..~~~~....', '.~T#BBB#.T..B.T.BssB.....TT~....', '.~T##C##..##B###B##B..#####~....',
            '.~.#BBB#..#BBB#BBB#B..#BBB#~~...', '.~.#####..#BBB#BBB#BT.##C##s~...', '.~........#########BBBBBBB#s~...', '.~......~~T.....T..B.W#BBB#s~...',
            '.~.T.~~~~~~...BBBBBBB.#BBB#s~~..', '.~s.~~TTT~~.TBBBBBBBB.#####T.~..', '.~s~~T.TT~..BBB....BB....TTTT~..', '.~sssT.T~~.BBB..T..BBBBBBBBBB?b.',
            '.~s~~TT~~..BB..TT..BBBBBBBBBB?B.', '.~s.~~~~...BB.TT.#IB..TT..TTT~..', '.~.T....T..BB..T###B#######T.~..', '.~.....TTT.BB.TT#BCB#BB#BB#.~~..',
            '.~.########BB#.T###BBBBBBB#.~...', '.~.#BBBBBBBBB#..#BBBBBB#BB#T~...', '.~.#BBBB#BBBB#.T##B###D####T~...', '.~.###BB#BBBB#.s#BBB#BB#B##~~...',
            '.~T#BCBBBB##B#.s#BBB#BBDBw#~....', '.~T###BB#BBBB#.s###########~....', '.~~#BBBB#BBBB#TssssT..TT~~~~....', '..~#BBBBBBBBB#TT..T..~~~~.......',
            '..~###########TTTT~~~~..........', '....~~~~~~~~~~~~~~~.............', '................................'
        ],
        npcs: [
            { x: 5,  y: 8,  sprite: 19, shop: 'rimuldar:key',     name: 'かぎや' },
            { x: 24, y: 8,  sprite: 24, shop: 'rimuldar:weapons', name: 'ぶきや' },
            { x: 17, y: 19, sprite: 24, shop: 'rimuldar:inn',     name: 'やどや' },
            { x: 4,  y: 24, sprite: 19, shop: 'rimuldar:tools',   name: 'どうぐや' },
            { x: 28, y: 1,  sprite: 26, lines: ['おとこ「この しまは みずうみの なか', '　　　　はしを わたるしかない」'] },
            { x: 8,  y: 4,  sprite: 26, lines: ['おとこ「かぎやへは まちの そとを', '　　　　まわって いくのだ」'] },
            { x: 3,  y: 5,  sprite: 24, lines: ['しょうにん「まほうのかぎは', '　　　　　　ここが いちばん やすい」'] },
            { x: 16, y: 9,  sprite: 22, lines: ['おんな「にしの うみの むこうに', '　　　　りゅうおうの しろが みえるわ」'] },
            { x: 25, y: 11, sprite: 18, lines: ['おとこ「みなみの しまに ほこらが ある」'] },
            { x: 7,  y: 14, sprite: 20, lines: ['ろうじん「ロトの しるしは', '　　　　　みなみの だいちに ねむる」'] },
            { x: 20, y: 15, sprite: 22, lines: ['おんな「ぬまちの どうくつは', '　　　　きたへ ぬけていますわ」'] },
            { x: 8,  y: 17, sprite: 13, lines: ['へいし「よるは まちから でるでないぞ」'] },
            { x: 12, y: 20, sprite: 26, lines: ['おとこ「とびらの おくに たからが ある」'] },
            { x: 20, y: 20, sprite: 18, lines: ['おとこ「メルキドの ゴーレムは', '　　　　ようせいの ふえで ねむる」'] },
            { x: 8,  y: 21, sprite: 21, lines: ['むすめ「ドムドーラは まものの すみか', '　　　　もう だれも おりません」'] },
            { x: 21, y: 24, sprite: 20, lines: ['ろうじん「かぎは つかうたび なくなる', '　　　　　おおめに かっておくがよい」'] },
            { x: 1,  y: 27, sprite: 22, lines: ['おんな「ローラひめは ぬまちの どうくつに', '　　　　とらわれていると ききました」'] },
            { x: 4,  y: 27, sprite: 17, lines: ['おとこ「はしを わたれば きたの たいりく」'] },
            { x: 11, y: 27, sprite: 25, lines: ['おとこ「りゅうおうを たおすには', '　　　　にじの はしが いる」'] }
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
        zone: 16,
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
        exitTo: { x: 81, y: 108 },
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
            // 店の位置は famicom-database.com の実機スクリーンショット9枚と
            // マップを突き合わせて1マスずつ特定した（全部100%一致）
            { x: 8,  y: 3,  sprite: 24, shop: 'melkido:inn',     name: 'やどや' },
            { x: 22, y: 5,  sprite: 24, shop: 'melkidoW1:weapons', name: 'ぶきや' },
            { x: 24, y: 12, sprite: 13, shop: 'melkidoW2:weapons', name: 'ぶきや' },
            { x: 27, y: 26, sprite: 24, shop: 'melkidoW3:weapons', name: 'ぶきや' },
            { x: 2,  y: 7,  sprite: 26, shop: 'melkidoT1:tools',   name: 'どうぐや' },
            { x: 7,  y: 12, sprite: 24, shop: 'melkidoT2:tools',   name: 'どうぐや' },
            { x: 22, y: 13, sprite: 22, shop: 'melkidoWater:water', name: 'せいすいや' },
            { x: 27, y: 6,  sprite: 20, shop: 'melkidoKey:key',    name: 'かぎや' },
            // 本家の八百屋。大根が安いらしいが買えない
            { x: 2,  y: 12, sprite: 24, lines: ['やおや「だいこんが やすいよ！」', '（しかし かう ことは できない）'] },
            { x: 22, y: 22, sprite: 20, lines: ['ろうじん「ロトの しるしは', '　　　　　みなみの だいちに ねむる」'] },
            { x: 3,  y: 27, sprite: 24, lines: ['しょうにん「ゴーレムが いるかぎり', '　　　　　　この まちは あんぜんだ」'] },
            { x: 14, y: 28, sprite: 20, lines: ['ろうじん「みかがみの たては', '　　　　　この よで いちばんの たて」'] }
        ],
        links: { b: ['world', 81, 108] }
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
            '................................', '.#############sBBs#############.', '.#TTT....TTTTssBBssTTTTTTTTTT.#.', '.#TT......T.T.sBBs..T########T#.',
            '.#T.#####......BB...T#BB#B~~#T#.', '.#T.#BBB#......BBs...#BBCB~~#T#.', '.#T.#BCB#......BBs.T.#BB#B~~#T#.', '.#T.##B##..ss..BBssT.#D######.#.',
            '.#T...BW..ssss.BBs.T....T..T..#.', '.#TT..B..ssTss.BBs.....TTTTTT.#.', '.#T...B..sTTTssBB..#########T.#.', '.#T...B.sssTTTsBB..#BBB#BBB#..#.',
            '.#....B.ssTTTs.BB..#BBB#BBB#..#.', '.#TT..B..sssss.BB..##B###B##.T#.', '.T....B....ss..BB....B...B...TT.', '.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.',
            '.BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.', '.TT......B....T.B...T.....~~~TT.', '.#TT.....B...TT.B.TTTT.~~~~~~~T.', '.#T......B..TT..BTTT..~~~~~~~~~.',
            '.#.....#IB#.....B.T..~~~~~~~~~~.', '.#.######B###...BT..~~~~..~~~~~.', '.#.#BB#BBBCB#...B..~~.......~~~.', '.#.#BB#B#####.T.BBB?..........~.',
            '.#.#BBDBBBBB#.T....~..#B####T.~.', '.#.#B##B##BB#.TT..~~..#BB#B#T.~.', '.#.#BB#BB#BB#TTTT.~~~.#BBCB#.~~.', '.#.#BB#BB#BB#.TT..~~..#BB#B#.T~.',
            '.#.##########.T..~~~~.######TT~.', '.#..............~~~~~.....~~T~~.', '.####################~~~~~~~~~~.', '................................'
        ],
        // 本家のNPCの立ち位置をそのまま使う。せりふは本作のもの
        npcs: [
            { x: 6,  y: 5,  sprite: 23, shop: 'weapons', name: 'ぶきや' },
            { x: 25, y: 5,  sprite: 19, shop: 'tools',   name: 'どうぐや' },
            { x: 25, y: 11, sprite: 19, cure: true,  name: 'ろうじん' },
            { x: 11, y: 22, sprite: 23, shop: 'inn',     name: 'やどや' },
            { x: 26, y: 26, sprite: 12, lines: ['へいし「のろわれた ものは', '　　　　きたの いえの ろうじんに みてもらえ」'] },
            { x: 21, y: 11, sprite: 25, lines: ['へいし「ラダトームの しろは', '　　　　この まちの すぐ にしじゃ」'] },
            { x: 21, y: 24, sprite: 25, lines: ['へいし「よるは まちから でるでないぞ」'] },
            { x: 11, y: 6,  sprite: 13, lines: ['ろうじん「どうくつは まっくらじゃ', '　　　　　たいまつを わすれるでないぞ」'] },
            { x: 15, y: 7,  sprite: 23, lines: ['しょうにん「やくそうは いくつあっても', '　　　　　　こまらんよ」'] },
            { x: 5,  y: 8,  sprite: 21, lines: ['むすめ「ゆうしゃさま…', '　　　ごぶじで おかえりなさい」'] },
            { x: 2,  y: 14, sprite: 17, lines: ['たびびと「にしの どうくつには', '　　　　　ロトの いしばんが あるそうだ」'] },
            { x: 4,  y: 23, sprite: 17, lines: ['おとこ「やどに とまれば', '　　　　きずも まほうも もとどおりさ」'] },
            { x: 11, y: 27, sprite: 16, lines: ['ぎんゆうしじん「ガライの まちには', '　　　　　　　　わが せんぞの はかが ある」'] },
            { x: 25, y: 21, sprite: 25, lines: ['へいし「ひがしの いえの ろうじんは', '　　　　のろいを といてくれるそうだ」'] },
            { x: 29, y: 2,  sprite: 13, lines: ['ろうじん「りゅうおうの しろは', '　　　　　ラダトームの めのまえじゃ」'] },
            { x: 12, y: 29, sprite: 21, lines: ['おんな「ローラひめは さらわれて', '　　　　もう ずいぶんに なります」'] },
            { x: 14, y: 29, sprite: 21, lines: ['おんな「おうさまが なげいて おられるわ」'] }
        ],
        links: {}
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
    }
};

// 宝箱の中身（本家 dn02.html より）
//   1 やくそう ／ 2 せんしのゆびわ ／ 3 たいまつ
//   4 10〜15ゴールド ／ 5 100〜131ゴールド（1/16で しのくびかざり）
const CHEST_TABLE = {
    '1': () => ({ tool: 'herb', name: 'やくそう' }),
    '2': () => ({ item: 'せんしのゆびわ', flag: 'warriorRing' }),
    '3': () => ({ tool: 'torch', name: 'たいまつ' }),
    '4': () => ({ gold: 10 + Math.floor(Math.random() * 6) }),
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
    // 老人が消えて自分で開ける（famicom-database.com／pidlio のシナリオ攻略）
    'r': () => ({ item: 'あまぐものつえ', flag: 'rainCloudStuff' }),
    'n': () => ({ item: 'にじのしずく',   flag: 'rainbowDrop' }),
    '5': () => (!getGameFlag('deathNecklace') && Math.floor(Math.random() * 16) === 0)
              ? { item: 'しのくびかざり', flag: 'deathNecklace' }
              : { gold: 100 + Math.floor(Math.random() * 32) },
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
const DUNGEON_DOORS = { numachi: 'numachiDoor' };

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
            else if (ch >= '1' && ch <= '9') { line.push(D_CHEST); d.chestAt[at] = ch; }
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
function inTown() { const d = currentDungeon(); return !!(d && d.kind === 'town'); }
function inCave() { return inDungeon() && !inTown(); }
// 町の人。足元ではなく「隣に立って話しかける」
function npcAt(x, y) {
    const d = currentDungeon();
    if (!d || !d.npcAt) return null;
    if (hiddenNpcs.has(currentMapId + ':' + x + ',' + y)) return null;
    return d.npcAt[x + ',' + y] || null;
}
function adjacentNpc() {
    if (!inTown()) return null;
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
    '56,49':  ['radatome', null],   // ラダトームのまち（markでなく start から入る）
    '51,51':  ['rcastle1', 'E'],    // ラダトーム城（南の門）
    '10,10':  ['garai', 'e'],       // ガライのまち
    '112,18': ['maira', 'y'],       // マイラのむら
    '89,9':   ['amehoko', '<'],     // あめのほこら
    '116,117':['seihoko', '<'],     // せいなるほこら
    '110,80': ['rimuldar', 'b'],    // リムルダールのまち
    '33,97':  ['domdora', 'y'],     // ドムドーラのまち（廃墟）
    '81,108': ['melkido', 'b', () => getGameFlag('golemKilled')],  // メルキド（ゴーレムを倒してから）
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
function dungeonPassable(mapId, x, y) {
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
        return !(d.npcAt && d.npcAt[x + ',' + y]) || hiddenNpcs.has(mapId + ':' + x + ',' + y);
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
            if (!dungeonPassable(mapId, nx, ny)) continue;
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
            if (!dungeonPassable(m, nx, ny)) continue;
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
