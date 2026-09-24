/* Paragraph Callouts Plus — bundled */
"use strict";

var obsidian = require("obsidian");
var view = require("@codemirror/view");
var state = require("@codemirror/state");

function uid() {
  return "r" + Math.random().toString(36).substring(2, 11);
}

function hexToRgba(hex, opacity) {
  if (!hex || !hex.startsWith("#") || hex.length < 7)
    return "rgba(128,128,128," + opacity / 100 + ")";
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b))
    return "rgba(128,128,128," + opacity / 100 + ")";
  return "rgba(" + r + "," + g + "," + b + "," + opacity / 100 + ")";
}

function newRule() {
  return {
    id: uid(),
    name: "New callout",
    prefix: ">>",
    synonyms: "",
    backgroundColor: "#e8f4f8",
    backgroundOpacity: 100,
    backgroundGradientEnabled: false,
    backgroundColor2: "#ffffff",
    backgroundGradientDirection: "vertical",
    textColor: "#1a1a1a",
    borderEnabled: true,
    borderColor: "#4a9eba",
    borderWidth: 2,
    borderOpacity: 100,
    borderStyle: "solid",
    borderRadius: 6,
    leftAccentEnabled: true,
    leftAccentColor: "#4a9eba",
    leftAccentWidth: 4,
    leftAccentOpacity: 100,
    prefixMode: "hide",
    replacementText: "",
    replacementSvg: "",
    paddingH: 16,
    paddingTop: 2,
    paddingBottom: 8,
    fitWidth: true,
  };
}

/* Правило оформления вводной пометы: «Ранее:», «См. также:», «Цит. по:».
   Скруглённость и внутренние отступы плашки не настраиваются — они заданы
   в styles.css. Рамка тонкая и по умолчанию темнее шрифта. */
function newRunInRule() {
  return {
    id: uid(),
    name: "New run-in heading",
    sign: ":",
    maxWords: 3,
    list: "",
    listOnly: false,
    patternOnly: false,
    borderRadius: 7,
    textColor: "#3c4149",
    backgroundColor: "#d6dae0",
    borderColor: "#9aa2ad",
  };
}

/* ═══════════════════════════════════════════
   Localization
   ═══════════════════════════════════════════ */

var LANG = {
  en: {
    title: "Paragraph Callouts Plus",
    langLabel: "Interface language",
    langDesc: "Switch between English and Russian",
    addRule: "Add new rule",
    addRuleBtn: "＋ Add rule",
    general: "General",
    name: "Name",
    prefix: "Prefix",
    prefixPlaceholder: ">>",
    synonyms: "Synonyms",
    synonymsDesc: "Extra prefixes (space-separated). E.g.: ⚠ WRN warning:",
    synonymsPlaceholder: "⚠ WRN note:",
    prefixMode: "Prefix display",
    prefixModeDesc: "How the prefix is shown in rendered text",
    prefixModeShow: "Show as typed",
    prefixModeHide: "Hide completely",
    prefixModeReplace: "Replace with…",
    replacementText: "Replacement text",
    replacementTextDesc: "Text, emoji or symbols to show instead of prefix",
    replacementTextPlaceholder: "💡 ",
    replacementSvg: "Replacement SVG",
    replacementSvgDesc: "Paste SVG markup or upload an .svg file. Takes priority over text replacement.",
    uploadSvg: "Upload SVG",
    clearSvg: "Clear",
    svgPreview: "SVG preview",
    prefixNote: "Prefix activates only when followed by a space. E.g.: \"! text\" triggers, \"!text\" does not.",
    colors: "Colors",
    background: "Background",
    text: "Text",
    bgOpacity: "Background opacity",
    gradientEnabled: "Gradient background",
    gradientColor2: "Second color",
    gradientDirection: "Direction",
    gradientVertical: "Vertical",
    gradientHorizontal: "Horizontal",
    borderAccent: "Border & Accent",
    border: "Border",
    leftAccent: "Left accent",
    borderColor: "Border color",
    width: "Width",
    opacity: "Opacity",
    style: "Style",
    styleSolid: "Solid",
    styleDashed: "Dashed",
    styleDotted: "Dotted",
    styleDouble: "Double",
    accentColor: "Accent color",
    accentOpacity: "Accent opacity",
    shape: "Shape",
    radius: "Radius",
    padH: "Pad H",
    padV: "Pad V",
    padTop: "Pad ↑",
    padBottom: "Pad ↓",
    fitWidth: "Width by text",
    fitWidthDesc: "The box ends at the text instead of stretching to the full line width.",
    duplicate: "Duplicate",
    delete: "Delete",
    preview: "Preview",
    previewText: "The quick brown fox jumps over the lazy dog.",
    invalidColor: "Invalid colour — use #RRGGBB",
    runIn: "Run-in headings",
    runInDesc: "A short phrase at the start of a line, ending with the sign, is rendered as a chip. Lists, quotes, headings, callouts, code and note properties are left alone.",
    addRunIn: "Add run-in heading style",
    addRunInBtn: "＋ Add style",
    newRunIn: "New run-in heading",
    runInSign: "Sign",
    runInSignDesc: "The character the heading ends with. A longer sign wins over a shorter one.",
    runInWords: "Max words",
    runInWordsDesc: "Punctuation between words is not counted: «Cf.» + «with» is two words.",
    runInRadius: "Corner radius",
    runInDuplicate: "Duplicate style",
    runInList: "Expressions",
    runInListDesc: "Comma-separated, without the sign. These are matched literally.",
    runInListPlaceholder: "Cf., Section, Summary, Abstract",
    runInListOnly: "From the list only",
    runInPatternOnly: "By pattern only",
    runInModeDesc: "With both unchecked the list and the pattern work together.",
    runInSample: "Note",
    runInText: "Font colour",
    runInBg: "Fill colour",
    runInBorder: "Border colour",
  },
  ru: {
    title: "Paragraph Callouts Plus",
    langLabel: "Язык интерфейса",
    langDesc: "Переключение между английским и русским",
    addRule: "Добавить новое правило",
    addRuleBtn: "＋ Добавить правило",
    general: "Общее",
    name: "Название",
    prefix: "Префикс",
    prefixPlaceholder: ">>",
    synonyms: "Синонимы",
    synonymsDesc: "Дополнительные префиксы (через пробел). Напр.: ⚠ ВНМ важно:",
    synonymsPlaceholder: "⚠ ВНМ заметка:",
    prefixMode: "Отображение префикса",
    prefixModeDesc: "Как показывать префикс в отрендеренном тексте",
    prefixModeShow: "Показывать как есть",
    prefixModeHide: "Скрывать полностью",
    prefixModeReplace: "Заменить на…",
    replacementText: "Текст замены",
    replacementTextDesc: "Текст, эмодзи или символы вместо префикса",
    replacementTextPlaceholder: "💡 ",
    replacementSvg: "SVG замена",
    replacementSvgDesc: "Вставьте SVG-разметку или загрузите .svg файл. Приоритет над текстовой заменой.",
    uploadSvg: "Загрузить SVG",
    clearSvg: "Очистить",
    svgPreview: "Предпросмотр SVG",
    prefixNote: "Префикс срабатывает только если после него стоит пробел. Напр.: «! текст» — сработает, «!текст» — нет.",
    colors: "Цвета",
    background: "Фон",
    text: "Текст",
    bgOpacity: "Прозрачность фона",
    gradientEnabled: "Градиентный фон",
    gradientColor2: "Второй цвет",
    gradientDirection: "Направление",
    gradientVertical: "Вертикальный",
    gradientHorizontal: "Горизонтальный",
    borderAccent: "Рамка и акцент",
    border: "Рамка",
    leftAccent: "Левый акцент",
    borderColor: "Цвет рамки",
    width: "Толщина",
    opacity: "Прозрачность",
    style: "Стиль",
    styleSolid: "Сплошной",
    styleDashed: "Штрих",
    styleDotted: "Точечный",
    styleDouble: "Двойной",
    accentColor: "Цвет акцента",
    accentOpacity: "Прозрачность акцента",
    shape: "Форма",
    radius: "Скругление",
    padH: "Отступ Г",
    padV: "Отступ В",
    padTop: "Отступ ↑",
    padBottom: "Отступ ↓",
    fitWidth: "Ширина по тексту",
    fitWidthDesc: "Рамка заканчивается на тексте, а не тянется до края строки.",
    duplicate: "Дублировать",
    delete: "Удалить",
    preview: "Предпросмотр",
    previewText: "Съешь ещё этих мягких французских булок, да выпей чаю.",
    invalidColor: "Неверный цвет — используйте #RRGGBB",
    runIn: "Вводные пометы",
    runInDesc: "Короткая помета в начале строки, оканчивающаяся знаком, оформляется плашкой. Списки, цитаты, заголовки, выноски, код и свойства заметки не затрагиваются.",
    addRunIn: "Добавить оформление пометы",
    addRunInBtn: "＋ Добавить оформление",
    newRunIn: "Новая помета",
    runInSign: "Знак",
    runInSignDesc: "Знак, которым заканчивается помета. Длинный знак срабатывает раньше короткого.",
    runInWords: "Слов не больше",
    runInWordsDesc: "Пунктуация между словами не считается: «Цит.» и «по» — это два слова.",
    runInRadius: "Скругление углов",
    runInDuplicate: "Дублировать оформление",
    runInList: "Выражения",
    runInListDesc: "Через запятую, без знака. Ловятся буквально.",
    runInListPlaceholder: "Цит. по, Рубрика, Описание, Аннотация",
    runInListOnly: "Только список",
    runInPatternOnly: "Только шаблон",
    runInModeDesc: "Если обе галки сняты, список и шаблон работают вместе.",
    runInSample: "Пример",
    runInText: "Цвет шрифта",
    runInBg: "Цвет заливки",
    runInBorder: "Цвет рамки",
  },
};

