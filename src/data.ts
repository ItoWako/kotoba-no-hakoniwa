// ── Photo imports ──────────────────────────────────────────
import p01 from "./imports/01_013_____.jpg";
import p02 from "./imports/02_013_____.JPG";
import p03 from "./imports/03_013_____.jpg";
import p04 from "./imports/05_013_____.JPG";
import p05 from "./imports/06_013_____.jpg";
import p06 from "./imports/07_013_____.jpg";
import p07 from "./imports/1MkEbiOVR5-RH0Lpa4nuRQ.jpg";
import p08 from "./imports/fWJXcPACSPOV2iPu3qLbEg.jpg";
import p09 from "./imports/PHO00179.JPG";
import p10 from "./imports/PHO00181.JPG";
import p11 from "./imports/____.jpg";
import p12 from "./imports/s2Nh1XdjQSW6ZS9EEhf85w.jpg";

export interface WordEntry {
  word: string;
  tanka: string;
}

export interface PhotoData {
  id: string;
  label: string;
  url: string | null;
  fullUrl: string | null;
  alt: string;
  inputCount: number;
  words: WordEntry[];
  isPlaceholder?: boolean;
}

export const ARCHIVE_PHOTOS: PhotoData[] = [
  {
    id: "sign-dusk",
    label: "SAMPLE 01",
    url: p01,
    fullUrl: p01,
    alt: "夕暮れの速度標識と電柱",
    inputCount: 23,
    words: [
      {
        word: "帰り道",
        tanka:
          "電柱が　続く帰り道　夕焼けに　あの角を曲がれば　誰かが待つか",
      },
      {
        word: "夕暮れ",
        tanka:
          "五十キロ　速度標識が　夕空に　急いで帰った　誰かの今日を",
      },
      {
        word: "電線",
        tanka:
          "電線が　空を横切る　夕暮れよ　どこまで続く　ただの道",
      },
    ],
  },
  {
    id: "chrysanthemum",
    label: "SAMPLE 02",
    url: p02,
    fullUrl: p02,
    alt: "暗がりに咲く白い菊",
    inputCount: 18,
    words: [
      {
        word: "白",
        tanka:
          "暗がりに　白い花だけが　ひかっていた　誰かが置いた　それだけを見た",
      },
      {
        word: "静寂",
        tanka:
          "菊の白　闇の中でも　白いまま　声もなく咲く　それでも咲く",
      },
      {
        word: "供える",
        tanka:
          "白菊を　誰かが供えた　この場所に　来る人の数だけ　記憶がある",
      },
    ],
  },
  {
    id: "statue-roses",
    label: "SAMPLE 03",
    url: p03,
    fullUrl: p03,
    alt: "銅像と薔薇とレンガの校舎",
    inputCount: 31,
    words: [
      {
        word: "銅像",
        tanka:
          "銅の手が　薔薇の上空へ　伸びていた　誰も見ていない　夕暮れの中",
      },
      {
        word: "踊る",
        tanka:
          "止まったまま　踊り続ける　銅の像　バラが散っても　まだそこにいる",
      },
      {
        word: "時間",
        tanka:
          "レンガの壁　像と薔薇が並ぶ　夕空に　時間だけが　積み重なる",
      },
    ],
  },
  {
    id: "tree-abstract",
    label: "SAMPLE 04",
    url: p04,
    fullUrl: p04,
    alt: "夜の木、根と枝が交錯する",
    inputCount: 15,
    words: [
      {
        word: "根",
        tanka:
          "地と空が　入れ替わっている　木の前で　根とも枝とも　分からなくなる",
      },
      {
        word: "深さ",
        tanka:
          "木の体を　ただ見つめていた　闇の中　どこまでが木で　どこからが夜か",
      },
      {
        word: "渦",
        tanka:
          "枝が渦を　作っている夜　見上げると　自分が落ちる　気がしてきた",
      },
    ],
  },
  {
    id: "feather",
    label: "SAMPLE 05",
    url: p05,
    fullUrl: p05,
    alt: "砂利の上に落ちた黒い羽根",
    inputCount: 28,
    words: [
      {
        word: "落ちた",
        tanka:
          "砂利の上　黒い羽が一本　落ちていた　空から来たか　誰かが置いたか",
      },
      {
        word: "気配",
        tanka:
          "羽一枚　鳥の気配だけ　残していた　飛んだ後には　石だけがある",
      },
      {
        word: "孤独",
        tanka:
          "誰のもの　誰も拾わない　羽根ひとつ　砂利の上に黒く　静かに朽ちる",
      },
    ],
  },
  {
    id: "candles",
    label: "SAMPLE 06",
    url: p06,
    fullUrl: p06,
    alt: "暗闇の中で燃えるろうそく",
    inputCount: 20,
    words: [
      {
        word: "炎",
        tanka:
          "細い炎が　二本並んでいた　暗闇に　祈りの言葉は　声にならない",
      },
      {
        word: "祈り",
        tanka:
          "ろうそくの　光だけが生きている　暗い堂で　誰かのために　今夜も灯る",
      },
      {
        word: "願い",
        tanka:
          "消えかけた　ろうそくを見ていた　赤い柱　願いの重さを　炎は知るか",
      },
    ],
  },
  {
    id: "fire-bowl",
    label: "SAMPLE 07",
    url: p07,
    fullUrl: p07,
    alt: "夜に燃える焚き火",
    inputCount: 35,
    words: [
      {
        word: "焔",
        tanka:
          "焔が　夜に揺れている　皿の上　誰かの言葉が　燃えているみたい",
      },
      {
        word: "温かい",
        tanka:
          "寒い夜　火だけが温かく　揺れていた　何かを照らして　何かを消した",
      },
      {
        word: "消える",
        tanka:
          "燃えるほど　灰になる木の　重さかな　一番熱い　瞬間に消える",
      },
    ],
  },
  {
    id: "cat-evening",
    label: "SAMPLE 08",
    url: p08,
    fullUrl: p08,
    alt: "夕陽の中の猫",
    inputCount: 42,
    words: [
      {
        word: "猫",
        tanka:
          "猫がいた　道の端っこで　夕陽の中　それだけのこと　でも覚えている",
      },
      {
        word: "夕陽",
        tanka:
          "金色の　道の向こうで　猫が座る　それだけなのに　泣きたくなった",
      },
      {
        word: "帰る",
        tanka:
          "猫一匹　信号の下で　毛繕い　あの夕方に　また戻れるか",
      },
    ],
  },
  {
    id: "cicada",
    label: "SAMPLE 09",
    url: p09,
    fullUrl: p09,
    alt: "木の幹に止まるセミ",
    inputCount: 12,
    words: [
      {
        word: "夏",
        tanka:
          "幹の上に　夏が貼りついて　眠っていた　鳴き声の後の　静けさより深い",
      },
      {
        word: "気配",
        tanka:
          "木の肌に　セミが化けていた　夏の午後　気づかずに過ぎた　時間の厚さ",
      },
      {
        word: "生命",
        tanka:
          "幹の上　セミは石になっていた　夏の証　見えなければ　気づかなかった",
      },
    ],
  },
  {
    id: "clover",
    label: "SAMPLE 10",
    url: p10,
    fullUrl: p10,
    alt: "地面に広がる三つ葉のクローバー",
    inputCount: 17,
    words: [
      {
        word: "草",
        tanka:
          "誰も踏まない　地面の隅に　三つ葉が　今日も緑で　いることを知った",
      },
      {
        word: "小さい",
        tanka:
          "三つ葉の　四つを探さず　そのままで　美しかった　それに気づいた",
      },
      {
        word: "足元",
        tanka:
          "足元に　小さな世界があった　三つ葉の　一枚一枚に　光が宿って",
      },
    ],
  },
  {
    id: "shrine-rope",
    label: "SAMPLE 11",
    url: p11,
    fullUrl: p11,
    alt: "注連縄越しに見る神社",
    inputCount: 9,
    words: [
      {
        word: "注連縄",
        tanka:
          "縄の向こう　神社が静かに　立っていた　ここから先には　何があるのか",
      },
      {
        word: "境界",
        tanka:
          "縄一本　聖と俗を分ける　冬の空　越えたくなった　越えなかった",
      },
      {
        word: "冬",
        tanka:
          "冬の社　誰もいない境内　石灯篭　赤い花だけが　場所を覚えていた",
      },
    ],
  },
  {
    id: "overpass-sky",
    label: "SAMPLE 12",
    url: p12,
    fullUrl: p12,
    alt: "高架橋の隙間から見上げる空",
    inputCount: 11,
    words: [
      {
        word: "高架",
        tanka:
          "橋の下で　空を切り取った　コンクリート　あの形でしか　見えない青さ",
      },
      {
        word: "隙間",
        tanka:
          "隙間から　空が落ちてくる　橋の下　見上げなければ　気づかなかった",
      },
      {
        word: "構造",
        tanka:
          "誰かが作った　この構造の中で　空がある　それを見ている　私もいる",
      },
    ],
  },
];

