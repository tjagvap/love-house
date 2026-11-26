/*!
 * 恋爱小屋 · 3D 别墅引擎
 * ---------------------------------------------------------------
 * 文件：assets/villa.js
 * 版本：1
 *
 * 纯前端静态脚本，无构建步骤，使用页面已加载的全局 THREE（assets/three.min.js, r128）。
 * 对外暴露 window.Villa，遵循 IIFE + 全局挂载的方式，不使用 import / export / ES Module。
 *
 * 特性：
 *   · 严格按户型表生成 14 个房间 / 41 面墙体 / 15 道门洞 / 14 扇窗 / 1 处楼梯开口
 *   · 毛坯房初始状态（水泥灰墙 + 素水泥地 + 裸露灯位），可装修墙面、地板、灯具
 *   · 墙可拆可建（外墙不可拆），buildCatalog 提供 4 个可新建隔墙方案
 *   · 贴纸可贴任意表面（墙 / 地 / 顶 / 家具），贴到家具上会跟随家具移动
 *   · 昼夜光影（太阳方位角 + 阴影 + 半球光 + 室内暖灯）、晴/阴/雨/雪/雾天气
 *   · 室外真实风景：草地起伏、远山、树林、河流、渐变天空、夜晚星星
 *   · edit（俯瞰编辑）与 walk（第一人称漫游）双模式，鼠标 / 键盘 / 触屏均可驱动
 *   · serialize() 可完整导出装修状态，init() 可完整读回
 *
 * 语法约束：ES5 / ES2015 语法，不使用可选链 ?. 与空值合并 ??（兼容旧版 WebView）。
 */