/** Get all prefixes for a rule: main + synonyms */
function getAllPrefixes(rule) {
  var list = [];
  if (rule.prefix) list.push(rule.prefix);
  if (rule.synonyms) {
    var parts = rule.synonyms.split(" ");
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      if (s.length > 0) list.push(s);
    }
  }
  return list;
}

/** Build a flat list of {prefix, rule} sorted longest-first */
function buildPrefixIndex(rules) {
  var entries = [];
  for (var i = 0; i < rules.length; i++) {
    var prefixes = getAllPrefixes(rules[i]);
    for (var j = 0; j < prefixes.length; j++) {
      entries.push({ prefix: prefixes[j], rule: rules[i] });
    }
  }
  entries.sort(function (a, b) { return b.prefix.length - a.prefix.length; });
  return entries;
}

/* ═══════════════════════════════════════════
   Вводные пометы (run-in headings)
   ═══════════════════════════════════════════ */

/* Модуль нужен только для того, чтобы не подсвечивать внутри блоков кода
   и формул. Если его вдруг нет — проверка просто пропускается. */
var runInLang = null;
try { runInLang = require("@codemirror/language"); } catch (e) { runInLang = null; }

var RUNIN_SKIP_NODE = /codeblock|frontmatter|math|inline-code|comment/i;

/* Слово: буквы, возможен внутренний дефис («Санкт-Петербург»), возможна
   хвостовая точка или запятая («См.», «Итак,»). Пунктуация словом не
   считается — «Цит. по» это два слова, а не три. */
var RUNIN_WORD = "[А-Яа-яЁёA-Za-z]+(?:-[А-Яа-яЁёA-Za-z]+)*[.,]?";
var RUNIN_FIRST = "[А-ЯЁA-Z][А-Яа-яЁёA-Za-z]*(?:-[А-Яа-яЁёA-Za-z]+)*[.,]?";

function escapeRunInRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

/* Шаблон: до maxWords слов с заглавной буквы, затем знак-триггер.

   Флага m нет намеренно: выражение всегда применяется к тексту ровно одной
   строки, поэтому ^ не может сработать в середине длинного абзаца. Флага i
   тоже нет — заглавная буква в начале это то, что не пускает сюда «https:».
   А «Встреча в 10:30» не ловится потому, что слово состоит только из букв:
   «10» словом не считается.

   Пробел перед знаком необязателен: двоеточие пишут вплотную к слову,
   а тире — через пробел («Итог — вывод дня»). */
function buildRunInPattern(sign, maxWords) {
  var s = String(sign == null ? "" : sign).trim();
  if (!s) return null;
  var n = parseInt(maxWords, 10);
  if (!(n >= 1)) n = 3;
  if (n > 6) n = 6;
  try {
    return new RegExp("^" + RUNIN_FIRST + "(?: " + RUNIN_WORD + "){0," + (n - 1) + "} ?" + escapeRunInRe(s));
  } catch (e) {
    return null;
  }
}

/* Список: перечисленные через запятую выражения ловятся буквально, вне
   зависимости от числа слов и заглавных букв. Длинное выражение проверяется
   раньше короткого, иначе «Цит.» перебьёт «Цит. по». */
function buildRunInList(list, sign) {
  var s = String(sign == null ? "" : sign).trim();
  if (!s) return null;
  var parts = String(list == null ? "" : list).split(",");
  var alts = [];
  for (var i = 0; i < parts.length; i++) {
    var w = parts[i].trim();
    if (w) alts.push(w);
  }
  if (alts.length === 0) return null;
  alts.sort(function (a, b) { return b.length - a.length; });
  var esc = [];
  for (var j = 0; j < alts.length; j++) esc.push(escapeRunInRe(alts[j]));
  try {
    return new RegExp("^(?:" + esc.join("|") + ") ?" + escapeRunInRe(s));
  } catch (e) {
    return null;
  }
}

/* Скомпилированные правила, отсортированные по убыванию длины знака:
   «::» должно срабатывать раньше «:». Пересобирается на каждом
   сохранении настроек, а не на каждой строке.

   Галки «только список» и «только шаблон» решают, какие выражения вообще
   собирать. Обе сняты — собираются оба, и работают вместе. */
function buildRunInIndex(rules) {
  var out = [];
  if (!Array.isArray(rules)) return out;
  for (var i = 0; i < rules.length; i++) {
    var r = rules[i];
    var listRe = r.patternOnly ? null : buildRunInList(r.list, r.sign);
    var patRe = r.listOnly ? null : buildRunInPattern(r.sign, r.maxWords);
    if (!listRe && !patRe) continue;
    var cls = "paragraph-runin paragraph-runin-" + r.id;
    out.push({
      rule: r,
      listRe: listRe,
      patRe: patRe,
      len: String(r.sign == null ? "" : r.sign).length,
      cls: cls,
      deco: view.Decoration.mark({ class: cls }),
    });
  }
  out.sort(function (a, b) { return b.len - a.len; });
  return out;
}

/* Первое подходящее правило для текста строки, либо null.
   Список проверяется раньше шаблона: он точнее. */
function matchRunInAt(index, text) {
  for (var i = 0; i < index.length; i++) {
    var e = index[i];
    var m = e.listRe ? e.listRe.exec(text) : null;
    if (!m && e.patRe) m = e.patRe.exec(text);
    if (m) return { e: e, text: m[0] };
  }
  return null;
}

/* Конец блока свойств заметки, иначе 0 — иначе ключ вида «Title:» поймался
   бы как помета. */
function runInFrontmatterEnd(doc) {
  if (doc.lines < 2 || doc.line(1).text.trim() !== "---") return 0;
  var limit = Math.min(doc.lines, 200);
  for (var i = 2; i <= limit; i++) {
    if (doc.line(i).text.trim() === "---") return doc.line(i).to;
  }
  return 0;
}

/* Вызывается только для уже совпавших строк, поэтому дерево синтаксиса
   дёргается несколько раз на экран, а не на каждую строку. */
function runInSkippedNode(ev, pos) {
  if (!runInLang || !runInLang.syntaxTree) return false;
  var node = runInLang.syntaxTree(ev.state).resolveInner(pos, 1);
  for (; node; node = node.parent) {
    if (RUNIN_SKIP_NODE.test(node.name)) return true;
  }
  return false;
}

