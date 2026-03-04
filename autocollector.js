 ==UserScript==
 @name         RPGTop Gifts Auto Collector
 @namespace    httpskindredspirits.ru
 @version      2.6
 @description  Автосбор подарков + поиск сокровищниц + авто-старт работ на спаунерах друзей + сбор плодов с дерева + панель сокровищницинструментов
 @author       Feathertail
 @match        httpsrpgtop.su
 @match        httpswww.rpgtop.su
 @grant        none
 ==UserScript==

(function () {
  'use strict';

  const VERBOSE = true;

  const DEFAULT_START_FROM = 1;
  const DEFAULT_COUNT = 1000;

  let START_FROM = DEFAULT_START_FROM;
  let COUNT = DEFAULT_COUNT;

  const FETCH_DELAY_MS = [200, 400];
  const SITE_DELAY_MS = [200, 400];
  const CLICK_DELAY_MS = [1200, 1800];
  const SPAWN_DELAY_MS = [450, 900];
  const TREE_DELAY_MS = [180, 320];

  const TREASURE_REFRESH_INTERVAL_MS = 45000;
  const TREASURE_REFRESH_STAGGER_MS = [240, 520];
  const TREASURE_VOTE_IFRAME_TIMEOUT_MS = 9000;
  const TREASURE_POST_WAIT_MS = [350, 650];

  const API_VER = 2040;
  const MAX_CLICKS_PER_GIFT = 2;

  const TOOL_CATALOG = [
    { id 391, name 'Лопата', spawns ['Торфяник', 'Грядка красной свеклы', 'Картофельное поле', 'Луковая грядка', 'Поле сахарной свеклы', 'Имбирное поле', 'Песочный карьер', 'Поле битвы', 'Глиняный карьер', 'Место раскопок'] },
    { id 876, name 'Малая кирка', spawns ['Горный склон', 'Соляные копи', 'Титановая шахта', 'Средняя угольная шахта', 'Малая угольная шахта', 'Шахта с беритом', 'Большая железная шахта', 'Большая медная шахта', 'Малая шахта меди', 'Средняя железная шахта', 'Малая серебряная шахта', 'Крохотная золотая шахта', 'Малая железная шахта'] },
    { id 874, name 'Топор дровосека', spawns ['Роща гевеи бразильской', 'Бамбуковая роща', 'Березовая роща', 'Хвойный лес', 'Осиновый лес', 'Тополиная аллея', 'Дубовая роща'] },
    { id 1199, name 'Корзина для сбора яиц', spawns ['Гнездо', 'Курица Пышка'] },
    { id 2048, name 'Бамбуковая палка', spawns ['Кокосовая плантация'] },
    { id 3488, name 'Poecilotheria metallica', spawns ['Террариум'] },
    { id 3103, name 'Штамп', spawns ['Театральная касса'] },
    { id 2306, name 'Корзина магазина комиксов', spawns ['Магазин комиксов Марвел'] },
    { id 1681, name 'Спутник', spawns ['Галактика'] },
    { id 2706, name 'Рюмка', spawns ['Бар «100 рентген»'] },
    { id 2797, name 'Корзина для сбора фруктов', spawns ['Кусты хурмы', 'Деревце фейхоа', 'Куст алычи', 'Кусты айвы', 'Абрикосовый сад', 'Сад киви', 'Грейпфрутовое дерево', 'Апельсиновый сад', 'Лаймовый сад', 'Гранатовый сад', 'Плантация манго'] },
    { id 2195, name 'Корзина для сбора', spawns ['Виноградник', 'Тутовник', 'Яблоневый сад', 'Плантация хмеля', 'Оливковое дерево', 'Кофейная плантация'] },
    { id 1115, name 'Кольцо поиска', spawns ['Уголок библиотеки'] },
    { id 3586, name 'Батискаф', spawns ['Океан'] },
    { id 3974, name 'Мачете', spawns ['Плантация Сахарного тростника'] },
    { id 3076, name 'Лейка', spawns ['Теплица с перцем', 'Теплица с помидорами', 'Теплица с огурцами'] },
    { id 1790, name 'Крейсер «Доблесть»', spawns ['Галактика «Звездных войн»'] },
    { id 3002, name 'Противогаз', spawns ['Отравленная миазмами земля'] },
    { id 1698, name 'Кузов', spawns ['Лещина обыкновенная'] },
    { id 3620, name 'Дирижерская палочка', spawns ['Музыкальная комната'] },
    { id 3984, name 'Кеды', spawns ['Стадион'] },
    { id 1512, name 'Ловушка для призраков', spawns ['Дом призраков'] },
    { id 3443, name 'Пропуск', spawns ['Больница Мистик Фоллс'] },
    { id 2206, name 'Садовые рукавицы', spawns ['Теплица с кабачками', 'Капустная грядка', 'Дынные грядки', 'Поле арбузов', 'Фасолевое поле', 'Малое тыквенное поле'] },
    { id 1797, name 'Сачок', spawns ['Речка', 'Искусственный пруд'] },
    { id 1598, name 'Фотоаппарат', spawns ['Самолёт на юг', 'Самолёт на север', 'Круизный лайнер в направлении запада', 'Круизный лайнер в направлении востока'] },
    { id 1913, name 'Исландская овчарка', spawns ['Сочный луг'] },
    { id 898, name 'Подзорная труба', spawns ['Звездное небо'] },
    { id 910, name 'Серп', spawns ['Кукурузное поле', 'Рисовое поле', 'Пшеничное поле', 'Цветочный луг', 'Льняное поле'] },
    { id 1257, name 'Лукошко для сбора ягод', spawns ['Куст крыжовника', 'Кусты кизила', 'Фиговое дерево', 'Кусты жимолости', 'Кусты черешни', 'Кусты шиповника', 'Кустики барбариса', 'Кусты ежевики', 'Деревце боярышника', 'Грядки с земляникой', 'Миндальное дерево', 'Туман', 'Обыкновенное болото', 'Лимонное дерево', 'Куст облепихи', 'Куст красной смородины', 'Сливовый сад', 'Кусты смородины', 'Грядки клубники', 'Малинник', 'Вишневый сад', 'Клюквенное болото'] },
  ];

  const origin = location.origin;
  const rand = (a, b) = Math.floor(a + Math.random()  (b - a + 1));
  const sleep = (ms) = new Promise((r) = setTimeout(r, ms));
  const jitter = ([a, b]) = sleep(rand(a, b));
  const yieldNow = () = new Promise((r) = setTimeout(r, 0));

  const LOG_PREFIX = '[rpgtop]';

  const TREASURE_LABEL_STYLE =
    'background#4b1766;color#ffd700;padding1px 4px;border-radius3px;font-weight600;';
  const TREASURE_SUMMARY_STYLE = 'color#ffd700;font-weight700;';
  const INFO_STYLE = 'color#2ecc71;';
  const WARN_STYLE = 'color#e67e22;';
  const ERR_STYLE = 'color#e74c3c;';
  const SPAWN_INFO_STYLE = 'color#3498db;';
  const TREE_INFO_STYLE = 'color#9b59b6;';

  function logTreasureFound(url) {
    console.log(
      '%c' + LOG_PREFIX + ' Найдена сокровищница',
      TREASURE_LABEL_STYLE,
      url,
    );
  }

  function logTreasureSummary(total) {
    if (total  0) {
      console.log(
        '%c' + LOG_PREFIX + ' Найдено сокровищниц ' + total + '. Список',
        TREASURE_SUMMARY_STYLE,
      );
    } else {
      console.log(
        '%c' + LOG_PREFIX + ' Сокровищницы не найдены на обработанных сайтах.',
        TREASURE_SUMMARY_STYLE,
      );
    }
  }

  function normSpawnName(s) {
    return String(s  '')
      .replace(u00a0g, ' ')
      .replace([«»']g, '')
      .replace(([^)])g, ' ')
      .replace(s+d+ssd+s$g, ' ')
      .replace(s+g, ' ')
      .trim()
      .toLowerCase()
      .replace(ёg, 'е');
  }

  const TOOL_BY_ID = new Map();
  const TOOL_SPAWNS_NORM = new Map();
  const SPAWN_TO_TOOLS = new Map();

  (function buildToolMaps() {
    for (let i = 0; i  TOOL_CATALOG.length; i++) {
      const t = TOOL_CATALOG[i];
      const id = String(t.id);
      TOOL_BY_ID.set(id, { id, name String(t.name), spawns t.spawns.slice() });

      const set = new Set();
      for (let j = 0; j  t.spawns.length; j++) {
        const sn = normSpawnName(t.spawns[j]);
        if (!sn) continue;
        set.add(sn);

        if (!SPAWN_TO_TOOLS.has(sn)) SPAWN_TO_TOOLS.set(sn, []);
        SPAWN_TO_TOOLS.get(sn).push(id);
      }
      TOOL_SPAWNS_NORM.set(id, set);
    }
  })();

  let spawnsActiveToolOverride = null;

  const treasureSet = new Set();
  const treasureList = [];
  const TREASURE_STORAGE_KEY = 'rpgtop_treasures_v1';

  const treasureMeta = new Map();
  let treasureUI = {
    block null,
    btn null,
    list null,
    count null,
    hint null,
    btnClear null,
  };
  let treasuresTickTimer = null;
  let treasuresRefreshTimer = null;
  let treasuresRefreshInFlight = false;

  let spawnsToolUI = {
    block null,
    list null,
    titleActive null,
    hint null,
    btnRefresh null,
  };

  function loadTreasuresFromStorage() {
    try {
      const raw = localStorage.getItem(TREASURE_STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;

      for (let i = 0; i  arr.length; i++) {
        const url = String(arr[i]  '');
        if (!url) continue;
        if (!treasureSet.has(url)) {
          treasureSet.add(url);
          treasureList.push(url);
        }
      }
    } catch (e) {}
  }

  function saveTreasuresToStorage() {
    try {
      localStorage.setItem(TREASURE_STORAGE_KEY, JSON.stringify(treasureList));
    } catch (e) {}
  }

  function ensureTreasureMeta(url) {
    if (!treasureMeta.has(url)) {
      treasureMeta.set(url, {
        url,
        attemptsUsed null,
        attemptsTotal null,
        keysFound null,
        keysTotal null,
        timerText '',
        timerSec null,
        timerFetchedAt null,
        lastCheckedAt null,
        lastActionAt null,
        lastError '',
      });
    }
    return treasureMeta.get(url);
  }

  function updateTreasureMeta(url, patch) {
    const m = ensureTreasureMeta(url);
    Object.assign(m, patch  {});
    if (treasureUI.block) renderTreasureListUI();
  }

  function notifyTreasureAdded(url) {
    ensureTreasureMeta(url);
    if (treasureUI.block) {
      renderTreasureListUI();
      refreshTreasureStatuses([url]).catch(() = {});
    }
  }

  loadTreasuresFromStorage();
  for (let i = 0; i  treasureList.length; i++)
    ensureTreasureMeta(treasureList[i]);

  function isOnSpawnsPage() {
    try {
      const u = new URL(location.href);
      return (
        u.pathname === 'cgi-binu.cgi' && u.searchParams.get('a') === 'spawns'
      );
    } catch (e) {
      return false;
    }
  }

  function isOnCollectionPage() {
    try {
      const u = new URL(location.href);
      return (
        u.pathname === 'cgi-binm.cgi' &&
        u.searchParams.get('a') === 'collection'
      );
    } catch (e) {
      return false;
    }
  }

  function isOnTreePage() {
    try {
      const u = new URL(location.href);
      return (
        u.pathname === 'cgi-bing.cgi' && u.searchParams.get('a') === 'tree'
      );
    } catch (e) {
      return false;
    }
  }

  function buildListUrlForPage(urlStr, pageNum) {
    const u = new URL(urlStr, origin);
    const p = u.pathname.replace(^+, '');
    let m;

    m = p.match(^(rd+(td+))pd+.html$i);
    if (m) return origin + '' + m[1] + 'p' + pageNum + '.html';

    m = p.match(^(rd+(td+)).htm$i);
    if (m) return origin + '' + m[1] + 'p' + pageNum + '.html';

    if (^pd+.html$i.test(p)) return origin + 'p' + pageNum + '.html';
    if (p === ''  p === 'index.html')
      return origin + 'p' + pageNum + '.html';

    m = p.match(^(.)(p)(d+)(.html)$i);
    if (m) return origin + '' + m[1] + 'p' + pageNum + '.html';

    return u.href;
  }

  async function fetchDoc(url) {
    const ctrl = new AbortController();
    const t = setTimeout(function () {
      ctrl.abort();
    }, 15000);
    try {
      const res = await fetch(url, {
        credentials 'include',
        signal ctrl.signal,
      });
      const html = await res.text();
      return new DOMParser().parseFromString(html, 'texthtml');
    } finally {
      clearTimeout(t);
    }
  }

  async function fetchXml(url) {
    const ctrl = new AbortController();
    const t = setTimeout(function () {
      ctrl.abort();
    }, 15000);

    try {
      const res = await fetch(url, {
        credentials 'include',
        signal ctrl.signal,
      });
      const buffer = await res.arrayBuffer();

      let text = '';
      if (buffer.byteLength  0) {
        const head = new TextDecoder('utf-8').decode(
          buffer.slice(0, Math.min(200, buffer.byteLength)),
        );

        const ct = (res.headers.get('content-type')  '').toLowerCase();
        const isCp1251Header = ct.includes('1251');
        const isCp1251Xml =
          encoding=[']windows-1251[']i.test(head) 
          encoding=[']cp1251[']i.test(head);

        if (isCp1251Header  isCp1251Xml) {
          text = new TextDecoder('windows-1251').decode(buffer);
        } else {
          text = new TextDecoder('utf-8').decode(buffer);
        }
      }

      return new DOMParser().parseFromString(text, 'textxml');
    } finally {
      clearTimeout(t);
    }
  }

  function normalizeCommUrl(href) {
    try {
      const u = new URL(href, origin);
      const m = u.pathname.match(^comm(td)(d+)d+.htm$i);
      if (m) return u.origin + 'comm' + m[1] + '1.htm';
      return null;
    } catch (e) {
      return null;
    }
  }

  function extractFromBlock4(doc) {
    const boxes = Array.prototype.slice.call(doc.querySelectorAll('.block_4'));
    const urls = [];
    for (let i = 0; i  boxes.length; i++) {
      const box = boxes[i];
      let a = box.querySelector('.comments a[href^=comm]');
      if (!a) a = box.querySelector('a[href^=comm]');
      const href = a && a.getAttribute('href');
      const norm = href  normalizeCommUrl(href)  null;
      if (norm) urls.push(norm);
    }
    if (VERBOSE) {
      console.log(
        '[rpgtop] .block_4 на странице',
        boxes.length,
        'получено comm-ссылок',
        urls.length,
      );
    }
    return { urls urls, perPage boxes.length };
  }

  async function detectPerPageWithDoc(startUrl) {
    const firstUrl = buildListUrlForPage(startUrl, 1);
    const doc = await fetchDoc(firstUrl);
    const extracted = extractFromBlock4(doc);
    const perPage = extracted.perPage  20;
    return { perPage perPage, firstDoc doc };
  }

  async function collectByRankRange(startUrl, startRank, count) {
    const info = await detectPerPageWithDoc(startUrl);
    const perPage = info.perPage;
    let firstDoc = info.firstDoc;

    if (VERBOSE) console.log('[rpgtop] perPage =', perPage);

    const startPage = Math.floor((startRank - 1)  perPage) + 1;
    const startOffset = (startRank - 1) % perPage;

    const result = [];
    let page = startPage;

    while (result.length  count) {
      let doc;
      if (page === 1 && firstDoc) {
        doc = firstDoc;
        firstDoc = null;
      } else {
        const pageUrl = buildListUrlForPage(startUrl, page);
        doc = await fetchDoc(pageUrl);
      }

      const extracted = extractFromBlock4(doc);
      const urls = extracted.urls;
      const onPage = extracted.perPage;
      if (!onPage) break;

      const slice = page === startPage  urls.slice(startOffset)  urls;
      for (let i = 0; i  slice.length; i++) {
        result.push(slice[i]);
        if (result.length = count) break;
      }

      page++;
      await jitter(FETCH_DELAY_MS);
    }

    return result;
  }

  function parseSiteIdFromCommUrl(commUrl) {
    try {
      const u = new URL(commUrl);
      const m = u.pathname.match(comm(td)(d+)i);
      if (m) return m[1];
      return null;
    } catch (e) {
      return null;
    }
  }

  function detectTreasuresFromXml(xml, commUrl, siteId, apiOrigin) {
    const itemsNodes = Array.prototype.slice.call(
      xml.getElementsByTagName('items'),
    );

    for (let i = 0; i  itemsNodes.length; i++) {
      const node = itemsNodes[i];
      const linkNode = node.getElementsByTagName('link')[0];
      if (!linkNode) continue;

      const linkText = (linkNode.textContent  '').trim();
      if (!linkText  linkText.indexOf('a=treasure') === -1) continue;

      const hrefMatch = linkText.match(
        href=[']([^']a=treasure[^'])[']i,
      );
      if (!hrefMatch) continue;

      let href = hrefMatch[1];

      if (href.indexOf('site=') === -1 && siteId) {
        const sep = href.indexOf('') === -1  ''  '&';
        href += sep + 'site=' + encodeURIComponent(siteId);
      }

      const absUrl = new URL(href, apiOrigin  commUrl).href;

      if (!treasureSet.has(absUrl)) {
        treasureSet.add(absUrl);
        treasureList.push(absUrl);
        saveTreasuresToStorage();
        logTreasureFound(absUrl);
        notifyTreasureAdded(absUrl);
      }
    }
  }

  function parseGiftsFromXml(xml, pageNum) {
    const items = Array.prototype.slice.call(xml.getElementsByTagName('items'));
    const gifts = [];

    for (let i = 0; i  items.length; i++) {
      const node = items[i];

      const actionNode = node.getElementsByTagName('action')[0];
      const action = actionNode && (actionNode.textContent  '').trim();
      if (action !== 'item_get') continue;

      const itemIdNode = node.getElementsByTagName('itemid')[0];
      const itemvNode = node.getElementsByTagName('itemv')[0];
      if (!itemIdNode  !itemvNode) continue;

      const id = (itemIdNode.textContent  '').trim();
      const item = (itemvNode.textContent  '').trim();

      const altNode = node.getElementsByTagName('alt')[0];
      const alt = altNode  (altNode.textContent  '').trim()  '';

      const numNode = node.getElementsByTagName('num')[0];
      let amount = 1;
      if (numNode) {
        const n = parseInt((numNode.textContent  '').trim(), 10);
        if (Number.isFinite(n) && n  0) amount = n;
      }

      gifts.push({ id, item, alt, amount, page pageNum });
    }

    return gifts;
  }

  function parseGiftsFromCommDoc(doc, defaultSiteId) {
    const nodes = Array.prototype.slice.call(
      doc.querySelectorAll('#gtitems .gift[onclick=item_get]'),
    );

    const gifts = [];
    for (let i = 0; i  nodes.length; i++) {
      const el = nodes[i];
      const onclick = el.getAttribute('onclick')  '';
      const m = onclick.match(
        item_gets(s(d+)s,s(d+)s,s(d+)s,s(d+)s)i,
      );
      if (!m) continue;

      const id = m[1];
      const item = m[2];
      const siteFromOnclick = m[3];
      const page = parseInt(m[4], 10)  1;

      let amount = 1;
      const numEl = el.querySelector('.num');
      if (numEl) {
        const n = parseInt((numEl.textContent  '').trim(), 10);
        if (Number.isFinite(n) && n  0) amount = n;
      }

      const img = el.querySelector('img');
      const alt = img  (img.getAttribute('alt')  '').trim()  '';

      gifts.push({
        id,
        item,
        alt,
        amount,
        page,
        _siteHint siteFromOnclick  defaultSiteId  null,
      });
    }

    return gifts;
  }

  function hasPage2Hint(gifts) {
    for (let i = 0; i  gifts.length; i++) {
      if ((gifts[i].page  1) = 2) return true;
    }
    return false;
  }

  async function listGiftsForSite(commUrl) {
    const siteId = parseSiteIdFromCommUrl(commUrl);
    if (!siteId) return { siteId null, apiOrigin null, gifts [] };

    const apiOrigin = new URL(commUrl).origin;

    const gifts = [];
    const seen = new Set();

    const addGift = (g) = {
      if (!g  !g.id  !g.item) return;

      if (g._siteHint && String(g._siteHint) !== String(siteId)) {
        if (VERBOSE) {
          console.warn(
            '%c' +
              LOG_PREFIX +
              ' Внимание onclick site=' +
              g._siteHint +
              ' не совпал с siteId из commUrl=' +
              siteId +
              '. Оставляю siteId из commUrl.',
            WARN_STYLE,
          );
        }
      }

      const key = `${siteId}${g.id}${g.item}${g.page  1}`;
      if (seen.has(key)) return;
      seen.add(key);

      gifts.push({
        id g.id,
        item g.item,
        alt g.alt  '',
        amount g.amount  1,
        page g.page  1,
      });
    };

    try {
      const listUrl1 =
        apiOrigin +
        'cgi-binjs_item.cgiact=list&ver=' +
        API_VER +
        '&site=' +
        encodeURIComponent(siteId) +
        '&page=1';

      const xml1 = await fetchXml(listUrl1);

      try {
        detectTreasuresFromXml(xml1, commUrl, siteId, apiOrigin);
      } catch (e) {
        if (VERBOSE) {
          console.warn(
            '%c' +
              LOG_PREFIX +
              ' Ошибка при разборе сокровищниц в XML для ' +
              commUrl,
            WARN_STYLE,
            e,
          );
        }
      }

      const page1Gifts = parseGiftsFromXml(xml1, 1);
      page1Gifts.forEach(addGift);
    } catch (e) {
      if (VERBOSE) {
        console.warn(
          '%c' + LOG_PREFIX + ' Ошибка загрузки XML list page=1 для ' + commUrl,
          WARN_STYLE,
          e,
        );
      }
    }

    await jitter(FETCH_DELAY_MS);
    await yieldNow();

    let htmlHintsPage2 = false;
    try {
      const commDoc = await fetchDoc(commUrl);
      const htmlGifts = parseGiftsFromCommDoc(commDoc, siteId);
      htmlGifts.forEach(addGift);

      htmlHintsPage2 = hasPage2Hint(htmlGifts);

      if (VERBOSE && htmlGifts.length) {
        console.log(
          '%c' +
            LOG_PREFIX +
            ' HTML gtitems найдено предметов ' +
            htmlGifts.length,
          INFO_STYLE,
        );
      }
    } catch (e) {
      if (VERBOSE) {
        console.warn(
          '%c' +
            LOG_PREFIX +
            ' Не удалось разобрать HTML comm для gtitems ' +
            commUrl,
          WARN_STYLE,
          e,
        );
      }
    }

    const alreadyHasPage2 = hasPage2Hint(gifts);

    if (htmlHintsPage2  alreadyHasPage2) {
      try {
        const listUrl2 =
          apiOrigin +
          'cgi-binjs_item.cgiact=list&ver=' +
          API_VER +
          '&site=' +
          encodeURIComponent(siteId) +
          '&page=2';

        const xml2 = await fetchXml(listUrl2);

        try {
          detectTreasuresFromXml(xml2, commUrl, siteId, apiOrigin);
        } catch (e) {
          if (VERBOSE) {
            console.warn(
              '%c' +
                LOG_PREFIX +
                ' Ошибка при разборе сокровищниц XML page=2 для ' +
                commUrl,
              WARN_STYLE,
              e,
            );
          }
        }

        const page2Gifts = parseGiftsFromXml(xml2, 2);
        page2Gifts.forEach(addGift);
      } catch (e) {
        if (VERBOSE) {
          console.warn(
            '%c' +
              LOG_PREFIX +
              ' Ошибка загрузки XML list page=2 для ' +
              commUrl,
            WARN_STYLE,
            e,
          );
        }
      }
    }

    return { siteId siteId, apiOrigin apiOrigin, gifts gifts };
  }

  async function collectGiftsForSite(listInfo) {
    const siteId = listInfo.siteId;
    const apiOrigin = listInfo.apiOrigin;
    const gifts = listInfo.gifts;
    const commUrl = listInfo.commUrl  null;

    if (!siteId  !apiOrigin)
      return { giftsOnSite 0, clicks 0, logicalGifts 0 };
    if (!gifts.length) return { giftsOnSite 0, clicks 0, logicalGifts 0 };

    let clicks = 0;
    let logicalGifts = 0;

    for (let gi = 0; gi  gifts.length; gi++) {
      const g = gifts[gi];

      if (window.__rpgtopStop) break;
      while (window.__rpgtopPause && !window.__rpgtopStop) await sleep(400);
      if (window.__rpgtopStop) break;

      const intended = Math.min(g.amount, MAX_CLICKS_PER_GIFT);
      if (intended = 0) continue;

      let loggedThisGift = false;

      for (let i = 0; i  intended; i++) {
        const url =
          apiOrigin +
          'cgi-binjs_item.cgiact=get' +
          '&ver=' +
          API_VER +
          '&id=' +
          encodeURIComponent(g.id) +
          '&site=' +
          encodeURIComponent(siteId) +
          '&item=' +
          encodeURIComponent(g.item) +
          '&page=' +
          (g.page  1);

        try {
          const xml = await fetchXml(url);
          const errNode = xml.getElementsByTagName('error')[0];
          const errText = errNode && errNode.textContent.trim();

          if (errText && errText !== '0') {
            const alreadyTaken =
              уже забралиi.test(errText)  вы уже получалиi.test(errText);

            if (VERBOSE && !alreadyTaken) {
              console.warn(
                '%c' +
                  LOG_PREFIX +
                  ' item_get ошибка для сайта ' +
                  siteId +
                  ', id=' +
                  g.id +
                  ', попытка ' +
                  (i + 1) +
                  '' +
                  intended +
                  ' ' +
                  errText,
                WARN_STYLE,
              );
            }
            break;
          }

          clicks++;

          if (VERBOSE && !loggedThisGift) {
            const label = g.alt  g.item  '(без названия)';
            console.log(
              '%c' +
                LOG_PREFIX +
                ' Сайт ' +
                (commUrl  'id ' + siteId) +
                ' — собран подарок ' +
                label,
              INFO_STYLE,
            );
            loggedThisGift = true;
          }
        } catch (e) {
          console.warn(
            '%c' +
              LOG_PREFIX +
              ' сетевая ошибка item_get для сайта ' +
              siteId +
              ', id=' +
              g.id +
              ', попытка ' +
              (i + 1) +
              '' +
              intended +
              '',
            WARN_STYLE,
            e,
          );
          break;
        }

        await jitter(CLICK_DELAY_MS);
        await yieldNow();
      }

      if (loggedThisGift) logicalGifts++;
    }

    return {
      giftsOnSite gifts.length,
      clicks clicks,
      logicalGifts logicalGifts,
    };
  }

  const SPAWNS_STORAGE_NICK_KEY = 'rpgtop_spawns_nick_v1';

  function normalizeNick(s) {
    return String(s  '').trim();
  }

  function extractNickFromTitle() {
    try {
      const t = document.title  '';
      const m = t.match(Спаунеры пользователяs+(.+)s-sTOPsRPGi);
      if (m) return normalizeNick(m[1]);
    } catch (e) {}
    return '';
  }

  function loadNickFromStorage() {
    try {
      return normalizeNick(localStorage.getItem(SPAWNS_STORAGE_NICK_KEY));
    } catch (e) {
      return '';
    }
  }

  function saveNickToStorage(nick) {
    try {
      localStorage.setItem(SPAWNS_STORAGE_NICK_KEY, normalizeNick(nick));
    } catch (e) {}
  }

  function getMyNick() {
    const saved = loadNickFromStorage();
    if (saved) return saved;

    const fromTitle = extractNickFromTitle();
    if (fromTitle) {
      saveNickToStorage(fromTitle);
      return fromTitle;
    }

    return '';
  }

  function isMyNickInSpawnsBox(boxEl, myNick) {
    const nick = normalizeNick(myNick);
    if (!boxEl  !nick) return false;

    const links = boxEl.querySelectorAll('.mess a');
    for (let i = 0; i  links.length; i++) {
      const a = links[i];
      const txt = normalizeNick(a.textContent);
      if (txt === nick) return true;
      const b = a.querySelector('b');
      if (b && normalizeNick(b.textContent) === nick) return true;
    }

    const allText = normalizeNick(boxEl.textContent  '');
    return allText.indexOf(nick) !== -1;
  }

  function collectSpawnJobsWithBoxes(doc) {
    const links = Array.prototype.slice.call(
      doc.querySelectorAll('.block_6 .cin a.messf[href=a=tool_jobs]'),
    );

    const jobs = [];
    for (let i = 0; i  links.length; i++) {
      const a = links[i];
      const href = a.getAttribute('href');
      if (!href) continue;

      const url = new URL(href, location.href).href;

      const box =
        a.closest('div[style=border-bottom]') 
        a.closest('div[style=dashed]') 
        a.closest('div');

      const text = a.textContent.trim();
      const spawnNorm = normSpawnName(text);

      jobs.push({ url, text, spawnNorm, box });
    }
    return jobs;
  }

  function getActiveToolFromDoc(doc) {
    if (!doc) return null;

    const blocks = Array.prototype.slice.call(doc.querySelectorAll('.block_6'));
    for (let i = 0; i  blocks.length; i++) {
      const b = blocks[i];
      const h3 =
        b.querySelector('.header h3.in') 
        b.querySelector('.header h3') 
        b.querySelector('h3');
      const h3Text = (h3  h3.textContent  '').replace(s+g, ' ').trim();
      if (!Активированныеs+предметыi.test(h3Text)) continue;

      const link = b.querySelector('.cin a[href^=item]');
      const href = link  link.getAttribute('href')  ''  '';
      const m = href.match(item(d+).htmli);
      if (!m) return null;

      const id = String(m[1]);
      const nameEl = b.querySelector('.cin b');
      const name = (nameEl  nameEl.textContent  '').replace(s+g, ' ').trim();

      return { id, name name  (TOOL_BY_ID.get(id)  TOOL_BY_ID.get(id).name  '') };
    }

    return null;
  }

  function getActiveTool() {
    if (spawnsActiveToolOverride && spawnsActiveToolOverride.id) return spawnsActiveToolOverride;
    const t = getActiveToolFromDoc(document);
    return t;
  }

  function computeSuggestedToolsForSpawns(spawnNorms) {
    const toolIds = new Set();
    for (const sn of spawnNorms) {
      const arr = SPAWN_TO_TOOLS.get(sn);
      if (!arr  !arr.length) continue;
      for (let i = 0; i  arr.length; i++) toolIds.add(String(arr[i]));
    }
    return Array.from(toolIds);
  }

  async function activateTool(toolId) {
    const id = String(toolId  '');
    if (!id) throw new Error('toolId empty');

    const confirmUrl = new URL('cgi-binm.cgi', origin);
    confirmUrl.searchParams.set('a', 'tool');
    confirmUrl.searchParams.set('id', id);

    const doc = await fetchDoc(confirmUrl.href);

    const form =
      doc.querySelector('form[name=confirm]') 
      doc.querySelector('form[action=cgi-binm.cgi]') 
      doc.querySelector('form');

    if (!form) throw new Error('confirm form not found');

    const actionAttr = form.getAttribute('action')  'cgi-binm.cgi';
    const actionUrl = new URL(actionAttr, origin).href;

    const inputs = Array.prototype.slice.call(form.querySelectorAll('input[name]'));
    const fields = {};
    for (let i = 0; i  inputs.length; i++) {
      const inp = inputs[i];
      const name = inp.getAttribute('name');
      if (!name) continue;
      fields[name] = inp.value  '';
    }

    if (!fields.a) fields.a = 'tool';
    if (!fields.id) fields.id = id;

    if (!fields.verid) {
      const veridEl = form.querySelector('input[name=verid]');
      const v = veridEl  (veridEl.value  '').trim()  '';
      if (v) fields.verid = v;
    }

    if (!fields.verid) throw new Error('verid not found');

    fields.ver = 'on';

    await postFormUrlEncoded(actionUrl, fields);

    const known = TOOL_BY_ID.get(id);
    spawnsActiveToolOverride = { id, name known  known.name  fields.id  id };
  }

  async function startWorkOnSpawnJob(job) {
    const jobUrl = job.url;

    let jobDoc;
    try {
      jobDoc = await fetchDoc(jobUrl);
    } catch (e) {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' Спаунер не удалось загрузить tool_jobs ' +
          jobUrl,
        WARN_STYLE,
        e,
      );
      return false;
    }

    const startLink = jobDoc.querySelector(
      'a.kupi_active[href=a=tool_start]',
    );
    if (!startLink) {
      if (VERBOSE) {
        console.log(
          '%c' +
            LOG_PREFIX +
            ' Спаунер нет активной кнопки начать работу на ' +
            jobUrl,
          SPAWN_INFO_STYLE,
        );
      }
      return false;
    }

    const href = startLink.getAttribute('href');
    if (!href) return false;

    const startUrl = new URL(href, jobUrl).href;

    try {
      await fetch(startUrl, { credentials 'include' });
      console.log(
        '%c' + LOG_PREFIX + ' Спаунер начата работа — ' + (job.text  jobUrl),
        SPAWN_INFO_STYLE,
      );
      return true;
    } catch (e) {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' Спаунер сетевая ошибка при запуске работы ' +
          startUrl,
        WARN_STYLE,
        e,
      );
      return false;
    }
  }

  function renderSpawnsToolUI() {
    if (!spawnsToolUI.block  !spawnsToolUI.list  !spawnsToolUI.titleActive) return;

    const jobs = collectSpawnJobsWithBoxes(document);
    const spawnNormsSet = new Set();
    for (let i = 0; i  jobs.length; i++) {
      if (jobs[i].spawnNorm) spawnNormsSet.add(jobs[i].spawnNorm);
    }

    const active = getActiveTool();
    const activeId = active && active.id  String(active.id)  '';
    const activeName = active && active.name  String(active.name)  (activeId && TOOL_BY_ID.get(activeId)  TOOL_BY_ID.get(activeId).name  '');

    if (activeId) {
      spawnsToolUI.titleActive.textContent = activeName  `${activeName} (${activeId})`  `id ${activeId}`;
    } else {
      spawnsToolUI.titleActive.textContent = 'не активирован';
    }

    const suggested = computeSuggestedToolsForSpawns(spawnNormsSet)
      .map((id) = TOOL_BY_ID.get(String(id)))
      .filter(Boolean);

    suggested.sort((a, b) = (a.name  '').localeCompare(b.name  '', 'ru'));

    if (activeId) {
      const allowedSet = TOOL_SPAWNS_NORM.get(activeId)  null;
      let ok = 0;
      let total = 0;

      if (allowedSet) {
        for (const sn of spawnNormsSet) {
          total++;
          if (allowedSet.has(sn)) ok++;
        }
      } else {
        total = spawnNormsSet.size;
        ok = spawnNormsSet.size;
      }

      spawnsToolUI.list.innerHTML =
        'div style=font-size11px;opacity.85;line-height1.35;' +
        'Спаунов на странице b' + String(spawnNormsSet.size) + 'b.br' +
        (allowedSet
           'Подходят под инструмент b' + String(ok) + 'b.'
           'Инструмент не в списке соответствий — фильтр по инструменту отключен.') +
        'div';
      return;
    }

    if (!suggested.length) {
      spawnsToolUI.list.innerHTML =
        'div style=opacity.8;font-size11px;line-height1.35;' +
        'Инструмент не активирован.brПодходящих инструментов для спаунов на странице не найдено.' +
        'div';
      return;
    }

    const btns = [];
    for (let i = 0; i  suggested.length; i++) {
      const t = suggested[i];
      btns.push(
        'button type=button data-tool-id=' + t.id + ' style=' +
          'padding6px 8px;border-radius8px;border1px solid rgba(255,255,255,0.25);' +
          'backgroundrgba(255,255,255,0.12);color#fff;cursorpointer;font-size11px;font-weight600;' +
          '' +
          'Активировать ' + String(t.name) +
        'button',
      );
    }

    spawnsToolUI.list.innerHTML =
      'div style=font-size11px;opacity.85;line-height1.35;margin-bottom6px;' +
      'Инструмент не активирован. Доступные для этих спаунов' +
      'div' +
      'div style=displayflex;flex-wrapwrap;gap6px;' + btns.join('') + 'div' +
      'div style=font-size11px;opacity.7;line-height1.35;margin-top6px;' +
      'После активации нажмите «Старт» (или обновите страницу, если хотите видеть блок активированного предмета).' +
      'div';
  }

  async function runSpawnsCollector() {
    console.log(
      '%c' +
        LOG_PREFIX +
        ' Режим спаунеры друзей (страница spawns). Будут обработаны ссылки на tool_jobs.',
      SPAWN_INFO_STYLE,
    );

    const myNick = getMyNick();

    if (VERBOSE) {
      console.log(
        '%c' +
          LOG_PREFIX +
          ' Spawns текущий ник для фильтра уже работаю ' +
          (myNick  myNick  '(не задан)'),
        SPAWN_INFO_STYLE,
      );
    }

    const activeTool = getActiveTool();
    if (!activeTool  !activeTool.id) {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' Spawns инструмент не активирован. Сначала активируйте инструмент (кнопками в панели).',
        WARN_STYLE,
      );
      renderSpawnsToolUI();
      return;
    }

    const activeId = String(activeTool.id);
    const activeName = activeTool.name  (TOOL_BY_ID.get(activeId)  TOOL_BY_ID.get(activeId).name  '');
    const allowedSet = TOOL_SPAWNS_NORM.get(activeId)  null;

    if (VERBOSE) {
      console.log(
        '%c' +
          LOG_PREFIX +
          ' Spawns активный инструмент ' +
          (activeName  activeName  'id ' + activeId) +
          (allowedSet  ''  ' (нет списка соответствий — фильтр по инструменту отключен)'),
        SPAWN_INFO_STYLE,
      );
    }

    const jobs = collectSpawnJobsWithBoxes(document);

    if (!jobs.length) {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' На странице spawns не найдено ни одного спаунера (a.messf  tool_jobs).',
        WARN_STYLE,
      );
      return;
    }

    let filtered = jobs;

    if (allowedSet) {
      const beforeTool = filtered.length;
      filtered = filtered.filter((j) = j.spawnNorm && allowedSet.has(j.spawnNorm));
      const skippedTool = beforeTool - filtered.length;

      console.log(
        '%c' +
          LOG_PREFIX +
          ' Spawns всего=' +
          beforeTool +
          ', пропущено (не подходит инструменту)=' +
          skippedTool +
          ', осталось=' +
          filtered.length +
          '.',
        SPAWN_INFO_STYLE,
      );

      if (!filtered.length) {
        console.log(
          '%c' +
            LOG_PREFIX +
            ' Spawns на странице нет спаунов под активный инструмент — запускать нечего.',
          SPAWN_INFO_STYLE,
        );
        return;
      }
    }

    if (myNick) {
      const before = filtered.length;
      filtered = filtered.filter((j) = !isMyNickInSpawnsBox(j.box, myNick));
      const skipped = before - filtered.length;

      console.log(
        '%c' +
          LOG_PREFIX +
          ' Spawns всего(после фильтра инструмента)=' +
          before +
          ', пропущено (уже работаю)=' +
          skipped +
          ', к запуску=' +
          filtered.length +
          '.',
        SPAWN_INFO_STYLE,
      );

      if (!filtered.length) {
        console.log(
          '%c' +
            LOG_PREFIX +
            ' Spawns все подходящие спаунеры уже содержат ваш ник в Работают — запускать нечего.',
          SPAWN_INFO_STYLE,
        );
        return;
      }
    } else {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' Spawns ник не удалось определить. Фильтр уже работаю отключен (заполните ник в панели).',
        WARN_STYLE,
      );
      console.log(
        '%c' +
          LOG_PREFIX +
          ' Подсказка ник берётся из заголовка вида Спаунеры пользователя ник - TOP RPG, либо из поля в панели.',
        SPAWN_INFO_STYLE,
      );
    }

    let processed = 0;
    let started = 0;

    for (let i = 0; i  filtered.length; i++) {
      const job = filtered[i];

      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }
      while (window.__rpgtopPause && !window.__rpgtopStop) await sleep(400);
      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }

      const ok = await startWorkOnSpawnJob(job);
      processed++;
      if (ok) started++;

      await jitter(SPAWN_DELAY_MS);
    }

    console.log(
      '%c' +
        LOG_PREFIX +
        ' Спауны обработано к запуску ' +
        processed +
        ', успешно начато работ ' +
        started +
        '.',
      SPAWN_INFO_STYLE,
    );
  }

  function highlightCollectionGifts() {
    try {
      const actions = Array.prototype.slice.call(
        document.querySelectorAll('div.gift_action a[href=a=collect]'),
      );

      if (!actions.length) {
        if (VERBOSE)
          console.log(
            LOG_PREFIX +
              ' На странице коллекции нет активных подарков для подсветки.',
          );
        return;
      }

      actions.forEach((a) = {
        const gift = a.closest('.gift');
        if (!gift) return;
        gift.style.outline = '2px solid red';
        gift.style.outlineOffset = '2px';
      });

      if (VERBOSE)
        console.log(
          LOG_PREFIX +
            ' Подсвечено активных подарков на странице коллекции ' +
            actions.length,
        );
    } catch (e) {
      console.warn(
        '%c' + LOG_PREFIX + ' Ошибка при подсветке подарков коллекции',
        WARN_STYLE,
        e,
      );
    }
  }

  function collectTreeFruitLinks(doc) {
    const links = Array.prototype.slice.call(
      doc.querySelectorAll(
        '.tree_plods a.vote_stat_buttom.tree_buttom[href=a=tree_get]',
      ),
    );

    const uniq = new Map();
    for (let i = 0; i  links.length; i++) {
      const a = links[i];
      const href = a.getAttribute('href');
      if (!href) continue;
      const url = new URL(href, location.href).href;
      if (!uniq.has(url)) {
        const span = a.closest('span');
        const title = (span && span.getAttribute('title'))  '';
        const img = span  span.querySelector('img.plod')  null;
        const alt = img  img.getAttribute('alt')  ''  '';
        const label = (title  alt  '').trim();
        uniq.set(url, { a, url, label });
      }
    }
    return Array.from(uniq.values());
  }

  function markTreeFruitAsCollected(a) {
    try {
      a.textContent = 'Забрано';
      a.style.pointerEvents = 'none';
      a.style.opacity = '0.55';
      a.style.filter = 'grayscale(1)';
      const span = a.closest('span');
      if (span) span.style.opacity = '0.75';
    } catch (e) {}
  }

  function extractTreasureVisitActions(doc, baseUrl) {
    const forms = Array.prototype.slice.call(
      doc.querySelectorAll('.treasure_site_visit form'),
    );
    const actions = [];

    for (let i = 0; i  forms.length; i++) {
      const form = forms[i];

      const aInput = form.querySelector('input[name=a]');
      const aVal = aInput && (aInput.value  '').trim();
      if (aVal !== 'tr_visit') continue;

      const visitInput = form.querySelector('input[name=visit]');
      const visit = visitInput && (visitInput.value  '').trim();
      if (!visit) continue;

      const actionAttr = form.getAttribute('action')  'cgi-bing.cgi';
      const actionUrl = new URL(actionAttr, baseUrl).href;

      const inputs = Array.prototype.slice.call(
        form.querySelectorAll('input[name]'),
      );
      const fields = {};
      for (let j = 0; j  inputs.length; j++) {
        const inp = inputs[j];
        const name = inp.getAttribute('name');
        if (!name) continue;
        fields[name] = inp.value  '';
      }

      actions.push({ actionUrl, fields, visit });
    }

    return actions;
  }

  async function postFormUrlEncoded(actionUrl, fields) {
    const params = new URLSearchParams();
    Object.keys(fields  {}).forEach((k) = params.append(k, fields[k]));

    return fetch(actionUrl, {
      method 'POST',
      credentials 'include',
      headers {
        'content-type' 'applicationx-www-form-urlencoded; charset=UTF-8',
      },
      body params.toString(),
    });
  }

  function fireVoteViaIframe(visitId, baseOrigin) {
    const voteUrl = new URL('vote' + encodeURIComponent(visitId), baseOrigin)
      .href;

    return new Promise((resolve) = {
      const iframe = document.createElement('iframe');
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.opacity = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');

      let done = false;
      let t = null;

      const finish = () = {
        if (done) return;
        done = true;
        if (t) clearTimeout(t);
        try {
          iframe.remove();
        } catch (e) {}
        resolve(voteUrl);
      };

      iframe.onload = finish;
      iframe.onerror = finish;

      t = setTimeout(finish, TREASURE_VOTE_IFRAME_TIMEOUT_MS);

      document.body.appendChild(iframe);
      iframe.src = voteUrl;
    });
  }

  function parseTreasureKeys(doc) {
    const keysRow = doc.querySelector('.treasure_main_keys');
    const spans = keysRow
       Array.prototype.slice.call(keysRow.querySelectorAll('span'))
       [];
    let found = null;
    let total = null;

    if (spans.length) {
      total = spans.length;
      found = 0;

      for (let i = 0; i  spans.length; i++) {
        const s = spans[i];
        const bg = (
          s.style && s.style.backgroundColor
             s.style.backgroundColor
             s.getAttribute('style')  ''
        ).toLowerCase();

        if (bg.indexOf('green') !== -1) found++;
      }
    }

    const textBox = doc.querySelector('.treasure_main_text');
    const txt = (textBox  textBox.textContent  '')
      .replace(s+g, ' ')
      .trim();
    const m = txt.match(Ключей найденоs(d+)sизs(d+)i);

    if (m) {
      const tf = parseInt(m[1], 10);
      const tt = parseInt(m[2], 10);

      if (Number.isFinite(tt) && tt  0) total = total === null  tt  total;
      if (Number.isFinite(tf) && tf = 0) {
        if (found === null) found = tf;
      }
    }

    if (found === null && total === null) return null;
    return {
      found found === null  0  found,
      total total === null  0  total,
    };
  }

  function parseTreasureTimer(doc) {
    const norm = (s) =
      String(s  '')
        .replace(u00a0g, ' ')
        .replace(s+g, ' ')
        .trim();

    const el =
      doc.querySelector('.treasure_vahat')  doc.querySelector('#vahat');
    const directText = norm(el  el.textContent  '');
    let m =
      directText.match((d+)sмин.s(d+)sсек.i) 
      directText.match((d+)sмин.s(d+)sсекi);
    if (m) {
      const mm = parseInt(m[1], 10);
      const ss = parseInt(m[2], 10);
      if (Number.isFinite(mm) && Number.isFinite(ss)) {
        return { text directText, sec mm  60 + ss };
      }
    }

    const scripts = Array.prototype.slice.call(doc.querySelectorAll('script'));
    let base = null;
    let add = 0;

    for (let i = 0; i  scripts.length; i++) {
      const code = scripts[i].textContent  '';

      const mBase = code.match(bvars+Vahats=s(d+)s;i);
      if (mBase) base = parseInt(mBase[1], 10);

      const adds = code.match(bVahats+=s(d+)s;gi);
      if (adds && adds.length) {
        for (let j = 0; j  adds.length; j++) {
          const one = adds[j].match(bVahats+=s(d+)s;i);
          if (one) {
            const v = parseInt(one[1], 10);
            if (Number.isFinite(v)) add += v;
          }
        }
      }
    }

    if (Number.isFinite(base)) {
      const sec = Math.max(0, base + (Number.isFinite(add)  add  0));
      const mm = Math.floor(sec  60);
      const ss = sec % 60;
      const text = mm + ' мин. ' + (ss  10  '0' + ss  String(ss)) + ' сек.';
      return { text, sec };
    }

    return { text directText  '', sec null };
  }

  function formatTimerFromMeta(m) {
    if (
      !m 
      !Number.isFinite(m.timerSec) 
      !Number.isFinite(m.timerFetchedAt)
    )
      return '—';
    const passed = Math.floor((Date.now() - m.timerFetchedAt)  1000);
    const left = Math.max(0, m.timerSec - passed);
    const mm = Math.floor(left  60);
    const ss = left % 60;
    return mm + '' + (ss  10  '0' + ss  String(ss));
  }

  function formatAttemptsFromMeta(m) {
    if (!m) return '—';
    if (!Number.isFinite(m.attemptsUsed)  !Number.isFinite(m.attemptsTotal))
      return '—';
    return String(m.attemptsUsed) + '' + String(m.attemptsTotal);
  }

  function shortUrl(u) {
    try {
      const url = new URL(u);
      const p = url.pathname + (url.search  '');
      return (url.host + p).replace(^www., '');
    } catch (e) {
      return u;
    }
  }

  function renderTreasuresHeader() {
    if (!treasureUI.count) return;
    treasureUI.count.textContent = String(treasureList.length);
  }

  function renderTreasureListUI() {
    if (!treasureUI.list) return;

    renderTreasuresHeader();

    if (!treasureList.length) {
      treasureUI.list.innerHTML =
        'div style=opacity.75;font-size11px;Список пустdiv';
      if (treasureUI.btn) treasureUI.btn.disabled = true;
      if (treasureUI.btnClear) treasureUI.btnClear.disabled = true;
      return;
    }

    const rows = [];
    for (let i = 0; i  treasureList.length; i++) {
      const url = treasureList[i];
      const m = ensureTreasureMeta(url);

      const attempts = formatAttemptsFromMeta(m);
      const timer = formatTimerFromMeta(m);

      const keys =
        Number.isFinite(m.keysFound) && Number.isFinite(m.keysTotal)
           String(m.keysFound) + '' + String(m.keysTotal)
           '—';

      const lastErr = m.lastError
         'div style=color#ffcc80;opacity.9;' +
          String(m.lastError).slice(0, 70) +
          'div'
         '';

      rows.push(
        'div style=displaygrid;grid-template-columns 1fr auto;gap6px;align-itemsstart;padding6px 0;border-top1px solid rgba(255,255,255,0.12);' +
          'div style=min-width0;' +
          'a href=' +
          url +
          ' target=_blank rel=noopener style=color#cde3ff;text-decorationnone;displayblock;white-spacenowrap;overflowhidden;text-overflowellipsis;font-size11px;' +
          (i + 1) +
          '. ' +
          shortUrl(url) +
          'a' +
          'div style=displayflex;gap10px;flex-wrapwrap;font-size11px;opacity.9;margin-top2px;' +
          'spanПопытки b style=color#fff;' +
          attempts +
          'bspan' +
          'spanКлючи b style=color#fff;' +
          keys +
          'bspan' +
          'spanТаймер b style=color#fff;' +
          timer +
          'bspan' +
          'div' +
          lastErr +
          'div' +
          'div style=font-size11px;opacity.85;text-alignright;' +
          (m.lastCheckedAt
             new Date(m.lastCheckedAt).toLocaleTimeString().slice(0, 5)
             '—') +
          'div' +
          'div',
      );
    }

    treasureUI.list.innerHTML = rows.join('');

    if (treasureUI.btn) treasureUI.btn.disabled = false;
    if (treasureUI.btnClear) treasureUI.btnClear.disabled = false;
  }

  function parseTreasureAttempts(doc) {
    const norm = (s) =
      String(s  '')
        .replace(u00a0g, ' ')
        .replace(s+g, ' ')
        .trim();

    const box = doc.querySelector('.treasure_main_text');

    if (box) {
      const ps = Array.prototype.slice.call(box.querySelectorAll('p'));
      for (let i = 0; i  ps.length; i++) {
        const p = ps[i];
        const t = norm(p.textContent);
        if (!Попытокi.test(t)) continue;

        const bs = p.querySelectorAll('b');
        if (bs && bs.length = 2) {
          const used = parseInt(norm(bs[0].textContent), 10);
          const total = parseInt(norm(bs[1].textContent), 10);
          if (Number.isFinite(used) && Number.isFinite(total))
            return { used, total };
        }

        const m = t.match(Попытокs(d+)s(из)s(d+)i);
        if (m) {
          const used = parseInt(m[1], 10);
          const total = parseInt(m[2], 10);
          if (Number.isFinite(used) && Number.isFinite(total))
            return { used, total };
        }
      }

      const txt = norm(box.textContent);
      const m2 = txt.match(Попытокs(d+)s(из)s(d+)i);
      if (m2) {
        const used = parseInt(m2[1], 10);
        const total = parseInt(m2[2], 10);
        if (Number.isFinite(used) && Number.isFinite(total))
          return { used, total };
      }
    }

    const bodyTxt = norm(doc.body  doc.body.textContent  '');
    const m3 = bodyTxt.match(Попытокs(d+)s(из)s(d+)i);
    if (m3) {
      const used = parseInt(m3[1], 10);
      const total = parseInt(m3[2], 10);
      if (Number.isFinite(used) && Number.isFinite(total))
        return { used, total };
    }

    return null;
  }

  async function refreshTreasureStatuses(urls) {
    if (treasuresRefreshInFlight) return;
    treasuresRefreshInFlight = true;

    try {
      const list =
        Array.isArray(urls) && urls.length
           urls.slice()
           treasureList.slice();

      for (let i = 0; i  list.length; i++) {
        if (window.__rpgtopStop) break;

        const url = list[i];
        ensureTreasureMeta(url);

        try {
          const doc = await fetchDoc(url);

          const att = parseTreasureAttempts(doc);
          const tim = parseTreasureTimer(doc);
          const keys = parseTreasureKeys(doc);

          updateTreasureMeta(url, {
            attemptsUsed att  att.used  null,
            attemptsTotal att  att.total  null,
            keysFound keys  keys.found  null,
            keysTotal keys  keys.total  null,
            timerText tim.text  '',
            timerSec Number.isFinite(tim.sec)  tim.sec  null,
            timerFetchedAt Number.isFinite(tim.sec)  Date.now()  null,
            lastCheckedAt Date.now(),
            lastError '',
          });
        } catch (e) {
          updateTreasureMeta(url, {
            lastCheckedAt Date.now(),
            lastError 'ошибка загрузки',
          });
        }

        await jitter(TREASURE_REFRESH_STAGGER_MS);
        await yieldNow();
      }
    } finally {
      treasuresRefreshInFlight = false;
    }
  }

  function startTreasureTicking() {
    if (treasuresTickTimer) clearInterval(treasuresTickTimer);
    treasuresTickTimer = setInterval(function () {
      if (!treasureUI.list) return;
      const nodes = treasureUI.list.querySelectorAll('div');
      if (!nodes  !nodes.length) return;
      renderTreasureListUI();
    }, 1000);
  }

  function startTreasureAutoRefresh() {
    if (treasuresRefreshTimer) clearInterval(treasuresRefreshTimer);
    treasuresRefreshTimer = setInterval(function () {
      if (!treasureList.length) return;
      refreshTreasureStatuses().catch(() = {});
    }, TREASURE_REFRESH_INTERVAL_MS);
  }

  let isMainRunning = false;
  let isTreasureRunning = false;

  window.__rpgtopStop = false;
  window.__rpgtopPause = false;
  window.__rpgtopTreasureIgnorePause = false;

  async function runTreasuresAutomation(ignorePause) {
    const list = treasureList.slice();

    if (!list.length) {
      console.log(
        '%c' + LOG_PREFIX + ' Сокровищницы список пуст (нечего обрабатывать).',
        TREASURE_SUMMARY_STYLE,
      );
      return;
    }

    console.log(
      '%c' + LOG_PREFIX + ' Сокровищницы к обработке ссылок ' + list.length,
      TREASURE_SUMMARY_STYLE,
    );

    let processedPages = 0;
    let totalVisits = 0;

    for (let ti = 0; ti  list.length; ti++) {
      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }

      while (window.__rpgtopPause && !window.__rpgtopStop && !ignorePause)
        await sleep(400);
      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }

      const treasureUrl = list[ti];
      const baseOrigin = new URL(treasureUrl).origin;

      let doc;
      try {
        doc = await fetchDoc(treasureUrl);
      } catch (e) {
        updateTreasureMeta(treasureUrl, {
          lastCheckedAt Date.now(),
          lastError 'ошибка загрузки',
        });
        continue;
      }

      const att0 = parseTreasureAttempts(doc);
      const tim0 = parseTreasureTimer(doc);
      const keys0 = parseTreasureKeys(doc);

      updateTreasureMeta(treasureUrl, {
        attemptsUsed att0  att0.used  null,
        attemptsTotal att0  att0.total  null,
        keysFound keys0  keys0.found  null,
        keysTotal keys0  keys0.total  null,
        timerText tim0.text  '',
        timerSec Number.isFinite(tim0.sec)  tim0.sec  null,
        timerFetchedAt Number.isFinite(tim0.sec)  Date.now()  null,
        lastCheckedAt Date.now(),
        lastError '',
      });

      const actions = extractTreasureVisitActions(doc, treasureUrl);

      if (!actions.length) {
        processedPages++;
        await jitter(SITE_DELAY_MS);
        continue;
      }

      const act = actions[rand(0, actions.length - 1)];

      try {
        await postFormUrlEncoded(act.actionUrl, act.fields);
        await jitter(TREASURE_POST_WAIT_MS);
      } catch (e) {
        updateTreasureMeta(treasureUrl, {
          lastCheckedAt Date.now(),
          lastError 'ошибка tr_visit',
        });
        processedPages++;
        await jitter(SITE_DELAY_MS);
        continue;
      }

      try {
        const voteUrl = await fireVoteViaIframe(act.visit, baseOrigin);
        totalVisits++;
        updateTreasureMeta(treasureUrl, {
          lastActionAt Date.now(),
          lastError '',
        });

        if (VERBOSE) {
          console.log(
            '%c' +
              LOG_PREFIX +
              ' Сокровищницы tr_visit + vote для visit=' +
              act.visit +
              ' (' +
              voteUrl +
              ')',
            INFO_STYLE,
          );
        }
      } catch (e) {
        updateTreasureMeta(treasureUrl, {
          lastActionAt Date.now(),
          lastError 'ошибка vote',
        });
      }

      await jitter([520, 820]);

      try {
        const doc2 = await fetchDoc(treasureUrl);
        const att = parseTreasureAttempts(doc2);
        const tim = parseTreasureTimer(doc2);
        const keys = parseTreasureKeys(doc2);

        updateTreasureMeta(treasureUrl, {
          attemptsUsed att  att.used  null,
          attemptsTotal att  att.total  null,
          keysFound keys  keys.found  null,
          keysTotal keys  keys.total  null,
          timerText tim.text  '',
          timerSec Number.isFinite(tim.sec)  tim.sec  null,
          timerFetchedAt Number.isFinite(tim.sec)  Date.now()  null,
          lastCheckedAt Date.now(),
          lastError '',
        });
      } catch (e) {}

      processedPages++;
      await jitter(SITE_DELAY_MS);
      await yieldNow();
    }

    console.log(
      '%c' +
        LOG_PREFIX +
        ' Сокровищницы готово. Страниц обработано ' +
        processedPages +
        ', выполнено tr_visitvote ' +
        totalVisits +
        '.',
      TREASURE_SUMMARY_STYLE,
    );
  }

  async function runTreeCollector() {
    console.log(
      '%c' +
        LOG_PREFIX +
        ' Режим дерево (tree). Собираю все плоды на странице...',
      TREE_INFO_STYLE,
    );

    const fruits = collectTreeFruitLinks(document);
    if (!fruits.length) {
      console.log(
        '%c' +
          LOG_PREFIX +
          ' На странице не найдено плодов для сбора (tree_get).',
        TREE_INFO_STYLE,
      );
      return;
    }

    console.log(
      '%c' + LOG_PREFIX + ' Найдено плодов ' + fruits.length,
      TREE_INFO_STYLE,
    );

    let processed = 0;
    let okCount = 0;

    for (let i = 0; i  fruits.length; i++) {
      const f = fruits[i];

      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }
      while (window.__rpgtopPause && !window.__rpgtopStop) await sleep(400);
      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }

      processed++;

      try {
        const res = await fetch(f.url, { credentials 'include' });

        if (res && res.ok) {
          okCount++;
          markTreeFruitAsCollected(f.a);

          if (VERBOSE) {
            console.log(
              '%c' +
                LOG_PREFIX +
                ' Дерево собран плод ' +
                processed +
                '' +
                fruits.length +
                (f.label  ' — ' + f.label  ''),
              TREE_INFO_STYLE,
            );
          }
        } else {
          console.warn(
            '%c' + LOG_PREFIX + ' Дерево ответ не ok для ' + f.url,
            WARN_STYLE,
          );
        }
      } catch (e) {
        console.warn(
          '%c' + LOG_PREFIX + ' Дерево сетевая ошибка для ' + f.url,
          WARN_STYLE,
          e,
        );
      }

      await jitter(TREE_DELAY_MS);
      await yieldNow();
    }

    console.log(
      '%c' +
        LOG_PREFIX +
        ' Дерево готово. Обработано ' +
        processed +
        ', успешно собрано ' +
        okCount +
        '.',
      TREE_INFO_STYLE,
    );
  }

  function clearAllTreasures() {
    try {
      localStorage.removeItem(TREASURE_STORAGE_KEY);
    } catch (e) {}

    treasureSet.clear();
    treasureList.length = 0;
    treasureMeta.clear();

    if (treasureUI.block) renderTreasureListUI();
  }

  function ensureTreePageButton() {
    const cin = document.querySelector('.cin');
    if (!cin) return;

    if (document.getElementById('rpgtop-tree-collect-all')) return;

    const wrap = document.createElement('div');
    wrap.id = 'rpgtop-tree-collect-all';
    Object.assign(wrap.style, {
      margin '10px 0 14px',
      display 'flex',
      justifyContent 'center',
      alignItems 'center',
      gap '8px',
      flexWrap 'wrap',
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Собрать все плоды';
    Object.assign(btn.style, {
      padding '8px 12px',
      borderRadius '8px',
      border '1px solid rgba(0,0,0,0.2)',
      background 'rgba(255,255,255,0.85)',
      cursor 'pointer',
      fontWeight '600',
      boxShadow '0 2px 8px rgba(0,0,0,0.12)',
    });

    const hint = document.createElement('span');
    hint.textContent = '(паузастоп работают из панели справа)';
    Object.assign(hint.style, { fontSize '12px', opacity '0.75' });

    btn.addEventListener('click', function () {
      const panelStart = document.getElementById('rpgtop-panel-start');
      if (panelStart) panelStart.click();
      else {
        runTreeCollector().catch((e) =
          console.error('%c' + LOG_PREFIX + ' Tree error', ERR_STYLE, e),
        );
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(hint);

    cin.insertBefore(wrap, cin.firstChild);
  }

  let inputStartEl = null;
  let inputCountEl = null;
  let rangeInfoEl = null;

  let inputNickEl = null;

  async function runCollector() {
    const START_URL = location.href;

    console.log(
      '%c[rpgtop] Команды (через UI иили консоль)',
      'color#2b6;',
      'n  __rpgtopPause = truefalse — паузапродолжитьn  __rpgtopStop  = true        — остановить',
    );

    const tStart =
      typeof performance !== 'undefined' && performance.now
         performance.now()
         Date.now();

    const list = await collectByRankRange(START_URL, START_FROM, COUNT);
    console.log(
      LOG_PREFIX +
        ' К сбору по местам с ' +
        START_FROM +
        ' по ' +
        (START_FROM + list.length - 1) +
        '. URL-ов ' +
        list.length,
    );
    if (!list.length) {
      console.warn(
        '%c' +
          LOG_PREFIX +
          ' Не удалось собрать ссылки. Убедитесь, что вы на странице категории с .block_4.',
        WARN_STYLE,
      );
      return;
    }

    let processed = 0;
    let totalClicks = 0;
    let totalLogicalGifts = 0;

    for (let i = 0; i  list.length; i++) {
      const commUrl = list[i];

      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }
      while (window.__rpgtopPause && !window.__rpgtopStop) await sleep(400);
      if (window.__rpgtopStop) {
        console.warn(
          '%c' + LOG_PREFIX + ' Остановлено пользователем',
          WARN_STYLE,
        );
        break;
      }

      const listInfo = await listGiftsForSite(commUrl);
      listInfo.commUrl = commUrl;

      const res = await collectGiftsForSite(listInfo);

      processed++;
      totalClicks += res.clicks;
      totalLogicalGifts += res.logicalGifts;

      await jitter(SITE_DELAY_MS);
    }

    const tEnd =
      typeof performance !== 'undefined' && performance.now
         performance.now()
         Date.now();
    const elapsedMs = tEnd - tStart;

    function formatDuration(ms) {
      const totalSec = Math.round(ms  1000);
      const minutes = Math.floor(totalSec  60);
      const seconds = totalSec % 60;
      if (minutes  0)
        return (
          minutes + ' мин ' + (seconds  10  '0' + seconds  seconds) + ' с'
        );
      return totalSec + ' с';
    }

    console.log(
      LOG_PREFIX +
        ' Готово за ' +
        formatDuration(elapsedMs) +
        '. Обработано сайтов ' +
        processed +
        '. Собрано подарков (уникальных) ' +
        totalLogicalGifts +
        '. Всего успешных item_get ' +
        totalClicks +
        '.',
    );

    logTreasureSummary(treasureList.length);
    if (treasureList.length) {
      treasureList.forEach((url, idx) =
        console.log('  ' + (idx + 1) + '. ' + url),
      );
    }
  }

  function createControlPanel() {
    const PANEL_COLLAPSE_KEY = 'rpgtop_panel_collapsed_v1';

    const panel = document.createElement('div');
    panel.id = 'rpgtop-gifts-panel';
    Object.assign(panel.style, {
      position 'fixed',
      top '10px',
      right '10px',
      zIndex '99999',
      padding '8px 10px',
      background 'rgba(0,0,0,0.7)',
      color '#fff',
      fontSize '12px',
      fontFamily 'system-ui, sans-serif',
      borderRadius '6px',
      boxShadow '0 2px 6px rgba(0,0,0,0.4)',
      display 'flex',
      flexDirection 'column',
      gap '6px',
      maxWidth '380px',
      minWidth '300px',
    });

    const headerRow = document.createElement('div');
    Object.assign(headerRow.style, {
      display 'flex',
      alignItems 'center',
      justifyContent 'space-between',
      gap '8px',
    });

    const title = document.createElement('div');
    title.textContent = 'RPTop Gifts  Spawns  Tree';
    Object.assign(title.style, { fontWeight '600', fontSize '12px' });

    function makeButton(text) {
      const b = document.createElement('button');
      b.textContent = text;
      Object.assign(b.style, {
        padding '2px 6px',
        fontSize '11px',
        cursor 'pointer',
      });
      return b;
    }

    const btnCollapse = makeButton('Свернуть');
    Object.assign(btnCollapse.style, { fontWeight '600' });

    headerRow.appendChild(title);
    headerRow.appendChild(btnCollapse);
    panel.appendChild(headerRow);

    const bodyWrap = document.createElement('div');
    Object.assign(bodyWrap.style, {
      display 'flex',
      flexDirection 'column',
      gap '6px',
    });
    panel.appendChild(bodyWrap);

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display 'flex',
      gap '4px',
      marginBottom '2px',
    });

    const btnStart = makeButton('Старт');
    const btnPause = makeButton('Пауза');
    const btnStop = makeButton('Стоп');

    btnStart.id = 'rpgtop-panel-start';
    btnPause.id = 'rpgtop-panel-pause';
    btnStop.id = 'rpgtop-panel-stop';

    btnRow.appendChild(btnStart);
    btnRow.appendChild(btnPause);
    btnRow.appendChild(btnStop);

    const status = document.createElement('div');
    status.textContent = 'Состояние ожидание';
    Object.assign(status.style, { fontSize '11px', opacity '0.85' });

    const rangeRow = document.createElement('div');
    Object.assign(rangeRow.style, {
      display 'flex',
      flexWrap 'wrap',
      gap '4px',
      marginTop '2px',
      alignItems 'center',
      fontSize '11px',
      opacity '0.9',
    });

    const labelFrom = document.createElement('span');
    labelFrom.textContent = 'С места';

    const inputStart = document.createElement('input');
    inputStart.type = 'number';
    inputStart.min = '1';
    inputStart.value = String(START_FROM);
    Object.assign(inputStart.style, {
      width '60px',
      padding '1px 3px',
      fontSize '11px',
    });

    const labelCount = document.createElement('span');
    labelCount.textContent = 'Кол-во';

    const inputCount = document.createElement('input');
    inputCount.type = 'number';
    inputCount.min = '1';
    inputCount.value = String(COUNT);
    Object.assign(inputCount.style, {
      width '60px',
      padding '1px 3px',
      fontSize '11px',
    });

    rangeRow.appendChild(labelFrom);
    rangeRow.appendChild(inputStart);
    rangeRow.appendChild(labelCount);
    rangeRow.appendChild(inputCount);

    const rangeInfo = document.createElement('div');
    Object.assign(rangeInfo.style, {
      fontSize '11px',
      opacity '0.85',
      marginTop '2px',
    });

    const modeInfo = document.createElement('div');
    Object.assign(modeInfo.style, {
      fontSize '11px',
      opacity '0.8',
      marginTop '2px',
    });

    const mode = isOnTreePage()
       'tree'
       isOnSpawnsPage()
         'spawns'
         'gifts';
    modeInfo.textContent =
      mode === 'tree'
         'Режим дерево (tree)'
         mode === 'spawns'
           'Режим спаунеры друзей (spawns)'
           'Режим сбор подарков (рейтинг)';

    if (mode === 'tree'  mode === 'spawns') {
      rangeRow.style.display = 'none';
      rangeInfo.style.display = 'none';
    }

    if (mode === 'tree') btnStart.textContent = 'Собрать все плоды';
    if (mode === 'spawns') btnStart.textContent = 'Старт работ';

    inputStartEl = inputStart;
    inputCountEl = inputCount;
    rangeInfoEl = rangeInfo;

    function recalcRangePreview() {
      if (!rangeInfoEl  !inputStartEl  !inputCountEl) return;
      const startVal = parseInt(inputStartEl.value, 10);
      const countVal = parseInt(inputCountEl.value, 10);

      const effStart =
        Number.isFinite(startVal) && startVal  0
           startVal
           DEFAULT_START_FROM;
      const effCount =
        Number.isFinite(countVal) && countVal  0  countVal  DEFAULT_COUNT;

      const effEnd = effStart + effCount - 1;
      rangeInfoEl.textContent =
        'Итого будет собрано с ' + effStart + ' по ' + effEnd + '.';
    }

    inputStart.addEventListener('input', recalcRangePreview);
    inputCount.addEventListener('input', recalcRangePreview);
    recalcRangePreview();

    const nickRow = document.createElement('div');
    Object.assign(nickRow.style, {
      display mode === 'spawns'  'flex'  'none',
      gap '6px',
      alignItems 'center',
      flexWrap 'wrap',
      fontSize '11px',
      opacity '0.92',
      marginTop '2px',
    });

    const nickLabel = document.createElement('span');
    nickLabel.textContent = 'Ник (для спаунов)';

    const nickInput = document.createElement('input');
    nickInput.type = 'text';
    nickInput.placeholder = 'например SethEvans';
    nickInput.value = getMyNick();
    Object.assign(nickInput.style, {
      width '140px',
      padding '1px 3px',
      fontSize '11px',
    });

    const nickHint = document.createElement('span');
    nickHint.textContent = '(пропускаем где вы уже в Работают)';
    Object.assign(nickHint.style, { opacity '0.75' });

    nickInput.addEventListener('change', function () {
      const v = normalizeNick(nickInput.value);
      nickInput.value = v;
      saveNickToStorage(v);
    });

    inputNickEl = nickInput;

    nickRow.appendChild(nickLabel);
    nickRow.appendChild(nickInput);
    nickRow.appendChild(nickHint);

    bodyWrap.appendChild(btnRow);
    bodyWrap.appendChild(status);
    bodyWrap.appendChild(rangeRow);
    bodyWrap.appendChild(modeInfo);
    bodyWrap.appendChild(rangeInfo);
    bodyWrap.appendChild(nickRow);

    let treasureBtn = null;
    let treasureClearBtn = null;

    if (mode === 'spawns') {
      const toolBlock = document.createElement('div');
      Object.assign(toolBlock.style, {
        borderTop '1px solid rgba(255,255,255,0.15)',
        paddingTop '6px',
        marginTop '2px',
      });

      const head = document.createElement('div');
      Object.assign(head.style, {
        display 'flex',
        alignItems 'baseline',
        justifyContent 'space-between',
        gap '8px',
      });

      const tTitle = document.createElement('div');
      tTitle.innerHTML =
        'Инструмент b id=rpgtop-spawns-tool-active—b';
      Object.assign(tTitle.style, { fontSize '11px', opacity '0.95' });

      const btns = document.createElement('div');
      Object.assign(btns.style, { display 'flex', gap '4px', alignItems 'center' });

      const btnRefresh = makeButton('Обновить');
      Object.assign(btnRefresh.style, { fontWeight '600' });

      btns.appendChild(btnRefresh);

      const hint = document.createElement('div');
      hint.textContent = 'Если инструмент не активирован — появятся кнопки активации подходящих.';
      Object.assign(hint.style, {
        fontSize '11px',
        opacity '0.7',
        marginTop '2px',
      });

      const listBox = document.createElement('div');
      Object.assign(listBox.style, {
        marginTop '6px',
        maxHeight '240px',
        overflow 'auto',
        paddingRight '6px',
      });

      head.appendChild(tTitle);
      head.appendChild(btns);
      toolBlock.appendChild(head);
      toolBlock.appendChild(hint);
      toolBlock.appendChild(listBox);

      bodyWrap.appendChild(toolBlock);
      document.body.appendChild(panel);

      spawnsToolUI.block = toolBlock;
      spawnsToolUI.list = listBox;
      spawnsToolUI.titleActive = tTitle.querySelector('#rpgtop-spawns-tool-active');
      spawnsToolUI.hint = hint;
      spawnsToolUI.btnRefresh = btnRefresh;

      listBox.addEventListener('click', function (e) {
        const target = e.target;
        if (!target) return;
        const btn = target.closest('button[data-tool-id]');
        if (!btn) return;

        const toolId = btn.getAttribute('data-tool-id')  '';
        if (!toolId) return;

        if (isMainRunning  isTreasureRunning) return;

        btn.disabled = true;
        const prevText = btn.textContent;
        btn.textContent = 'Активация...';

        (async function () {
          try {
            status.textContent = 'Состояние активация инструмента...';
            await activateTool(toolId);
            status.textContent = 'Состояние ожидание';
            renderSpawnsToolUI();
          } catch (err) {
            status.textContent = 'Состояние ожидание';
            console.error('%c' + LOG_PREFIX + ' Ошибка активации инструмента', ERR_STYLE, err);
            btn.disabled = false;
            btn.textContent = prevText;
          }
        })();
      });

      btnRefresh.addEventListener('click', function () {
        spawnsActiveToolOverride = null;
        renderSpawnsToolUI();
      });
    } else {
      const treasureBlock = document.createElement('div');
      Object.assign(treasureBlock.style, {
        borderTop '1px solid rgba(255,255,255,0.15)',
        paddingTop '6px',
        marginTop '2px',
      });

      const treasureHead = document.createElement('div');
      Object.assign(treasureHead.style, {
        display 'flex',
        alignItems 'baseline',
        justifyContent 'space-between',
        gap '8px',
      });

      const treasureTitle = document.createElement('div');
      treasureTitle.innerHTML =
        'Сокровищницы b id=rpgtop-treasure-count0b';
      Object.assign(treasureTitle.style, { fontSize '11px', opacity '0.95' });

      const treasureBtns = document.createElement('div');
      Object.assign(treasureBtns.style, {
        display 'flex',
        gap '4px',
        alignItems 'center',
      });

      treasureBtn = makeButton('+1 (1 сайт)');
      Object.assign(treasureBtn.style, { fontWeight '600' });
      treasureBtn.id = 'rpgtop-panel-treasures';

      treasureClearBtn = makeButton('Очистить');
      Object.assign(treasureClearBtn.style, { fontWeight '600' });

      treasureBtns.appendChild(treasureBtn);
      treasureBtns.appendChild(treasureClearBtn);

      const treasureHint = document.createElement('div');
      treasureHint.textContent =
        'Показывает попыткиключитаймер. Обновление авто.';
      Object.assign(treasureHint.style, {
        fontSize '11px',
        opacity '0.7',
        marginTop '2px',
      });

      const treasureListBox = document.createElement('div');
      Object.assign(treasureListBox.style, {
        marginTop '6px',
        maxHeight '240px',
        overflow 'auto',
        paddingRight '6px',
      });

      treasureHead.appendChild(treasureTitle);
      treasureHead.appendChild(treasureBtns);
      treasureBlock.appendChild(treasureHead);
      treasureBlock.appendChild(treasureHint);
      treasureBlock.appendChild(treasureListBox);

      bodyWrap.appendChild(treasureBlock);
      document.body.appendChild(panel);

      treasureUI.block = treasureBlock;
      treasureUI.btn = treasureBtn;
      treasureUI.btnClear = treasureClearBtn;
      treasureUI.list = treasureListBox;
      treasureUI.count = treasureTitle.querySelector('#rpgtop-treasure-count');
      treasureUI.hint = treasureHint;
    }

    let collapsed = false;
    try {
      collapsed = localStorage.getItem(PANEL_COLLAPSE_KEY) === '1';
    } catch (e) {}

    function applyCollapsed() {
      bodyWrap.style.display = collapsed  'none'  'flex';
      panel.style.minWidth = collapsed  '170px'  '300px';
      panel.style.maxWidth = collapsed  '220px'  '380px';
      btnCollapse.textContent = collapsed  'Развернуть'  'Свернуть';
    }

    btnCollapse.addEventListener('click', function () {
      collapsed = !collapsed;
      try {
        localStorage.setItem(PANEL_COLLAPSE_KEY, collapsed  '1'  '0');
      } catch (e) {}
      applyCollapsed();
    });

    function updateUI() {
      const anyRunning = isMainRunning  isTreasureRunning;

      if (!anyRunning) {
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnStop.disabled = true;
        btnPause.textContent = 'Пауза';
        status.textContent = 'Состояние ожидание';
      } else {
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnStop.disabled = false;

        if (window.__rpgtopPause && isMainRunning) {
          status.textContent = 'Состояние пауза';
          btnPause.textContent = 'Продолжить';
        } else {
          status.textContent = 'Состояние работает';
          btnPause.textContent = 'Пауза';
        }
      }

      if (treasureBtn && treasureClearBtn) {
        const canRunTreasure =
          !isTreasureRunning && (!isMainRunning  window.__rpgtopPause);
        treasureBtn.disabled = !canRunTreasure  !treasureList.length;
        treasureBtn.textContent = isTreasureRunning
           'Сокров. в работе'
           '+1 (1 сайт)';

        treasureClearBtn.disabled = anyRunning  !treasureList.length;
      }

      if (spawnsToolUI.btnRefresh) {
        spawnsToolUI.btnRefresh.disabled = anyRunning;
      }
    }

    function startMainRun(runPromiseFactory) {
      if (isMainRunning  isTreasureRunning) return;

      isMainRunning = true;
      window.__rpgtopStop = false;
      updateUI();

      const p = runPromiseFactory();

      p.catch(function (err) {
        console.error(
          '%c' + LOG_PREFIX + ' Ошибка в сборщике',
          ERR_STYLE,
          err,
        );
      }).finally(function () {
        isMainRunning = false;
        window.__rpgtopPause = false;
        window.__rpgtopStop = false;
        updateUI();
      });
    }

    btnStart.addEventListener('click', function () {
      startMainRun(function () {
        if (isOnTreePage()) return runTreeCollector();

        if (isOnSpawnsPage()) {
          if (inputNickEl) {
            const v = normalizeNick(inputNickEl.value);
            inputNickEl.value = v;
            saveNickToStorage(v);
          }
          return runSpawnsCollector();
        }

        if (inputStartEl && inputCountEl) {
          const startVal = parseInt(inputStartEl.value, 10);
          const countVal = parseInt(inputCountEl.value, 10);

          START_FROM =
            Number.isFinite(startVal) && startVal  0
               startVal
               DEFAULT_START_FROM;
          COUNT =
            Number.isFinite(countVal) && countVal  0
               countVal
               DEFAULT_COUNT;
        } else {
          START_FROM = DEFAULT_START_FROM;
          COUNT = DEFAULT_COUNT;
        }

        if (rangeInfoEl) {
          const effEnd = START_FROM + COUNT - 1;
          rangeInfoEl.textContent =
            'Итого будет собрано с ' + START_FROM + ' по ' + effEnd + '.';
        }

        return runCollector();
      });
    });

    if (treasureBtn && treasureClearBtn) {
      treasureBtn.addEventListener('click', function () {
        if (isTreasureRunning) return;
        if (isMainRunning && !window.__rpgtopPause) return;

        isTreasureRunning = true;
        window.__rpgtopStop = false;

        const ignorePause = !!(isMainRunning && window.__rpgtopPause);
        window.__rpgtopTreasureIgnorePause = ignorePause;

        updateUI();

        runTreasuresAutomation(ignorePause)
          .catch(function (err) {
            console.error(
              '%c' + LOG_PREFIX + ' Ошибка в сокровищницах',
              ERR_STYLE,
              err,
            );
          })
          .finally(function () {
            isTreasureRunning = false;
            window.__rpgtopTreasureIgnorePause = false;
            updateUI();
            refreshTreasureStatuses().catch(() = {});
          });
      });

      treasureClearBtn.addEventListener('click', function () {
        if (isMainRunning  isTreasureRunning) return;
        clearAllTreasures();
        updateUI();
      });
    }

    btnPause.addEventListener('click', function () {
      if (!isMainRunning && !isTreasureRunning) return;
      window.__rpgtopPause = !window.__rpgtopPause;
      updateUI();
    });

    btnStop.addEventListener('click', function () {
      if (!isMainRunning && !isTreasureRunning) return;
      window.__rpgtopStop = true;
      window.__rpgtopPause = false;
      updateUI();
    });

    applyCollapsed();

    if (treasureUI.list) {
      renderTreasureListUI();
      refreshTreasureStatuses().catch(() = {});
      startTreasureTicking();
      startTreasureAutoRefresh();
    }

    if (spawnsToolUI.block) {
      renderSpawnsToolUI();
    }

    updateUI();
  }

  function initRpgtopScript() {
    createControlPanel();

    if (isOnCollectionPage()) {
      highlightCollectionGifts();
    }

    if (isOnTreePage()) {
      ensureTreePageButton();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRpgtopScript);
  } else {
    initRpgtopScript();
  }
})();