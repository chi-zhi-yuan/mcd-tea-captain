# workbuddy.md · WorkBuddy 开发上下文

本项目（麦茶团长 / mcd-tea-captain）全程使用腾讯 WorkBuddy 智能体开发。

## 开发过程纪要（2026-10-11 会话）

1. **调研**：用 WorkBuddy 抓取活动仓库与 mcd-mcp-server 文档，盘点 35 个 Tool；检索榜单 130+ 参赛项目，定位「团队拼单」赛道竞品形态（纯对话式收单），确立「参与者链接化点单 + 实时满减看板」差异化方向。
2. **架构**：WorkBuddy 云服务开通应用（wbapp_4bQZALInkz0dAn7w9XCujP），建 sessions/orders 表 + RLS 策略；参与者前端为单文件孟菲斯风 H5（CDN 引入 @tencent-ai/workbuddy-cloud-sdk）。
3. **开发调试**：
   - MCP 连通性验证：initialize 握手 + campaign-calendar 实调（返回真实活动数据：9.9 早餐两件套、GD 联名等）
   - 云数据面端到端验证：CORS 预检 204 / POST 订单 201 / GET 回读 200
   - 用无头 Chrome（puppeteer-core）自动化回归：加载 → 点单 → 交卷 → 看板跳转全链路
4. **迭代修复**（对话中实测驱动）：
   - 轮询重渲染清空输入草稿 → 点单页静默刷新 + state 草稿保护
   - 首屏「加载中」卡死 → 静默分支条件补严
   - 新增：点单页满减激励条（三态）、👀 看板围观 / 🍴 我也要点互跳（八卦围观闭环）
5. **产出**：SKILL.md（团长三阶段工作流）、app/index.html（参与者前端）、README.md、MCP_INTEGRATION.md、CONTEST_DECLARATION.md、mcp-config.example.json。

## 声明

- 麦当劳 MCP Token 未出现在任何仓库文件中（本地持有，仓库仅含 `${MCD_MCP_TOKEN}` 占位符）。
- 云端 publicConfig 中的 publishableKey 为公开应用标识（设计上即公开，不含权限），非密钥。