/* Режим чтения: начало абзаца и всё, что идёт после <br>, — чтобы пометы
   работали и на строках после Shift+Enter. */
function markRunInInParagraph(p, index) {
  var nodes = Array.prototype.slice.call(p.childNodes);
  var atLineStart = true;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.nodeName === "BR") { atLineStart = true; continue; }
    if (atLineStart && node.nodeType === Node.TEXT_NODE) {
      var text = node.nodeValue || "";
      var m = matchRunInAt(index, text);
      if (m) {
        var span = document.createElement("span");
        span.className = m.e.cls;
        span.textContent = m.text;
        var rest = document.createTextNode(text.slice(m.text.length));
        p.replaceChild(rest, node);
        p.insertBefore(span, rest);
      }
    }
    atLineStart = false;
  }
}

/* ═══════════════════════════════════════════
   Разбор абзацев: жёсткий перенос vs новый абзац
   ═══════════════════════════════════════════ */

/* Маркер ЖЁСТКОГО переноса строки (Shift+Enter) в исходном markdown.
   По документации Obsidian разрыв строки внутри абзаца — это либо два
   пробела в конце строки, либо Shift+Enter; в файле и то и другое обязано
   оставить след, иначе перенос неотличим от обычного Enter. Обычный Enter
   даёт «мягкий» перенос без хвоста — и это НЕ продолжение абзаца-выноски.
   Поддерживаем все три общепринятых записи. */
var HARD_BREAK_RE = /(?:[ \t]{2,}|\\|<br\s*\/?>)$/i;

/* Строка открывает НОВЫЙ markdown-блок: заголовок, список, задачу, цитату,
   код-фенс, таблицу, горизонтальную черту. Жёсткий перенос перед такой
   строкой её в абзац не втягивает — блочная разметка сильнее. */
