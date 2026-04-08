# OneBot Agent 工具与 CLI

插件通过 WebSocket 与 OneBot（Lagrange.Core / go-cqhttp）通信，提供 **Agent 工具**（供 Cron/脚本/AI 调用）和等价的 **CLI 命令**（供人工或工作流直接调用）。  
AI 或脚本应优先使用 **CLI**，便于复现、调试和文档化。

---

## 前置条件

- **Gateway 已启动**：`openclaw gateway`（或 `openclaw gateway run`）
- OneBot 已运行并连接；若为正向 WS，CLI 会按配置自动建连
- 配置：`openclaw.json` 的 `channels.onebot` 或环境变量 `ONEBOT_WS_*`

---

## 1. 获取群历史消息

**Agent 工具**：`onebot_get_group_msg_history`  
**CLI**：

```bash
openclaw onebot get-group-msg-history --group-id <群号> [--hours <N>] [--count 50] [--message-seq <序号>]
```

- 指定 **`--hours N`**：获取**从现在到过去 N 小时**内的消息（内部按时间范围分页拉取），例如 `--hours 24` 即过去 24 小时。
- 不指定 `--hours`：按单页返回，始终**从旧到新**；分页时用上一批最早一条的 `message_seq` 作为 `--message-seq`。

| 参数 | 说明 |
|------|------|
| `--group-id` | 群号（必填） |
| `--hours` | 获取最近 N 小时内的消息（可选；指定后按时间范围拉取） |
| `--count` | 条数，默认 50（未指定 --hours 时生效） |
| `--message-seq` | 起始消息序号（可选，分页用，未指定 --hours 时生效） |

示例：

```bash
openclaw onebot get-group-msg-history --group-id 123456789
openclaw onebot get-group-msg-history --group-id 123456789 --hours 24
openclaw onebot get-group-msg-history --group-id 123456789 --hours 1 --limit 500
```

---

## 2. 按名字模糊搜索群成员（查 QQ 号）

**Agent 工具**：`onebot_search_group_member`  
**CLI**：

```bash
openclaw onebot search-group-member --group-id <群号> --name <名字>
```

| 参数 | 说明 |
|------|------|
| `--group-id` | 群号（必填） |
| `--name` | 要搜的名字（群名片或昵称，模糊匹配） |

输出：匹配到的 QQ 与展示名。

示例：

```bash
openclaw onebot search-group-member --group-id 123456789 --name 小明
```

---

## 3. 发送文本

**Agent 工具**：`onebot_send_text`  
**CLI**（推荐使用主命令）：

```bash
openclaw message send --channel onebot --target group:<群号> --message "内容"
openclaw message send --channel onebot --target user:<QQ号> --message "内容"
```

---

## 4. 发送图片

**Agent 工具**：`onebot_send_image`  
**CLI**：

```bash
openclaw message send --channel onebot --target group:<群号> --media "file:///path/to.png"
openclaw message send --channel onebot --target user:<QQ号> --media "https://example.com/pic.jpg"
```

---

## 5. 发送语音

**Agent 工具**：`onebot_send_record`  
**CLI**：

```bash
openclaw onebot send-record --target group:<群号> --file "file:///path/to/audio.mp3"
openclaw onebot send-record --target user:<QQ号> --file "https://example.com/voice.silk"
```

| 参数 | 说明 |
|------|------|
| `--target` | group:<群号> 或 user:<QQ号>（必填） |
| `--file` | 语音文件，支持 `file://` 本地路径、`http(s)://` URL、`base64://`（必填） |

支持的音频格式：mp3、wav、amr、silk 等（NapCat/Lagrange 会自动转码为 SILK）。

示例：

```bash
# 发送本地语音到群
openclaw onebot send-record --target group:123456789 --file "file:///tmp/hello.mp3"

# 发送网络语音到私聊
openclaw onebot send-record --target user:987654321 --file "https://example.com/voice.silk"
```

---

## 6. 上传文件到群/私聊

