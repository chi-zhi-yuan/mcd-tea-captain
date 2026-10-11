# MCP Integration · 麦茶团长

本项目基于**麦当劳中国官方 MCP Server**（`https://mcp.mcd.cn`，Streamable HTTP + Bearer Token）构建团长侧全部业务能力。本文档说明实际使用的 Tool、调用流程与业务价值。

## 1. Server 信息

| 项 | 值 |
|---|---|
| 接入地址 | `https://mcp.mcd.cn` |
| 协议 | Streamable HTTP（MCP 标准协议） |
| 鉴权 | `Authorization: Bearer ${MCD_MCP_TOKEN}`（[申请入口](https://open.mcd.cn/mcp)） |
| 限流 | 600 次/分钟/Token |
| 配置示例 | [mcp-config.example.json](./mcp-config.example.json)（仅环境变量占位符） |

**Token 边界（本项目核心设计）**：MCP Token 只存在于团长本地的 WorkBuddy 连接器配置中。参与者浏览器侧只有拼单数据面的公开读写配置，前端代码零密钥——30 人拼单也只需 1 人有 Token。

## 2. 实际使用的 Tool

| Tool | 阶段 | 输入要点 | 业务价值 |
|---|---|---|---|
| `query-nearby-stores` / `delivery-query-stores` | 发起 | 地址或经纬度 | 定位可配送门店，校验营业状态，取 storeCode |
| `query-meals` | 发起 | storeCode | 拉门店菜单，精选下午茶品项（分类/价格/标签）存入拼单快照 |
| `query-store-coupons` | 发起 | storeCode | 拉本店可用满减券，提取门槛/减额档位驱动进度条 |
| `calculate-price` | 结算 | 商品列表（可含券） | **唯一价格预言机**：逐档试算券后总价，不做本地优惠猜测 |
| `create-order` | 结算 | 门店/商品/就餐方式 | 团长双确认后真实下单，返回支付链接/取餐码 |
| `query-order` | 履约 | orderId | 配送进度回传，告知团长取餐 |

## 3. 调用流程

```
Phase 1 发起（团长说「发起下午茶拼单」）
  query-nearby-stores ──► 校验营业 ──► 取 storeCode
  query-meals ──────────► 精选 20-40 品项（元→分统一单位）
  query-store-coupons ───► 提取满减档位 [{thresholdFen, offFen}]
  写入云库 sessions（menu/coupons 快照）──► 生成参与者链接

Phase 2 收单（参与者自助，不经 MCP）
  浏览器 ──► 云数据库 orders（公开读写，RLS 限定拼单表）
  看板 4s 轮询聚合：总价 → 进度条 → 「还差 ¥X 解锁 -¥Y」→ 凑单方案

Phase 3 结算（团长说「截止结算」）
  汇总 orders ──► 组装 MCP 计价参数
  calculate-price × N（≤20 次试探预算）──► 输出方案对比表
  团长明确确认 ──► create-order ──► 支付链接/取餐码
  （可选）query-order 回传配送状态
```

## 4. 工程细节与实测结论

以下来自开发期实测（2026-10-11，Token 初始化握手 + `campaign-calendar` 实调验证通过）：

1. **价格单位不一致**：菜单接口单位是元，计价接口返回分。Skill 编排层统一在计算前转为分，展示层转元，杜绝浮点误差。
2. **calculate-price 是唯一可信价格源**：满减进度条显示的是「预估」（基于开团时券档位快照），最终应付金额一律以结算时 `calculate-price` 返回为准——两者如有出入，向团长明示差异再确认。
3. **真实下单双确认**：`create-order` 展示完整方案 → 团长明确回复确认词 → 才执行。演示模式直接跳过下单环节。
4. **限流预算**：结算试算次数封顶 20 次（远低于 600/分钟），单次拼单全流程 MCP 调用 < 40 次。
5. **错误码处理**：401 → 引导重申请 Token；429 → 自动退避；600057（门店打烊）→ 建议换店或改自取。

## 5. 业务价值

- **把「团长」从人肉收单器/计算器中解放**：收单自动化（参与者自助点单）+ 算账自动化（官方接口试算），团长只剩「发起」和「确认」两个动作。
- **满减信息对称**：以往只有下单的人知道凑没凑够；现在进度条全员实时可见，「还差 ¥8」成为集体目标——这是拼单行为里的社交激励，也是产品传播点。
- **零门槛参与**：同事侧免登录、免 App、免 Token，30 秒完成点单，看板满足「谁点了什么」的围观心态。
- **官方数据背书**：菜单、价格、券、订单全部来自麦当劳官方 MCP 接口，无任何本地缓存价格或猜测逻辑。
