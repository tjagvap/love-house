/* ============================================================================
 * 恋爱小屋 · 账号与订单同步模块
 * 说明：
 *  - 账号：邮箱 + 密码注册/登录，「记住我」把账号密码存在本机，下次自动登录。
 *  - 角色：账号绑定男生 / 女生，菜谱按角色分级显示。
 *  - 配对：双方各自注册后，用对方的「小屋配对码」把两个账号绑定成一对，
 *          之后订单、菜单、房间装修全部自动在云端同步，不需要再发分享链接。
 *  - 降级：云服务不可用时（离线 / 未开通），自动退回本机模式，功能仍可用，
 *          只是订单不会跨设备同步，界面会明确提示。
 * ========================================================================== */
(function (global) {
  'use strict';

  var CLOUD_ENDPOINT = 'https://love-house-65758.app.workbuddy.host';
  var CLOUD_PUBLISHABLE_KEY = 'wbpk_NVD2DXSSThMwyeuJYADyWv_nL5oU1wBJDF9HVi220r02pSUI3JMItQn';

  var LS_ACCOUNT = 'love_house_account_v1';
  var LS_SESSION = 'love_house_session_v1';

  var account = {
    cloud: null,          // WorkBuddyCloud 客户端
    ready: false,         // SDK 是否初始化成功
    online: false,        // 云服务是否可用
    user: null,           // { id, name, email }
    profile: null,        // { ownerId, nickname, gender, pairCode }
    saved: null,          // 记住的账号 { email, password, remember }
    pairCode: '',
    lastError: '',
    listeners: {}
  };

  function emit(evt, payload) {
    (account.listeners[evt] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { console.warn('[账号] 事件处理异常', evt, e); }
    });
  }
  function on(evt, fn) {
    (account.listeners[evt] = account.listeners[evt] || []).push(fn);
  }

  // ---------------------------------------------------------------- 本机记住
  function loadSaved() {
    try { account.saved = JSON.parse(localStorage.getItem(LS_ACCOUNT) || 'null'); }
    catch (e) { account.saved = null; }
    if (!account.saved || !account.saved.email) account.saved = null;
    return account.saved;
  }
  function saveAccount(email, password, remember) {
    if (remember) {
      account.saved = { email: email, password: password, remember: true, at: Date.now() };
      try { localStorage.setItem(LS_ACCOUNT, JSON.stringify(account.saved)); } catch (e) {}
    } else {
      account.saved = null;
      try { localStorage.removeItem(LS_ACCOUNT); } catch (e) {}
    }
  }

  // ---------------------------------------------------------------- SDK 初始化
  function initCloud() {
    if (account.cloud) return Promise.resolve(account.cloud);
    return new Promise(function (resolve) {
      if (!global.WorkBuddyCloud) { resolve(null); return; }
      try {
        account.cloud = global.WorkBuddyCloud.createWorkBuddyCloud({
          endpoint: CLOUD_ENDPOINT,
          oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
          publishableKey: CLOUD_PUBLISHABLE_KEY
        });
        account.ready = true;
        resolve(account.cloud);
      } catch (e) {
        console.warn('[账号] 云服务初始化失败', e);
        account.lastError = e.message || String(e);
        resolve(null);
      }
    });
  }

  // ---------------------------------------------------------------- 账号资料
  function randomPairCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    for (var i = 0; i < 6; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }

  function normalizeCode(code) {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // 读取（并按需创建）当前账号的资料行
  function fetchProfile(userId) {
    if (!account.cloud) return Promise.resolve(null);
    return account.cloud.database.from('profiles').select('*')
      .eq('owner_id', userId).maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data || null;
      });
  }

  function upsertProfile(userId, patch) {
    if (!account.cloud) return Promise.resolve(null);
    var body = Object.assign({}, patch, { updated_at: new Date().toISOString() });
    return account.cloud.database.from('profiles').update(body)
      .eq('owner_id', userId).select().maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (res.data) return res.data;
        // 没有行则插入
        var insertBody = Object.assign({ owner_id: userId }, body);
        return account.cloud.database.from('profiles').insert(insertBody).select().maybeSingle()
          .then(function (r2) {
            if (r2.error) throw r2.error;
            return r2.data;
          });
      });
  }

  // ---------------------------------------------------------------- 注册 / 登录
  // 注册需要邮箱验证码：先 sendOtp → verifyOtp（带 password 完成注册）
  function register(email, password, code) {
    if (!account.cloud) return Promise.reject(new Error('云服务未就绪，请稍后再试'));
    var started = account.cloud.auth.sendOtp({ email: email });
    return started.then(function (sent) {
      if (sent.error) throw sent.error;
      return account.cloud.auth.verifyOtp({
        email: email,
        verificationId: sent.data.verificationId,
        isExistingUser: sent.data.isExistingUser,
        token: code,
        password: password
      });
    }).then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  function sendRegisterCode(email) {
    if (!account.cloud) return Promise.reject(new Error('云服务未就绪，请稍后再试'));
    return account.cloud.auth.sendOtp({ email: email }).then(function (sent) {
      if (sent.error) throw sent.error;
      return sent.data;
    });
  }

  function login(email, password) {
    if (!account.cloud) return Promise.reject(new Error('云服务未就绪，请稍后再试'));
    return account.cloud.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  }

  function logout() {
    var p = account.cloud ? account.cloud.auth.signOut() : Promise.resolve();
    return p.catch(function () {}).then(function () {
      account.user = null;
      account.profile = null;
      account.pairCode = '';
      try { localStorage.removeItem(LS_SESSION); } catch (e) {}
      emit('signed-out');
    });
  }

  // 登录成功后：拉取/建立资料，设置角色，配对码
  function afterAuth(session) {
    account.user = {
      id: (session && session.user && session.user.id) || '',
      name: (session && session.user && session.user.name) || (session && session.user && session.user.email) || '',
      email: (session && session.user && session.user.email) || ''
    };
    return fetchProfile(account.user.id).then(function (row) {
      if (row) {
        account.profile = row;
        account.pairCode = row.pair_code || '';
        if (!row.pair_code) {
          return upsertProfile(account.user.id, { pair_code: randomPairCode() })
            .then(function (r) { account.profile = r; account.pairCode = (r && r.pair_code) || ''; return r; });
        }
        return row;
      }
      return upsertProfile(account.user.id, {
        nickname: account.user.name,
        gender: 'male',
        pair_code: randomPairCode()
      }).then(function (r) {
        account.profile = r;
        account.pairCode = (r && r.pair_code) || '';
        return r;
      });
    }).then(function () {
      try { localStorage.setItem(LS_SESSION, JSON.stringify({ at: Date.now(), uid: account.user.id })); } catch (e) {}
      account.online = true;
      emit('signed-in', account.profile);
      return account.profile;
    });
  }

  // ---------------------------------------------------------------- 配对
  // 输入对方的配对码 → 把自己的 pair_code 改成对方的码，双方共享同一 pair_code
  function pairWith(code) {
    var target = normalizeCode(code);
    if (target.length !== 6) return Promise.reject(new Error('配对码是 6 位字母数字，请检查一下'));
    if (!account.user) return Promise.reject(new Error('请先登录'));
    return fetchProfile(account.user.id).then(function (row) {
      var current = (row && row.pair_code) || account.pairCode || randomPairCode();
      if (current === target) throw new Error('这就是你自己小屋的配对码哦');
      return upsertProfile(account.user.id, { pair_code: target }).then(function (r) {
        account.profile = r;
        account.pairCode = target;
        emit('paired', target);
        return target;
      });
    });
  }

  function unpair() {
    if (!account.user) return Promise.reject(new Error('请先登录'));
    var fresh = randomPairCode();
    return upsertProfile(account.user.id, { pair_code: fresh }).then(function (r) {
      account.profile = r;
      account.pairCode = fresh;
      emit('paired', fresh);
      return fresh;
    });
  }

  // ---------------------------------------------------------------- 订单同步
  function loadOrders() {
    if (!account.cloud || !account.pairCode) return Promise.resolve([]);
    return account.cloud.database.from('orders').select('*')
      .eq('pair_code', account.pairCode)
      .order('created_at', { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(function (row) {
          try { return Object.assign({}, row.payload, { id: row.id, at: row.created_at }); }
          catch (e) { return null; }
        }).filter(Boolean);
      });
  }

  function saveOrder(order) {
    if (!account.cloud || !account.pairCode) return Promise.resolve(false);
    var id = order.id;
    var payload = Object.assign({}, order);
    delete payload.id; delete payload.at;
    return account.cloud.database.from('orders').upsert({
      id: id,
      pair_code: account.pairCode,
      payload: payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' }).then(function (res) {
      if (res.error) throw res.error;
      return true;
    });
  }

  function deleteOrder(id) {
    if (!account.cloud || !account.pairCode) return Promise.resolve(false);
    return account.cloud.database.from('orders').delete().eq('id', id).select()
      .then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
  }

  // ---------------------------------------------------------------- 启动
  function restore() {
    loadSaved();
    return initCloud().then(function () {
      if (!account.cloud) { account.online = false; emit('offline'); return null; }
      return account.cloud.auth.getSession().then(function (res) {
        if (res.error || !res.data || !res.data.session) {
          // 没有有效会话：若勾选了「记住我」，用保存的账号密码自动登录
          if (account.saved && account.saved.remember && account.saved.password) {
            return login(account.saved.email, account.saved.password)
              .then(function (session) { return afterAuth(session); })
              .catch(function (e) {
                console.warn('[账号] 自动登录失败', e && e.message);
                account.online = true;
                return null;
              });
          }
          account.online = true;
          emit('signed-out');
          return null;
        }
        return afterAuth(res.data.session);
      }).catch(function (e) {
        console.warn('[账号] 会话恢复失败', e && e.message);
        account.online = false;
        emit('offline');
        return null;
      });
    });
  }

  global.LoveHouseAccount = {
    account: account,
    on: on,
    emit: emit,
    restore: restore,
    initCloud: initCloud,
    register: register,
    sendRegisterCode: sendRegisterCode,
    login: login,
    logout: logout,
    pairWith: pairWith,
    unpair: unpair,
    loadOrders: loadOrders,
    saveOrder: saveOrder,
    deleteOrder: deleteOrder,
    saveAccount: saveAccount,
    loadSaved: loadSaved,
    upsertProfile: upsertProfile,
    fetchProfile: fetchProfile,
    randomPairCode: randomPairCode,
    normalizeCode: normalizeCode,
    setProfile: function (patch) {
      if (!account.user) return Promise.reject(new Error('请先登录'));
      return upsertProfile(account.user.id, patch).then(function (r) {
        account.profile = r;
        if (patch && patch.pair_code) account.pairCode = patch.pair_code;
        emit('profile', account.profile);
        return r;
      });
    }
  };
})(window);
