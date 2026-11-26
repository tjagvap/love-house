/*!
 * 恋爱小屋 · 别墅桥接层
 * ---------------------------------------------------------------
 * 文件：assets/villa-bridge.js
 * 版本：1
 *
 * 把 assets/villa.js（纯 Three.js 别墅引擎）与 index.html 的既有 UI 接起来：
 *   · 楼层 / 房间切换（一层 7 间 + 二层 7 间，含走廊、楼梯间、阳台）
 *   · 房间级装修：墙面 / 地面 / 吊灯（毛坯 → 精装）
 *   · 贴纸任意表面：先选素材，再点画面任意位置（墙 / 地 / 顶 / 家具），家具上的贴纸跟随家具移动
 *   · 墙体改造：拆除内墙 / 重新砌墙 / 新建隔墙
 *   · 家具摆放：点家具库 → 点地面位置落地
 *   · 昼夜与天气：与页面既有 environment 系统同步
 *   · 持久化：Villa.serialize() → localStorage，刷新后原样恢复
 *
 * 语法约束：ES5 / ES2015，不使用可选链 ?. 与空值合并 ??（兼容旧版 WebView）。
 */
(function (global) {
  'use strict';

  var VILLA_UI_KEY = 'love_house_villa_v1';

  /* --------------------------------------------------------------
   * 0. 常量
   * -------------------------------------------------------------- */

  // 墙面配色（毛坯灰 → 精装暖白）
  var WALL_COLORS = [
    { color: '#b9b6ae', name: '毛坯水泥' },
    { color: '#e8e0d3', name: '暖白' },
    { color: '#d8c8b4', name: '米灰' },
    { color: '#c5d3c8', name: '薄荷绿' },
    { color: '#cdd6e2', name: '雾霾蓝' },
    { color: '#e5c9c2', name: '豆沙粉' },
    { color: '#efe3d0', name: '奶油杏' }
  ];

  // 地面材质
  var FLOOR_STYLES = [
    { key: 'cement', name: '素水泥', css: '#a8a49c' },
    { key: 'wood', name: '原木地板', css: '#b78a5e' },
    { key: 'dark', name: '深胡桃木', css: '#4c3525' },
    { key: 'tile', name: '浅灰瓷砖', css: '#d9dcd9' }
  ];

  // 家具库（与 villa.js 内置原型一一对应）
  var FURNITURE_ITEMS = [
    { type: 'sofa', name: '沙发', ico: '🛋️' },
    { type: 'armchair', name: '单人沙发', ico: '💺' },
    { type: 'armchair2', name: '单椅', ico: '🪑' },
    { type: 'table', name: '餐桌', ico: '🍽️' },
    { type: 'diningTable', name: '圆餐桌', ico: '⭕' },
    { type: 'coffeeTable', name: '茶几', ico: '☕' },
    { type: 'cabinet', name: '柜子', ico: '🗄️' },
    { type: 'shelf', name: '书架', ico: '📚' },
    { type: 'bookshelf', name: '落地书架', ico: '📖' },
    { type: 'lamp', name: '落地灯', ico: '💡' },
    { type: 'pendant', name: '吊灯', ico: '🔆' },
    { type: 'plant', name: '绿植', ico: '🌿' },
    { type: 'rug', name: '地毯', ico: '🧶' },
    { type: 'bed', name: '双人床', ico: '🛏️' },
    { type: 'nightstand', name: '床头柜', ico: '🗄️' },
    { type: 'wardrobe', name: '衣柜', ico: '🚪' },
    { type: 'dresser', name: '梳妆台', ico: '🪞' },
    { type: 'sink', name: '洗手台', ico: '🚰' },
    { type: 'mirror', name: '镜子', ico: '🪞' },
    { type: 'bathtub', name: '浴缸', ico: '🛁' },
    { type: 'toilet', name: '马桶', ico: '🚽' },
    { type: 'vanity', name: '浴室柜', ico: '🧴' },
    { type: 'towel', name: '毛巾架', ico: '🧻' },
    { type: 'stove', name: '灶台', ico: '🔥' },
    { type: 'fridge', name: '冰箱', ico: '🧊' },
    { type: 'curtain', name: '窗帘', ico: '🪟' },
    { type: 'tv', name: '电视', ico: '📺' },
    { type: 'picture', name: '装饰画', ico: '🖼️' }
  ];

  var FLOOR_NAMES = { 0: '一层', 1: '二层' };

  /* --------------------------------------------------------------
   * 1. 桥接状态
   * -------------------------------------------------------------- */

  var S = {
    ready: false,
    initPromise: null,
    canvas: null,
    viewport: null,
    floor: 0,
    activeRoomId: 'living',
    // 待放置的工具：null | { kind:'sticker', assetPath, name } | { kind:'furniture', type, name }
    pending: null,
    // 当前选中的贴纸 / 家具 id
    selectedStickerId: null,
    selectedFurnitureId: null,
    // 外部回调（由 index.html 注入）
    hooks: {
      toast: function () {},
      getStickerCatalog: function () { return {}; },
      getEnvHour: function () { return 12; },
      getEnvNightFactor: function () { return 0; },
      getEnvWeather: function () { return 'sunny'; }
    },
    els: {},
    saveTimer: 0
  };

  /* --------------------------------------------------------------
   * 2. 小工具
   * -------------------------------------------------------------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function toast(msg) {
    try { S.hooks.toast(msg); } catch (e) { console.warn('[Villa] toast 失败', e); }
  }

  function villa() { return global.Villa; }

  function safeParse(key) {
    try { return JSON.parse(global.localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }

  function saveLocal() {
    if (!S.ready || !villa() || !villa().ready) return;
    try {
      global.localStorage.setItem(VILLA_UI_KEY, JSON.stringify(villa().serialize()));
    } catch (e) {
      console.warn('[Villa] 存档失败', e);
    }
  }

  function scheduleSave() {
    if (S.saveTimer) clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(saveLocal, 600);
  }

  /* --------------------------------------------------------------
   * 3. 初始化
   * -------------------------------------------------------------- */

  function init(options) {
    if (options) {
      if (options.toast) S.hooks.toast = options.toast;
      if (options.getStickerCatalog) S.hooks.getStickerCatalog = options.getStickerCatalog;
      if (options.getEnvHour) S.hooks.getEnvHour = options.getEnvHour;
      if (options.getEnvNightFactor) S.hooks.getEnvNightFactor = options.getEnvNightFactor;
      if (options.getEnvWeather) S.hooks.getEnvWeather = options.getEnvWeather;
    }
    if (S.initPromise) return S.initPromise;

    S.canvas = $('villaCanvas');
    S.viewport = $('villaViewport');
    if (!S.canvas || !S.viewport) {
      console.warn('[Villa] 未找到别墅画布，桥接层未启动');
      return Promise.resolve(null);
    }

    S.initPromise = (function () {
      // 等 Three.js 加载完成
      var ready = global.__threeLoadPromise
        ? global.__threeLoadPromise.catch(function () { return false; })
        : Promise.resolve(!!global.THREE);
      return ready.then(function (ok) {
        if (!ok || !global.THREE) throw new Error('Three.js 未加载');
        var saved = safeParse(VILLA_UI_KEY);
        var loading = $('villaLoading');
        return villa().init(S.canvas, saved).then(function (V) {
          S.ready = true;
          if (loading) loading.style.display = 'none';
          S.floor = 0;
          S.activeRoomId = (V && V.activeRoomId) || 'living';
          bindEvents(V);
          renderAll();
          syncEnvironment();
          toast('别墅已就绪，走进去慢慢装修吧 🏡');
          return V;
        });
      }).catch(function (err) {
        console.error('[Villa] 初始化失败', err);
        var loading = $('villaLoading');
        if (loading) loading.textContent = '别墅搭建失败：' + (err && err.message ? err.message : err);
        return null;
      });
    })();

    return S.initPromise;
  }

  /* --------------------------------------------------------------
   * 4. 事件绑定
   * -------------------------------------------------------------- */

  function bindEvents(V) {
    V.on('change', function (payload) {
      scheduleSave();
      if (!payload) return;
      if (payload.action === 'room-style') renderRoomDecor();
      if (payload.action === 'sticker-add' || payload.action === 'sticker-remove') renderStickerList();
      if (payload.action === 'furniture-add' || payload.action === 'furniture-remove') renderFurniturePanel();
      if (payload.action === 'wall-demolish' || payload.action === 'wall-construct') renderWallTools();
    });

    V.on('playerroom', function (payload) {
      if (!payload || !payload.roomId) return;
      if (payload.roomId === S.activeRoomId) return;
      // 走进哪间房，就把装修面板切到那间
      S.activeRoomId = payload.roomId;
      var room = findRoom(payload.roomId);
      if (room) S.floor = room.floor;
      renderFloorTabs();
      renderRoomTabs();
      renderRoomDecor();
      updateHud();
    });

    V.on('floorchange', function () {
      updateHud();
    });

    // 点击画布：放置贴纸 / 家具 / 选中物体
    S.canvas.addEventListener('click', function (event) {
      if (!S.ready) return;
      handleCanvasClick(event);
    });

    // 贴纸 / 家具选中后，键盘微调
    document.addEventListener('keydown', function (event) {
      if (!S.ready) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
      var k = (event.key || '').toLowerCase();
      if (k === 'escape') { clearPending(); return; }
      if (S.pending) return;
      if (k === 'delete' || k === 'backspace') {
        if (S.selectedStickerId) { V.removeSticker(S.selectedStickerId); S.selectedStickerId = null; renderStickerList(); }
        else if (S.selectedFurnitureId) { V.removeFurniture(S.selectedFurnitureId); S.selectedFurnitureId = null; renderFurniturePanel(); }
      }
    });
  }

  function canvasRatio(event) {
    var rect = S.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      fx: (event.clientX - rect.left) / rect.width,
      fy: (event.clientY - rect.top) / rect.height
    };
  }

  function handleCanvasClick(event) {
    var V = villa();
    if (!V || !V.ready) return;
    var ratio = canvasRatio(event);
    if (!ratio) return;

    // 1) 有待放置的工具 → 在点击位置落地
    if (S.pending) {
      var hit = V.pickAt(ratio.fx, ratio.fy);
      if (!hit) { toast('这里点不到东西，换个位置试试～'); return; }
      if (S.pending.kind === 'sticker') {
        placeStickerAt(hit, S.pending);
      } else if (S.pending.kind === 'furniture') {
        placeFurnitureAt(hit, S.pending);
      }
      return;
    }

    // 2) 没有待放置 → 选中贴纸或家具
    var pick = V.pickAt(ratio.fx, ratio.fy);
    if (!pick) { S.selectedStickerId = null; S.selectedFurnitureId = null; renderStickerList(); renderFurniturePanel(); return; }
    if (pick.stickerId) {
      S.selectedStickerId = pick.stickerId;
      S.selectedFurnitureId = null;
      V.selectSticker(pick.stickerId);
      renderStickerList();
      renderFurniturePanel();
      toast('已选中贴纸，可以拖动位置 / 旋转 / 缩放');
    } else if (pick.itemId) {
      S.selectedFurnitureId = pick.itemId;
      S.selectedStickerId = null;
      V.selectFurniture(pick.itemId);
      renderStickerList();
      renderFurniturePanel();
      toast('已选中家具');
    }
  }

  function placeStickerAt(hit, pending) {
    var V = villa();
    var targetType = hit.targetType === 'furniture' ? 'furniture' : (hit.surface || hit.targetType || 'wall');
    var id = V.placeSticker({
      assetPath: pending.assetPath,
      name: pending.name,
      position: hit.position,
      normal: hit.normal,
      targetType: targetType,
      itemId: hit.itemId || null,
      roomId: hit.roomId || S.activeRoomId,
      size: pending.size || 0.5,
      rotation: 0
    });
    if (!id) { toast('贴纸没能放上去，换个位置试试～'); return; }
    S.selectedStickerId = id;
    var where = targetType === 'furniture' ? '家具上' :
      targetType === 'floor' ? '地板上' :
      targetType === 'ceiling' ? '天花板上' : '墙面上';
    toast(`已把 ${pending.name} 贴到${where} ✅`);
    renderStickerList();
    scheduleSave();
    clearPending();
  }

  function placeFurnitureAt(hit, pending) {
    var V = villa();
    var roomId = hit.roomId || S.activeRoomId;
    // 尽量落在地面
    var x = hit.position ? hit.position.x : null;
    var z = hit.position ? hit.position.z : null;
    if (hit.surface === 'floor' || hit.targetType === 'floor') {
      // 命中地板：直接用命中点
    } else {
      var room = findRoom(roomId);
      if (!room) { toast('这里放不下家具'); return; }
      x = room.center.x; z = room.center.z;
    }
    var id = V.addFurniture(roomId, pending.type, pending.name, { x: x, z: z, rotation: 0, scale: 1 });
    if (!id) { toast('家具没能放下，换个位置试试～'); return; }
    S.selectedFurnitureId = id;
    toast(`${pending.name} 已摆好，可以拖动调整位置`);
    renderFurniturePanel();
    scheduleSave();
    clearPending();
  }

  function clearPending() {
    if (S.pending) {
      S.pending = null;
      renderStickerGrid();
      renderFurniturePanel();
      updateHud();
    }
  }

  /* --------------------------------------------------------------
   * 5. 昼夜与天气同步
   * -------------------------------------------------------------- */

  function syncEnvironment() {
    var V = villa();
    if (!V || !V.ready) return;
    var hour = S.hooks.getEnvHour();
    var night = S.hooks.getEnvNightFactor();
    var weather = S.hooks.getEnvWeather();
    if (typeof hour === 'number') V.setDaylight(hour, typeof night === 'number' ? night : 0);
    if (weather) V.setWeather(weather);
  }

  /* --------------------------------------------------------------
   * 6. 渲染：楼层与房间
   * -------------------------------------------------------------- */

  function findRoom(roomId) {
    var list = villa() && villa().ready ? villa().getRoomList() : [];
    for (var i = 0; i < list.length; i++) if (list[i].id === roomId) return list[i];
    return null;
  }

  function renderAll() {
    renderFloorTabs();
    renderRoomTabs();
    renderRoomDecor();
    renderStickerGrid();
    renderStickerList();
    renderFurniturePanel();
    renderWallTools();
    updateHud();
  }

  function renderFloorTabs() {
    var box = $('villaFloorTabs');
    if (!box || !villa() || !villa().ready) return;
    box.innerHTML = '';
    [0, 1].forEach(function (floor) {
      var btn = el('button', 'villa-floor-btn' + (floor === S.floor ? ' active' : ''), FLOOR_NAMES[floor]);
      btn.type = 'button';
      btn.addEventListener('click', function () {
        S.floor = floor;
        var rooms = villa().getRoomsByFloor(floor);
        if (rooms.length) {
          S.activeRoomId = rooms[0].id;
          villa().setActiveRoom(S.activeRoomId);
        }
        renderFloorTabs();
        renderRoomTabs();
        renderRoomDecor();
        updateHud();
      });
      box.appendChild(btn);
    });
  }

  function renderRoomTabs() {
    var box = $('villaRoomTabs');
    if (!box || !villa() || !villa().ready) return;
    box.innerHTML = '';
    var rooms = villa().getRoomsByFloor(S.floor);
    rooms.forEach(function (room) {
      var btn = el('button', 'villa-room-btn' + (room.id === S.activeRoomId ? ' active' : ''), room.name);
      btn.type = 'button';
      btn.title = `${room.name} · ${room.area} m²`;
      btn.addEventListener('click', function () {
        S.activeRoomId = room.id;
        villa().setActiveRoom(room.id);
        renderRoomTabs();
        renderRoomDecor();
        updateHud();
      });
      box.appendChild(btn);
    });
  }

  /* --------------------------------------------------------------
   * 7. 渲染：房间装修（墙 / 地 / 灯）
   * -------------------------------------------------------------- */

  function renderRoomDecor() {
    var wallBox = $('villaWallSwatches');
    var floorBox = $('villaFloorSwatches');
    var lampBox = $('villaLampToggle');
    var label = $('villaDecorRoomLabel');
    var V = villa();
    if (!V || !V.ready) return;

    var roomId = S.activeRoomId;
    var room = findRoom(roomId);
    var style = V.getRoomStyle(roomId) || { wall: '#b9b6ae', floor: 'cement', lamp: false };
    if (label) label.textContent = room ? `${room.name} · ${FLOOR_NAMES[room.floor]}` : '—';

    if (wallBox) {
      wallBox.innerHTML = '';
      WALL_COLORS.forEach(function (item) {
        var btn = el('button', 'villa-swatch' + ((style.wall || '').toLowerCase() === item.color ? ' active' : ''));
        btn.type = 'button';
        btn.title = item.name;
        btn.style.background = item.color;
        btn.addEventListener('click', function () {
          V.setRoomStyle(roomId, { wall: item.color });
          renderRoomDecor();
          scheduleSave();
          toast(`${room ? room.name : '房间'} 墙面刷成了${item.name}`);
        });
        wallBox.appendChild(btn);
      });
    }

    if (floorBox) {
      floorBox.innerHTML = '';
      FLOOR_STYLES.forEach(function (item) {
        var btn = el('button', 'villa-swatch villa-floor-swatch' + ((style.floor || 'cement') === item.key ? ' active' : ''));
        btn.type = 'button';
        btn.title = item.name;
        btn.style.background = item.css;
        btn.addEventListener('click', function () {
          V.setRoomStyle(roomId, { floor: item.key });
          renderRoomDecor();
          scheduleSave();
          toast(`${room ? room.name : '房间'} 地面换成了${item.name}`);
        });
        floorBox.appendChild(btn);
      });
    }

    if (lampBox) {
      lampBox.checked = style.lamp !== false;
      lampBox.onchange = function () {
        V.setRoomStyle(roomId, { lamp: lampBox.checked });
        scheduleSave();
        toast(lampBox.checked ? '吊灯已点亮' : '吊灯已关闭');
      };
    }
  }

  /* --------------------------------------------------------------
   * 8. 渲染：贴纸库 + 已贴贴纸
   * -------------------------------------------------------------- */

  function renderStickerGrid() {
    var box = $('villaStickerGrid');
    if (!box || !villa() || !villa().ready) return;
    var themeSel = $('villaStickerTheme');
    var catalog = S.hooks.getStickerCatalog() || {};
    var theme = themeSel ? themeSel.value : 'hello_kitty';
    var items = (catalog[theme] || []).filter(function (a) { return !a.sheet; }).slice(0, 24);
    box.innerHTML = '';
    if (!items.length) {
      box.appendChild(el('span', 'villa-empty', '素材库加载中…'));
      return;
    }
    items.forEach(function (asset) {
      var btn = el('button', 'villa-sticker-btn');
      btn.type = 'button';
      btn.title = `点击选中「${asset.name}」，再点画面任意位置贴上`;
      var img = el('img');
      img.src = asset.path; img.alt = asset.name; img.loading = 'lazy';
      btn.appendChild(img);
      btn.addEventListener('click', function () {
        S.pending = { kind: 'sticker', assetPath: asset.path, name: asset.name, size: 0.5 };
        renderStickerGrid();
        updateHud();
        toast('已选中贴纸，去画面里点一个位置贴上（墙 / 地 / 顶 / 家具都行）');
      });
      box.appendChild(btn);
    });
  }

  function renderStickerList() {
    var box = $('villaStickerList');
    if (!box) return;
    var V = villa();
    if (!V || !V.ready) return;
    var list = V.getStickerList();
    box.innerHTML = '';
    if (!list.length) {
      box.appendChild(el('span', 'villa-empty', '还没有贴纸，点上面的素材再点画面即可贴上'));
      return;
    }
    list.forEach(function (st) {
      var chip = el('div', 'villa-art-chip' + (st.id === S.selectedStickerId ? ' active' : ''));
      var img = el('img');
      img.src = st.assetPath; img.alt = st.name; img.loading = 'lazy';
      chip.appendChild(img);
      var rm = el('button', 'villa-chip-remove', '×');
      rm.type = 'button';
      rm.title = `移除 ${st.name}`;
      rm.addEventListener('click', function (event) {
        event.stopPropagation();
        V.removeSticker(st.id);
        if (S.selectedStickerId === st.id) S.selectedStickerId = null;
        renderStickerList();
        scheduleSave();
      });
      chip.appendChild(rm);
      chip.addEventListener('click', function () {
        S.selectedStickerId = st.id;
        V.selectSticker(st.id);
        renderStickerList();
      });
      box.appendChild(chip);
    });
  }

  /* --------------------------------------------------------------
   * 9. 渲染：家具面板
   * -------------------------------------------------------------- */

  function renderFurniturePanel() {
    var box = $('villaFurnitureGrid');
    if (!box) return;
    var V = villa();
    if (!V || !V.ready) return;
    box.innerHTML = '';
    FURNITURE_ITEMS.forEach(function (item) {
      var btn = el('button', 'villa-furn-btn' + (S.pending && S.pending.kind === 'furniture' && S.pending.type === item.type ? ' active' : ''));
      btn.type = 'button';
      btn.innerHTML = `<span class="villa-furn-ico">${item.ico}</span><b>${item.name}</b>`;
      btn.addEventListener('click', function () {
        S.pending = { kind: 'furniture', type: item.type, name: item.name };
        renderFurniturePanel();
        updateHud();
        toast(`已选中${item.name}，在房间里点地面就能放下`);
      });
      box.appendChild(btn);
    });
  }

  /* --------------------------------------------------------------
   * 10. 渲染：墙体工具（拆墙 / 砌墙 / 新建隔墙）
   * -------------------------------------------------------------- */

  function renderWallTools() {
    var box = $('villaWallList');
    var catalogBox = $('villaBuildCatalog');
    var V = villa();
    if (!V || !V.ready) return;
    var walls = V.getWallList().filter(function (w) { return w.floor === S.floor; });
    var roomNames = {};
    V.getRoomList().forEach(function (r) { roomNames[r.id] = r.name; });

    if (box) {
      box.innerHTML = '';
      var inner = walls.filter(function (w) { return w.kind !== 'exterior'; });
      if (!inner.length) {
        box.appendChild(el('span', 'villa-empty', '本层没有可改造的隔墙'));
      }
      inner.forEach(function (w) {
        var row = el('div', 'villa-wall-row');
        var name = (w.rooms || []).map(function (id) { return roomNames[id] || id; }).join(' / ') || w.id;
        row.appendChild(el('span', 'villa-wall-name', name + (w.demolished ? '（已拆除）' : '')));
        var act = el('button', 'villa-wall-btn' + (w.demolished ? '' : ' danger'), w.demolished ? '重新砌回' : '敲掉这面墙');
        act.type = 'button';
        act.addEventListener('click', function () {
          if (w.demolished) {
            V.constructWall(w.id);
            toast('墙体已重新砌好');
          } else {
            V.demolishWall(w.id);
            toast('墙体已敲掉，空间打通啦 🔨');
          }
          renderWallTools();
          scheduleSave();
        });
        row.appendChild(act);
        box.appendChild(row);
      });
    }

    if (catalogBox) {
      catalogBox.innerHTML = '';
      var catalog = V.getBuildCatalog().filter(function (c) { return c.floor === S.floor; });
      if (!catalog.length) {
        catalogBox.appendChild(el('span', 'villa-empty', '本层没有待建隔墙方案'));
      }
      catalog.forEach(function (c) {
        var btn = el('button', 'villa-build-btn', '＋ ' + c.name);
        btn.type = 'button';
        btn.addEventListener('click', function () {
          if (V.constructWall(c.id)) {
            toast('新隔墙已砌好 🧱');
          } else {
            toast('这面墙已经在了');
          }
          renderWallTools();
          scheduleSave();
        });
        catalogBox.appendChild(btn);
      });
    }
  }

  /* --------------------------------------------------------------
   * 11. HUD
   * -------------------------------------------------------------- */

  function updateHud() {
    var label = $('villaRoomLabel');
    var count = $('villaCountLabel');
    var tip = $('villaTip');
    var V = villa();
    if (!V || !V.ready) return;
    var room = findRoom(S.activeRoomId);
    if (label) label.textContent = room ? room.name : '别墅';
    if (count) {
      var furn = V.getFurnitureList(S.activeRoomId).length;
      var stickers = V.getStickerList().filter(function (s) { return !s.roomId || s.roomId === S.activeRoomId; }).length;
      count.textContent = `${furn} 件家具 · ${stickers} 张贴纸`;
    }
    if (tip) {
      tip.textContent = S.pending
        ? (S.pending.kind === 'sticker' ? '已选中贴纸：点击画面任意位置贴上（墙 / 地 / 顶 / 家具）' : '已选中家具：点击房间地面放下')
        : '走到哪间房，就装修哪间房 · 走廊与楼梯都可以通行';
    }
  }

  /* --------------------------------------------------------------
   * 12. 对外 API
   * -------------------------------------------------------------- */

  var Bridge = {
    init: init,
    isReady: function () { return S.ready; },
    getActiveRoomId: function () { return S.activeRoomId; },
    setActiveRoom: function (roomId) {
      S.activeRoomId = roomId;
      var room = findRoom(roomId);
      if (room) S.floor = room.floor;
      if (villa() && villa().ready) villa().setActiveRoom(roomId);
      renderFloorTabs();
      renderRoomTabs();
      renderRoomDecor();
      updateHud();
    },
    refresh: renderAll,
    syncEnvironment: syncEnvironment,
    save: saveLocal,
    reset: function () {
      try { global.localStorage.removeItem(VILLA_UI_KEY); } catch (e) { /* ignore */ }
      if (villa() && villa().ready) {
        var V = villa();
        V.getStickerList().forEach(function (s) { V.removeSticker(s.id); });
        V.getFurnitureList().forEach(function (f) { V.removeFurniture(f.id); });
        V.getWallList().forEach(function (w) { if (w.demolished) V.constructWall(w.id); });
      }
      toast('别墅已恢复毛坯状态');
      renderAll();
    }
  };

  global.VillaBridge = Bridge;

})(window);
