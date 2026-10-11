/**
 * 麦茶团长 · 应用配置
 * endpoint / publishableKey 来自 WorkBuddy 云服务 publicConfig（标识应用本身，不含任何权限密钥）
 * 麦当劳 MCP Token 绝不出现在前端——所有 MCP 调用都发生在团长（WorkBuddy 会话）侧
 */
window.APP_CONFIG = {
  cloud: {
    endpoint: 'https://mcd-tea-captain.app.workbuddy.host',
    publishableKey: 'wbpk_4bQZALInkz0dAn7w9XCujP_KAqwGzJcf7v8Bfax8QknZoo821diakhu'
  }
}
