'use strict';

/* =============================================================
 * 次元宇宙 ↔ 绘梦 连接接口
 * 浏览器 / Node 通用（依赖全局 fetch，Node 18+ 内置）
 *
 * 用法：
 *   import { HuimengBridge } from './interface/huimeng-bridge.js';
 *   const bridge = new HuimengBridge({ baseURL, token });
 *   const chars = await bridge.fetchCharacters('project-id');
 * ============================================================= */

function HuimengBridge(options) {
  options = options || {};
  this.baseURL = (options.baseURL || 'https://huimeng-ai-backend.onrender.com/api').replace(/\/$/, '');
  this.token = options.token || '';
  this.timeout = options.timeout || 15000;
}

HuimengBridge.prototype._request = function (path, method, body) {
  var self = this;
  var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, self.timeout) : null;
  var headers = { 'Accept': 'application/json' };
  if (self.token) headers['Authorization'] = 'Bearer ' + self.token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  return fetch(self.baseURL + path, {
    method: method || 'GET',
    headers: headers,
    signal: ctrl ? ctrl.signal : undefined,
    body: body === undefined ? undefined : JSON.stringify(body)
  }).then(function (res) {
    if (timer) clearTimeout(timer);
    return res.text().then(function (raw) {
      var data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = raw; }
      if (!res.ok) {
        var err = new Error('绘梦接口 ' + path + ' 失败：' + res.status);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  }).catch(function (err) {
    if (timer) clearTimeout(timer);
    /* 端点尚未实现时优雅降级 */
    if (err && (err.status === 404 || err.status === 405)) {
      console.warn('[HuimengBridge] 端点未实现，返回空数据：' + path);
      return { items: [] };
    }
    throw err;
  });
};

/* 拉取角色设定 → 游戏角色数据 */
HuimengBridge.prototype.fetchCharacters = function (projectId) {
  return this._request('/projects/' + encodeURIComponent(projectId) + '/characters')
    .then(function (data) {
      return (data && data.items ? data.items : []).map(function (c) {
        return {
          id: c.id,
          name: c.name || c.title,
          avatar: c.avatar || c.coverUrl,
          description: c.description || c.intro,
          abilities: c.abilities || c.tags || []
        };
      });
    });
};

/* 拉取分镜 → 关卡节点 */
HuimengBridge.prototype.fetchStoryboardNodes = function (projectId) {
  return this._request('/projects/' + encodeURIComponent(projectId) + '/storyboard')
    .then(function (data) {
      return (data && data.items ? data.items : []).map(function (n, i) {
        return {
          index: i + 1,
          title: n.title || ('镜头 ' + (i + 1)),
          scene: n.scene || n.location,
          action: n.action || n.description,
          emotion: n.emotion,
          duration: n.duration || 3
        };
      });
    });
};

/* 拉取场景 → 关卡背景 */
HuimengBridge.prototype.fetchScenes = function (projectId) {
  return this._request('/projects/' + encodeURIComponent(projectId) + '/scenes')
    .then(function (data) {
      return (data && data.items ? data.items : []).map(function (s) {
        return {
          id: s.id,
          name: s.name || s.title,
          image: s.image || s.url,
          description: s.description || s.intro
        };
      });
    });
};

/* 拉取通用资产 */
HuimengBridge.prototype.fetchAssets = function (projectId) {
  return this._request('/projects/' + encodeURIComponent(projectId) + '/assets')
    .then(function (data) { return (data && data.items ? data.items : []); });
};

/* 回传游玩数据到绘梦 */
HuimengBridge.prototype.pushGameplayLog = function (projectId, log) {
  return this._request('/projects/' + encodeURIComponent(projectId) + '/gameplay-logs', 'POST', {
    log: log,
    timestamp: Date.now()
  });
};

/* CommonJS / ESM 双导出 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HuimengBridge: HuimengBridge };
}
if (typeof window !== 'undefined') {
  window.HuimengBridge = HuimengBridge;
}
