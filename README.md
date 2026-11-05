# 次元宇宙 · Dimensional Universe

> 一个横跨 2D / 2.5D / 3D 多元视角的横版动作冒险游戏概念项目。
> 与「绘梦 AI 动漫创作平台」联动：从绘梦导入角色、场景、分镜，自动生成可游玩的关卡原型。

---

## 一、项目定位

| 项 | 说明 |
| --- | --- |
| 类型 | 二维横版动作冒险（核心玩法） |
| 视角 | **可切换**：2D 横版 / 2.5D 伪透视 / 3D 自由镜头 |
| 状态 | **概念提案阶段**，当前仓库仅提供设计文档与「绘梦」对接接口，暂不实现游戏本体 |
| 联动项目 | [绘梦 AI 动漫创作平台](https://github.com/liqi279/huimeng-ai) |

## 二、核心玩法概念（2D 横版）

- 主角在横版关卡中探索、战斗、解谜
- 关卡由「章节 → 场景 → 节点」组成，每个节点可绑定绘梦生成的美术资源
- 收集、跳跃、攻击、技能释放等基础横版动作
- 多结局分支，玩家选择影响剧情走向

## 三、多元视角切换（设计想法，未实现）

在任意关卡中可一键切换视角，**仅提出想法，不要求立即实现**：

1. **2D 横版**（默认）：纯 2D 精灵 + 视差背景，性能最优、复古感强
2. **2.5D 伪透视**：2D 精灵在带透视的 3D 场景中移动，增加纵深感
3. **3D 自由镜头**：场景与角色均为 3D 模型，镜头可自由旋转/缩放

> 三种视角共享同一套关卡数据与角色状态，切换只改变渲染管线与输入映射。

## 四、与绘梦的连接接口

本仓库 `interface/huimeng-bridge.js` 提供一个浏览器端/Node 端通用的桥接模块，
用于从「绘梦」拉取创作资产并转换成游戏可用的数据：

```js
import { HuimengBridge } from './interface/huimeng-bridge.js';

const bridge = new HuimengBridge({
  baseURL: 'https://huimeng-ai-backend.onrender.com/api', // 绘梦后端
  token: 'YOUR_HUIMENG_TOKEN'
});

// 拉取某项目的角色设定，转成游戏角色数据
const characters = await bridge.fetchCharacters('project-id');
// 拉取分镜，转成关卡节点
const nodes = await bridge.fetchStoryboardNodes('project-id');
// 拉取场景图，作为关卡背景
const scenes = await bridge.fetchScenes('project-id');
```

### 接口契约

| 方法 | 绘梦端点 | 返回 | 用途 |
| --- | --- | --- | --- |
| `fetchCharacters(projectId)` | `GET /projects/:id/characters` | 角色数组 | 生成可操控角色 / NPC |
| `fetchStoryboardNodes(projectId)` | `GET /projects/:id/storyboard` | 分镜节点数组 | 生成关卡节点与过场 |
| `fetchScenes(projectId)` | `GET /projects/:id/scenes` | 场景数组 | 关卡背景 / 环境贴图 |
| `fetchAssets(projectId)` | `GET /projects/:id/assets` | 资产数组 | 通用美术资源 |
| `pushGameplayLog(projectId, log)` | `POST /projects/:id/gameplay-logs` | `{ok:true}` | 回传游玩数据到绘梦 |

> 上述端点为**约定接口**，绘梦后端可按需逐步实现；桥接模块在端点缺失时会优雅降级。

## 五、目录结构

```
dimensional-universe/
├── README.md                  本文件
├── package.json               项目清单
├── interface/
│   └── huimeng-bridge.js      绘梦连接接口（浏览器/Node 通用）
└── docs/
    └── game-design.md         游戏设计草案（玩法/视角/关卡）
```

## 六、路线图（概念）

- [ ] Phase 0：绘梦对接接口落地 + 资产拉通
- [ ] Phase 1：2D 横版核心玩法原型
- [ ] Phase 2：2.5D 视角切换
- [ ] Phase 3：3D 自由镜头
- [ ] Phase 4：联网 / 关卡编辑器

## 七、许可

MIT