function isBlockStart(t) {
  return /^\s{0,3}(#{1,6}(\s|$)|>|(```|~~~)|([-*+]|\d{1,9}[.)])\s|\|)/.test(t)
      || /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(t);
}

/* Правило, чей префикс стоит в начале строки, либо null.
   index отсортирован по убыванию длины, поэтому длинный префикс
   срабатывает раньше короткого. */
function matchPrefixIn(index, t) {
  for (var j = 0; j < index.length; j++) {
    var pfx = index[j].prefix + " ";
    if (t.startsWith(pfx)) return { rule: index[j].rule, prefix: pfx };
  }
  return null;
}

/* id правила выноски, которой принадлежит строка n, либо null.
   Поднимаемся к началу абзаца, но только по строкам, связанным ЖЁСТКИМ
   переносом: обычный Enter обрывает цепочку. */
function calloutRuleIdAt(doc, n, index) {
  var i = n;
  while (i >= 1) {
    var t = doc.line(i).text;
    var m = matchPrefixIn(index, t);
    if (m) return m.rule.id;
    if (t.trim() === "" || isBlockStart(t)) return null;
    if (i === 1) return null;
    if (!HARD_BREAK_RE.test(doc.line(i - 1).text)) return null;
    i -= 1;
  }
  return null;
}

var DEFAULT_SETTINGS = {
  lang: "en",
  rules: [
    Object.assign(newRule(), {
      name: "Default callout",
      prefix: ">>",
      synonyms: "",
    }),
    Object.assign(newRule(), {
      name: "Warning",
      prefix: "!!",
      synonyms: "⚠ WRN",
      backgroundColor: "#fff3e0",
      textColor: "#5d4037",
      borderColor: "#ff9800",
      leftAccentColor: "#ff9800",
    }),
  ],
};

/* ═══════════════════════════════════════════
   CM6 Widget for prefix replacement
   ═══════════════════════════════════════════ */

class PrefixReplacementWidget extends view.WidgetType {
  constructor(content, isSvg) {
    super();
    this.content = content;
    this.isSvg = isSvg;
  }
  toDOM() {
    var span = document.createElement("span");
    span.className = "paragraph-callout-prefix-replacement";
    if (this.isSvg) {
      span.classList.add("paragraph-callout-prefix-svg");
      span.innerHTML = this.content;
    } else {
      span.textContent = this.content;
    }
    return span;
  }
  eq(other) {
    return this.content === other.content && this.isSvg === other.isSvg;
  }
  get estimatedHeight() { return -1; }
  ignoreEvent() { return false; }
}

/* ═══════════════════════════════════════════
   Plugin
   ═══════════════════════════════════════════ */

class ParagraphCalloutsPlugin extends obsidian.Plugin {
  async onload() {
    this.cmExtensions = [];
    this.styleEl = null;
    await this.loadSettings();
    this.registerEditorExtension(this.cmExtensions);
    this.rebuildCM();
    this.registerMarkdownPostProcessor(this.postProcess.bind(this));
    this.injectCSS();
    this.addSettingTab(new CalloutsSettingTab(this.app, this));
  }

  onunload() {
    if (this.styleEl) { this.styleEl.remove(); this.styleEl = null; }
  }

  async loadSettings() {
    var raw = await this.loadData();
    this.settings = { lang: "en", rules: [] };
    if (raw) {
      if (raw.lang) this.settings.lang = raw.lang;
      if (Array.isArray(raw.rules)) {
        var template = newRule();
        this.settings.rules = raw.rules.map(function (r) {
          var merged = Object.assign({}, template, r);
          /* Migration: old removePrefix → new prefixMode */
          if (merged.prefixMode === undefined || merged.prefixMode === null) {
            merged.prefixMode = (r.removePrefix === false) ? "show" : "hide";
          }
          if (!merged.replacementText) merged.replacementText = "";
          if (!merged.replacementSvg) merged.replacementSvg = "";
          /* Migration: единый paddingV → раздельные paddingTop / paddingBottom.
             Верхний отступ берём заметно меньше прежнего (было ×0.55, стало
             ×0.25), чтобы заливка и рамка сверху сразу прижались к тексту;
             дальше подстраивается двумя слайдерами. */
          if (r.paddingTop === undefined && r.paddingBottom === undefined) {
            var pv = (typeof r.paddingV === "number") ? r.paddingV : 8;
            merged.paddingTop = Math.round(pv * 0.25);
            merged.paddingBottom = pv;
          }
          delete merged.paddingV;
          return merged;
        });
      }
    }
    if (this.settings.rules.length === 0) {
      this.settings.rules = DEFAULT_SETTINGS.rules.map(function (r) {
        return Object.assign({}, r, { id: uid() });
      });
    }

    /* Вводные пометы. Пустой массив — это осознанный выбор (все правила
       удалены), подставлять умолчание заново в этом случае нельзя; оно
       ставится только когда ключа ещё нет вообще. runIn — новое имя ключа,
       labels — как он назывался в первой версии этой возможности. */
    var savedRunIn = null;
    if (raw && Array.isArray(raw.runIn)) savedRunIn = raw.runIn;
    else if (raw && Array.isArray(raw.labels)) savedRunIn = raw.labels;

    if (savedRunIn) {
      var rTemplate = newRunInRule();
      this.settings.runIn = savedRunIn.map(function (l) {
        return Object.assign({}, rTemplate, l);
      });
    } else {
      this.settings.runIn = [newRunInRule()];
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.injectCSS();
    this.rebuildCM();
  }

  /** Helper: get localized string */
  t(key) {
    var lang = this.settings.lang || "en";
    var dict = LANG[lang] || LANG.en;
    return dict[key] || LANG.en[key] || key;
  }

  /* ── CSS injection ── */

  injectCSS() {
    if (this.styleEl) this.styleEl.remove();
    var el = document.createElement("style");
    el.id = "paragraph-callouts-plus-css";
    var css = "";

    /* Верхний и нижний внутренние отступы задаются раздельно — слайдеры
       «Отступ ↑» и «Отступ ↓» у каждого правила. Верхний можно увести в 0,
       чтобы заливка и рамка вплотную прижались к первой строке текста
       (остаточный зазор там — это интерлиньяж строки, а не padding). */

    for (var i = 0; i < this.settings.rules.length; i++) {
      var r = this.settings.rules[i];
      var bg = hexToRgba(r.backgroundColor, r.backgroundOpacity);
      var bd = hexToRgba(r.borderColor, r.borderOpacity);
      var la = hexToRgba(r.leftAccentColor, r.leftAccentOpacity);
      var cls = "paragraph-callout-" + r.id;

      var borderCSS = "border:none;";
      if (r.borderEnabled && !r.leftAccentEnabled) {
        borderCSS = "border:" + r.borderWidth + "px " + r.borderStyle + " " + bd + ";";
      } else if (!r.borderEnabled && r.leftAccentEnabled) {
        borderCSS = "border:none;border-left:" + r.leftAccentWidth + "px " + r.borderStyle + " " + la + ";";
      } else if (r.borderEnabled && r.leftAccentEnabled) {
        borderCSS = "border:" + r.borderWidth + "px " + r.borderStyle + " " + bd + ";"
          + "border-left:" + r.leftAccentWidth + "px " + r.borderStyle + " " + la + ";";
      }

      var backgroundCSS;
      if (r.backgroundGradientEnabled) {
        var bg2 = hexToRgba(r.backgroundColor2, r.backgroundOpacity);
        /* Оба направления слегка скошены, а не строго 180°/90° —
           заказано намеренно, для более живого вида градиента. */
        var angle = (r.backgroundGradientDirection === "horizontal") ? "100deg" : "160deg";
        backgroundCSS = "background:linear-gradient(" + angle + "," + bg + "," + bg2 + ");";
      } else {
        backgroundCSS = "background-color:" + bg + ";";
      }

      var padTop = (typeof r.paddingTop === "number") ? r.paddingTop : 2;
      var padBottom = (typeof r.paddingBottom === "number") ? r.paddingBottom : 8;
      var padH = r.paddingH;
      var fit = (r.fitWidth !== false);

      var C = "." + cls;

      /* ── Базовое правило: режим чтения (<p>) и предпросмотр в настройках ── */
      css += C + "{"
        + backgroundCSS
        + "color:" + r.textColor + ";"
        + borderCSS
        + "border-radius:" + r.borderRadius + "px;"
        + "padding-top:" + padTop + "px;"
        + "padding-bottom:" + padBottom + "px;"
        + "padding-left:" + padH + "px;"
        + "padding-right:" + padH + "px;"
        + "margin:2px 0;"
        /* Ширина по тексту: короткий абзац сжимается до своей строки, длинный
           переносится и занимает доступную ширину. В режиме чтения абзац с
           Shift+Enter — это один <p> с <br>, и fit-content там честно даёт
           ширину САМОЙ ДЛИННОЙ строки абзаца, как и просили. */
        + (fit ? "width:fit-content;max-width:100%;" : "")
        + "transition:background .15s ease,border-color .15s ease;"
        + "}\n";

      /* ── Склейка соседних абзацев одного правила ──
         Отступы схлопываем: верхний остаётся только у первой строки серии,
         нижний — только у последней, иначе внутри слитой выноски появляются
         лишние пустоты между строками. Ширину у слитых строк возвращаем на
         полную: иначе строки разной длины дают рваную «лесенку». */
      css += C + "+" + C + "{"
        + "margin-top:0;padding-top:0;"
        + "border-top-left-radius:0;border-top-right-radius:0;"
        + (r.borderEnabled ? "border-top:none;" : "")
        + (fit ? "width:auto;" : "")
        + "}\n";
      css += C + ":has(+" + C + "){"
        + "margin-bottom:0;padding-bottom:0;"
        + "border-bottom-left-radius:0;border-bottom-right-radius:0;"
        + (r.borderEnabled ? "border-bottom:none;" : "")
        + (fit ? "width:auto;" : "")
        + "}\n";

      /* ── Редактор (Live Preview) ──
         Obsidian и темы задают отступы строке селектором вида
         `.markdown-source-view.mod-cm6 .cm-line` — специфичность 0,3,0, выше
         одиночного класса. Именно поэтому слайдеры отступов в редакторе
         не работали, а в предпросмотре настроек (обычный div) работали, и
         высота выноски в двух местах расходилась. Перебиваем адресно. */
      var E = ".markdown-source-view.mod-cm6 .cm-line" + C;
      css += E + "{"
        + "padding-top:" + padTop + "px!important;"
        + "padding-bottom:" + padBottom + "px!important;"
        + "padding-left:" + padH + "px!important;"
        + "padding-right:" + padH + "px!important;"
        + (fit ? "width:fit-content!important;" : "")
        + "}\n";
      css += E + "+.cm-line" + C + "{"
        + "padding-top:0!important;"
        + (fit ? "width:auto!important;" : "")
        + "}\n";
      css += E + ":has(+.cm-line" + C + "){"
        + "padding-bottom:0!important;"
        + (fit ? "width:auto!important;" : "")
        + "}\n";
    }

    /* ── Вводные пометы ──
       Здесь только цвета. Геометрия плашки (скругление, отступы, толщина
       рамки) задана один раз в styles.css и не настраивается. */
    var runIn = this.settings.runIn || [];
    for (var k = 0; k < runIn.length; k++) {
      var L = runIn[k];
      var rad = (typeof L.borderRadius === "number") ? L.borderRadius : 7;
      css += ".paragraph-runin-" + L.id + "{"
        + "background-color:" + L.backgroundColor + ";"
        + "color:" + L.textColor + ";"
        + "border-color:" + L.borderColor + ";"
        + "border-radius:" + rad + "px;"
        + "}\n";
    }

    el.textContent = css;
    document.head.appendChild(el);
    this.styleEl = el;
  }

  /* ── CM6 ── */

  rebuildCM() {
    this.cmExtensions.length = 0;
    this.runInIndex = buildRunInIndex(this.settings.runIn);
    this.cmExtensions.push(this.buildHardBreakKeymap());
    this.cmExtensions.push(this.buildViewPlugin());
    this.cmExtensions.push(this.buildRunInViewPlugin());
    this.app.workspace.updateOptions();
  }

  /* Shift+Enter внутри абзаца-выноски.

     Проблема: при выключенной настройке «Strict line breaks» (это значение
     по умолчанию) Obsidian показывает одиночный перевод строки как разрыв,
     и в файл при Shift+Enter может уйти голый \n — неотличимый от обычного
     Enter. Тогда плагин физически не может понять, где разрыв строки, а где
     новый абзац: в файле они выглядят одинаково.

     Решение: внутри выноски перехватываем Shift+Enter и сами дописываем
     маркер жёсткого переноса (два пробела) перед переводом строки. Это
     штатная markdown-запись разрыва строки, её понимает и режим чтения, и
     любой сторонний редактор. Вне выносок в обработку не вмешиваемся —
     возвращаем false, и Obsidian отрабатывает клавишу как обычно. */
  buildHardBreakKeymap() {
    var plugin = this;
    return state.Prec.highest(view.keymap.of([{
      key: "Shift-Enter",
      run: function (ev) {
        var st = ev.state;
        var sel = st.selection.main;
        if (!sel.empty) return false;
        var index = buildPrefixIndex(plugin.settings.rules);
        var line = st.doc.lineAt(sel.head);
        if (!calloutRuleIdAt(st.doc, line.number, index)) return false;

        /* Маркер дописываем только если его ещё нет и слева есть текст:
           иначе получится строка из одних пробелов. */
        var before = line.text.slice(0, sel.head - line.from);
        var marker = (before.trim().length > 0 && !HARD_BREAK_RE.test(before)) ? "  " : "";
        ev.dispatch(st.replaceSelection(marker + "\n"), {
          scrollIntoView: true,
          userEvent: "input"
        });
        return true;
      }
    }]));
  }

  buildViewPlugin() {
    var plugin = this;
    return view.ViewPlugin.fromClass(
      class {
        constructor(ev) { this.decorations = this.build(ev); }
        update(upd) {
          if (upd.docChanged || upd.viewportChanged || upd.selectionSet)
            this.decorations = this.build(upd.view);
        }
        build(ev) {
          var builder = new state.RangeSetBuilder();
          var doc = ev.state.doc;
          var index = buildPrefixIndex(plugin.settings.rules);

          function matchPrefix(t) { return matchPrefixIn(index, t); }

          var activeLine = new Set();
          for (var s = 0; s < ev.state.selection.ranges.length; s++) {
            var sel = ev.state.selection.ranges[s];
            var sn = doc.lineAt(sel.from).number;
            var en = doc.lineAt(sel.to).number;
            for (var n = sn; n <= en; n++) activeLine.add(n);
          }
          /* Курсор внутри абзаца-выноски (на строке после Shift+Enter):
             раскрываем префикс у ПЕРВОЙ строки абзаца, чтобы его можно было
             править. Поднимаемся только по жёстким переносам; с пустой
             строки и с начала нового блока вверх не идём — иначе значок не
             отрисуется сразу после Enter. */
          var seeds = [];
          activeLine.forEach(function (ln) { seeds.push(ln); });
          for (var e = 0; e < seeds.length; e++) {
            var n2 = seeds[e];
            var seedText = doc.line(n2).text;
            if (seedText.trim() === "" || isBlockStart(seedText)) continue;
            while (n2 > 1) {
              if (matchPrefix(doc.line(n2).text)) break; /* это первая строка абзаца */
              if (!HARD_BREAK_RE.test(doc.line(n2 - 1).text)) break;
              n2 -= 1;
              activeLine.add(n2);
            }
          }

          var prevRuleId = null; /* активное правило текущего абзаца (или null) */

          for (var i = 1; i <= doc.lines; i++) {
            var line = doc.line(i);
            var text = line.text;

            /* Пустая строка — конец абзаца. */
            if (text.trim() === "") { prevRuleId = null; continue; }

            var m = matchPrefix(text);

            /* ── Строка без своего префикса ── */
            if (!m) {
              /* Продолжением абзаца-выноски считаем ТОЛЬКО строку после
                 жёсткого переноса (Shift+Enter). Обычный Enter даёт мягкий
                 перенос — это уже следующий абзац, оформление не наследует. */
              var isHardWrap = prevRuleId !== null
                && !isBlockStart(text)
                && i > 1
                && HARD_BREAK_RE.test(doc.line(i - 1).text);
              if (isHardWrap) {
                builder.add(line.from, line.from,
                  view.Decoration.line({ class: "paragraph-callout-" + prevRuleId }));
              } else {
                prevRuleId = null;
              }
              continue;
            }

            /* ── Строка начинает выноску ── */
            var matchedRule = m.rule;
            var fullPrefix = m.prefix;

            builder.add(line.from, line.from,
              view.Decoration.line({ class: "paragraph-callout-" + matchedRule.id }));

            /* Соседний абзац с тем же правилом без пустой строки между ними:
               значок-замену показываем только у первого абзаца серии, фон и
               граница при этом визуально сливаются. */
            var isRepeatOfPrev = (prevRuleId === matchedRule.id);

            var mode = matchedRule.prefixMode || "hide";
            if (mode !== "show" && !activeLine.has(i)) {
              var end = line.from + fullPrefix.length;
              if (mode === "hide" || isRepeatOfPrev) {
                builder.add(line.from, end, view.Decoration.replace({}));
              } else if (mode === "replace") {
                var hasSvg = matchedRule.replacementSvg && matchedRule.replacementSvg.trim().length > 0;
                var hasText = matchedRule.replacementText && matchedRule.replacementText.trim().length > 0;
                if (hasSvg) {
                  builder.add(line.from, end, view.Decoration.replace({
                    widget: new PrefixReplacementWidget(matchedRule.replacementSvg, true)
                  }));
                } else if (hasText) {
                  builder.add(line.from, end, view.Decoration.replace({
                    widget: new PrefixReplacementWidget(matchedRule.replacementText + " ", false)
                  }));
                } else {
                  builder.add(line.from, end, view.Decoration.replace({}));
                }
              }
            }

            prevRuleId = matchedRule.id;
          }
          return builder.finish();
        }
      },
      { decorations: function (v) { return v.decorations; } }
    );
  }

  /* Вводные пометы — отдельное расширение.

     Оно намеренно не живёт внутри buildViewPlugin: тот перебирает весь
     документ и пересобирается на каждое движение курсора, потому что ему
     нужно раскрывать префикс на активной строке. Пометам ни то, ни другое
     не нужно, поэтому здесь перебираются только строки видимой области и
     только при изменении текста или прокрутке. Выражение применяется к
     тексту отдельной строки — за счёт этого привязка к началу строки
     корректна по построению. */
  buildRunInViewPlugin() {
    var plugin = this;
    return view.ViewPlugin.fromClass(
      class {
        constructor(ev) { this.decorations = this.build(ev); }
        update(upd) {
          if (upd.docChanged || upd.viewportChanged)
            this.decorations = this.build(upd.view);
        }
        build(ev) {
          var builder = new state.RangeSetBuilder();
          var index = plugin.runInIndex || [];
          if (index.length === 0) return builder.finish();

          var doc = ev.state.doc;
          var prefixIndex = buildPrefixIndex(plugin.settings.rules);
          var fmEnd = runInFrontmatterEnd(doc);
          var last = -1;
          var ranges = ev.visibleRanges;

          for (var r = 0; r < ranges.length; r++) {
            var pos = ranges[r].from;
            var to = ranges[r].to;
            while (pos <= to) {
              var line = doc.lineAt(pos);
              pos = line.to + 1;
              if (line.from <= last) continue;
              if (line.from < fmEnd) continue;
              if (line.length < 2) continue;

              var m = matchRunInAt(index, line.text);
              if (!m) continue;
              /* Внутри абзаца-выноски помету не ставим: в режиме чтения
                 такой абзац тоже пропускается, иначе два режима разойдутся. */
              if (calloutRuleIdAt(doc, line.number, prefixIndex)) continue;
              if (runInSkippedNode(ev, line.from)) continue;

              builder.add(line.from, line.from + m.text.length, m.e.deco);
              last = line.from;
            }
          }
          return builder.finish();
        }
      },
      { decorations: function (v) { return v.decorations; } }
    );
  }

  /* ── Reading view ── */

  postProcess(el, ctx) {
    var index = buildPrefixIndex(this.settings.rules);
    var runInIndex = this.runInIndex || buildRunInIndex(this.settings.runIn);
    var paragraphs = el.querySelectorAll("p");
    /* Отслеживаем последний обработанный <p> и его правило, чтобы у
       нескольких подряд идущих абзацев с одним и тем же префиксом
       (уже визуально слитых в одну "выноску" через соседский CSS-селектор
       .rule+.rule) значок/замена показывались только у самого первого. */
    var prevRuleId = null;
    var prevEl = null;
    paragraphs.forEach(function (p) {
      var txt = p.textContent || "";
      var matchedRuleId = null;
      for (var j = 0; j < index.length; j++) {
        var entry = index[j];
        var fullPrefix = entry.prefix + " ";
        if (!txt.startsWith(fullPrefix)) continue;
        var rule = entry.rule;
        matchedRuleId = rule.id;
        p.classList.add("paragraph-callout-" + rule.id);

        var isAdjacentRepeat = (prevRuleId === rule.id && prevEl === p.previousElementSibling);

        var mode = rule.prefixMode || "hide";
        if (mode === "show") break; /* prefix stays visible */

        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
        var first = walker.nextNode();
        if (!first || !first.textContent) break;
        first.textContent = first.textContent.substring(fullPrefix.length);

        if (mode === "replace" && !isAdjacentRepeat) {
          var hasSvg = rule.replacementSvg && rule.replacementSvg.trim().length > 0;
          var hasText = rule.replacementText && rule.replacementText.trim().length > 0;
          if (hasSvg || hasText) {
            var span = document.createElement("span");
            span.className = "paragraph-callout-prefix-replacement";
            if (hasSvg) {
              span.classList.add("paragraph-callout-prefix-svg");
              span.innerHTML = rule.replacementSvg;
            } else {
              span.textContent = rule.replacementText + " ";
            }
            first.parentNode.insertBefore(span, first);
          }
        }
        /* mode === "replace" && isAdjacentRepeat: префикс скрыт, но
           значок повторно не вставляем — это и есть подавление. */
        break;
      }

      /* Пометы ставим только в обычных абзацах. В выносках, списках,
         цитатах и таблицах строка в исходнике начинается с префикса, «- »
         или «> » и под выражение всё равно не подходит — в режиме чтения
         ведём себя так же, иначе два режима разойдутся. */
      if (!matchedRuleId && runInIndex.length > 0
          && !p.closest("blockquote, li, table, pre, .callout")) {
        markRunInInParagraph(p, runInIndex);
      }

      prevRuleId = matchedRuleId;
      prevEl = matchedRuleId ? p : null;
    });
  }
}

/* ═══════════════════════════════════════════
   Settings Tab
   ═══════════════════════════════════════════ */

class CalloutsSettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.openRuleId = null;
    this.openRunInId = null;
  }

  t(key) { return this.plugin.t(key); }

  display() {
    var containerEl = this.containerEl;
    containerEl.empty();
    containerEl.addClass("paragraph-callouts-settings");

    /* Функции перерисовки живых предпросмотров — по одной на раскрытое
       правило. Пересобираются вместе с DOM настроек. */
    this.previewPainters = [];

    containerEl.createEl("h1", { text: this.t("title") });

    var self = this;

    new obsidian.Setting(containerEl)
      .setName(this.t("langLabel"))
      .setDesc(this.t("langDesc"))
      .addDropdown(function (d) {
        d.addOptions({ en: "English", ru: "Русский" })
          .setValue(self.plugin.settings.lang || "en")
          .onChange(async function (v) {
            self.plugin.settings.lang = v;
            await self.plugin.saveSettings();
            self.display();
          });
      });

    new obsidian.Setting(containerEl)
      .setName(this.t("addRule"))
      .addButton(function (b) {
        b.setButtonText(self.t("addRuleBtn")).setCta().onClick(async function () {
          var nr = newRule();
          self.plugin.settings.rules.push(nr);
          self.openRuleId = nr.id;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    var rules = this.plugin.settings.rules;
    for (var i = 0; i < rules.length; i++) {
      this.renderRule(containerEl, rules[i], i);
    }

    /* ── Вводные пометы ── */

    containerEl.createEl("h2", { text: this.t("runIn") });
    containerEl.createDiv({ cls: "callout-prefix-note", text: this.t("runInDesc") });

    new obsidian.Setting(containerEl)
      .setName(this.t("addRunIn"))
      .addButton(function (b) {
        b.setButtonText(self.t("addRunInBtn")).setCta().onClick(async function () {
          var nl = newRunInRule();
          nl.name = self.t("newRunIn");
          self.plugin.settings.runIn.push(nl);
          self.openRunInId = nl.id;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    var labels = this.plugin.settings.runIn || [];
    for (var k = 0; k < labels.length; k++) {
      this.renderRunIn(containerEl, labels[k], k);
    }
  }

  renderRunIn(parent, runIn, idx) {
    var self = this;
    var wrap = parent.createDiv({ cls: "callout-rule-container" });
    var details = wrap.createEl("details");

    if (this.openRunInId === runIn.id) details.open = true;
    details.addEventListener("toggle", function () {
      if (details.open) self.openRunInId = runIn.id;
    });

    var summary = details.createEl("summary", { cls: "callout-rule-summary" });
    summary.createEl("span", { text: (idx + 1) + ". ", cls: "callout-rule-index" });
    var summaryName = summary.createEl("strong", { text: runIn.name });
    var summarySign = summary.createEl("code", { text: runIn.sign, cls: "callout-rule-prefix-code" });

    var body = details.createDiv({ cls: "callout-rule-body" });

    /* Цвета в предпросмотре приходят из инжектированного CSS и обновляются
       сами; вручную перерисовываем только текст. */
    var previewWrap = body.createDiv({ cls: "callout-preview-sticky" });
    previewWrap.createDiv({ cls: "callout-live-preview-label", text: this.t("preview") });
    var previewLine = previewWrap.createDiv({ cls: "callout-live-preview" });
    var previewChip = previewLine.createEl("span");
    var previewRest = previewLine.createEl("span");

    var paint = function () {
      summaryName.setText(runIn.name);
      summarySign.setText(runIn.sign);
      previewChip.className = "paragraph-runin paragraph-runin-" + runIn.id;
      previewChip.setText(self.t("runInSample") + runIn.sign);
      previewRest.setText(" " + self.t("previewText"));
    };
    paint();
    this.previewPainters.push(paint);

    new obsidian.Setting(body)
      .setName(this.t("name"))
      .addText(function (t) {
        t.setValue(runIn.name).onChange(async function (v) {
          runIn.name = v;
          await self.saveRunIn(runIn.id);
        });
      });

    new obsidian.Setting(body)
      .setName(this.t("runInSign"))
      .setDesc(this.t("runInSignDesc"))
      .addText(function (t) {
        t.setPlaceholder(":").setValue(runIn.sign).onChange(async function (v) {
          runIn.sign = v;
          await self.saveRunIn(runIn.id);
        });
      });

    new obsidian.Setting(body)
      .setName(this.t("runInWords"))
      .setDesc(this.t("runInWordsDesc"))
      .addSlider(function (s) {
        s.setLimits(1, 6, 1).setValue(runIn.maxWords || 3).setDynamicTooltip()
          .onChange(async function (v) { runIn.maxWords = v; await self.saveRunIn(runIn.id); });
      });

    new obsidian.Setting(body)
      .setName(this.t("runInRadius"))
      .addSlider(function (s) {
        var cur = (typeof runIn.borderRadius === "number") ? runIn.borderRadius : 7;
        s.setLimits(0, 16, 1).setValue(cur).setDynamicTooltip()
          .onChange(async function (v) { runIn.borderRadius = v; await self.saveRunIn(runIn.id); });
      });

    new obsidian.Setting(body)
      .setName(this.t("runInList"))
      .setDesc(this.t("runInListDesc"))
      .addText(function (t) {
        t.setPlaceholder(self.t("runInListPlaceholder"))
          .setValue(runIn.list || "")
          .onChange(async function (v) {
            runIn.list = v;
            await self.saveRunIn(runIn.id);
          });
      });

    /* Галки взаимоисключающие: включение одной снимает другую. Обе сняты —
       работают и список, и шаблон. */
    var modeRow = body.createDiv({ cls: "inline-row" });

    new obsidian.Setting(modeRow)
      .setName(this.t("runInListOnly"))
      .addToggle(function (t) {
        t.setValue(!!runIn.listOnly).onChange(async function (v) {
          runIn.listOnly = v;
          if (v) runIn.patternOnly = false;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    new obsidian.Setting(modeRow)
      .setName(this.t("runInPatternOnly"))
      .addToggle(function (t) {
        t.setValue(!!runIn.patternOnly).onChange(async function (v) {
          runIn.patternOnly = v;
          if (v) runIn.listOnly = false;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    body.createDiv({ cls: "callout-prefix-note", text: this.t("runInModeDesc") });

    this.colorPicker(body, this.t("runInText"), runIn.textColor, async function (v) {
      runIn.textColor = v;
      await self.saveRunIn(runIn.id);
    });

    this.colorPicker(body, this.t("runInBg"), runIn.backgroundColor, async function (v) {
      runIn.backgroundColor = v;
      await self.saveRunIn(runIn.id);
    });

    this.colorPicker(body, this.t("runInBorder"), runIn.borderColor, async function (v) {
      runIn.borderColor = v;
      await self.saveRunIn(runIn.id);
    });

    var danger = body.createDiv({ cls: "callout-danger-zone" });
    new obsidian.Setting(danger).addButton(function (b) {
      b.setButtonText(self.t("runInDuplicate")).onClick(async function () {
        var arr = self.plugin.settings.runIn;
        var i = arr.indexOf(runIn);
        var copy = Object.assign({}, runIn, { id: uid() });
        arr.splice(i < 0 ? arr.length : i + 1, 0, copy);
        self.openRunInId = copy.id;
        await self.plugin.saveSettings();
        self.display();
      });
    });
    new obsidian.Setting(danger).addButton(function (b) {
      b.setButtonText(self.t("delete")).setWarning().onClick(async function () {
        var arr = self.plugin.settings.runIn;
        var i = arr.indexOf(runIn);
        if (i >= 0) arr.splice(i, 1);
        self.openRunInId = null;
        await self.plugin.saveSettings();
        self.display();
      });
    });
  }

  async saveRunIn(labelId) {
    this.openRunInId = labelId;
    await this.plugin.saveSettings();
    var painters = this.previewPainters || [];
    for (var i = 0; i < painters.length; i++) {
      try { painters[i](); } catch (e) { /* элемент уже снят с DOM */ }
    }
  }

  renderRule(parent, rule, idx) {
    var self = this;
    var wrap = parent.createDiv({ cls: "callout-rule-container" });
    var details = wrap.createEl("details");

    if (this.openRuleId === rule.id) details.open = true;
    details.addEventListener("toggle", function () {
      if (details.open) self.openRuleId = rule.id;
    });

    var summary = details.createEl("summary", { cls: "callout-rule-summary" });
    summary.createEl("span", { text: (idx + 1) + ". ", cls: "callout-rule-index" });
    var summaryName = summary.createEl("strong", { text: rule.name });
    var summaryPrefix = summary.createEl("code", { text: rule.prefix, cls: "callout-rule-prefix-code" });

    var body = details.createDiv({ cls: "callout-rule-body" });

    /* ── Sticky Preview ── */
    var stickyWrap = body.createDiv({ cls: "callout-preview-sticky" });
    stickyWrap.createDiv({ cls: "callout-live-preview-label", text: self.t("preview") });
    var preview = stickyWrap.createDiv({ cls: "paragraph-callout-" + rule.id + " callout-live-preview" });

    /* Оформление предпросмотра (цвета, рамка, отступы, ширина) обновляется
       само: оно приходит из инжектированного CSS, который пересобирается на
       каждом save(). А содержимое — текст префикса, подставной символ, SVG —
       нужно перерисовать вручную, иначе предпросмотр отстаёт от настроек до
       следующего полного перерендера. */
    var paintPreview = function () {
      summaryName.setText(rule.name);
      summaryPrefix.setText(rule.prefix);
      preview.empty();
      var mode = rule.prefixMode || "hide";
      if (mode === "show") {
        preview.setText(rule.prefix + " " + self.t("previewText"));
      } else if (mode === "replace") {
        var hasSvg = rule.replacementSvg && rule.replacementSvg.trim().length > 0;
        var hasText = rule.replacementText && rule.replacementText.trim().length > 0;
        if (hasSvg) {
          var svgSpan = preview.createEl("span", {
            cls: "paragraph-callout-prefix-replacement paragraph-callout-prefix-svg"
          });
          svgSpan.innerHTML = rule.replacementSvg;
          preview.appendText(self.t("previewText"));
        } else if (hasText) {
          preview.setText(rule.replacementText + " " + self.t("previewText"));
        } else {
          preview.setText(self.t("previewText"));
        }
      } else {
        preview.setText(self.t("previewText"));
      }
    };
    paintPreview();
    if (!self.previewPainters) self.previewPainters = [];
    self.previewPainters.push(paintPreview);

    /* ── General ── */
    body.createEl("h4", { text: self.t("general") });

    var genRow = body.createDiv({ cls: "inline-row" });

    new obsidian.Setting(genRow)
      .setName(self.t("name"))
      .addText(function (t) {
        t.setValue(rule.name).onChange(async function (v) {
          rule.name = v;
          await self.save(rule.id);
        });
      });

    new obsidian.Setting(genRow)
      .setName(self.t("prefix"))
      .addText(function (t) {
        t.setPlaceholder(self.t("prefixPlaceholder")).setValue(rule.prefix).onChange(async function (v) {
          rule.prefix = v;
          await self.save(rule.id);
        });
      });

    body.createDiv({ cls: "callout-prefix-note", text: self.t("prefixNote") });

    new obsidian.Setting(body)
      .setName(self.t("synonyms"))
      .setDesc(self.t("synonymsDesc"))
      .addText(function (t) {
        t.setPlaceholder(self.t("synonymsPlaceholder")).setValue(rule.synonyms || "").onChange(async function (v) {
          rule.synonyms = v;
          await self.save(rule.id);
        });
      });

    /* ── Prefix Mode ── */
    new obsidian.Setting(body)
      .setName(self.t("prefixMode"))
      .setDesc(self.t("prefixModeDesc"))
      .addDropdown(function (d) {
        var opts = {};
        opts["show"] = self.t("prefixModeShow");
        opts["hide"] = self.t("prefixModeHide");
        opts["replace"] = self.t("prefixModeReplace");
        d.addOptions(opts)
          .setValue(rule.prefixMode || "hide")
          .onChange(async function (v) {
            rule.prefixMode = v;
            await self.plugin.saveSettings();
            self.display();
          });
      });

    if (rule.prefixMode === "replace") {
      new obsidian.Setting(body)
        .setName(self.t("replacementText"))
        .setDesc(self.t("replacementTextDesc"))
        .addText(function (t) {
          t.setPlaceholder(self.t("replacementTextPlaceholder"))
            .setValue(rule.replacementText || "")
            .onChange(async function (v) {
              rule.replacementText = v;
              await self.save(rule.id);
            });
        });

      /* SVG setting row: label + upload/clear buttons */
      var svgSetting = new obsidian.Setting(body)
        .setName(self.t("replacementSvg"))
        .setDesc(self.t("replacementSvgDesc"));

      svgSetting.addButton(function (b) {
        b.setButtonText(self.t("uploadSvg")).onClick(function () {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = ".svg";
          input.style.display = "none";
          document.body.appendChild(input);
          input.addEventListener("change", async function () {
            if (input.files && input.files[0]) {
              var reader = new FileReader();
              reader.onload = async function (e) {
                rule.replacementSvg = e.target.result;
                await self.plugin.saveSettings();
                self.display();
              };
              reader.readAsText(input.files[0]);
            }
            document.body.removeChild(input);
          });
          input.click();
        });
      });

      if (rule.replacementSvg && rule.replacementSvg.trim().length > 0) {
        svgSetting.addButton(function (b) {
          b.setButtonText(self.t("clearSvg")).setWarning().onClick(async function () {
            rule.replacementSvg = "";
            await self.plugin.saveSettings();
            self.display();
          });
        });
      }

      /* SVG textarea */
      var svgTextareaWrap = body.createDiv({ cls: "callout-svg-textarea-wrap" });
      var textarea = svgTextareaWrap.createEl("textarea", {
        cls: "callout-svg-textarea",
        attr: { rows: 4, placeholder: "<svg>...</svg>", spellcheck: "false" }
      });
      textarea.value = rule.replacementSvg || "";
      textarea.addEventListener("change", async function () {
        rule.replacementSvg = textarea.value;
        await self.plugin.saveSettings();
        self.display();
      });

      /* SVG preview */
      if (rule.replacementSvg && rule.replacementSvg.trim().length > 0) {
        var svgPreviewWrap = body.createDiv({ cls: "callout-svg-preview-wrap" });
        svgPreviewWrap.createDiv({ cls: "callout-svg-preview-label", text: self.t("svgPreview") });
        var svgPreviewBox = svgPreviewWrap.createDiv({ cls: "callout-svg-preview" });
        svgPreviewBox.innerHTML = rule.replacementSvg;
      }
    }

    /* ── Colors ── */
    body.createEl("h4", { text: self.t("colors") });

    var colRow = body.createDiv({ cls: "inline-row" });
    self.colorPicker(colRow, self.t("background"), rule.backgroundColor, async function (v) {
      rule.backgroundColor = v; await self.save(rule.id);
    });
    self.colorPicker(colRow, self.t("text"), rule.textColor, async function (v) {
      rule.textColor = v; await self.save(rule.id);
    });

    new obsidian.Setting(body)
      .setName(self.t("bgOpacity"))
      .addSlider(function (s) {
        s.setLimits(0, 100, 5).setValue(rule.backgroundOpacity).setDynamicTooltip()
          .onChange(async function (v) { rule.backgroundOpacity = v; await self.save(rule.id); });
      });

    new obsidian.Setting(body)
      .setName(self.t("gradientEnabled"))
      .addToggle(function (t) {
        t.setValue(!!rule.backgroundGradientEnabled).onChange(async function (v) {
          rule.backgroundGradientEnabled = v;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    if (rule.backgroundGradientEnabled) {
      var gradRow = body.createDiv({ cls: "inline-row" });
      self.colorPicker(gradRow, self.t("gradientColor2"), rule.backgroundColor2, async function (v) {
        rule.backgroundColor2 = v; await self.save(rule.id);
      });
      new obsidian.Setting(gradRow)
        .setName(self.t("gradientDirection"))
        .addDropdown(function (d) {
          var opts = {};
          opts["vertical"] = self.t("gradientVertical");
          opts["horizontal"] = self.t("gradientHorizontal");
          d.addOptions(opts)
            .setValue(rule.backgroundGradientDirection || "vertical")
            .onChange(async function (v) { rule.backgroundGradientDirection = v; await self.save(rule.id); });
        });
    }

    /* ── Border ── */
    body.createEl("h4", { text: self.t("borderAccent") });

    var borderToggles = body.createDiv({ cls: "inline-row" });

    new obsidian.Setting(borderToggles)
      .setName(self.t("border"))
      .addToggle(function (t) {
        t.setValue(rule.borderEnabled).onChange(async function (v) {
          rule.borderEnabled = v;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    new obsidian.Setting(borderToggles)
      .setName(self.t("leftAccent"))
      .addToggle(function (t) {
        t.setValue(rule.leftAccentEnabled).onChange(async function (v) {
          rule.leftAccentEnabled = v;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    if (rule.borderEnabled) {
      var bdRow = body.createDiv({ cls: "inline-row" });
      self.colorPicker(bdRow, self.t("borderColor"), rule.borderColor, async function (v) {
        rule.borderColor = v; await self.save(rule.id);
      });
      new obsidian.Setting(bdRow)
        .setName(self.t("width"))
        .addSlider(function (s) {
          s.setLimits(1, 10, 1).setValue(rule.borderWidth).setDynamicTooltip()
            .onChange(async function (v) { rule.borderWidth = v; await self.save(rule.id); });
        });

      var bdRow2 = body.createDiv({ cls: "inline-row" });
      new obsidian.Setting(bdRow2)
        .setName(self.t("opacity"))
        .addSlider(function (s) {
          s.setLimits(0, 100, 5).setValue(rule.borderOpacity).setDynamicTooltip()
            .onChange(async function (v) { rule.borderOpacity = v; await self.save(rule.id); });
        });
      new obsidian.Setting(bdRow2)
        .setName(self.t("style"))
        .addDropdown(function (d) {
          var opts = {};
          opts["solid"] = self.t("styleSolid");
          opts["dashed"] = self.t("styleDashed");
          opts["dotted"] = self.t("styleDotted");
          opts["double"] = self.t("styleDouble");
          d.addOptions(opts)
            .setValue(rule.borderStyle)
            .onChange(async function (v) { rule.borderStyle = v; await self.save(rule.id); });
        });
    }

    if (rule.leftAccentEnabled) {
      var laRow = body.createDiv({ cls: "inline-row" });
      self.colorPicker(laRow, self.t("accentColor"), rule.leftAccentColor, async function (v) {
        rule.leftAccentColor = v; await self.save(rule.id);
      });
      new obsidian.Setting(laRow)
        .setName(self.t("width"))
        .addSlider(function (s) {
          s.setLimits(1, 12, 1).setValue(rule.leftAccentWidth).setDynamicTooltip()
            .onChange(async function (v) { rule.leftAccentWidth = v; await self.save(rule.id); });
        });
      if (!rule.borderEnabled) {
        new obsidian.Setting(body)
          .setName(self.t("accentOpacity"))
          .addSlider(function (s) {
            s.setLimits(0, 100, 5).setValue(rule.leftAccentOpacity).setDynamicTooltip()
              .onChange(async function (v) { rule.leftAccentOpacity = v; await self.save(rule.id); });
          });
      }
    }

    /* ── Shape ── */
    body.createEl("h4", { text: self.t("shape") });

    var shapeRow = body.createDiv({ cls: "inline-row" });
    new obsidian.Setting(shapeRow)
      .setName(self.t("radius"))
      .addSlider(function (s) {
        s.setLimits(0, 28, 1).setValue(rule.borderRadius).setDynamicTooltip()
          .onChange(async function (v) { rule.borderRadius = v; await self.save(rule.id); });
      });
    new obsidian.Setting(shapeRow)
      .setName(self.t("padH"))
      .addSlider(function (s) {
        s.setLimits(0, 48, 2).setValue(rule.paddingH).setDynamicTooltip()
          .onChange(async function (v) { rule.paddingH = v; await self.save(rule.id); });
      });
    var padRow = body.createDiv({ cls: "inline-row" });
    new obsidian.Setting(padRow)
      .setName(self.t("padTop"))
      .addSlider(function (s) {
        s.setLimits(0, 28, 1).setValue(rule.paddingTop).setDynamicTooltip()
          .onChange(async function (v) { rule.paddingTop = v; await self.save(rule.id); });
      });
    new obsidian.Setting(padRow)
      .setName(self.t("padBottom"))
      .addSlider(function (s) {
        s.setLimits(0, 28, 1).setValue(rule.paddingBottom).setDynamicTooltip()
          .onChange(async function (v) { rule.paddingBottom = v; await self.save(rule.id); });
      });

    new obsidian.Setting(body)
      .setName(self.t("fitWidth"))
      .setDesc(self.t("fitWidthDesc"))
      .addToggle(function (t) {
        t.setValue(rule.fitWidth !== false).onChange(async function (v) {
          rule.fitWidth = v;
          await self.save(rule.id);
        });
      });

    /* ── Actions ── */
    var danger = body.createDiv({ cls: "callout-danger-zone" });

    new obsidian.Setting(danger)
      .addButton(function (b) {
        b.setButtonText(self.t("duplicate")).onClick(async function () {
          var clone = Object.assign({}, rule, { id: uid(), name: rule.name + " copy" });
          self.plugin.settings.rules.splice(idx + 1, 0, clone);
          self.openRuleId = clone.id;
          await self.plugin.saveSettings();
          self.display();
        });
      });

    new obsidian.Setting(danger)
      .addButton(function (b) {
        b.setButtonText(self.t("delete")).setWarning().onClick(async function () {
          self.plugin.settings.rules.splice(idx, 1);
          self.openRuleId = null;
          await self.plugin.saveSettings();
          self.display();
        });
      });
  }

  async save(ruleId) {
    this.openRuleId = ruleId;
    await this.plugin.saveSettings();
    /* Живое обновление предпросмотра без полного перерендера настроек —
       иначе слетает фокус в поле ввода и позиция прокрутки. */
    var painters = this.previewPainters || [];
    for (var i = 0; i < painters.length; i++) {
      try { painters[i](); } catch (e) { /* элемент уже снят с DOM */ }
    }
  }

  colorPicker(parent, label, initial, onChange) {
    var self = this;
    var setting = new obsidian.Setting(parent).setName(label);
    var wrapper = setting.controlEl.createDiv({ cls: "color-picker-wrapper" });
    var picker = wrapper.createEl("input");
    picker.type = "color";
    picker.className = "color-picker-native";
    picker.value = initial;
    var hex = wrapper.createEl("input");
    hex.type = "text";
    hex.className = "color-picker-hex";
    hex.value = initial;
    hex.maxLength = 7;
    picker.addEventListener("input", async function () {
      hex.value = picker.value;
      await onChange(picker.value);
    });
    hex.addEventListener("change", async function () {
      var v = hex.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        picker.value = v;
        await onChange(v);
      } else {
        hex.value = picker.value;
        new obsidian.Notice(self.t("invalidColor"));
      }
    });
  }
}

module.exports = ParagraphCalloutsPlugin;
