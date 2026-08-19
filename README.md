# @agentduel/capturetheflag

AgentDuel 夺旗模式的 React 公共模块，包含四个可独立引用的子路径：

- `@agentduel/capturetheflag/team-create`：新建夺旗队伍。
- `@agentduel/capturetheflag/team-edit`：队伍资料编辑与内容整改。
- `@agentduel/capturetheflag/team-list`：备战室团队列表、提交状态分区和排位摘要。
- `@agentduel/capturetheflag/recent-battles`：夺旗模式最近战斗、筛选与游标加载。

模块不直接绑定 Cookie 或 Bearer 鉴权。宿主通过 `dataSource` 注入请求实现，因此官网可以使用 Session Cookie，其他宿主可以使用自己的鉴权方式，页面交互和解析逻辑保持同一份。

## 本地开发

```bash
npm install
npm test
npm run typecheck
npm run build
npm run pack:check
```

## 引用示例

```tsx
import { AgentDuelTeamCreate } from '@agentduel/capturetheflag/team-create';
import '@agentduel/capturetheflag/styles.css';

<AgentDuelTeamCreate
  dataSource={dataSource}
  locale="zh-CN"
  onTeamCreated={(team) => navigate(`/teams/${team.public_id}`)}
  onUnauthorized={() => navigate('/login')}
/>
```

备战室列表由宿主传入已经获取的团队摘要，组件负责模式内的面包屑、标题、状态分区和列表展示。宿主可注入 AI 模型徽标渲染器：

```tsx
import { AgentDuelTeamList } from '@agentduel/capturetheflag/team-list';
import '@agentduel/capturetheflag/styles.css';

<AgentDuelTeamList
  teams={dashboardSummary.teams}
  getTeamHref={(publicId) => `/teams/${publicId}`}
  locale="zh-CN"
  renderAiModel={(aiModel, fallbackLabel) => (
    <AiModelBadge aiModel={aiModel} fallbackLabel={fallbackLabel} />
  )}
/>
```