(function (global) {
  'use strict';

  /* Three.js 由页面异步加载（多线路兜底），因此这里用 IIFE 内部的惰性变量：
     加载完成后由 init() 赋值为 global.THREE，避免脚本解析期就访问未定义的 THREE。 */
  var THREE = null;

  /* ==============================================================
   * 0. 常量
   * ============================================================== */

  var VERSION = 1;

  var FLOOR_H = 3.4;            // 二层楼板标高 / 每层层高
  var CEIL_H = 3.2;             // 净层高（楼板底面）
  var SLAB_T = 0.2;             // 楼板厚
  var WALL_T = 0.16;            // 墙厚
  var DOOR_H = 2.2;             // 门洞高
  var GLASS_DOOR_H = 2.4;       // 玻璃推拉门高
  var EYE_H = 1.62;             // 漫游眼高
  var PLAYER_R = 0.32;          // 玩家碰撞半径
  var PLAYER_H = 1.75;          // 玩家身高（碰撞用）
  var WALK_SPEED = 2.6;         // 步行速度 m/s
  var RUN_SPEED = 4.8;          // 疾走速度 m/s
  var LOOK_SENS = 0.0032;       // 视角灵敏度（弧度 / 像素）

  // 楼梯：stairs 房间内直跑楼梯，宽 3m，14 级，z=8.6 → z=3.6 上升 3.4m
  var STAIR_X0 = 8, STAIR_X1 = 11;
  var STAIR_Z_TOP = 3.6, STAIR_Z_BOT = 8.6;
  var STAIR_STEPS = 14;
  var STAIR_RISE = FLOOR_H / STAIR_STEPS;                            // 0.2428
  var STAIR_RUN = (STAIR_Z_BOT - STAIR_Z_TOP) / STAIR_STEPS;          // 0.3571

  // 网格（列 c0..c3 / 行 r0..r2）
  var GRID_X = [-12, -6, 0, 6, 12];
  var GRID_Z = [-9, -3, 3, 9];

  // 毛坯房默认样式
  var RAW_WALL_COLOR = '#b9b6ae';
  var RAW_FLOOR = 'cement';

  /* ==============================================================
   * 1. 数据表
   * ============================================================== */

  /* 房间定义
   * rect  : [x0, x1, z0, z1]  —— 对外暴露的矩形，严格按户型表
   * zones : 可选的补充矩形（与 rect 一起构成房间实际地板区域），
   *          用于填补户型表中未单独命名、但同属该房间的连通空间
   */
  var ROOM_DEFS = [
    // ---------- 一层 ----------
    { id: 'living',   name: '客厅',     floor: 0, rect: [-12, -6, -9, 3] },
    { id: 'dining',   name: '餐厅',     floor: 0, rect: [-6, 0, -9, -3] },
    { id: 'kitchen',  name: '厨房',     floor: 0, rect: [-6, 0, -3, 9] },
    { id: 'corridor', name: '走廊',     floor: 0, rect: [0, 12, -9, 3] },
    { id: 'bath',     name: '卫生间',   floor: 0, rect: [0, 6, 3, 9] },
    { id: 'stairs',   name: '楼梯间',   floor: 0, rect: [6, 12, 3, 9] },
    { id: 'storage',  name: '储藏室',   floor: 0, rect: [-12, -6, 3, 9] },
    // ---------- 二层 ----------
    { id: 'master',   name: '主卧',     floor: 1, rect: [-12, -6, -9, 3] },
    { id: 'kids',     name: '次卧',     floor: 1, rect: [-12, -6, 3, 9], zones: [[-12, 0, 3, 9]] },
    { id: 'study',    name: '书房',     floor: 1, rect: [-6, 0, -9, -3] },
    { id: 'hall2',    name: '二层走廊', floor: 1, rect: [-6, 6, -3, 3] },
    { id: 'balcony',  name: '阳台',     floor: 1, rect: [0, 12, -9, -3] },
    { id: 'bath2',    name: '二层卫生间', floor: 1, rect: [0, 6, 3, 9] },
    { id: 'tea',      name: '茶室',     floor: 1, rect: [6, 12, 3, 9], zones: [[6, 8, -3, 9], [11, 12, -3, 9], [8, 11, -3, 3.6]] }
  ];

  /* 墙体定义
   * id       : 稳定唯一 id（外墙以 _ext 结尾，不可拆）
   * floor    : 0 / 1
   * kind     : 'interior' | 'exterior' | 'opening'
   * axis     : 'x' = 沿 X 方向延伸（固定 z = coord）；'z' = 沿 Z 方向延伸（固定 x = coord）
   * coord    : 墙面所在的固定坐标
   * from,to  : 沿延伸方向的起止世界坐标
   * rooms    : 两侧房间 id（单侧为外墙时只写一个）
   * openings : 洞口列表 { type:'door'|'window'|'glass'|'open', a, b, sill, top }
   */
  var WALL_DEFS = [
    /* ---------------- 一层 · 外墙 ---------------- */
    { id: 'g_west_living_ext',   floor: 0, kind: 'exterior', axis: 'z', coord: -12, from: -9,  to: 3,   rooms: ['living'],   openings: [{ type: 'window', a: -6,    b: -3.8,  sill: 1.0, top: 2.4 }] },
    { id: 'g_west_storage_ext',  floor: 0, kind: 'exterior', axis: 'z', coord: -12, from: 3,   to: 9,   rooms: ['storage'],  openings: [] },
    { id: 'g_north_living_ext',  floor: 0, kind: 'exterior', axis: 'x', coord: -9,  from: -12, to: -6,  rooms: ['living'],   openings: [{ type: 'window', a: -10,   b: -7.8,  sill: 1.0, top: 2.4 }] },
    { id: 'g_north_dining_ext',  floor: 0, kind: 'exterior', axis: 'x', coord: -9,  from: -6,  to: 0,   rooms: ['dining'],   openings: [{ type: 'window', a: -4,    b: -1.8,  sill: 1.0, top: 2.4 }] },
    { id: 'g_north_corridor_ext',floor: 0, kind: 'exterior', axis: 'x', coord: -9,  from: 0,   to: 12,  rooms: ['corridor'], openings: [{ type: 'window', a: 7.8,   b: 10,    sill: 1.0, top: 2.4 }] },
    { id: 'g_east_corridor_ext', floor: 0, kind: 'exterior', axis: 'z', coord: 12,  from: -9,  to: 3,   rooms: ['corridor'], openings: [{ type: 'window', a: -7,    b: -4.8,  sill: 1.0, top: 2.4 }] },
    { id: 'g_east_stairs_ext',   floor: 0, kind: 'exterior', axis: 'z', coord: 12,  from: 3,   to: 9,   rooms: ['stairs'],   openings: [{ type: 'window', a: 4,     b: 6.2,   sill: 1.0, top: 2.4 }] },
    { id: 'g_south_storage_ext', floor: 0, kind: 'exterior', axis: 'x', coord: 9,   from: -12, to: -6,  rooms: ['storage'],  openings: [] },
    { id: 'g_south_kitchen_ext', floor: 0, kind: 'exterior', axis: 'x', coord: 9,   from: -6,  to: 0,   rooms: ['kitchen'],  openings: [{ type: 'window', a: -4,    b: -1.8,  sill: 1.0, top: 2.4 }] },
    { id: 'g_south_bath_ext',    floor: 0, kind: 'exterior', axis: 'x', coord: 9,   from: 0,   to: 6,   rooms: ['bath'],     openings: [{ type: 'window', a: 2,     b: 4.2,   sill: 1.6, top: 2.4 }] },
    { id: 'g_south_stairs_ext',  floor: 0, kind: 'exterior', axis: 'x', coord: 9,   from: 6,   to: 12,  rooms: ['stairs'],   openings: [] },
    /* ---------------- 一层 · 内墙 ---------------- */
    { id: 'g_living_dining',     floor: 0, kind: 'interior', axis: 'z', coord: -6, from: -9, to: -3, rooms: ['living', 'dining'],   openings: [{ type: 'door', a: -7.4, b: -6, sill: 0, top: DOOR_H }] },
    { id: 'g_living_kitchen',    floor: 0, kind: 'interior', axis: 'z', coord: -6, from: -3, to: 3,  rooms: ['living', 'kitchen'],  openings: [{ type: 'door', a: -1.4, b: 0, sill: 0, top: DOOR_H }] },
    { id: 'g_storage_kitchen',   floor: 0, kind: 'interior', axis: 'z', coord: -6, from: 3,  to: 9,  rooms: ['storage', 'kitchen'], openings: [{ type: 'door', a: 4.4,  b: 5.8, sill: 0, top: DOOR_H }] },
    { id: 'g_dining_corridor',   floor: 0, kind: 'interior', axis: 'z', coord: 0,  from: -9, to: -3, rooms: ['dining', 'corridor'], openings: [{ type: 'door', a: -7.4, b: -6, sill: 0, top: DOOR_H }] },
    { id: 'g_kitchen_corridor',  floor: 0, kind: 'interior', axis: 'z', coord: 0,  from: -3, to: 3,  rooms: ['kitchen', 'corridor'], openings: [{ type: 'door', a: -1.4, b: 0, sill: 0, top: DOOR_H }] },
    { id: 'g_kitchen_bath',      floor: 0, kind: 'interior', axis: 'z', coord: 0,  from: 3,  to: 9,  rooms: ['kitchen', 'bath'],   openings: [{ type: 'door', a: 4.4, b: 5.8, sill: 0, top: DOOR_H }] },
    { id: 'g_dining_kitchen',    floor: 0, kind: 'interior', axis: 'x', coord: -3, from: -6, to: 0,  rooms: ['dining', 'kitchen'],  openings: [] },
    { id: 'g_living_storage',    floor: 0, kind: 'interior', axis: 'x', coord: 3,  from: -12, to: -6, rooms: ['living', 'storage'],  openings: [{ type: 'door', a: -10, b: -8.6, sill: 0, top: DOOR_H }] },
    { id: 'g_corridor_bath',     floor: 0, kind: 'interior', axis: 'x', coord: 3,  from: 0,  to: 6,  rooms: ['corridor', 'bath'],  openings: [{ type: 'door', a: 2, b: 3.4, sill: 0, top: DOOR_H }] },
    { id: 'g_stairs_open',       floor: 0, kind: 'opening',  axis: 'x', coord: 3,  from: 6,  to: 12, rooms: ['corridor', 'stairs'], openings: [{ type: 'open', a: 8, b: 11, sill: 0, top: 2.4 }] },
    { id: 'g_bath_stairs',       floor: 0, kind: 'interior', axis: 'z', coord: 6,  from: 3,  to: 9,  rooms: ['bath', 'stairs'],    openings: [] },
    /* ---------------- 二层 · 外墙 ---------------- */
    { id: 'f2_west_master_ext',  floor: 1, kind: 'exterior', axis: 'z', coord: -12, from: -9, to: 3,  rooms: ['master'], openings: [{ type: 'window', a: -6,    b: -3.8, sill: 1.0, top: 2.4 }] },
    { id: 'f2_west_kids_ext',    floor: 1, kind: 'exterior', axis: 'z', coord: -12, from: 3,  to: 9,  rooms: ['kids'],   openings: [{ type: 'window', a: 4.4,   b: 6.6,   sill: 1.0, top: 2.4 }] },
    { id: 'f2_north_master_ext', floor: 1, kind: 'exterior', axis: 'x', coord: -9,  from: -12, to: -6, rooms: ['master'], openings: [{ type: 'window', a: -10,   b: -7.8,  sill: 1.0, top: 2.4 }] },
    { id: 'f2_north_study_ext',  floor: 1, kind: 'exterior', axis: 'x', coord: -9,  from: -6, to: 0,  rooms: ['study'],  openings: [{ type: 'window', a: -4,    b: -1.8,  sill: 1.0, top: 2.4 }] },
    { id: 'f2_east_tea_ext',     floor: 1, kind: 'exterior', axis: 'z', coord: 12,  from: 3,  to: 9,  rooms: ['tea'],    openings: [{ type: 'window', a: 4,     b: 6.2,   sill: 1.0, top: 2.4 }] },
    { id: 'f2_south_kids_ext',   floor: 1, kind: 'exterior', axis: 'x', coord: 9,   from: -12, to: 0,  rooms: ['kids'],   openings: [] },
    { id: 'f2_south_bath2_ext',  floor: 1, kind: 'exterior', axis: 'x', coord: 9,   from: 0,  to: 6,  rooms: ['bath2'],  openings: [{ type: 'window', a: 2,     b: 4.2,   sill: 1.6, top: 2.4 }] },
    { id: 'f2_south_tea_ext',    floor: 1, kind: 'exterior', axis: 'x', coord: 9,   from: 6,  to: 12, rooms: ['tea'],    openings: [] },
    /* ---------------- 二层 · 内墙 ---------------- */
    { id: 'f2_master_study',     floor: 1, kind: 'interior', axis: 'z', coord: -6, from: -9, to: -3, rooms: ['master', 'study'],  openings: [{ type: 'door',  a: -7.4, b: -6,   sill: 0, top: DOOR_H }] },
    { id: 'f2_master_hall2',     floor: 1, kind: 'interior', axis: 'z', coord: -6, from: -3, to: 3,  rooms: ['master', 'hall2'],  openings: [{ type: 'door',  a: -1.4, b: 0,    sill: 0, top: DOOR_H }] },
    { id: 'f2_master_kids',      floor: 1, kind: 'interior', axis: 'x', coord: 3,  from: -12, to: -6, rooms: ['master', 'kids'],   openings: [{ type: 'door',  a: -10,  b: -8.6, sill: 0, top: DOOR_H }] },
    { id: 'f2_study_balcony',    floor: 1, kind: 'interior', axis: 'z', coord: 0,  from: -9, to: -3, rooms: ['study', 'balcony'], openings: [{ type: 'glass', a: -7.4, b: -6,   sill: 0, top: GLASS_DOOR_H }] },
    { id: 'f2_hall2_study',      floor: 1, kind: 'interior', axis: 'x', coord: -3, from: -6, to: 0,  rooms: ['hall2', 'study'],   openings: [] },
    { id: 'f2_hall2_balcony',    floor: 1, kind: 'interior', axis: 'x', coord: -3, from: 0,  to: 6,  rooms: ['hall2', 'balcony'], openings: [{ type: 'door',  a: 2,    b: 3.4,  sill: 0, top: DOOR_H }] },
    { id: 'f2_hall2_bath2',      floor: 1, kind: 'interior', axis: 'x', coord: 3,  from: 0,  to: 6,  rooms: ['hall2', 'bath2'],   openings: [{ type: 'door',  a: 2,    b: 3.4,  sill: 0, top: DOOR_H }] },
    { id: 'f2_hall2_kids',       floor: 1, kind: 'interior', axis: 'x', coord: 3,  from: -6, to: 0,  rooms: ['hall2', 'kids'],    openings: [] },
    { id: 'f2_hall2_tea',        floor: 1, kind: 'interior', axis: 'z', coord: 6,  from: -3, to: 3,  rooms: ['hall2', 'tea'],     openings: [{ type: 'door',  a: -1.4, b: 0,    sill: 0, top: DOOR_H }] },
    { id: 'f2_kids_bath2',       floor: 1, kind: 'interior', axis: 'z', coord: 0,  from: 3,  to: 9,  rooms: ['kids', 'bath2'],    openings: [] },
    { id: 'f2_bath2_tea',        floor: 1, kind: 'interior', axis: 'z', coord: 6,  from: 3,  to: 9,  rooms: ['bath2', 'tea'],     openings: [] }
  ];

  /* 可新建隔墙方案（constructWall('new:xxx') 即可真正生成一面带门洞的墙） */
  var BUILD_CATALOG = [
    { id: 'new:g_living_mid',   name: '客厅中间隔墙', floor: 0, kind: 'interior', axis: 'z', coord: -9, from: -9, to: 3,  rooms: ['living'],  openings: [{ type: 'door', a: -4.2, b: -2.8, sill: 0, top: DOOR_H }] },
    { id: 'new:g_corridor_mid', name: '走廊东段隔墙', floor: 0, kind: 'interior', axis: 'x', coord: -6, from: 6,  to: 12, rooms: ['corridor'], openings: [{ type: 'door', a: 7.4, b: 8.8, sill: 0, top: DOOR_H }] },
    { id: 'new:f2_kids_mid',    name: '次卧中间隔墙', floor: 1, kind: 'interior', axis: 'x', coord: 6,  from: -12, to: -6, rooms: ['kids'],    openings: [{ type: 'door', a: -10.4, b: -9, sill: 0, top: DOOR_H }] },
    { id: 'new:f2_study_mid',   name: '书房中间隔墙', floor: 1, kind: 'interior', axis: 'x', coord: -6, from: -6, to: 0,  rooms: ['study'],   openings: [{ type: 'door', a: -4.2, b: -2.8, sill: 0, top: DOOR_H }] }
  ];

  /* ==============================================================
   * 2. 工具函数
   * ============================================================== */

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function now() { return (new Date()).getTime(); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function obj(o) { return o || {}; }

  /* 简单确定性伪随机，保证每次生成的室外布景一致 */
  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /* 值噪声（用于草地色斑与起伏） */
  function hash2(x, z) {
    var h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
    return h - Math.floor(h);
  }
  function noise2(x, z) {
    var xi = Math.floor(x), zi = Math.floor(z);
    var xf = x - xi, zf = z - zi;
    var u = smooth(xf), v = smooth(zf);
    var a = hash2(xi, zi), b = hash2(xi + 1, zi);
    var c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }

  /* ==============================================================
   * 3. 全局状态
   * ============================================================== */

  var S = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    raycaster: null,
    clock: null,

    houseRoot: null,
    wallRoot: null,
    floorRoot: null,
    ceilingRoot: null,
    furnitureRoot: null,
    stickerRoot: null,
    lampRoot: null,
    outdoorRoot: null,
    weatherRoot: null,
    helperRoot: null,

    sun: null,
    hemi: null,
    ambient: null,
    fillLight: null,
    lampLights: [],          // 室内灯池
    glassMats: [],           // 窗玻璃材质（夜间透出暖光）
    lampRooms: [],           // 灯池当前对应的房间

    walls: {},               // wallId -> { def, groups:{roomId:Group}, demolished, built }
    rooms: {},               // roomId -> room 对象
    furniture: {},           // itemId -> { id, roomId, type, name, group, opts }
    stickers: {},            // stickerId -> { id, mesh, ... }

    colliders: [],           // 碰撞 AABB 列表

    mode: 'edit',
    activeRoomId: 'living',
    selectedFurnitureId: null,
    selectedStickerId: null,
    selHelper: null,
    selHelper2: null,

    pointer: { x: 0, y: 0, inside: false },
    lastPick: null,
    lastPickKey: '',

    moveAxis: { x: 0, y: 0 },
    keys: {},
    yaw: 0,
    pitch: 0,
    player: { x: -9, y: 0, z: -3, floor: 0 },
    lastRoomId: null,
    orbit: { az: 0.72, el: 0.6, dist: 46, target: null },
    pointerLocked: false,
    enabled: true,
    raf: 0,
    ready: false,
    disposed: false,

    hour: 13,
    nightFactor: 0,
    weather: 'sunny',

    seq: 0,
    listeners: {},
    resizeHandler: null,
    domHandlers: []
  };

  var geoCache = {};
  var matCache = {};
  var texCache = {};
  var furnitureProto = {};

  function nextId(prefix) {
    S.seq += 1;
    return prefix + '_' + S.seq;
  }

  /* ==============================================================
   * 4. 几何 / 材质 / 贴图缓存
   * ============================================================== */

  function boxGeo(w, h, d) {
    var k = 'b|' + w + '|' + h + '|' + d;
    if (!geoCache[k]) geoCache[k] = new THREE.BoxGeometry(w, h, d);
    return geoCache[k];
  }
  function cylGeo(rt, rb, h, seg) {
    var k = 'c|' + rt + '|' + rb + '|' + h + '|' + seg;
    if (!geoCache[k]) geoCache[k] = new THREE.CylinderGeometry(rt, rb, h, seg || 12);
    return geoCache[k];
  }
  function sphGeo(r, seg) {
    var k = 's|' + r + '|' + (seg || 14);
    if (!geoCache[k]) geoCache[k] = new THREE.SphereGeometry(r, seg || 14, Math.max(6, (seg || 14) / 2));
    return geoCache[k];
  }
  function icoGeo(r, det) {
    var k = 'i|' + r + '|' + (det || 0);
    if (!geoCache[k]) geoCache[k] = new THREE.IcosahedronGeometry(r, det || 0);
    return geoCache[k];
  }
  function coneGeo(r, h, seg) {
    var k = 'n|' + r + '|' + h + '|' + (seg || 12);
    if (!geoCache[k]) geoCache[k] = new THREE.ConeGeometry(r, h, seg || 12);
    return geoCache[k];
  }
  function latheGeo(points, seg) {
    var k = 'l|' + points.length + '|' + points.join('_') + '|' + (seg || 16);
    if (!geoCache[k]) {
      var pts = [];
      for (var i = 0; i < points.length; i++) pts.push(new THREE.Vector2(points[i][0], points[i][1]));
      geoCache[k] = new THREE.LatheGeometry(pts, seg || 16);
    }
    return geoCache[k];
  }
  function planeGeo(w, h) {
    var k = 'p|' + w + '|' + h;
    if (!geoCache[k]) geoCache[k] = new THREE.PlaneGeometry(w, h);
    return geoCache[k];
  }

  /* 标准材质缓存（同色同参数共享，显著降低 drawcall / program 切换） */
  function stdMat(color, rough, metal, extra) {
    var key = 'm|' + color + '|' + (rough === undefined ? 0.85 : rough) + '|' + (metal === undefined ? 0 : metal) + '|' + (extra ? JSON.stringify(extra) : '');
    if (!matCache[key]) {
      var p = { color: color, roughness: rough === undefined ? 0.85 : rough, metalness: metal === undefined ? 0 : metal };
      if (extra) { for (var k in extra) p[k] = extra[k]; }
      matCache[key] = new THREE.MeshStandardMaterial(p);
    }
    return matCache[key];
  }

  function basicMat(color, extra) {
    var key = 'b|' + color + '|' + (extra ? JSON.stringify(extra) : '');
    if (!matCache[key]) {
      var p = { color: color };
      if (extra) { for (var k in extra) p[k] = extra[k]; }
      matCache[key] = new THREE.MeshBasicMaterial(p);
    }
    return matCache[key];
  }

  function boxMesh(w, h, d, x, y, z, m) {
    var me = new THREE.Mesh(boxGeo(w, h, d), m);
    me.position.set(x, y, z);
    me.castShadow = true;
    me.receiveShadow = true;
    return me;
  }
  function cylMesh(rt, rb, h, seg, x, y, z, m) {
    var me = new THREE.Mesh(cylGeo(rt, rb, h, seg), m);
    me.position.set(x, y, z);
    me.castShadow = true;
    me.receiveShadow = true;
    return me;
  }
  function sphMesh(r, seg, x, y, z, m) {
    var me = new THREE.Mesh(sphGeo(r, seg), m);
    me.position.set(x, y, z);
    me.castShadow = true;
    me.receiveShadow = true;
    return me;
  }

  /* ---------------- 程序化贴图 ---------------- */

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function texWood(dark) {
    var key = 'wood' + (dark ? 'D' : 'L');
    if (texCache[key]) return texCache[key];
    var c = makeCanvas(256, 256), g = c.getContext('2d');
    var base = dark ? '#4c3524' : '#b08050';
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    var rnd = seeded(dark ? 991 : 337);
    for (var i = 0; i < 8; i++) {
      var y = i * 32;
      g.fillStyle = 'rgba(0,0,0,' + (0.04 + rnd() * 0.05) + ')';
      g.fillRect(0, y, 256, 32);
      g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(256, y + 0.5); g.stroke();
      for (var j = 0; j < 5; j++) {
        var x = rnd() * 256;
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + (rnd() * 40 - 20), y + 30); g.stroke();
      }
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(0, y + 1, 256, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.encoding = THREE.sRGBEncoding;
    texCache[key] = t;
    return t;
  }

  function texTile() {
    if (texCache.tile) return texCache.tile;
    var c = makeCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#dcd8d0'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(120,115,105,0.55)'; g.lineWidth = 3;
    for (var i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke();
    }
    var rnd = seeded(77);
    for (var k = 0; k < 260; k++) {
      g.fillStyle = 'rgba(150,145,135,' + (rnd() * 0.12) + ')';
      g.fillRect(rnd() * 256, rnd() * 256, 3, 3);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.encoding = THREE.sRGBEncoding;
    texCache.tile = t;
    return t;
  }

  function texCement() {
    if (texCache.cement) return texCache.cement;
    var c = makeCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#a8a49c'; g.fillRect(0, 0, 256, 256);
    var rnd = seeded(4242);
    for (var i = 0; i < 4200; i++) {
      var v = rnd();
      g.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(60,58,54,0.10)';
      g.beginPath();
      g.arc(rnd() * 256, rnd() * 256, rnd() * 2.2 + 0.4, 0, Math.PI * 2);
      g.fill();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    t.encoding = THREE.sRGBEncoding;
    texCache.cement = t;
    return t;
  }

  function texGrass() {
    if (texCache.grass) return texCache.grass;
    var c = makeCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#5d8a4c'; g.fillRect(0, 0, 256, 256);
    var rnd = seeded(2024);
    for (var i = 0; i < 2600; i++) {
      var v = rnd();
      g.fillStyle = v > 0.6 ? 'rgba(120,160,92,0.5)' : (v > 0.3 ? 'rgba(74,112,60,0.5)' : 'rgba(150,175,110,0.35)');
      g.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 3, 2 + rnd() * 3);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(60, 60);
    t.encoding = THREE.sRGBEncoding;
    texCache.grass = t;
    return t;
  }

  /* ==============================================================
   * 5. 房间数据
   * ============================================================== */

  function roomZones(def) {
    var zones = [def.rect.slice(0)];
    if (def.zones) for (var i = 0; i < def.zones.length; i++) zones.push(def.zones[i].slice(0));
    return zones;
  }

  function buildRooms() {
    S.rooms = {};
    for (var i = 0; i < ROOM_DEFS.length; i++) {
      var d = ROOM_DEFS[i];
      var zones = roomZones(d);
      var area = 0;
      for (var j = 0; j < zones.length; j++) area += (zones[j][1] - zones[j][0]) * (zones[j][3] - zones[j][2]);
      S.rooms[d.id] = {
        id: d.id,
        name: d.name,
        floor: d.floor,
        rect: { x0: d.rect[0], x1: d.rect[1], z0: d.rect[2], z1: d.rect[3] },
        zones: zones,
        center: { x: (d.rect[0] + d.rect[1]) / 2, z: (d.rect[2] + d.rect[3]) / 2 },
        area: Math.round(area * 100) / 100,
        floorY: d.floor * FLOOR_H,
        style: { wall: RAW_WALL_COLOR, floor: RAW_FLOOR, lamp: false },
        wallMaterial: null,
        floorMaterial: null,
        ceilingMaterial: null,
        lampGroup: null,
        lampOn: false
      };
    }
  }

  /* 判断某个点属于哪个房间（含补充区域） */
  function roomAt(x, z, floor) {
    for (var id in S.rooms) {
      var r = S.rooms[id];
      if (r.floor !== floor) continue;
      for (var i = 0; i < r.zones.length; i++) {
        var zn = r.zones[i];
        if (x >= zn[0] && x <= zn[1] && z >= zn[2] && z <= zn[3]) return r;
      }
    }
    return null;
  }

  /* ==============================================================
   * 6. 墙体几何
   * ============================================================== */

  /* 把墙体定义拆解成若干实心盒（沿墙方向的区间 + 竖向区间） */
  function wallSegments(def) {
    var base = def.floor * FLOOR_H;
    var top = base + FLOOR_H;
    var segs = [];
    var ops = (def.openings || []).slice().sort(function (a, b) { return a.a - b.a; });
    var cursor = def.from;
    for (var i = 0; i < ops.length; i++) {
      var op = ops[i];
      if (op.a > cursor) segs.push({ a: cursor, b: op.a, y0: base, y1: top, op: null });
      var sill = base + (op.sill || 0);
      var oTop = base + (op.top === undefined ? DOOR_H : op.top);
      if (sill > base + 0.001) segs.push({ a: op.a, b: op.b, y0: base, y1: sill, op: op });
      if (oTop < top - 0.001) segs.push({ a: op.a, b: op.b, y0: oTop, y1: top, op: op });
      cursor = Math.max(cursor, op.b);
    }
    if (cursor < def.to - 0.001) segs.push({ a: cursor, b: def.to, y0: base, y1: top, op: null });
    return segs;
  }

  function wallSegBox(def, seg) {
    var len = seg.b - seg.a;
    var h = seg.y1 - seg.y0;
    var cx, cz, w, d;
    if (def.axis === 'x') {
      cx = (seg.a + seg.b) / 2; cz = def.coord;
      w = len; d = WALL_T;
    } else {
      cx = def.coord; cz = (seg.a + seg.b) / 2;
      w = WALL_T; d = len;
    }
    return { x: cx, z: cz, y: (seg.y0 + seg.y1) / 2, w: w, h: h, d: d };
  }

  /* 单侧（单房间）墙体的全部网格 */
  function buildWallSide(def, roomId, group) {
    var mat = S.rooms[roomId] ? S.rooms[roomId].wallMaterial : stdMat(RAW_WALL_COLOR, 0.92);
    var segs = wallSegments(def);
    var base = def.floor * FLOOR_H;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      var b = wallSegBox(def, s);
      var me = new THREE.Mesh(boxGeo(b.w, b.h, b.d), mat);
      me.position.set(b.x, b.y, b.z);
      me.castShadow = true; me.receiveShadow = true;
      me.userData.surface = 'wall';
      me.userData.roomId = roomId;
      me.userData.wallId = def.id;
      group.add(me);
    }
    // 洞口内的窗框 / 玻璃
    var ops = def.openings || [];
    for (var k = 0; k < ops.length; k++) {
      if (ops[k].type === 'window' || ops[k].type === 'glass') {
        buildWindowInsert(def, ops[k], group, roomId, base);
      }
    }
  }

  /* 窗（玻璃 + 白色木框 + 中挺）*/
  function buildWindowInsert(def, op, group, roomId, base) {
    var w = op.b - op.a;
    var h = (op.top - (op.sill || 0));
    var cy = base + (op.sill || 0) + h / 2;
    var cx = def.axis === 'x' ? (op.a + op.b) / 2 : def.coord;
    var cz = def.axis === 'x' ? def.coord : (op.a + op.b) / 2;
    var along = def.axis === 'x' ? 'x' : 'z';
    var t = 0.06;
    var frameMat = stdMat(0xf2efe8, 0.6);
    var glassMat = new THREE.MeshStandardMaterial({
      color: 0xcfe6ef, roughness: 0.06, metalness: 0.0,
      transparent: true, opacity: 0.22, side: THREE.DoubleSide,
      depthWrite: false, emissive: 0xffc27a, emissiveIntensity: 0
    });
    S.glassMats.push(glassMat);

    function piece(pw, ph, pd, ox, oy, oz, m) {
      var me = new THREE.Mesh(boxGeo(pw, ph, pd), m);
      if (along === 'x') me.position.set(cx + ox, cy + oy, cz + oz);
      else me.position.set(cx + ox, cy + oy, cz + oz);
      me.castShadow = false; me.receiveShadow = false;
      me.userData.surface = 'wall';
      me.userData.roomId = roomId;
      me.userData.wallId = def.id;
      group.add(me);
      return me;
    }

    var horiz = def.axis === 'x';
    // 上框 / 下框
    piece(horiz ? w : t, t, horiz ? t : w, 0, h / 2 - t / 2, 0, frameMat);
    piece(horiz ? w : t, t, horiz ? t : w, 0, -h / 2 + t / 2, 0, frameMat);
    // 左右框
    piece(horiz ? t : w, h, horiz ? t : w, -w / 2 + t / 2, 0, 0, frameMat);
    piece(horiz ? t : w, h, horiz ? t : w, w / 2 - t / 2, 0, 0, frameMat);
    // 中挺
    if (op.type === 'glass') {
      // 玻璃推拉门：中间竖挺 + 横挺
      piece(horiz ? t : w, h, horiz ? t : w, 0, 0, 0, frameMat);
      piece(horiz ? w : t, t, horiz ? t : w, 0, h * 0.22, 0, frameMat);
    } else {
      piece(horiz ? t : w, h, horiz ? t : w, 0, 0, 0, frameMat);
      piece(horiz ? w : t, t, horiz ? t : w, 0, 0, 0, frameMat);
    }
    // 玻璃
    var gl = new THREE.Mesh(planeGeo(w - t * 1.2, h - t * 1.2), glassMat);
    if (horiz) gl.rotation.y = 0; else gl.rotation.y = Math.PI / 2;
    if (horiz) gl.position.set(cx, cy, cz); else gl.position.set(cx, cy, cz);
    gl.userData.surface = 'wall';
    gl.userData.roomId = roomId;
    gl.userData.wallId = def.id;
    gl.renderOrder = 1;
    group.add(gl);
  }

  /* ==============================================================
   * 7. 碰撞
   * ============================================================== */

  function addCollider(minX, minY, minZ, maxX, maxY, maxZ) {
    S.colliders.push({ minX: minX, minY: minY, minZ: minZ, maxX: maxX, maxY: maxY, maxZ: maxZ });
  }

  /* 圆 - AABB 推出 */
  function resolveCollisions(px, pz, feetY) {
    var headY = feetY + PLAYER_H;
    for (var i = 0; i < S.colliders.length; i++) {
      var c = S.colliders[i];
      if (feetY >= c.maxY - 0.06) continue;      // 玩家站在其上方
      if (headY <= c.minY + 0.02) continue;      // 玩家在其下方
      var cx = clamp(px, c.minX, c.maxX);
      var cz = clamp(pz, c.minZ, c.maxZ);
      var dx = px - cx, dz = pz - cz;
      var d2 = dx * dx + dz * dz;
      if (d2 >= PLAYER_R * PLAYER_R) continue;
      if (d2 > 1e-8) {
        var d = Math.sqrt(d2);
        var push = (PLAYER_R - d) / d;
        px += dx * push;
        pz += dz * push;
      } else {
        // 圆心在盒内：沿最小穿透轴推出
        var l = px - c.minX, r = c.maxX - px, u = pz - c.minZ, dn = c.maxZ - pz;
        var m = Math.min(l, r, u, dn);
        if (m === l) px = c.minX - PLAYER_R;
        else if (m === r) px = c.maxX + PLAYER_R;
        else if (m === u) pz = c.minZ - PLAYER_R;
        else pz = c.maxZ + PLAYER_R;
      }
    }
    return { x: px, z: pz };
  }

  /* ==============================================================
   * 8. 房屋主体构建
   * ============================================================== */

  function buildWall(def) {
    var st = S.walls[def.id];
    if (!st) {
      st = S.walls[def.id] = { def: def, groups: {}, demolished: false, built: !def.id || def.id.indexOf('new:') !== 0 };
    }
    if (st.built) {
      for (var rid in def.rooms) {
        var roomId = def.rooms[rid];
        if (!roomId) continue;
        var g = new THREE.Group();
        g.name = 'wall_' + def.id + '_' + roomId;
        buildWallSide(def, roomId, g);
        S.wallRoot.add(g);
        st.groups[roomId] = g;
      }
      // 碰撞（只生成一次，避免双份）
      if (!st.colliders) {
        st.colliders = [];
        var segs = wallSegments(def);
        for (var i = 0; i < segs.length; i++) {
          var b = wallSegBox(def, segs[i]);
          var c = {
            minX: b.x - b.w / 2, maxX: b.x + b.w / 2,
            minZ: b.z - b.d / 2, maxZ: b.z + b.d / 2,
            minY: b.y - b.h / 2, maxY: b.y + b.h / 2
          };
          st.colliders.push(c);
        }
        S.colliders = S.colliders.concat(st.colliders);
      }
    }
    return st;
  }

  function setWallVisible(st, visible) {
    for (var rid in st.groups) {
      st.groups[rid].visible = visible;
    }
  }

  /* 用若干矩形铺设楼板 / 屋顶 */
  function addSlab(rects, y0, y1, material, castShadow) {
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      var w = r[1] - r[0], d = r[3] - r[2];
      var me = new THREE.Mesh(boxGeo(w, y1 - y0, d), material);
      me.position.set((r[0] + r[1]) / 2, (y0 + y1) / 2, (r[2] + r[3]) / 2);
      me.castShadow = castShadow !== false;
      me.receiveShadow = true;
      me.userData.surface = 'floor';
      S.houseRoot.add(me);
    }
  }

  function buildHouse() {
    var conc = stdMat(0xbdbab2, 0.94);
    var plinth = stdMat(0x9d9a93, 0.95);

    /* 基础台基 */
    var base = new THREE.Mesh(boxGeo(24.4, 0.32, 18.4), plinth);
    base.position.set(0, -0.16, 0);
    base.receiveShadow = true;
    base.castShadow = true;
    S.houseRoot.add(base);

    /* 一层楼板（各房间地板） */
    for (var id in S.rooms) {
      var r = S.rooms[id];
      if (r.floor !== 0) continue;
      for (var i = 0; i < r.zones.length; i++) {
        var zn = r.zones[i];
        var me = new THREE.Mesh(planeGeo(zn[1] - zn[0], zn[3] - zn[2]), r.floorMaterial);
        me.rotation.x = -Math.PI / 2;
        me.position.set((zn[0] + zn[1]) / 2, 0.005, (zn[2] + zn[3]) / 2);
        me.receiveShadow = true;
        me.userData.surface = 'floor';
        me.userData.roomId = id;
        S.floorRoot.add(me);
      }
    }

    /* 二层楼板结构（避开楼梯洞） */
    var slab1 = [
      [-12, 8, -9, 9],
      [11, 12, -9, 9],
      [8, 11, -9, 3.6]
    ];
    addSlab(slab1, FLOOR_H - SLAB_T, FLOOR_H, conc, true);

    /* 二层房间地板 */
    for (var id2 in S.rooms) {
      var r2 = S.rooms[id2];
      if (r2.floor !== 1) continue;
      for (var j = 0; j < r2.zones.length; j++) {
        var zn2 = r2.zones[j];
        var me2 = new THREE.Mesh(planeGeo(zn2[1] - zn2[0], zn2[3] - zn2[2]), r2.floorMaterial);
        me2.rotation.x = -Math.PI / 2;
        me2.position.set((zn2[0] + zn2[1]) / 2, FLOOR_H + 0.005, (zn2[2] + zn2[3]) / 2);
        me2.receiveShadow = true;
        me2.userData.surface = 'floor';
        me2.userData.roomId = id2;
        S.floorRoot.add(me2);
      }
    }

    /* 顶棚：一层（避开楼梯洞）+ 二层（阳台为半室外，无顶） */
    var ceil0 = [
      [-12, 8, -9, 9],
      [11, 12, -9, 9],
      [8, 11, -9, 3.6]
    ];
    for (var k = 0; k < ceil0.length; k++) {
      var cr = ceil0[k];
      var cm = new THREE.Mesh(planeGeo(cr[1] - cr[0], cr[3] - cr[2]), stdMat(0xe9e6df, 0.95));
      cm.rotation.x = Math.PI / 2;
      cm.position.set((cr[0] + cr[1]) / 2, CEIL_H - 0.01, (cr[2] + cr[3]) / 2);
      cm.receiveShadow = true;
      cm.userData.surface = 'ceiling';
      S.ceilingRoot.add(cm);
    }
    var ceil1 = [
      [-12, 0, -9, 9],
      [0, 8, -3, 9],
      [11, 12, -3, 9],
      [8, 11, -3, 3.6]
    ];
    for (var k2 = 0; k2 < ceil1.length; k2++) {
      var cr2 = ceil1[k2];
      var cm2 = new THREE.Mesh(planeGeo(cr2[1] - cr2[0], cr2[3] - cr2[2]), stdMat(0xe9e6df, 0.95));
      cm2.rotation.x = Math.PI / 2;
      cm2.position.set((cr2[0] + cr2[1]) / 2, FLOOR_H + CEIL_H - 0.01, (cr2[2] + cr2[3]) / 2);
      cm2.receiveShadow = true;
      cm2.userData.surface = 'ceiling';
      S.ceilingRoot.add(cm2);
    }

    /* 屋顶（阳台区域不封顶） */
    var roof = [
      [-12, 0, -9, 9],
      [0, 8, -3, 9],
      [11, 12, -3, 9],
      [8, 11, -3, 3.6]
    ];
    addSlab(roof, FLOOR_H + CEIL_H, FLOOR_H + CEIL_H + SLAB_T, conc, true);

    /* 墙体 */
    for (var w = 0; w < WALL_DEFS.length; w++) buildWall(WALL_DEFS[w]);

    buildStairs();
    buildBalcony();
    buildRoomLamps();
  }

  /* ---------------- 楼梯 ---------------- */
  function buildStairs() {
    var g = new THREE.Group();
    g.name = 'stairs';
    var tread = stdMat(0x9a6b42, 0.75);
    var riser = stdMat(0x8a5f3a, 0.8);
    var rail = stdMat(0x6f7378, 0.35, 0.65);

    for (var i = 0; i < STAIR_STEPS; i++) {
      var z1 = STAIR_Z_BOT - i * STAIR_RUN;
      var z0 = z1 - STAIR_RUN;
      var topY = (i + 1) * STAIR_RISE;
      // 踏步
      var step = new THREE.Mesh(boxGeo(STAIR_X1 - STAIR_X0, 0.06, STAIR_RUN), tread);
      step.position.set((STAIR_X0 + STAIR_X1) / 2, topY - 0.03, (z0 + z1) / 2);
      step.castShadow = true; step.receiveShadow = true;
      step.userData.surface = 'floor';
      g.add(step);
      // 竖板
      var ris = new THREE.Mesh(boxGeo(STAIR_X1 - STAIR_X0, STAIR_RISE, 0.04), riser);
      ris.position.set((STAIR_X0 + STAIR_X1) / 2, topY - STAIR_RISE / 2, z1 - 0.02);
      ris.castShadow = true; ris.receiveShadow = true;
      g.add(ris);
      // 侧墙（填充踏步下方的空隙，形成实体楼梯）
      var fill = new THREE.Mesh(boxGeo(0.08, topY, STAIR_RUN), stdMat(0xb9b6ae, 0.94));
      fill.position.set(STAIR_X0 - 0.04, topY / 2, (z0 + z1) / 2);
      fill.castShadow = true; fill.receiveShadow = true;
      g.add(fill);
      var fill2 = new THREE.Mesh(boxGeo(0.08, topY, STAIR_RUN), stdMat(0xb9b6ae, 0.94));
      fill2.position.set(STAIR_X1 + 0.04, topY / 2, (z0 + z1) / 2);
      fill2.castShadow = true; fill2.receiveShadow = true;
      g.add(fill2);
    }

    // 侧栏（扶手 + 立柱）
    var sides = [STAIR_X0 - 0.12, STAIR_X1 + 0.12];
    for (var s = 0; s < sides.length; s++) {
      var x = sides[s];
      var len = Math.sqrt((STAIR_Z_BOT - STAIR_Z_TOP) * (STAIR_Z_BOT - STAIR_Z_TOP) + FLOOR_H * FLOOR_H);
      var bar = new THREE.Mesh(boxGeo(0.07, 0.07, len), rail);
      bar.position.set(x, FLOOR_H / 2 + 0.95, (STAIR_Z_TOP + STAIR_Z_BOT) / 2);
      bar.rotation.x = Math.atan2(FLOOR_H, STAIR_Z_BOT - STAIR_Z_TOP);
      bar.castShadow = true;
      g.add(bar);
      for (var b = 0; b <= 5; b++) {
        var t = b / 5;
        var pz = lerp(STAIR_Z_BOT, STAIR_Z_TOP, t);
        var py = lerp(0, FLOOR_H, t);
        var post = new THREE.Mesh(cylGeo(0.025, 0.025, 0.95, 8), rail);
        post.position.set(x, py + 0.475, pz);
        post.castShadow = true;
        g.add(post);
      }
      // 楼梯侧面碰撞（防止走出楼梯）
      addCollider(x - 0.09, 0, STAIR_Z_TOP, x + 0.09, CEIL_H, STAIR_Z_BOT);
    }
    S.houseRoot.add(g);
  }

  /* ---------------- 阳台栏杆 ---------------- */
  function buildBalcony() {
    var g = new THREE.Group();
    g.name = 'balcony_rail';
    var frameMat = stdMat(0x40464c, 0.4, 0.55);
    var glassMat = new THREE.MeshStandardMaterial({
      color: 0xbfe0e8, roughness: 0.05, metalness: 0.0,
      transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false
    });
    var baseY = FLOOR_H;
    var h = 1.1;

    function rail(x0, z0, x1, z1) {
      var alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
      var len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      var cx = (x0 + x1) / 2;
      var cz = (z0 + z1) / 2;
      var pw = alongX ? len : 0.06;
      var pd = alongX ? 0.06 : len;
      // 底座
      var bs = new THREE.Mesh(boxGeo(pw, 0.12, pd), frameMat);
      bs.position.set(cx, baseY + 0.06, cz);
      bs.castShadow = true; bs.receiveShadow = true;
      g.add(bs);
      // 玻璃
      var gl = new THREE.Mesh(boxGeo(alongX ? len : 0.04, h - 0.24, alongX ? 0.04 : len), glassMat);
      gl.position.set(cx, baseY + 0.12 + (h - 0.24) / 2, cz);
      gl.renderOrder = 1;
      g.add(gl);
      // 扶手
      var tp = new THREE.Mesh(boxGeo(pw, 0.07, pd), frameMat);
      tp.position.set(cx, baseY + h - 0.035, cz);
      tp.castShadow = true;
      g.add(tp);
      // 立柱
      var n = Math.max(2, Math.round(len / 1.6));
      for (var i = 0; i <= n; i++) {
        var t = i / n;
        var px = alongX ? lerp(x0, x1, t) : cx;
        var pz = alongX ? cz : lerp(z0, z1, t);
        var po = new THREE.Mesh(boxGeo(0.05, h, 0.05), frameMat);
        po.position.set(px, baseY + h / 2, pz);
        po.castShadow = true;
        g.add(po);
      }
      // 碰撞
      if (alongX) addCollider(Math.min(x0, x1) - 0.06, baseY, cz - 0.09, Math.max(x0, x1) + 0.06, baseY + h, cz + 0.09);
      else addCollider(cx - 0.09, baseY, Math.min(z0, z1) - 0.06, cx + 0.09, baseY + h, Math.max(z0, z1) + 0.06);
    }

    // 北侧（z = -9，朝向远景）
    rail(0, -9, 12, -9);
    // 东侧（x = 12，朝向远景）
    rail(12, -9, 12, -3);
    // 南侧靠楼厅段（z = -3, x = 6..12，与二层楼厅分隔）
    rail(6, -3, 12, -3);

    S.houseRoot.add(g);
  }

  /* ---------------- 房间灯具 ---------------- */
  function buildRoomLamps() {
    for (var id in S.rooms) {
      var r = S.rooms[id];
      var g = new THREE.Group();
      g.name = 'lamp_' + id;
      var z0 = r.rect[2], z1 = r.rect[3];
      var cx = r.center.x;
      var cz = (z0 + z1) / 2;
      var y = r.floorY + CEIL_H - 0.03;
      // 裸露灯位（毛坯）
      var socket = new THREE.Mesh(cylGeo(0.055, 0.055, 0.06, 10), stdMat(0xdedad2, 0.7));
      socket.position.set(cx, y, cz);
      g.add(socket);
      var wire = new THREE.Mesh(cylGeo(0.006, 0.006, 0.12, 6), stdMat(0x333333, 0.6));
      wire.position.set(cx, y + 0.08, cz);
      g.add(wire);
      r.lampGroup = g;
      S.lampRoot.add(g);
    }
  }

  /* ==============================================================
   * 9. 家具
   * ============================================================== */

  var PAL = {
    wood: 0x8b5a2b, woodLight: 0xc19a6b, woodDark: 0x4a3222,
    fabric: 0x7e93a8, fabricWarm: 0xc0a184, fabricGreen: 0x7f9b7a,
    white: 0xf3f1ec, cream: 0xe8e0d3, metal: 0xb8bcc0, dark: 0x2f3134,
    leaf: 0x4e7c46, leafDark: 0x3c6038, pot: 0xb5714c,
    glass: 0xcfe6ef, gold: 0xc8a45c, black: 0x1e2022
  };

  function M(color, rough, metal) { return stdMat(color, rough === undefined ? 0.82 : rough, metal === undefined ? 0 : metal); }

  /* 各类家具的程序化几何（全部使用 Box / Cylinder / Sphere / Lathe / Cone 组合） */
  var FURNITURE_BUILDERS = {
    sofa: function (g) {
      var w = 2.05, d = 0.92, sh = 0.42, fab = M(PAL.fabric, 0.94);
      g.add(boxMesh(w, 0.24, d, 0, sh - 0.12, 0, fab));
      g.add(boxMesh(w, 0.56, 0.2, 0, sh + 0.2, -d / 2 + 0.1, fab));
      g.add(boxMesh(0.2, 0.44, d, -w / 2 + 0.1, sh + 0.14, 0, fab));
      g.add(boxMesh(0.2, 0.44, d, w / 2 - 0.1, sh + 0.14, 0, fab));
      for (var i = 0; i < 3; i++) {
        var cw = (w - 0.44) / 3;
        g.add(boxMesh(cw - 0.04, 0.14, d - 0.28, -w / 2 + 0.22 + (i + 0.5) * cw, sh + 0.07, 0.04, M(PAL.fabricWarm, 0.95)));
        g.add(boxMesh(cw - 0.12, 0.3, 0.12, -w / 2 + 0.22 + (i + 0.5) * cw, sh + 0.3, -d / 2 + 0.18, M(PAL.fabricGreen, 0.95)));
      }
      var lg = [-w / 2 + 0.16, w / 2 - 0.16], lz = [-d / 2 + 0.16, d / 2 - 0.16];
      for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) {
        g.add(cylMesh(0.028, 0.022, 0.1, 8, lg[a], 0.05, lz[b], M(PAL.woodDark, 0.7)));
      }
    },
    armchair: function (g) {
      var w = 0.86, d = 0.84, sh = 0.42, fab = M(PAL.fabricWarm, 0.94);
      g.add(boxMesh(w, 0.22, d, 0, sh - 0.11, 0, fab));
      g.add(boxMesh(w, 0.5, 0.18, 0, sh + 0.18, -d / 2 + 0.09, fab));
      g.add(boxMesh(0.16, 0.38, d, -w / 2 + 0.08, sh + 0.12, 0, fab));
      g.add(boxMesh(0.16, 0.38, d, w / 2 - 0.08, sh + 0.12, 0, fab));
      g.add(boxMesh(w - 0.3, 0.12, d - 0.26, 0, sh + 0.06, 0.03, M(PAL.cream, 0.95)));
      var lg = [-w / 2 + 0.12, w / 2 - 0.12], lz = [-d / 2 + 0.12, d / 2 - 0.12];
      for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) {
        g.add(cylMesh(0.026, 0.02, 0.1, 8, lg[a], 0.05, lz[b], M(PAL.woodDark, 0.7)));
      }
    },
    armchair2: function (g) {
      var fab = M(PAL.fabricGreen, 0.94);
      g.add(boxMesh(0.56, 0.1, 0.54, 0, 0.45, 0, fab));
      g.add(boxMesh(0.56, 0.5, 0.09, 0, 0.72, -0.23, fab));
      for (var a = -1; a <= 1; a += 2) {
        g.add(cylMesh(0.022, 0.022, 0.45, 8, a * 0.24, 0.225, -0.2, M(PAL.wood, 0.75)));
        g.add(cylMesh(0.022, 0.022, 0.45, 8, a * 0.24, 0.225, 0.2, M(PAL.wood, 0.75)));
      }
    },
    table: function (g) {
      g.add(boxMesh(1.4, 0.07, 0.95, 0, 0.74, 0, M(PAL.woodLight, 0.7)));
      for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
        g.add(boxMesh(0.07, 0.72, 0.07, a * 0.62, 0.36, b * 0.4, M(PAL.wood, 0.75)));
      }
    },
    diningTable: function (g) {
      var top = new THREE.Mesh(cylGeo(0.7, 0.7, 0.07, 24), M(PAL.woodLight, 0.65));
      top.position.y = 0.74; top.castShadow = true; top.receiveShadow = true;
      g.add(top);
      g.add(cylMesh(0.09, 0.12, 0.7, 12, 0, 0.35, 0, M(PAL.woodDark, 0.7)));
      g.add(cylMesh(0.34, 0.38, 0.05, 16, 0, 0.03, 0, M(PAL.woodDark, 0.7)));
    },
    coffeeTable: function (g) {
      g.add(boxMesh(1.1, 0.06, 0.58, 0, 0.42, 0, M(PAL.woodLight, 0.6)));
      g.add(boxMesh(0.95, 0.04, 0.46, 0, 0.16, 0, M(PAL.woodDark, 0.75)));
      for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
        g.add(boxMesh(0.06, 0.42, 0.06, a * 0.48, 0.21, b * 0.24, M(PAL.wood, 0.75)));
      }
    },
    cabinet: function (g) {
      g.add(boxMesh(1.2, 1.75, 0.45, 0, 0.875, 0, M(PAL.woodLight, 0.7)));
      g.add(boxMesh(1.24, 0.06, 0.49, 0, 1.78, 0, M(PAL.woodDark, 0.7)));
      for (var a = -1; a <= 1; a += 2) {
        g.add(boxMesh(0.54, 1.6, 0.03, a * 0.3, 0.88, 0.23, M(PAL.cream, 0.75)));
        g.add(cylMesh(0.018, 0.018, 0.12, 8, a * 0.06, 0.9, 0.26, M(PAL.gold, 0.35, 0.7)));
      }
      g.add(boxMesh(1.2, 0.14, 0.45, 0, 0.07, 0, M(PAL.woodDark, 0.75)));
    },
    shelf: function (g) {
      var w = 0.9, h = 1.8, d = 0.34;
      g.add(boxMesh(0.05, h, d, -w / 2, h / 2, 0, M(PAL.wood, 0.75)));
      g.add(boxMesh(0.05, h, d, w / 2, h / 2, 0, M(PAL.wood, 0.75)));
      g.add(boxMesh(w, 0.05, d, 0, 0.02, 0, M(PAL.wood, 0.75)));
      for (var i = 0; i < 4; i++) {
        var y = 0.42 + i * 0.44;
        g.add(boxMesh(w, 0.04, d, 0, y, 0, M(PAL.woodLight, 0.7)));
        var rnd = seeded(100 + i);
        for (var b = 0; b < 6; b++) {
          var bw = 0.05 + rnd() * 0.04, bh = 0.2 + rnd() * 0.12;
          var col = [0x8b4a3a, 0x3f5d78, 0x6b7a3a, 0x8a7a45][Math.floor(rnd() * 4)];
          g.add(boxMesh(bw, bh, d - 0.1, -w / 2 + 0.08 + b * 0.13, y + bh / 2 + 0.02, 0, M(col, 0.9)));
        }
      }
    },
    bookshelf: function (g) {
      var w = 1.0, h = 2.0, d = 0.32;
      g.add(boxMesh(w, h, 0.04, 0, h / 2, -d / 2, M(PAL.woodDark, 0.8)));
      g.add(boxMesh(0.05, h, d, -w / 2, h / 2, 0, M(PAL.wood, 0.75)));
      g.add(boxMesh(0.05, h, d, w / 2, h / 2, 0, M(PAL.wood, 0.75)));
      for (var i = 0; i < 5; i++) {
        var y = 0.06 + i * 0.48;
        g.add(boxMesh(w, 0.04, d, 0, y, 0, M(PAL.woodLight, 0.7)));
        var rnd = seeded(500 + i);
        for (var b = 0; b < 7; b++) {
          var bw = 0.05 + rnd() * 0.045, bh = 0.24 + rnd() * 0.14;
          var col = [0x9a5b3a, 0x3c5f7d, 0x5f7a3c, 0x8a6a35, 0x6b3f52][Math.floor(rnd() * 5)];
          g.add(boxMesh(bw, bh, d - 0.08, -w / 2 + 0.09 + b * 0.125, y + bh / 2 + 0.02, 0, M(col, 0.9)));
        }
      }
      g.add(boxMesh(w, 0.05, d, 0, h, 0, M(PAL.wood, 0.75)));
    },
    lamp: function (g) {
      g.add(cylMesh(0.16, 0.19, 0.04, 16, 0, 0.02, 0, M(PAL.dark, 0.5, 0.4)));
      g.add(cylMesh(0.022, 0.022, 1.45, 10, 0, 0.74, 0, M(PAL.dark, 0.4, 0.6)));
      var shade = new THREE.Mesh(cylGeo(0.17, 0.23, 0.28, 18, 1), M(PAL.cream, 0.9, 0, { emissive: 0x332611, emissiveIntensity: 0.6 }));
      shade.position.set(0, 1.58, 0);
      shade.castShadow = true;
      g.add(shade);
    },
    pendant: function (g) {
      g.add(cylMesh(0.008, 0.008, 0.55, 6, 0, 1.72, 0, M(PAL.dark, 0.5)));
      var shade = new THREE.Mesh(latheGeo([[0.02, 0], [0.09, 0.02], [0.2, 0.2], [0.21, 0.24]], 20), M(PAL.gold, 0.4, 0.5, { emissive: 0x3a2a0c, emissiveIntensity: 0.8 }));
      shade.position.set(0, 1.3, 0);
      shade.castShadow = true;
      g.add(shade);
      var bulb = sphMesh(0.06, 10, 0, 1.33, 0, M(0xfff0cc, 0.4, 0, { emissive: 0xffc27a, emissiveIntensity: 1.4 }));
      g.add(bulb);
    },
    plant: function (g) {
      var pot = new THREE.Mesh(latheGeo([[0.0, 0], [0.16, 0], [0.19, 0.3], [0.2, 0.32], [0.17, 0.32], [0.16, 0.3], [0.0, 0.02]], 18), M(PAL.pot, 0.9));
      pot.castShadow = true; pot.receiveShadow = true;
      g.add(pot);
      g.add(cylMesh(0.022, 0.03, 0.5, 8, 0, 0.5, 0, M(PAL.woodDark, 0.8)));
      var rnd = seeded(31);
      for (var i = 0; i < 7; i++) {
        var leaf = sphMesh(0.16 + rnd() * 0.08, 8,
          (rnd() - 0.5) * 0.34, 0.75 + rnd() * 0.5, (rnd() - 0.5) * 0.34,
          M(rnd() > 0.5 ? PAL.leaf : PAL.leafDark, 0.92));
        leaf.scale.set(1, 0.72, 1);
        g.add(leaf);
      }
    },
    rug: function (g) {
      var m = new THREE.Mesh(planeGeo(2.4, 1.6), M(0xb5714c, 0.98));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.012;
      m.receiveShadow = true;
      m.userData.surface = 'floor';
      g.add(m);
      var inner = new THREE.Mesh(planeGeo(1.9, 1.15), M(0xd9a76c, 0.98));
      inner.rotation.x = -Math.PI / 2;
      inner.position.y = 0.016;
      inner.receiveShadow = true;
      g.add(inner);
    },
    bed: function (g) {
      var w = 1.6, d = 2.05;
      g.add(boxMesh(w + 0.08, 0.3, d + 0.08, 0, 0.2, 0, M(PAL.wood, 0.75)));
      g.add(boxMesh(w, 0.26, d, 0, 0.46, 0, M(PAL.white, 0.95)));
      g.add(boxMesh(w + 0.1, 1.0, 0.1, 0, 0.5, -d / 2 - 0.04, M(PAL.woodDark, 0.7)));
      g.add(boxMesh(w, 0.06, d * 0.55, 0, 0.6, d * 0.2, M(PAL.fabric, 0.95)));
      for (var a = -1; a <= 1; a += 2) {
        var pw = new THREE.Mesh(boxGeo(0.62, 0.14, 0.34), M(PAL.white, 0.96));
        pw.position.set(a * 0.36, 0.66, -d / 2 + 0.3);
        pw.rotation.x = -0.12;
        pw.castShadow = true;
        g.add(pw);
      }
      for (var b = -1; b <= 1; b += 2) for (var c = -1; c <= 1; c += 2) {
        g.add(boxMesh(0.09, 0.16, 0.09, b * (w / 2 + 0.02), 0.08, c * (d / 2 + 0.02), M(PAL.woodDark, 0.7)));
      }
    },
    nightstand: function (g) {
      g.add(boxMesh(0.46, 0.5, 0.42, 0, 0.35, 0, M(PAL.woodLight, 0.72)));
      g.add(boxMesh(0.5, 0.04, 0.46, 0, 0.62, 0, M(PAL.woodDark, 0.7)));
      g.add(boxMesh(0.38, 0.16, 0.02, 0, 0.44, 0.215, M(PAL.cream, 0.8)));
      g.add(cylMesh(0.015, 0.015, 0.1, 8, 0, 0.44, 0.235, M(PAL.gold, 0.35, 0.7)));
      for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
        g.add(cylMesh(0.022, 0.018, 0.1, 8, a * 0.19, 0.05, b * 0.16, M(PAL.woodDark, 0.7)));
      }
    },
    wardrobe: function (g) {
      g.add(boxMesh(1.8, 2.2, 0.6, 0, 1.1, 0, M(PAL.woodLight, 0.7)));
      g.add(boxMesh(1.86, 0.06, 0.66, 0, 2.22, 0, M(PAL.woodDark, 0.7)));
      for (var a = -1; a <= 1; a += 2) {
        g.add(boxMesh(0.84, 1.98, 0.03, a * 0.44, 1.1, 0.31, M(PAL.cream, 0.72)));
        g.add(cylMesh(0.016, 0.016, 0.24, 8, a * 0.08, 1.1, 0.34, M(PAL.gold, 0.3, 0.75)));
      }
      g.add(boxMesh(1.8, 0.12, 0.6, 0, 0.06, 0, M(PAL.woodDark, 0.75)));
    },
    dresser: function (g) {
      g.add(boxMesh(1.2, 0.72, 0.5, 0, 0.42, 0, M(PAL.woodLight, 0.72)));
      g.add(boxMesh(1.24, 0.05, 0.54, 0, 0.8, 0, M(PAL.woodDark, 0.7)));
      for (var i = 0; i < 3; i++) {
        g.add(boxMesh(1.08, 0.16, 0.02, 0, 0.2 + i * 0.22, 0.26, M(PAL.cream, 0.78)));
        g.add(cylMesh(0.014, 0.014, 0.16, 8, 0, 0.2 + i * 0.22, 0.28, M(PAL.gold, 0.3, 0.75)));
      }
      for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
        g.add(cylMesh(0.024, 0.02, 0.14, 8, a * 0.52, 0.07, b * 0.2, M(PAL.woodDark, 0.7)));
      }
    },
    sink: function (g) {
      g.add(cylMesh(0.09, 0.12, 0.7, 12, 0, 0.35, 0, M(PAL.white, 0.6)));
      var basin = new THREE.Mesh(latheGeo([[0.0, 0], [0.26, 0.02], [0.28, 0.1], [0.27, 0.12], [0.24, 0.05], [0.0, 0.03]], 20), M(PAL.white, 0.45));
      basin.position.y = 0.78;
      basin.castShadow = true;
      g.add(basin);
      g.add(cylMesh(0.02, 0.02, 0.26, 8, 0, 1.02, -0.16, M(PAL.metal, 0.28, 0.8)));
      g.add(boxMesh(0.05, 0.05, 0.16, 0, 1.14, -0.11, M(PAL.metal, 0.28, 0.8)));
    },
    mirror: function (g) {
      g.add(boxMesh(0.72, 0.92, 0.05, 0, 1.5, 0, M(PAL.gold, 0.35, 0.6)));
      var gl = new THREE.Mesh(planeGeo(0.62, 0.82), M(0xdfeaf0, 0.06, 0.9, { envMap: null }));
      gl.position.set(0, 1.5, 0.031);
      g.add(gl);
    },
    bathtub: function (g) {
      g.add(boxMesh(1.72, 0.5, 0.78, 0, 0.28, 0, M(PAL.white, 0.4)));
      var water = new THREE.Mesh(planeGeo(1.56, 0.62), M(0x9fd4e2, 0.08, 0.1, { transparent: true, opacity: 0.75 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, 0.47, 0);
      g.add(water);
      g.add(cylMesh(0.025, 0.025, 0.2, 8, -0.7, 0.62, 0, M(PAL.metal, 0.25, 0.85)));
      g.add(boxMesh(0.05, 0.05, 0.16, -0.7, 0.72, 0.07, M(PAL.metal, 0.25, 0.85)));
    },
    toilet: function (g) {
      g.add(boxMesh(0.38, 0.72, 0.2, 0, 0.36, -0.22, M(PAL.white, 0.4)));
      var bowl = new THREE.Mesh(latheGeo([[0.0, 0], [0.2, 0.02], [0.21, 0.1], [0.17, 0.16], [0.0, 0.15]], 18), M(PAL.white, 0.35));
      bowl.position.set(0, 0.3, 0.06);
      bowl.scale.set(1, 1, 1.3);
      bowl.castShadow = true;
      g.add(bowl);
      g.add(boxMesh(0.36, 0.04, 0.5, 0, 0.46, 0.06, M(PAL.white, 0.35)));
    },
    vanity: function (g) {
      g.add(boxMesh(1.0, 0.76, 0.48, 0, 0.42, 0, M(PAL.woodLight, 0.7)));
      g.add(boxMesh(1.04, 0.05, 0.52, 0, 0.82, 0, M(PAL.woodDark, 0.7)));
      for (var a = -1; a <= 1; a += 2) {
        g.add(boxMesh(0.46, 0.62, 0.02, a * 0.25, 0.44, 0.245, M(PAL.cream, 0.75)));
      }
      var basin = new THREE.Mesh(latheGeo([[0.0, 0], [0.22, 0.02], [0.24, 0.09], [0.22, 0.11], [0.19, 0.04], [0.0, 0.02]], 18), M(PAL.white, 0.42));
      basin.position.y = 0.84;
      g.add(basin);
      g.add(cylMesh(0.018, 0.018, 0.24, 8, 0, 1.04, -0.14, M(PAL.metal, 0.25, 0.85)));
      var mg = new THREE.Mesh(planeGeo(0.6, 0.78), M(0xdfeaf0, 0.06, 0.9));
      mg.position.set(0, 1.55, -0.24);
      mg.rotation.y = Math.PI;
      g.add(mg);
      g.add(boxMesh(0.66, 0.84, 0.04, 0, 1.55, -0.265, M(PAL.gold, 0.35, 0.6)));
    },
    towel: function (g) {
      g.add(cylMesh(0.016, 0.016, 0.62, 8, 0, 1.3, 0, M(PAL.metal, 0.28, 0.8)));
      g.add(boxMesh(0.62, 0.02, 0.05, 0, 1.6, 0, M(PAL.metal, 0.28, 0.8)));
      var t1 = boxMesh(0.26, 0.42, 0.05, -0.16, 1.36, 0.01, M(0xd8e6ee, 0.96));
      g.add(t1);
      g.add(boxMesh(0.24, 0.38, 0.05, 0.16, 1.38, 0.01, M(0xe8c6c0, 0.96)));
    },
    stove: function (g) {
      g.add(boxMesh(0.76, 0.86, 0.62, 0, 0.43, 0, M(PAL.metal, 0.35, 0.5)));
      g.add(boxMesh(0.8, 0.05, 0.66, 0, 0.88, 0, M(PAL.dark, 0.4, 0.4)));
      for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
        var burn = new THREE.Mesh(cylGeo(0.11, 0.11, 0.015, 14), M(0x24262a, 0.6));
        burn.position.set(a * 0.18, 0.91, b * 0.14);
        g.add(burn);
      }
      g.add(boxMesh(0.6, 0.04, 0.03, 0, 0.6, 0.32, M(PAL.dark, 0.5)));
      g.add(boxMesh(0.36, 0.3, 0.02, 0, 0.3, 0.32, M(0x1b1d20, 0.3, 0.2, { emissive: 0xff7b2e, emissiveIntensity: 0.35 })));
    },
    fridge: function (g) {
      g.add(boxMesh(0.7, 1.85, 0.68, 0, 0.93, 0, M(PAL.metal, 0.3, 0.55)));
      g.add(boxMesh(0.66, 0.02, 0.02, 0, 1.2, 0.345, M(PAL.dark, 0.5)));
      g.add(boxMesh(0.03, 0.36, 0.04, 0.26, 1.0, 0.36, M(PAL.dark, 0.4, 0.6)));
      g.add(boxMesh(0.03, 0.36, 0.04, 0.26, 0.5, 0.36, M(PAL.dark, 0.4, 0.6)));
      g.add(boxMesh(0.72, 0.06, 0.7, 0, 0.03, 0, M(PAL.dark, 0.6)));
    },
    curtain: function (g) {
      g.add(cylMesh(0.018, 0.018, 2.0, 8, 0, 2.3, 0, M(PAL.metal, 0.3, 0.7)));
      for (var a = -1; a <= 1; a += 2) {
        var panel = boxMesh(0.42, 2.1, 0.05, a * 0.24, 1.55, 0, M(0xe4d8c8, 0.96));
        g.add(panel);
        for (var i = 0; i < 4; i++) {
          g.add(boxMesh(0.05, 2.06, 0.055, a * 0.24 - 0.16 + i * 0.105, 1.55, 0, M(0xd6c8b6, 0.96)));
        }
      }
    },
    tv: function (g) {
      g.add(boxMesh(1.2, 0.05, 0.4, 0, 0.5, 0, M(PAL.dark, 0.45, 0.3)));
      g.add(boxMesh(0.08, 0.5, 0.08, 0, 0.25, 0, M(PAL.dark, 0.45, 0.3)));
      g.add(boxMesh(1.16, 0.66, 0.05, 0, 1.08, 0, M(PAL.black, 0.4)));
      var screen = new THREE.Mesh(planeGeo(1.08, 0.58), M(0x182028, 0.2, 0.1, { emissive: 0x223344, emissiveIntensity: 0.5 }));
      screen.position.set(0, 1.08, 0.03);
      g.add(screen);
    },
    picture: function (g) {
      g.add(boxMesh(0.9, 0.68, 0.04, 0, 1.5, 0, M(PAL.woodDark, 0.6)));
      var art = new THREE.Mesh(planeGeo(0.78, 0.56), M(0xc9b8a2, 0.9));
      art.position.set(0, 1.5, 0.023);
      g.add(art);
      var acc = new THREE.Mesh(planeGeo(0.34, 0.22), M(0x8fa2b5, 0.9));
      acc.position.set(-0.12, 1.44, 0.026);
      g.add(acc);
    }
  };

  var FURNITURE_NAMES = {
    sofa: '沙发', armchair: '单人沙发', armchair2: '单椅', table: '餐桌', diningTable: '圆餐桌',
    coffeeTable: '茶几', cabinet: '柜子', shelf: '书架', bookshelf: '书架', lamp: '落地灯',
    pendant: '吊灯', plant: '绿植', rug: '地毯', bed: '双人床', nightstand: '床头柜',
    wardrobe: '衣柜', dresser: '梳妆台', sink: '洗手台', mirror: '镜子', bathtub: '浴缸',
    toilet: '马桶', vanity: '浴室柜', towel: '毛巾架', stove: '灶台', fridge: '冰箱',
    curtain: '窗帘', tv: '电视', picture: '装饰画'
  };

  /* 部分家具不参与碰撞（薄 / 挂墙 / 装饰） */
  var NO_COLLIDE = { rug: 1, picture: 1, mirror: 1, curtain: 1, tv: 1, towel: 1, pendant: 1 };

  function furnitureProtoOf(type) {
    if (furnitureProto[type]) return furnitureProto[type];
    var builder = FURNITURE_BUILDERS[type];
    if (!builder) return null;
    var g = new THREE.Group();
    g.name = 'proto_' + type;
    builder(g);
    furnitureProto[type] = g;
    return g;
  }

  /* ==============================================================
   * 10. 室外场景
   * ============================================================== */

  /* 河道中心线（z 随 x 起伏），地形与河面共用 */
  function riverCenterZ(x) {
    var u = clamp((x + 140) / 290, 0, 1);
    return -48 - Math.sin(u * 3.6) * 20 - u * 12;
  }

  function buildOutdoor() {
    var g = S.outdoorRoot;

    /* 草地：带起伏与色斑 */
    var gGeo = new THREE.PlaneGeometry(320, 320, 64, 64);
    gGeo.rotateX(-Math.PI / 2);
    var pos = gGeo.attributes.position;
    var colors = [];
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getZ(i);
      var d = Math.max(Math.abs(x) - 14, Math.abs(z) - 11);
      var h = 0;
      if (d > 0) {
        h = (noise2(x * 0.06, z * 0.06) - 0.5) * 1.6 + (noise2(x * 0.18, z * 0.18) - 0.5) * 0.5;
        h = clamp(h, -0.9, 1.1);
      }
      // 河道区域下压，形成河谷
      if (Math.abs(z - riverCenterZ(x)) < 6.5) h = Math.min(h, -1.15);
      pos.setY(i, h);
      var shade = noise2(x * 0.25 + 11, z * 0.25 - 7);
      var c = new THREE.Color().setHSL(0.26 - shade * 0.05, 0.34 + shade * 0.16, 0.27 + shade * 0.09);
      colors.push(c.r, c.g, c.b);
    }
    gGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    gGeo.computeVertexNormals();
    var grassMat = new THREE.MeshStandardMaterial({ map: texGrass(), vertexColors: true, roughness: 0.96, metalness: 0 });
    var ground = new THREE.Mesh(gGeo, grassMat);
    ground.position.y = -0.16;
    ground.receiveShadow = true;
    g.add(ground);

    /* 远景草地（补足到地平线） */
    var far = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), M(0x6d9159, 0.98));
    far.rotation.x = -Math.PI / 2;
    far.position.y = -1.4;
    g.add(far);

    /* 河流：一条自北侧远处穿过的蓝色带状水面（阳台 / 北窗可远眺） */
    var riverPts = [];
    for (var t = 0; t <= 12; t++) {
      var u = t / 12;
      var rx = lerp(-140, 150, u);
      var rz = riverCenterZ(rx);
      riverPts.push(new THREE.Vector3(rx, 0, rz));
    }
    var riverGeo = new THREE.PlaneGeometry(1, 1, 12, 1);
    var rpos = riverGeo.attributes.position;
    for (var q = 0; q < 13; q++) {
      var idx = q * 2;
      rpos.setXYZ(idx, riverPts[q].x, 0, riverPts[q].z - 4.5);
      rpos.setXYZ(idx + 1, riverPts[q].x, 0, riverPts[q].z + 4.5);
    }
    riverGeo.computeVertexNormals();
    var river = new THREE.Mesh(riverGeo, new THREE.MeshStandardMaterial({ color: 0x4f8fbf, roughness: 0.14, metalness: 0.25, transparent: true, opacity: 0.88 }));
    river.position.y = -0.03;
    g.add(river);

    /* 远山：低多边形锥体组合 */
    var hillMat = M(0x6d7f6a, 0.98);
    var hillMat2 = M(0x7b8a76, 0.98);
    var hills = [
      [-95, -120, 22, 34], [-20, -140, 30, 44], [60, -135, 26, 38], [130, -110, 24, 32],
      [-140, 60, 26, 36], [150, 90, 30, 42], [-40, 130, 22, 30], [90, 140, 26, 34]
    ];
    for (var h = 0; h < hills.length; h++) {
      var hx = hills[h][0], hz = hills[h][1], hr = hills[h][2], hh = hills[h][3];
      var hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 7, 2), h % 2 ? hillMat : hillMat2);
      hill.position.set(hx, hh / 2 - 2.5, hz);
      hill.rotation.y = h * 0.7;
      hill.castShadow = false;
      hill.receiveShadow = false;
      g.add(hill);
      var hill2 = new THREE.Mesh(new THREE.ConeGeometry(hr * 0.62, hh * 0.7, 6, 1), hillMat2);
      hill2.position.set(hx + hr * 0.5, hh * 0.35 - 2.5, hz - hr * 0.3);
      g.add(hill2);
    }

    /* 树：12 棵以上 */
    var trunkMat = M(0x6b4b30, 0.95);
    var leafMats = [M(0x4d7c3f, 0.94), M(0x5d8c46, 0.94), M(0x426b39, 0.94)];
    var rnd = seeded(8899);
    var treePos = [
      [-22, -16], [-19, 4], [-24, 14], [-16, -22], [-30, -4],
      [20, -16], [24, 6], [19, 17], [28, -12], [16, 20],
      [-8, 26], [10, 28], [34, 14], [-34, 12], [3, -26]
    ];
    for (var k = 0; k < treePos.length; k++) {
      var tx = treePos[k][0] + (rnd() - 0.5) * 3;
      var tz = treePos[k][1] + (rnd() - 0.5) * 3;
      var th = 2.8 + rnd() * 2.0;
      var tree = new THREE.Group();
      var trunk = new THREE.Mesh(cylGeo(0.2, 0.3, th, 8), trunkMat);
      trunk.position.y = th / 2;
      trunk.castShadow = true;
      tree.add(trunk);
      var layers = 4;
      for (var L = 0; L < layers; L++) {
        var cr = 1.35 - L * 0.24 + rnd() * 0.16;
        var crown = new THREE.Mesh(icoGeo(cr, 0), leafMats[(k + L) % 3]);
        crown.position.set((rnd() - 0.5) * 0.34, th * 0.62 + L * 0.66, (rnd() - 0.5) * 0.34);
        crown.castShadow = true;
        tree.add(crown);
      }
      tree.position.set(tx, 0, tz);
      tree.rotation.y = rnd() * 6.28;
      g.add(tree);
    }

    /* 云 */
    var cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, fog: false });
    var clouds = new THREE.Group();
    for (var c = 0; c < 9; c++) {
      var cg = new THREE.Group();
      var cr2 = 4 + rnd() * 4;
      for (var j = 0; j < 4; j++) {
        var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(cr2 * (0.6 + rnd() * 0.5), 0), cloudMat);
        blob.position.set((rnd() - 0.5) * cr2 * 2.4, (rnd() - 0.5) * cr2 * 0.5, (rnd() - 0.5) * cr2 * 1.2);
        blob.scale.set(1, 0.55, 1);
        cg.add(blob);
      }
      cg.position.set((rnd() - 0.5) * 260, 48 + rnd() * 26, (rnd() - 0.5) * 260);
      clouds.add(cg);
    }
    clouds.name = 'clouds';
    g.add(clouds);
    S.clouds = clouds;
  }

  /* ==============================================================
   * 11. 天空 / 光照 / 天气
   * ============================================================== */

  function buildSky() {
    var canvas = makeCanvas(32, 256);
    S.skyCanvas = canvas;
    S.skyCtx = canvas.getContext('2d');
    var tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = THREE.RepeatWrapping;
    S.skyTex = tex;

    var dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
    dome.name = 'sky';
    dome.renderOrder = -1;
    S.scene.add(dome);
    S.skyDome = dome;

    /* 星星 */
    var starGeo = new THREE.BufferGeometry();
    var sp = [];
    var rnd = seeded(1234);
    for (var i = 0; i < 600; i++) {
      var th = rnd() * Math.PI * 2;
      var ph = Math.acos(rnd() * 0.95);
      var r = 340;
      sp.push(Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.9 + 20, Math.sin(ph) * Math.sin(th) * r);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    stars.name = 'stars';
    S.scene.add(stars);
    S.stars = stars;
  }

  /* 依据小时数与天气计算天空 / 太阳颜色 */
  function skyPalette(hour, weather) {
    var t = ((hour % 24) + 24) % 24;
    var top, mid, bottom, sun, sunI, hemiSky, hemiGround, hemiI, fogNear, fogFar, amb, ambI;
    if (t < 4.5) {          // 深夜
      top = 0x060a1a; mid = 0x0d1730; bottom = 0x1b2545;
      sun = 0x24304f; sunI = 0.0;
      hemiSky = 0x1a2444; hemiGround = 0x0b0e14; hemiI = 0.2; amb = 0x121a30, ambI = 0.07;
      fogNear = 8; fogFar = 120;
    } else if (t < 6.5) {   // 拂晓
      top = 0x2a3f6b; mid = 0x7a6a86; bottom = 0xe0925c;
      sun = 0xff9a4d; sunI = 0.3;
      hemiSky = 0x6d7ba6; hemiGround = 0x3a3226; hemiI = 0.26; amb = 0x4a4a6a, ambI = 0.12;
      fogNear = 14; fogFar = 150;
    } else if (t < 9) {    // 清晨
      top = 0x5a86c4; mid = 0x9fb7d6; bottom = 0xf0c79a;
      sun = 0xffd6a0; sunI = 0.68;
      hemiSky = 0xa9c2e2; hemiGround = 0x6b6350; hemiI = 0.36; amb = 0xffeeda, ambI = 0.2;
      fogNear = 22; fogFar = 210;
    } else if (t < 15) {   // 正午
      top = 0x3f7fd0; mid = 0x8fb6e2; bottom = 0xc9dcef;
      sun = 0xfff6e6; sunI = 0.82;
      hemiSky = 0xbcd6f2; hemiGround = 0x7d7666; hemiI = 0.5; amb = 0xfff3e4, ambI = 0.24;
      fogNear = 30; fogFar = 280;
    } else if (t < 17.2) { // 午后
      top = 0x4a86c8; mid = 0xa8c2dc; bottom = 0xf2d5ac;
      sun = 0xffe3b4; sunI = 0.78;
      hemiSky = 0xb0cbe8; hemiGround = 0x786c55; hemiI = 0.38; amb = 0xffeeda, ambI = 0.2;
      fogNear = 24; fogFar = 240;
    } else if (t < 19.2) { // 黄昏
      top = 0x2f3f74; mid = 0xbf6f6a; bottom = 0xffa45c;
      sun = 0xff7a3c; sunI = 0.5;
      hemiSky = 0x8a7a9c; hemiGround = 0x54402c; hemiI = 0.26; amb = 0xffb887, ambI = 0.16;
      fogNear = 16; fogFar = 175;
    } else if (t < 21) {   // 暮色
      top = 0x121c3c; mid = 0x2d3557; bottom = 0x6a5566;
      sun = 0x4a4260; sunI = 0.1;
      hemiSky = 0x2a3358; hemiGround = 0x14161c; hemiI = 0.2; amb = 0x2a3358, ambI = 0.09;
      fogNear = 10; fogFar = 130;
    } else {                // 夜
      top = 0x070b1e; mid = 0x0e1832; bottom = 0x1c2648;
      sun = 0x283354; sunI = 0.0;
      hemiSky = 0x1b2647; hemiGround = 0x0c0f15; hemiI = 0.21; amb = 0x141c34, ambI = 0.08;
      fogNear = 8; fogFar = 120;
    }

    var w = weather;
    if (w === 'cloudy') {
      top = mixHex(top, 0x9aa6b2, 0.62); mid = mixHex(mid, 0xb3bcc6, 0.6); bottom = mixHex(bottom, 0xc3c8cc, 0.5);
      sunI *= 0.42; hemiI *= 1.1;
      fogNear = 14; fogFar = 95;
    } else if (w === 'rain') {
      top = mixHex(top, 0x5a6472, 0.72); mid = mixHex(mid, 0x6b7683, 0.7); bottom = mixHex(bottom, 0x7b848f, 0.62);
      sunI *= 0.18; hemiI *= 0.75;
      fogNear = 6; fogFar = 62;
    } else if (w === 'snow') {
      top = mixHex(top, 0xb8c2cc, 0.68); mid = mixHex(mid, 0xcdd4da, 0.65); bottom = mixHex(bottom, 0xe4e8ea, 0.6);
      sunI *= 0.35; hemiI *= 0.95;
      fogNear = 9; fogFar = 78;
    } else if (w === 'fog') {
      top = mixHex(top, 0xa8b0b6, 0.7); mid = mixHex(mid, 0xb6bcc0, 0.72); bottom = mixHex(bottom, 0xc8ccce, 0.68);
      sunI *= 0.3; hemiI *= 0.9;
      fogNear = 4; fogFar = 34;
    }

    return {
      top: top, mid: mid, bottom: bottom, sun: sun, sunI: sunI,
      hemiSky: hemiSky, hemiGround: hemiGround, hemiI: hemiI,
      amb: amb, ambI: ambI,
      fogNear: fogNear, fogFar: fogFar
    };
  }

  function mixHex(a, b, t) {
    var ca = new THREE.Color(a), cb = new THREE.Color(b);
    ca.lerp(cb, t);
    return ca.getHex();
  }

  function paintSky(pal) {
    if (!S.skyCtx) return;
    var ctx = S.skyCtx, c = S.skyCanvas;
    var grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, '#' + ('000000' + pal.top.toString(16)).slice(-6));
    grad.addColorStop(0.55, '#' + ('000000' + pal.mid.toString(16)).slice(-6));
    grad.addColorStop(1, '#' + ('000000' + pal.bottom.toString(16)).slice(-6));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    if (S.skyTex) S.skyTex.needsUpdate = true;
  }

  /* 太阳位置：6 点东升、12 点南顶、18 点西落 */
  function sunDirection(hour) {
    var a = ((hour - 6) / 12) * Math.PI;
    var elev = Math.sin(a) * (75 * Math.PI / 180);
    if (a < 0 || a > Math.PI) elev = Math.min(elev, 0);
    var ch = Math.cos(elev);
    return new THREE.Vector3(Math.cos(a) * ch, Math.sin(elev), Math.sin(a) * ch);
  }

  function applyDaylight() {
    if (!S.scene) return;
    var pal = skyPalette(S.hour, S.weather);
    S.palette = pal;
    paintSky(pal);

    var dir = sunDirection(S.hour);
    var sunPos = dir.clone().multiplyScalar(60).add(new THREE.Vector3(0, 2, 0));
    S.sun.position.copy(sunPos);
    S.sun.target.position.set(0, 1.5, 0);
    S.sun.target.updateMatrixWorld();
    S.sun.color.setHex(pal.sun);
    S.sun.intensity = pal.sunI;
    S.sun.castShadow = pal.sunI > 0.05;

    S.hemi.color.setHex(pal.hemiSky);
    S.hemi.groundColor.setHex(pal.hemiGround);
    S.hemi.intensity = pal.hemiI;

    if (S.ambient) {
      S.ambient.color.setHex(pal.amb);
      S.ambient.intensity = pal.ambI;
    }

    var bg = new THREE.Color(pal.bottom);
    S.scene.background = bg;
    if (S.scene.fog) {
      S.scene.fog.color.copy(bg);
      S.scene.fog.near = pal.fogNear;
      S.scene.fog.far = pal.fogFar;
    }

    // 夜间窗玻璃透出室内暖光
    var glow = clamp(S.nightFactor, 0, 1) * 0.42;
    for (var gi = 0; gi < S.glassMats.length; gi++) {
      S.glassMats[gi].emissiveIntensity = glow;
    }

    if (S.stars) {
      var nightAmt = clamp((S.nightFactor - 0.15) / 0.6, 0, 1);
      S.stars.material.opacity = nightAmt * 0.9;
      S.stars.visible = nightAmt > 0.02;
    }
    if (S.clouds) S.clouds.children.forEach(function (cl) { cl.position.x += 0.06; });

    updateLampLights();
  }

  /* 室内灯：nightFactor > 0.35 自动点亮 */
  function updateLampLights() {
    var night = S.nightFactor > 0.35;
    for (var id in S.rooms) {
      var r = S.rooms[id];
      r.lampOn = !!(r.style.lamp || night);
      if (r.lampGroup) {
        // 有灯时显示吊灯装饰
        if (r.lampOn && !r.lampFixture) {
          var proto = furnitureProtoOf('pendant');
          if (proto) {
            var fix = proto.clone(true);
            // 灯具原型的灯罩在局部 y=1.3 处，整体下移使灯罩悬在吊顶下 0.7m
            fix.position.set(r.center.x, r.floorY + CEIL_H - 2.0, (r.rect[2] + r.rect[3]) / 2);
            fix.userData.itemId = null;
            r.lampGroup.add(fix);
            r.lampFixture = fix;
          }
        } else if (!r.lampOn && r.lampFixture) {
          r.lampGroup.remove(r.lampFixture);
          r.lampFixture = null;
        }
      }
    }
    assignLampPool();
  }

  /* 灯池：把有限数量的 PointLight 分配给离相机最近的、点亮的房间 */
  function assignLampPool() {
    var need = [];
    for (var id in S.rooms) {
      var r = S.rooms[id];
      if (!r.lampOn) continue;
      var d = Math.abs(r.center.x - S.camera.position.x) + Math.abs(r.center.z - S.camera.position.z) + Math.abs(r.floorY - S.player.y) * 0.5;
      need.push({ id: id, r: r, d: d });
    }
    need.sort(function (a, b) { return a.d - b.d; });
    var max = S.lampLights.length;
    for (var i = 0; i < max; i++) {
      var light = S.lampLights[i], roomId = need[i] ? need[i].id : null;
      if (S.lampRooms[i] === roomId && light) { if (roomId) light.intensity = 1.0; continue; }
      if (light) {
        if (roomId) {
          var rr = S.rooms[roomId];
          light.position.set(rr.center.x, rr.floorY + CEIL_H - 0.7, (rr.rect[2] + rr.rect[3]) / 2);
          light.intensity = 1.0;
          light.visible = true;
        } else {
          light.intensity = 0;
          light.visible = false;
        }
      }
      S.lampRooms[i] = roomId;
    }
  }

  /* 雨 / 雪粒子 */
  function buildWeatherParticles() {
    var g = S.weatherRoot;

    var rainCount = 2400, snowCount = 1400;
    var rainGeo = new THREE.BufferGeometry();
    var rp = new Float32Array(rainCount * 3);
    var rnd = seeded(2025);
    for (var i = 0; i < rainCount; i++) {
      rp[i * 3] = (rnd() - 0.5) * 70;
      rp[i * 3 + 1] = rnd() * 26;
      rp[i * 3 + 2] = (rnd() - 0.5) * 70;
    }
    rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
    var rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xa8c4dd, size: 0.09, transparent: true, opacity: 0.72, depthWrite: false }));
    rain.visible = false;
    rain.frustumCulled = false;
    g.add(rain);
    S.rain = rain;

    var snowGeo = new THREE.BufferGeometry();
    var sp = new Float32Array(snowCount * 3);
    for (var j = 0; j < snowCount; j++) {
      sp[j * 3] = (rnd() - 0.5) * 70;
      sp[j * 3 + 1] = rnd() * 26;
      sp[j * 3 + 2] = (rnd() - 0.5) * 70;
    }
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    var snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false }));
    snow.visible = false;
    snow.frustumCulled = false;
    g.add(snow);
    S.snow = snow;
  }

  function updateWeatherParticles(dt) {
    if (S.rain && S.rain.visible) {
      var p = S.rain.geometry.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var y = p.getY(i) - dt * 22;
        if (y < -1) { y += 27; }
        p.setY(i, y);
      }
      p.needsUpdate = true;
    }
    if (S.snow && S.snow.visible) {
      var q = S.snow.geometry.attributes.position;
      for (var j = 0; j < q.count; j++) {
        var sy = q.getY(j) - dt * 1.5;
        if (sy < -1) sy += 27;
        q.setY(j, sy);
        q.setX(j, q.getX(j) + Math.sin(now() * 0.0006 + j) * dt * 0.35);
      }
      q.needsUpdate = true;
    }
  }

  /* ==============================================================
   * 12. 贴纸
   * ============================================================== */

  function stickerMaterial(map) {
    return new THREE.MeshBasicMaterial({
      map: map || null,
      color: map ? 0xffffff : 0xdddddd,
      transparent: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: true
    });
  }

  function stickerPlane(w, h) {
    return new THREE.PlaneGeometry(w, h);
  }

  function placeSticker(opts) {
    if (!S.stickerRoot) return null;
    var o = opts || {};
    var id = nextId('st');
    var size = o.size === undefined ? 0.5 : o.size;
    var w, h;
    if (typeof size === 'object' && size !== null) {
      w = size.w || size.width || 0.5;
      h = size.h || size.height || 0.5;
    } else {
      h = size;
      w = size;
    }
    var mat = stickerMaterial(null);
    var mesh = new THREE.Mesh(stickerPlane(w, h), mat);
    mesh.renderOrder = 3;
    mesh.userData.stickerId = id;
    mesh.userData.surface = 'sticker';

    var pos = o.position || { x: 0, y: 1.5, z: 0 };
    var nrm = o.normal || { x: 0, y: 0, z: 1 };
    var rotation = o.rotation === undefined ? 0 : o.rotation;

    var sticker = {
      id: id,
      name: o.name || '贴纸',
      assetPath: o.assetPath || '',
      targetType: o.targetType || 'wall',
      itemId: o.itemId || null,
      roomId: o.roomId || null,
      size: size,
      rotation: rotation,
      mesh: mesh,
      material: mat,
      texture: null,
      aspect: 1,
      worldPos: new THREE.Vector3(pos.x, pos.y, pos.z),
      worldNormal: new THREE.Vector3(nrm.x, nrm.y, nrm.z),
      parent: null
    };

    // 贴到家具上：作为家具子对象，随家具移动
    if (o.targetType === 'furniture' && o.itemId && S.furniture[o.itemId]) {
      var fg = S.furniture[o.itemId].group;
      sticker.parent = fg;
      fg.add(mesh);
      fg.updateMatrixWorld(true);
      applyStickerTransform(sticker, true);
    } else {
      S.stickerRoot.add(mesh);
      applyStickerTransform(sticker, false);
    }

    // 贴图异步加载，按真实长宽比自适应尺寸
    if (sticker.assetPath) {
      loadStickerTexture(sticker);
    }

    S.stickers[id] = sticker;
    emit('change', { action: 'sticker-add', id: id });
    return id;
  }

  function loadStickerTexture(sticker) {
    var loader = new THREE.TextureLoader();
    loader.load(
      sticker.assetPath,
      function (tex) {
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        sticker.texture = tex;
        sticker.material.map = tex;
        sticker.material.color.setHex(0xffffff);
        sticker.material.needsUpdate = true;
        if (tex.image) {
          var iw = tex.image.width || 1, ih = tex.image.height || 1;
          sticker.aspect = iw / ih;
          resizeSticker(sticker);
        }
      },
      undefined,
      function () {
        emit('log', { type: 'warn', message: '贴纸贴图加载失败：' + sticker.assetPath });
      }
    );
  }

  function resizeSticker(sticker) {
    var size = sticker.size;
    var w, h;
    if (typeof size === 'object' && size !== null) {
      w = size.w || size.width || 0.5;
      h = size.h || size.height || 0.5;
    } else {
      h = size;
      w = size * sticker.aspect;
    }
    sticker.mesh.geometry = stickerPlane(w, h);
    sticker.worldW = w; sticker.worldH = h;
  }

  /* 让贴纸平面贴合表面法线，并沿法线外推避免 z-fighting */
  function applyStickerTransform(sticker, local) {
    var mesh = sticker.mesh;
    var wn = sticker.worldNormal.clone().normalize();
    // 沿法线外推 0.012m，避免与表面 z-fighting（墙 / 地 / 顶 / 家具统一处理）
    var wp = sticker.worldPos.clone().add(wn.clone().multiplyScalar(0.012));
    if (local && sticker.parent) {
      // 作为家具子对象：先把外推后的世界坐标换算到家具局部坐标，
      // 这样家具被旋转 / 缩放 / 移动时，贴纸会正确跟随。
      sticker.parent.updateMatrixWorld(true);
      var inv = new THREE.Matrix4().copy(sticker.parent.matrixWorld).invert();
      mesh.position.copy(wp.clone().applyMatrix4(inv));
      sticker.parent.updateMatrixWorld(true);
    } else {
      mesh.position.copy(wp);
    }
    mesh.lookAt(wp.clone().add(wn));   // 平面 +Z 对齐表面法线
    mesh.rotateZ(sticker.rotation);    // 绕法线随机旋转
  }

  function removeSticker(id) {
    var st = S.stickers[id];
    if (!st) return false;
    if (st.parent) st.parent.remove(st.mesh);
    else S.stickerRoot.remove(st.mesh);
    st.mesh.geometry.dispose();
    if (st.texture) st.texture.dispose();
    st.material.dispose();
    delete S.stickers[id];
    if (S.selectedStickerId === id) S.selectedStickerId = null;
    emit('change', { action: 'sticker-remove', id: id });
    return true;
  }

  function updateSticker(id, patch) {
    var st = S.stickers[id];
    if (!st) return false;
    var p = patch || {};
    if (p.position) {
      st.worldPos.set(p.position.x, p.position.y, p.position.z);
    }
    if (p.normal) {
      st.worldNormal.set(p.normal.x, p.normal.y, p.normal.z);
    }
    if (p.rotation !== undefined) st.rotation = p.rotation;
    if (p.size !== undefined) {
      st.size = p.size;
      resizeSticker(st);
    }
    if (p.name !== undefined) st.name = p.name;
    applyStickerTransform(st, !!(st.parent));
    emit('change', { action: 'sticker-update', id: id });
    return true;
  }

  function selectSticker(id) {
    S.selectedStickerId = S.stickers[id] ? id : null;
    if (S.selectedStickerId) S.selectedFurnitureId = null;
    refreshSelectionHelper();
    emit('change', { action: 'select-sticker', id: S.selectedStickerId });
    return S.selectedStickerId;
  }

  function getSelectedSticker() {
    return S.selectedStickerId ? S.stickers[S.selectedStickerId] : null;
  }

  /* ==============================================================
   * 13. 拾取
   * ============================================================== */

  function objectVisible(obj) {
    var o = obj;
    while (o) {
      if (o.visible === false) return false;
      o = o.parent;
    }
    return true;
  }

  function rootItemId(obj) {
    var o = obj;
    while (o) {
      if (o.userData && o.userData.itemId) return o.userData.itemId;
      o = o.parent;
    }
    return null;
  }

  function pickTarget() {
    if (!S.raycaster || !S.camera) return null;
    return pickTargetAt(new THREE.Vector2(S.pointer.x, S.pointer.y));
  }

  function pickTargetAt(ndc) {
    if (!S.raycaster || !S.camera) return null;
    S.raycaster.setFromCamera(ndc, S.camera);
    var roots = [S.wallRoot, S.floorRoot, S.ceilingRoot, S.furnitureRoot, S.stickerRoot];
    var hits = S.raycaster.intersectObjects(roots, true);
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if (!objectVisible(h.object)) continue;
      if (h.object.userData && h.object.userData.stickerId) {
        var st = S.stickers[h.object.userData.stickerId];
        if (!st) continue;
        return {
          kind: 'surface',
          targetType: st.targetType,
          itemId: st.itemId,
          stickerId: st.id,
          roomId: st.roomId,
          position: { x: h.point.x, y: h.point.y, z: h.point.z },
          normal: faceNormal(h),
          distance: h.distance
        };
      }
      var itemId = rootItemId(h.object);
      if (itemId && S.furniture[itemId]) {
        var f = S.furniture[itemId];
        return {
          kind: 'furniture',
          targetType: 'furniture',
          itemId: itemId,
          roomId: f.roomId,
          surface: 'furniture',
          position: { x: h.point.x, y: h.point.y, z: h.point.z },
          normal: faceNormal(h),
          distance: h.distance
        };
      }
      var surface = (h.object.userData && h.object.userData.surface) || 'wall';
      return {
        kind: 'surface',
        targetType: surface,
        surface: surface,
        itemId: (h.object.userData && h.object.userData.itemId) || null,
        roomId: (h.object.userData && h.object.userData.roomId) || null,
        wallId: (h.object.userData && h.object.userData.wallId) || null,
        position: { x: h.point.x, y: h.point.y, z: h.point.z },
        normal: faceNormal(h),
        distance: h.distance
      };
    }
    return null;
  }

  function faceNormal(hit) {
    var n = new THREE.Vector3(0, 1, 0);
    if (hit.face) {
      n = hit.face.normal.clone();
      var nm = new THREE.Matrix3();
      nm.getNormalMatrix(hit.object.matrixWorld);
      n.applyMatrix3(nm).normalize();
    }
    return { x: n.x, y: n.y, z: n.z };
  }

  /* ==============================================================
   * 14. 家具 API
   * ============================================================== */

  function addFurniture(roomId, type, name, opts) {
    if (!S.rooms[roomId]) return null;
    var proto = furnitureProtoOf(type);
    if (!proto) {
      emit('log', { type: 'warn', message: '未知家具类型：' + type });
      return null;
    }
    var o = opts || {};
    var id = nextId('f');
    var g = proto.clone(true);
    g.name = 'furn_' + id;
    g.userData.itemId = id;
    g.userData.surface = 'furniture';
    g.userData.roomId = roomId;
    g.userData.type = type;

    var room = S.rooms[roomId];
    var x = isNum(o.x) ? o.x : room.center.x;
    var z = isNum(o.z) ? o.z : room.center.z;
    var rot = isNum(o.rotation) ? o.rotation : 0;
    var sc = isNum(o.scale) ? o.scale : 1;
    g.position.set(x, room.floorY, z);
    g.rotation.y = rot;
    g.scale.setScalar(sc);

    S.furnitureRoot.add(g);
    S.furniture[id] = {
      id: id, roomId: roomId, type: type,
      name: name || FURNITURE_NAMES[type] || type,
      group: g, x: x, z: z, rotation: rot, scale: sc
    };
    refreshFurnitureCollider(id);
    emit('change', { action: 'furniture-add', id: id, roomId: roomId, type: type });
    return id;
  }

  function removeFurniture(id) {
    var f = S.furniture[id];
    if (!f) return false;
    S.furnitureRoot.remove(f.group);
    removeFurnitureCollider(id);
    delete S.furniture[id];
    if (S.selectedFurnitureId === id) S.selectedFurnitureId = null;
    refreshSelectionHelper();
    emit('change', { action: 'furniture-remove', id: id });
    return true;
  }

  function updateFurniture(id, patch) {
    var f = S.furniture[id];
    if (!f) return false;
    var p = patch || {};
    if (isNum(p.x)) { f.x = p.x; f.group.position.x = p.x; }
    if (isNum(p.z)) { f.z = p.z; f.group.position.z = p.z; }
    if (isNum(p.rotation)) { f.rotation = p.rotation; f.group.rotation.y = p.rotation; }
    if (isNum(p.scale)) {
      f.scale = p.scale;
      f.group.scale.setScalar(p.scale);
    }
    if (p.name !== undefined) f.name = p.name;
    refreshFurnitureCollider(id);
    emit('change', { action: 'furniture-update', id: id });
    return true;
  }

  function selectFurniture(id) {
    S.selectedFurnitureId = S.furniture[id] ? id : null;
    if (S.selectedFurnitureId) S.selectedStickerId = null;
    refreshSelectionHelper();
    emit('change', { action: 'select-furniture', id: S.selectedFurnitureId });
    return S.selectedFurnitureId;
  }

  function getSelectedFurniture() {
    return S.selectedFurnitureId ? S.furniture[S.selectedFurnitureId] : null;
  }

  function getFurniture(roomId) {
    var out = [];
    for (var id in S.furniture) {
      if (!roomId || S.furniture[id].roomId === roomId) out.push(S.furniture[id]);
    }
    return out;
  }

  /* 家具碰撞盒 */
  function refreshFurnitureCollider(id) {
    var f = S.furniture[id];
    if (!f) return;
    removeFurnitureCollider(id);
    if (NO_COLLIDE[f.type]) return;
    var box = new THREE.Box3().setFromObject(f.group);
    if (!isFinite(box.min.x) || !isFinite(box.max.x)) return;
    var minY = box.min.y, maxY = box.max.y;
    if (maxY - minY < 0.08) return;
    var c = {
      minX: box.min.x - 0.01, maxX: box.max.x + 0.01,
      minZ: box.min.z - 0.01, maxZ: box.max.z + 0.01,
      minY: minY, maxY: maxY
    };
    f.collider = c;
    S.colliders.push(c);
  }

  function removeFurnitureCollider(id) {
    var f = S.furniture[id];
    if (!f || !f.collider) return;
    var i = S.colliders.indexOf(f.collider);
    if (i >= 0) S.colliders.splice(i, 1);
    f.collider = null;
  }

  /* 选中高亮框 */
  function refreshSelectionHelper() {
    if (!S.helperRoot) return;
    var target = null;
    if (S.selectedFurnitureId && S.furniture[S.selectedFurnitureId]) target = S.furniture[S.selectedFurnitureId].group;
    else if (S.selectedStickerId && S.stickers[S.selectedStickerId]) target = S.stickers[S.selectedStickerId].mesh;
    if (!target) {
      if (S.selHelper) { S.helperRoot.remove(S.selHelper); S.selHelper.geometry.dispose(); S.selHelper = null; }
      return;
    }
    if (!S.selHelper) {
      S.selHelper = new THREE.BoxHelper(target, 0xe59d43);
      S.selHelper.material.depthTest = false;
      S.selHelper.material.transparent = true;
      S.selHelper.renderOrder = 999;
      S.helperRoot.add(S.selHelper);
    } else {
      S.selHelper.setFromObject(target);
    }
    S.selHelper.update();
  }

  /* ==============================================================
   * 15. 墙体拆建
   * ============================================================== */

  function isExterior(def) {
    return def.kind === 'exterior' || (def.id && def.id.indexOf('_ext') > 0);
  }

  /* 把内部墙体状态同步到对外的 VILLA.walls 元数据 */
  function syncWallMeta() {
    var list = [];
    for (var wid in S.walls) {
      var st = S.walls[wid];
      list.push({
        id: wid, floor: st.def.floor, kind: st.def.kind,
        rooms: st.def.rooms, demolished: !!st.demolished,
        thickness: WALL_T, height: FLOOR_H
      });
    }
    VILLA.walls = list;
  }

  function demolishWall(wallId) {
    var st = S.walls[wallId];
    if (!st) return false;
    if (isExterior(st.def)) {
      emit('log', { type: 'warn', message: '外墙不可拆除：' + wallId });
      return false;
    }
    if (st.demolished) return false;
    st.demolished = true;
    setWallVisible(st, false);
    // 移除碰撞
    if (st.colliders) {
      for (var i = 0; i < st.colliders.length; i++) {
        var idx = S.colliders.indexOf(st.colliders[i]);
        if (idx >= 0) S.colliders.splice(idx, 1);
      }
      st.colliders = null;
    }
    syncWallMeta();
    emit('change', { action: 'wall-demolish', id: wallId });
    emit('log', { type: 'info', message: '已拆除墙体：' + wallId });
    return true;
  }

  function constructWall(wallId) {
    var st = S.walls[wallId];
    if (!st) {
      // 新建隔墙
      var cat = null;
      for (var i = 0; i < BUILD_CATALOG.length; i++) {
        if (BUILD_CATALOG[i].id === wallId) { cat = BUILD_CATALOG[i]; break; }
      }
      if (!cat) {
        emit('log', { type: 'warn', message: '未知墙位：' + wallId });
        return false;
      }
      var def = {
        id: cat.id, floor: cat.floor, kind: cat.kind, axis: cat.axis,
        coord: cat.coord, from: cat.from, to: cat.to,
        rooms: cat.rooms.slice(0), openings: cat.openings.map(function (o) { return { type: o.type, a: o.a, b: o.b, sill: o.sill, top: o.top }; }),
        thickness: WALL_T, height: FLOOR_H
      };
      S.walls[def.id] = { def: def, groups: {}, demolished: false, built: true };
      buildWall(def);
      syncWallMeta();
      emit('change', { action: 'wall-construct', id: wallId });
      emit('log', { type: 'info', message: '已新建墙体：' + cat.name });
      return true;
    }
    if (!st.demolished && st.built) return false;
    st.demolished = false;
    if (!st.built) {
      buildWall(st.def);
    } else {
      setWallVisible(st, true);
      if (!st.colliders) {
        var segs = wallSegments(st.def);
        st.colliders = [];
        for (var j = 0; j < segs.length; j++) {
          var b = wallSegBox(st.def, segs[j]);
          st.colliders.push({
            minX: b.x - b.w / 2, maxX: b.x + b.w / 2,
            minZ: b.z - b.d / 2, maxZ: b.z + b.d / 2,
            minY: b.y - b.h / 2, maxY: b.y + b.h / 2
          });
        }
        S.colliders = S.colliders.concat(st.colliders);
      }
    }
    syncWallMeta();
    emit('change', { action: 'wall-construct', id: wallId });
    emit('log', { type: 'info', message: '已恢复墙体：' + st.def.id });
    return true;
  }

  function canConstruct(wallId) {
    var st = S.walls[wallId];
    if (!st) {
      for (var i = 0; i < BUILD_CATALOG.length; i++) if (BUILD_CATALOG[i].id === wallId) return true;
      return false;
    }
    return st.demolished || !st.built;
  }

  /* ==============================================================
   * 16. 房间样式
   * ============================================================== */

  var FLOOR_STYLE = {
    cement: { color: 0xa8a49c, map: 'cement', rough: 0.9 },
    wood:   { color: 0xffffff, map: 'woodL', rough: 0.72 },
    dark:   { color: 0xffffff, map: 'woodD', rough: 0.68 },
    tile:   { color: 0xffffff, map: 'tile', rough: 0.55 }
  };

  function makeRoomMaterials(room) {
    if (!room.wallMaterial) {
      room.wallMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(room.style.wall), roughness: 0.92, metalness: 0 });
    }
    if (!room.floorMaterial) {
      room.floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
    }
  }

  function applyFloorStyle(room) {
    var st = FLOOR_STYLE[room.style.floor] || FLOOR_STYLE.cement;
    var map = null;
    if (st.map === 'cement') map = texCement();
    else if (st.map === 'tile') map = texTile();
    else if (st.map === 'woodL') map = texWood(false);
    else if (st.map === 'woodD') map = texWood(true);
    room.floorMaterial.map = map;
    room.floorMaterial.color.setHex(st.color);
    room.floorMaterial.roughness = st.rough;
    room.floorMaterial.needsUpdate = true;
  }

  function setRoomStyle(roomId, style) {
    var room = S.rooms[roomId];
    if (!room) return false;
    var s = style || {};
    if (s.wall !== undefined && s.wall !== null) room.style.wall = s.wall;
    if (s.floor !== undefined && s.floor !== null) room.style.floor = s.floor;
    if (s.lamp !== undefined && s.lamp !== null) room.style.lamp = !!s.lamp;
    makeRoomMaterials(room);
    if (room.wallMaterial) room.wallMaterial.color.set(new THREE.Color(room.style.wall));
    applyFloorStyle(room);
    updateLampLights();
    emit('change', { action: 'room-style', roomId: roomId });
    return true;
  }

  function getRoomStyle(roomId) {
    var room = S.rooms[roomId];
    if (!room) return null;
    return { wall: room.style.wall, floor: room.style.floor, lamp: room.style.lamp };
  }

  /* ==============================================================
   * 17. 玩家与相机
   * ============================================================== */

  /* 把玩家放到指定位置，并立即贴合当前支撑面（地面或楼梯） */
  function teleportPlayer(x, z, floor) {
    S.player.x = x;
    S.player.z = z;
    S.player.floor = floor;
    S.player.y = supportHeight(x, z);
    var r = roomAt(x, z, floor);
    S.lastRoomId = r ? r.id : null;
  }

  function supportHeight(x, z) {
    if (x > STAIR_X0 && x < STAIR_X1 && z >= STAIR_Z_TOP && z <= STAIR_Z_BOT) {
      return FLOOR_H * (STAIR_Z_BOT - z) / (STAIR_Z_BOT - STAIR_Z_TOP);
    }
    return S.player.floor === 1 ? FLOOR_H : 0;
  }

  function updatePlayer(dt) {
    var ax = S.moveAxis.x, az = S.moveAxis.y;
    if (S.keys['a'] || S.keys['arrowleft']) ax -= 1;
    if (S.keys['d'] || S.keys['arrowright']) ax += 1;
    if (S.keys['w'] || S.keys['arrowup']) az += 1;
    if (S.keys['s'] || S.keys['arrowdown']) az -= 1;
    ax = clamp(ax, -1, 1); az = clamp(az, -1, 1);
    if (ax === 0 && az === 0) return;

    var speed = (S.keys['shift'] ? RUN_SPEED : WALK_SPEED);
    var len = Math.sqrt(ax * ax + az * az);
    if (len > 1) { ax /= len; az /= len; }

    var sin = Math.sin(S.yaw), cos = Math.cos(S.yaw);
    // 前方 = (-sin, -cos)（yaw=0 时朝 -z）
    var dx = (ax * cos - az * sin) * speed * dt;
    var dz = (-ax * sin - az * cos) * speed * dt;

    var nx = S.player.x + dx, nz = S.player.z + dz;
    var res = resolveCollisions(nx, nz, S.player.y);
    S.player.x = res.x; S.player.z = res.z;

    // 楼层与高度
    var onStair = S.player.x > STAIR_X0 && S.player.x < STAIR_X1 && S.player.z >= STAIR_Z_TOP && S.player.z <= STAIR_Z_BOT;
    if (onStair) {
      var h = supportHeight(S.player.x, S.player.z);
      S.player.y = h;
      var nf = h > FLOOR_H / 2 ? 1 : 0;
      if (nf !== S.player.floor) {
        S.player.floor = nf;
        emit('floorchange', { floor: nf });
      }
    } else {
      var ty = supportHeight(S.player.x, S.player.z);
      S.player.y += (ty - S.player.y) * Math.min(1, dt * 14);
      if (Math.abs(ty - S.player.y) < 0.01) S.player.y = ty;
    }

    // 进入新房间时广播，方便外部把「当前装修房间」切到脚下这一间
    var nowRoom = roomAt(S.player.x, S.player.z, S.player.floor);
    var nowRoomId = nowRoom ? nowRoom.id : null;
    if (nowRoomId !== S.lastRoomId) {
      S.lastRoomId = nowRoomId;
      emit('playerroom', { roomId: nowRoomId, floor: S.player.floor });
    }
  }

  function updateCamera() {
    if (!S.camera) return;
    if (S.mode === 'walk') {
      S.camera.position.set(S.player.x, S.player.y + EYE_H, S.player.z);
      S.camera.rotation.set(0, 0, 0);
      S.camera.rotateY(S.yaw);
      S.camera.rotateX(S.pitch);
    } else {
      var o = S.orbit;
      var ce = Math.cos(o.el), se = Math.sin(o.el);
      S.camera.position.set(
        o.target.x + Math.sin(o.az) * ce * o.dist,
        o.target.y + se * o.dist,
        o.target.z + Math.cos(o.az) * ce * o.dist
      );
      S.camera.lookAt(o.target);
    }
  }

  /* ==============================================================
   * 18. 输入
   * ============================================================== */

  function isTypingTarget(target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    return !!target.isContentEditable;
  }

  function onKeyDown(e) {
    if (!S.enabled) return;
    // 正在输入框里打字时，绝不抢占按键
    if (isTypingTarget(e.target)) return;
    var k = (e.key || '').toLowerCase();
    S.keys[k] = true;
    if (k === 'shift') S.keys['shift'] = true;
    if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === ' ') {
      if (S.mode === 'walk') e.preventDefault();
    }
  }
  function onKeyUp(e) {
    var k = (e.key || '').toLowerCase();
    S.keys[k] = false;
  }
  function onPointerDown(e) {
    if (S.mode === 'walk' && !S.pointerLocked) {
      // 触屏 / 鼠标拖动视角
      S.dragging = true;
      S.lastX = e.clientX; S.lastY = e.clientY;
    }
  }

  /* 指针锁定时，把准星位置（画面中心）写入 pointer，供拾取使用 */
  function syncLockedPointer() {
    if (!S.pointerLocked) return;
    S.pointer.x = 0; S.pointer.y = 0; S.pointer.inside = true;
  }
  function onPointerUp() { S.dragging = false; }
  function onPointerMove(e) {
    if (!S.canvas) return;
    var rect = S.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // 指针锁定状态下浏览器不再提供真实鼠标位置，准星固定在画面中心
    if (S.pointerLocked) {
      S.pointer.x = 0; S.pointer.y = 0;
      S.pointer.inside = true;
      return;
    }
    S.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    S.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    S.pointer.inside = true;
    if (S.dragging && !S.pointerLocked) {
      lookBy(e.clientX - S.lastX, e.clientY - S.lastY);
      S.lastX = e.clientX; S.lastY = e.clientY;
    }
  }
  function onPointerLockChange() {
    S.pointerLocked = (document.pointerLockElement === S.canvas);
    syncLockedPointer();
    emit('change', { action: 'pointerlock', locked: S.pointerLocked });
  }
  function onWheel(e) {
    if (S.mode !== 'edit') return;
    e.preventDefault();
    S.orbit.dist = clamp(S.orbit.dist + (e.deltaY > 0 ? 3 : -3), 14, 90);
  }
  function onMouseMoveLocked(e) {
    if (!S.pointerLocked) return;
    lookBy(e.movementX || 0, e.movementY || 0);
  }

  function bindDom() {
    var c = S.canvas;
    if (!c) return;
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMoveLocked);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    c.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    c.addEventListener('pointermove', onPointerMove);
    c.addEventListener('wheel', onWheel, { passive: false });
    c.addEventListener('click', function () {
      if (S.mode === 'walk' && !S.pointerLocked) requestPointerLock();
    });
    S.domHandlers = [document, document, document, document, c, window, c, c];
  }

  function unbindDom() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('mousemove', onMouseMoveLocked);
    document.removeEventListener('pointerlockchange', onPointerLockChange);
    if (S.canvas) {
      S.canvas.removeEventListener('pointerdown', onPointerDown);
      S.canvas.removeEventListener('pointermove', onPointerMove);
      S.canvas.removeEventListener('wheel', onWheel);
    }
    window.removeEventListener('pointerup', onPointerUp);
  }

  function requestPointerLock() {
    if (!S.canvas) return;
    if (S.canvas.requestPointerLock) {
      try { S.canvas.requestPointerLock(); } catch (e) { /* 部分 WebView 不支持 */ }
    }
  }
  function releasePointerLock() {
    if (document.exitPointerLock) {
      try { document.exitPointerLock(); } catch (e) { }
    }
  }

  function setMoveAxis(x, y) {
    S.moveAxis.x = clamp(isNum(x) ? x : 0, -1, 1);
    S.moveAxis.y = clamp(isNum(y) ? y : 0, -1, 1);
  }

  function lookBy(dx, dy) {
    if (!isNum(dx) || !isNum(dy)) return;
    if (S.mode === 'walk') {
      S.yaw -= dx * LOOK_SENS;
      S.pitch = clamp(S.pitch - dy * LOOK_SENS, -1.45, 1.45);
    } else {
      S.orbit.az -= dx * 0.005;
      S.orbit.el = clamp(S.orbit.el + dy * 0.004, 0.15, 1.45);
    }
  }

  /* ==============================================================
   * 19. 渲染循环
   * ============================================================== */

  var lastTime = 0;
  var pickTimer = 0;

  function loop() {
    if (S.disposed) return;
    S.raf = requestAnimationFrame(loop);
    if (!S.enabled) { lastTime = now(); return; }
    var t = now();
    var dt = Math.min(0.05, (t - lastTime) / 1000) || 0.016;
    lastTime = t;

    if (S.mode === 'walk') updatePlayer(dt);
    updateCamera();
    updateWeatherParticles(dt);

    // 拾取事件（节流）
    pickTimer += dt;
    if (pickTimer > 0.12) {
      pickTimer = 0;
      var p = pickTarget();
      var key = p ? (p.kind + '|' + (p.itemId || '') + '|' + (p.stickerId || '') + '|' + (p.targetType || '')) : 'none';
      if (key !== S.lastPickKey) {
        S.lastPickKey = key;
        S.lastPick = p;
        emit('pick', p);
      } else {
        S.lastPick = p;
      }
      if (S.selHelper) S.selHelper.update();
      assignLampPool();
    }

    S.renderer.render(S.scene, S.camera);
  }

  function onResize() {
    if (!S.renderer || !S.camera) return;
    var c = S.canvas;
    var w = c.clientWidth || c.width || 800;
    var h = c.clientHeight || c.height || 600;
    S.renderer.setSize(w, h, false);
    S.camera.aspect = w / Math.max(1, h);
    S.camera.updateProjectionMatrix();
  }

  /* ==============================================================
   * 20. 事件
   * ============================================================== */

  function on(evt, fn) {
    if (!evt || typeof fn !== 'function') return;
    if (!S.listeners[evt]) S.listeners[evt] = [];
    S.listeners[evt].push(fn);
  }

  function emit(evt, payload) {
    var arr = S.listeners[evt];
    if (!arr) return;
    for (var i = 0; i < arr.length; i++) {
      try { arr[i](payload); } catch (e) {
        if (global.console && console.error) console.error('[Villa] 事件处理异常：' + evt, e);
      }
    }
  }

  /* ==============================================================
   * 21. 持久化
   * ============================================================== */

  function serialize() {
    var rooms = [];
    for (var id in S.rooms) {
      var r = S.rooms[id];
      rooms.push({ id: id, style: { wall: r.style.wall, floor: r.style.floor, lamp: r.style.lamp } });
    }
    var demolished = [], built = [];
    for (var wid in S.walls) {
      var st = S.walls[wid];
      if (st.demolished) demolished.push(wid);
      if (wid.indexOf('new:') === 0 && st.built) built.push(wid);
    }
    var furniture = [];
    for (var fid in S.furniture) {
      var f = S.furniture[fid];
      furniture.push({
        id: fid, roomId: f.roomId, type: f.type, name: f.name,
        x: f.x, z: f.z, rotation: f.rotation, scale: f.scale
      });
    }
    var stickers = [];
    for (var sid in S.stickers) {
      var st2 = S.stickers[sid];
      stickers.push({
        id: sid, assetPath: st2.assetPath, name: st2.name,
        targetType: st2.targetType, itemId: st2.itemId, roomId: st2.roomId,
        size: st2.size, rotation: st2.rotation,
        position: { x: st2.worldPos.x, y: st2.worldPos.y, z: st2.worldPos.z },
        normal: { x: st2.worldNormal.x, y: st2.worldNormal.y, z: st2.worldNormal.z }
      });
    }
    return {
      version: VERSION,
      mode: S.mode,
      activeRoomId: S.activeRoomId,
      hour: S.hour,
      nightFactor: S.nightFactor,
      weather: S.weather,
      rooms: rooms,
      walls: { demolished: demolished, built: built },
      demolished: demolished,
      built: built,
      furniture: furniture,
      stickers: stickers
    };
  }

  function restore(data) {
    if (!data) return;
    if (data.rooms) {
      for (var i = 0; i < data.rooms.length; i++) {
        var rd = data.rooms[i];
        if (S.rooms[rd.id]) setRoomStyle(rd.id, rd.style || {});
      }
    }
    // 先拆掉要拆的墙
    var demolished = data.demolished || (data.walls && data.walls.demolished) || [];
    for (var d = 0; d < demolished.length; d++) {
      if (S.walls[demolished[d]]) demolishWall(demolished[d]);
    }
    // 再建新墙
    var built = data.built || (data.walls && data.walls.built) || [];
    for (var b = 0; b < built.length; b++) constructWall(built[b]);
    // 家具
    if (data.furniture) {
      for (var f = 0; f < data.furniture.length; f++) {
        var fd = data.furniture[f];
        addFurniture(fd.roomId, fd.type, fd.name, { x: fd.x, z: fd.z, rotation: fd.rotation, scale: fd.scale });
      }
    }
    // 贴纸
    if (data.stickers) {
      for (var s = 0; s < data.stickers.length; s++) {
        var sd = data.stickers[s];
        placeSticker({
          assetPath: sd.assetPath, name: sd.name, position: sd.position, normal: sd.normal,
          size: sd.size, rotation: sd.rotation, roomId: sd.roomId,
          targetType: sd.targetType, itemId: sd.itemId
        });
      }
    }
    if (data.activeRoomId && S.rooms[data.activeRoomId]) S.activeRoomId = data.activeRoomId;
    if (isNum(data.hour)) S.hour = data.hour;
    if (isNum(data.nightFactor)) S.nightFactor = data.nightFactor;
    if (data.weather) S.weather = data.weather;
    applyDaylight();
  }

  /* ==============================================================
   * 22. 对外 API
   * ============================================================== */

  var VILLA = {
    version: VERSION,
    ready: false,
    mode: 'edit',
    rooms: [],
    activeRoomId: 'living',
    walls: [],
    buildCatalog: [],

    /* 初始化（异步） */
    init: function (canvas, savedData) {
      var self = this;
      return new Promise(function (resolve, reject) {
        try {
          THREE = global.THREE;
          if (!THREE) throw new Error('Three.js 尚未加载完成');
          S.canvas = canvas;
          S.orbit.target = new THREE.Vector3(0, 2.4, 0);
          S.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
          S.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          S.renderer.setSize(canvas.clientWidth || 960, canvas.clientHeight || 600, false);
          S.renderer.shadowMap.enabled = true;
          S.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          S.renderer.outputEncoding = THREE.sRGBEncoding;
          S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
          S.renderer.toneMappingExposure = 0.82;

          S.scene = new THREE.Scene();
          S.scene.fog = new THREE.Fog(0xcdd6e0, 30, 280);

          S.camera = new THREE.PerspectiveCamera(48, 1, 0.08, 900);
          S.raycaster = new THREE.Raycaster();

          S.houseRoot = new THREE.Group(); S.houseRoot.name = 'house';
          S.wallRoot = new THREE.Group(); S.wallRoot.name = 'walls';
          S.floorRoot = new THREE.Group(); S.floorRoot.name = 'floors';
          S.ceilingRoot = new THREE.Group(); S.ceilingRoot.name = 'ceilings';
          S.furnitureRoot = new THREE.Group(); S.furnitureRoot.name = 'furniture';
          S.stickerRoot = new THREE.Group(); S.stickerRoot.name = 'stickers';
          S.lampRoot = new THREE.Group(); S.lampRoot.name = 'lamps';
          S.outdoorRoot = new THREE.Group(); S.outdoorRoot.name = 'outdoor';
          S.weatherRoot = new THREE.Group(); S.weatherRoot.name = 'weather';
          S.helperRoot = new THREE.Group(); S.helperRoot.name = 'helpers';

          S.scene.add(S.outdoorRoot, S.houseRoot, S.floorRoot, S.ceilingRoot, S.wallRoot,
            S.furnitureRoot, S.stickerRoot, S.lampRoot, S.weatherRoot, S.helperRoot);

          buildRooms();
          for (var id in S.rooms) {
            makeRoomMaterials(S.rooms[id]);
            applyFloorStyle(S.rooms[id]);
          }

          /* 灯光 */
          S.sun = new THREE.DirectionalLight(0xfff6e6, 2.0);
          S.sun.castShadow = true;
          S.sun.shadow.mapSize.set(2048, 2048);
          S.sun.shadow.camera.left = -26;
          S.sun.shadow.camera.right = 26;
          S.sun.shadow.camera.top = 26;
          S.sun.shadow.camera.bottom = -26;
          S.sun.shadow.camera.near = 1;
          S.sun.shadow.camera.far = 160;
          S.sun.shadow.bias = -0.0006;
          S.sun.shadow.normalBias = 0.02;
          S.scene.add(S.sun);
          S.scene.add(S.sun.target);

          S.hemi = new THREE.HemisphereLight(0xbcd6f2, 0x7d7666, 0.6);
          S.scene.add(S.hemi);

          /* 暖色环境补光：让室内墙面在白天也有温度 */
          S.ambient = new THREE.AmbientLight(0xfff3e4, 0.24);
          S.scene.add(S.ambient);

          /* 室内灯池（8 盏） */
          for (var i = 0; i < 8; i++) {
            var pl = new THREE.PointLight(0xffc27a, 0, 15, 1.2);
            pl.visible = false;
            S.scene.add(pl);
            S.lampLights.push(pl);
            S.lampRooms.push(null);
          }

          buildSky();
          buildOutdoor();
          buildWeatherParticles();
          buildHouse();

          /* 对外元数据 */
          VILLA.rooms = [];
          for (var rid in S.rooms) {
            var rr = S.rooms[rid];
            VILLA.rooms.push({
              id: rr.id, name: rr.name, floor: rr.floor,
              rect: rr.rect, zones: rr.zones, center: rr.center,
              area: rr.area, floorY: rr.floorY,
              style: { wall: rr.style.wall, floor: rr.style.floor, lamp: rr.style.lamp }
            });
          }
          VILLA.walls = [];
          for (var wid in S.walls) {
            var wst = S.walls[wid];
            VILLA.walls.push({
              id: wid, floor: wst.def.floor, kind: wst.def.kind,
              rooms: wst.def.rooms, demolished: !!wst.demolished,
              thickness: WALL_T, height: FLOOR_H
            });
          }
          VILLA.buildCatalog = BUILD_CATALOG.map(function (c) {
            return { id: c.id, name: c.name, floor: c.floor, kind: c.kind, rooms: c.rooms.slice(0) };
          });
          VILLA.activeRoomId = S.activeRoomId;

          bindDom();
          S.resizeHandler = onResize;
          window.addEventListener('resize', onResize);
          onResize();

          applyDaylight();
          updateLampLights();

          if (savedData) restore(savedData);

          S.ready = true;
          VILLA.ready = true;
          lastTime = now();
          loop();
          emit('change', { action: 'init' });
          resolve(VILLA);
        } catch (e) {
          if (global.console && console.error) console.error('[Villa] 初始化失败', e);
          reject(e);
        }
      });
    },

    /* 销毁 */
    dispose: function () {
      S.disposed = true;
      if (S.raf) cancelAnimationFrame(S.raf);
      S.raf = 0;
      unbindDom();
      if (S.resizeHandler) window.removeEventListener('resize', S.resizeHandler);
      if (S.scene) {
        S.scene.traverse(function (o) {
          if (o.geometry && o.geometry.dispose) o.geometry.dispose();
          if (o.material) {
            var ms = Array.isArray(o.material) ? o.material : [o.material];
            for (var i = 0; i < ms.length; i++) {
              if (ms[i] && ms[i].map && ms[i].map.dispose) ms[i].map.dispose();
              if (ms[i] && ms[i].dispose) ms[i].dispose();
            }
          }
        });
      }
      if (S.renderer) {
        S.renderer.dispose();
        if (S.renderer.forceContextLoss) { try { S.renderer.forceContextLoss(); } catch (e) { } }
      }
      geoCache = {}; matCache = {}; texCache = {}; furnitureProto = {};
      S.rooms = {}; S.walls = {}; S.furniture = {}; S.stickers = {};
      S.colliders = []; S.listeners = {};
      S.ready = false;
      VILLA.ready = false;
    },

    /* 模式切换 */
    setMode: function (mode) {
      var m = mode === 'walk' ? 'walk' : 'edit';
      if (S.mode === m) return m;
      S.mode = m;
      VILLA.mode = m;
      if (m === 'walk') {
        if (S.pointerLocked) releasePointerLock();
        // 进入漫游时，若当前房间有效则把玩家放到该房间中心
        var r = S.rooms[S.activeRoomId];
        if (r) teleportPlayer(r.center.x, r.center.z, r.floor);
      } else {
        S.moveAxis.x = 0; S.moveAxis.y = 0;
      }
      emit('change', { action: 'mode', mode: m });
      return m;
    },

    /* 切换当前装修房间 */
    setActiveRoom: function (roomId) {
      if (!S.rooms[roomId]) return null;
      S.activeRoomId = roomId;
      VILLA.activeRoomId = roomId;
      S.lastRoomId = roomId;
      if (S.mode === 'walk') {
        var r = S.rooms[roomId];
        teleportPlayer(r.center.x, r.center.z, r.floor);
        // 面向房间中心偏北，便于观察
        S.yaw = 0;
        S.pitch = -0.05;
      }
      emit('roomchange', { roomId: roomId });
      emit('change', { action: 'active-room', roomId: roomId });
      return roomId;
    },

    getActiveRoom: function () {
      return S.rooms[S.activeRoomId] || null;
    },

    getRoomsByFloor: function (floor) {
      var out = [];
      for (var i = 0; i < VILLA.rooms.length; i++) {
        if (VILLA.rooms[i].floor === floor) out.push(VILLA.rooms[i]);
      }
      return out;
    },

    /* 全部房间（含名称、楼层、面积），供外部渲染房间列表 */
    getRoomList: function () {
      var out = [];
      for (var i = 0; i < VILLA.rooms.length; i++) {
        var r = VILLA.rooms[i];
        out.push({
          id: r.id, name: r.name, floor: r.floor, area: r.area,
          center: r.center, floorY: r.floorY,
          style: { wall: r.style.wall, floor: r.style.floor, lamp: r.style.lamp }
        });
      }
      return out;
    },

    /* 全部墙体（含是否已拆除），供外部渲染「拆墙 / 砌墙」工具栏 */
    getWallList: function () {
      var out = [];
      for (var wid in S.walls) {
        var st = S.walls[wid];
        out.push({
          id: wid, floor: st.def.floor, kind: st.def.kind,
          rooms: st.def.rooms ? st.def.rooms.slice(0) : [],
          demolished: !!st.demolished,
          canDemolish: !isExterior(st.def) && !st.demolished,
          canConstruct: canConstruct(wid)
        });
      }
      return out;
    },

    /* 可新建的隔墙目录（buildCatalog） */
    getBuildCatalog: function () {
      return VILLA.buildCatalog.map(function (c) {
        return { id: c.id, name: c.name, floor: c.floor, kind: c.kind, rooms: c.rooms.slice(0) };
      });
    },

    /* 装修 */
    setRoomStyle: function (roomId, style) {
      return setRoomStyle(roomId, style);
    },
    getRoomStyle: function (roomId) {
      return getRoomStyle(roomId);
    },

    /* 家具 */
    addFurniture: function (roomId, type, name, opts) {
      return addFurniture(roomId, type, name, opts);
    },
    removeFurniture: function (id) {
      return removeFurniture(id);
    },
    updateFurniture: function (id, patch) {
      return updateFurniture(id, patch);
    },
    selectFurniture: function (id) {
      return selectFurniture(id);
    },
    getSelectedFurniture: function () {
      return getSelectedFurniture();
    },
    getFurniture: function (roomId) {
      return getFurniture(roomId);
    },

    /* 家具（对外只读副本，避免外部误改内部引用） */
    getFurnitureList: function (roomId) {
      var out = [];
      for (var id in S.furniture) {
        var f = S.furniture[id];
        if (roomId && f.roomId !== roomId) continue;
        out.push({
          id: f.id, roomId: f.roomId, type: f.type, name: f.name,
          x: f.x, z: f.z, rotation: f.rotation, scale: f.scale
        });
      }
      return out;
    },

    /* 贴纸（对外只读副本） */
    getStickerList: function () {
      var out = [];
      for (var id in S.stickers) {
        var st = S.stickers[id];
        out.push({
          id: st.id, name: st.name, assetPath: st.assetPath,
          targetType: st.targetType, itemId: st.itemId, roomId: st.roomId,
          size: st.size, rotation: st.rotation,
          position: { x: st.worldPos.x, y: st.worldPos.y, z: st.worldPos.z },
          normal: { x: st.worldNormal.x, y: st.worldNormal.y, z: st.worldNormal.z }
        });
      }
      return out;
    },

    /* 贴纸 */
    placeSticker: function (opts) {
      return placeSticker(opts);
    },
    removeSticker: function (id) {
      return removeSticker(id);
    },
    updateSticker: function (id, patch) {
      return updateSticker(id, patch);
    },
    getStickers: function () {
      var out = [];
      for (var id in S.stickers) out.push(S.stickers[id]);
      return out;
    },
    pickTarget: function () {
      return pickTarget();
    },

    /* 按画布内的相对坐标（0~1）拾取表面：
       用于「先选贴纸 → 再点画面任意位置贴上」的交互。
       fx/fy 为相对画布左/上角的比例，
       返回 { kind, targetType, surface, position, normal, itemId, roomId } */
    pickAt: function (fx, fy) {
      if (!S.raycaster || !S.camera) return null;
      var ndc;
      if (S.pointerLocked) {
        // 指针锁定时只能命中准星（画面中心）
        ndc = new THREE.Vector2(0, 0);
      } else {
        ndc = new THREE.Vector2(fx * 2 - 1, -(fy * 2 - 1));
      }
      var prev = { x: S.pointer.x, y: S.pointer.y };
      S.pointer.x = ndc.x; S.pointer.y = ndc.y;
      var hit = pickTargetAt(ndc);
      S.pointer.x = prev.x; S.pointer.y = prev.y;
      return hit;
    },

    getSelectedSticker: function () {
      return getSelectedSticker();
    },
    selectSticker: function (id) {
      return selectSticker(id);
    },

    /* 墙体 */
    demolishWall: function (wallId) {
      return demolishWall(wallId);
    },
    constructWall: function (wallId) {
      return constructWall(wallId);
    },
    canConstruct: function (wallId) {
      return canConstruct(wallId);
    },
    getWall: function (wallId) {
      var st = S.walls[wallId];
      if (!st) return null;
      return { id: wallId, floor: st.def.floor, kind: st.def.kind, rooms: st.def.rooms, demolished: !!st.demolished };
    },

    /* 昼夜与天气 */
    setDaylight: function (hour, nightFactor) {
      S.hour = clamp(isNum(hour) ? hour : S.hour, 0, 24);
      S.nightFactor = clamp(isNum(nightFactor) ? nightFactor : S.nightFactor, 0, 1);
      applyDaylight();
      emit('change', { action: 'daylight', hour: S.hour, nightFactor: S.nightFactor });
    },
    setWeather: function (weather) {
      var list = ['sunny', 'cloudy', 'rain', 'snow', 'fog'];
      S.weather = list.indexOf(weather) >= 0 ? weather : 'sunny';
      if (S.rain) S.rain.visible = (S.weather === 'rain');
      if (S.snow) S.snow.visible = (S.weather === 'snow');
      applyDaylight();
      emit('change', { action: 'weather', weather: S.weather });
    },

    /* 输入 */
    setMoveAxis: function (x, y) { setMoveAxis(x, y); },
    lookBy: function (dx, dy) { lookBy(dx, dy); },
    requestPointerLock: function () { requestPointerLock(); },
    releasePointerLock: function () { releasePointerLock(); },
    setEnabled: function (bool) {
      S.enabled = !!bool;
      if (!S.enabled) {
        S.moveAxis.x = 0; S.moveAxis.y = 0;
        S.keys = {};
        S.dragging = false;
      }
      emit('change', { action: 'enabled', enabled: S.enabled });
    },

    /* 事件 */
    on: function (evt, fn) { on(evt, fn); },
    emit: function (evt, payload) { emit(evt, payload); },

    /* 持久化 */
    serialize: function () { return serialize(); },

    /* 调试 / 统计信息（便于外部 UI 与自动化测试核对） */
    getDebugInfo: function () {
      var doors = 0, windows = 0, glassDoors = 0, openings = 0;
      var wallCount = 0;
      for (var wid in S.walls) {
        wallCount++;
        var ops = S.walls[wid].def.openings || [];
        for (var i = 0; i < ops.length; i++) {
          if (ops[i].type === 'door') doors++;
          else if (ops[i].type === 'window') windows++;
          else if (ops[i].type === 'glass') glassDoors++;
          else if (ops[i].type === 'open') openings++;
        }
      }
      var furnCount = 0;
      for (var fid in S.furniture) furnCount++;
      var stCount = 0;
      for (var sid in S.stickers) stCount++;
      var info = {
        rooms: VILLA.rooms.length,
        walls: wallCount,
        doors: doors,
        windows: windows,
        glassDoors: glassDoors,
        openings: openings,
        colliders: S.colliders.length,
        furniture: furnCount,
        stickers: stCount,
        mode: S.mode,
        hour: S.hour,
        nightFactor: S.nightFactor,
        weather: S.weather,
        drawCalls: S.renderer ? S.renderer.info.render.calls : 0,
        triangles: S.renderer ? S.renderer.info.render.triangles : 0,
        player: {
          x: Math.round(S.player.x * 1000) / 1000,
          y: Math.round(S.player.y * 1000) / 1000,
          z: Math.round(S.player.z * 1000) / 1000,
          floor: S.player.floor
        }
      };
      if (S.scene && S.scene.background && S.scene.background.getHexString) {
        info.background = '#' + S.scene.background.getHexString();
      }
      if (S.sun) info.sunIntensity = Math.round(S.sun.intensity * 1000) / 1000;
      return info;
    }
  };

  global.Villa = VILLA;

  /* 调试入口：仅当页面 URL 带 ?villa_debug 参数时暴露内部状态，便于排查渲染问题 */
  try {
    if (typeof location !== 'undefined' && location.search && location.search.indexOf('villa_debug') >= 0) {
      VILLA._internal = S;
    }
  } catch (e) { /* 忽略 */ }

})(window);