**Agent 工具**：`onebot_upload_file`  
**CLI**：

```bash
openclaw onebot upload-file --target group:<群号> --file <本地绝对路径> --name <显示文件名>
openclaw onebot upload-file --target user:<QQ号> --file <本地绝对路径> --name <显示文件名>
```

---

## 7. 执行脚本（Cron 等）

**Agent 工具**：`onebot_run_script`  
**CLI**：无直接一对一命令，可由 Cron 或工作流调用脚本，脚本内使用上述 CLI 或 `onebotClient` API。

---

## 8. 群管理

**Agent 工具**：`onebot_group_admin`  
**CLI**：

```bash
openclaw onebot group-admin --action <action> --group-id <群号> [其他参数]
```

支持的 action：

| action | 说明 | 必要参数 | 可选参数 |
|--------|------|---------|---------|
| `set_group_name` | 修改群名 | `--group-id`, `--name` | |
| `send_group_notice` | 发群公告 | `--group-id`, `--content` | |
| `set_group_ban` | 禁言成员 | `--group-id`, `--user-id` | `--duration`（秒，默认 600，0=解除） |
| `set_group_whole_ban` | 全员禁言 | `--group-id` | `--enable`/`--no-enable` |
| `set_group_kick` | 踢出成员 | `--group-id`, `--user-id` | `--reject-add-request` |
| `set_group_admin` | 设置管理员 | `--group-id`, `--user-id` | `--enable`/`--no-enable` |
| `set_group_card` | 设置名片 | `--group-id`, `--user-id`, `--name` | |
| `set_group_special_title` | 设置头衔 | `--group-id`, `--user-id`, `--title` | |
| `set_group_portrait` | 设置群头像 | `--group-id`, `--file` | |
| `delete_msg` | 撤回消息 | `--message-id` | |
| `get_group_info` | 获取群信息 | `--group-id` | |
| `get_group_member_list` | 获取成员列表 | `--group-id` | |
| `get_group_member_info` | 获取成员信息 | `--group-id`, `--user-id` | |

示例：

```bash
# 修改群名
openclaw onebot group-admin --action set_group_name --group-id 123456789 --name "新群名"

# 禁言 10 分钟
openclaw onebot group-admin --action set_group_ban --group-id 123456789 --user-id 987654321 --duration 600

# 踢人
openclaw onebot group-admin --action set_group_kick --group-id 123456789 --user-id 987654321
```

---

## 9. 通用 API 调用（onebot_api）

**Agent 工具**：`onebot_api`

直接调用任意 OneBot/NapCat API，无需逐个封装。传入 `action`（API 端点名）和 `params`（参数对象），返回完整 JSON 响应。

适用于上述专用工具未覆盖的 API（如群相册、精华消息、群文件管理、戳一戳、AI 语音等）。

| 参数 | 说明 |
|------|------|
| `action` | OneBot API 名称，如 `get_group_list`、`set_essence_msg` |
| `params` | API 参数对象，字段与 OneBot 协议文档一致 |
| `timeout` | 可选，超时毫秒数，默认 15000 |

示例：

```json
// 获取群精华消息
{ "action": "get_essence_msg_list", "params": { "group_id": 123456 } }

// 群戳一戳
{ "action": "group_poke", "params": { "user_id": 789012 } }

// 获取群文件列表
{ "action": "get_group_root_files", "params": { "group_id": 123456 } }
```

完整 API 列表参考：[napcat-api-reference.md](napcat-api-reference.md)

---

## 使用建议

- **AI / 自动化**：优先使用上述 **CLI 命令**，便于在 Skill 中写明「如何调用」、可复现。对于专用工具未覆盖的 API，使用 `onebot_api` 通用工具。
- **Cron / 内置任务**：在 `openclaw.json` 的 `cronJobs` 中配置 `script`，脚本内通过 `onebotClient.callApi(action, params)` 或子进程调用 CLI。
- **临时查询**：直接运行 `openclaw onebot search-group-member ...` 等。