// Backward-compat alias
export const ACTIVE_PHOTO = ARCHIVE_PHOTOS[0];

// ── Tanka generation ──────────────────────────────────────
const TANKA_MAP: Record<string, string> = {
  静寂: "静けさの　中に立っていた　ひとりきり　声をかけても　誰も来なかった",
  孤独: "ひとりとは　こういうことかと　思う夜　誰かの気配が　遠ざかる音",
  光: "光だけが　確かにそこにあった　触れられない　でも見えていた　それで十分だ",
  記憶: "あの日から　ずっと覚えている　一瞬を　思い出すたびに　少し変わっていく",
  時間: "時間が　静かに流れていた　あの場所で　止めようとしたが　手を離した",
  帰り道: "帰り道　いつもと同じ　角を曲がり　知っているはずの　景色が遠い",
  夏: "夏が来て　夏が過ぎていく　毎年も　同じようで違う　あなたのいない夏",
  雨: "雨が降る　外を見ていた　誰でもない　窓ガラスの上を　滴が滑る",
  夕暮れ: "夕暮れが　静かに来ていた　また今日も　終わろうとしている　始まりの前に",
  空: "空を見た　ただそれだけで　泣きたくなった　理由も分からず　また見上げた",
  希望: "希望とは　遠いところにある　光のこと　近づいても　まだ遠かった",
  眠り: "眠れない　夜に考える　君のこと　朝になれば　少し薄くなる",
  息: "息をして　それだけのこと　今日も生きた　それで十分だと　思えない夜",
};

export function generateTankaForPhoto(word: string, photoId: string): string {
  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId);
  if (photo) {
    const entry = photo.words.find((w) => w.word === word);
    if (entry) return entry.tanka;
  }
  return generateTanka(word);
}

export function generateTanka(word: string): string {
  return (
    TANKA_MAP[word] ??
    `${word}という　言葉を選んだ　あなたの目に　この景色は何色に　映っていたか`
  );
}
