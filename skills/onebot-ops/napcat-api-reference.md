# NapCat OneBot API 快速参考

本文档供 AI agent 使用 `onebot_api` 工具时查阅。`onebot_api` 工具接受 `action`（API 名）和 `params`（参数对象），直接通过 WebSocket 调用 NapCat/OneBot v11 API。

完整文档：https://napneko.github.io/api/4.17.55

---

## 消息接口

| action | 说明 | params |
|--------|------|--------|
| `send_msg` | 发送消息（自动判断私聊/群聊） | `{ message_type, user_id?, group_id?, message }` |
| `send_private_msg` | 发送私聊消息 | `{ user_id, message }` |
| `send_group_msg` | 发送群消息 | `{ group_id, message }` |
| `delete_msg` | 撤回消息 | `{ message_id }` |
| `get_msg` | 获取消息详情 | `{ message_id }` |
| `send_forward_msg` | 发送合并转发 | `{ group_id?, user_id?, messages }` |
| `send_group_forward_msg` | 群合并转发 | `{ group_id, messages }` |
| `send_private_forward_msg` | 私聊合并转发 | `{ user_id, messages }` |
| `get_forward_msg` | 获取合并转发内容 | `{ message_id }` |
| `get_group_msg_history` | 群历史消息 | `{ group_id, message_seq?, count? }` |
| `get_friend_msg_history` | 好友历史消息 | `{ user_id, message_seq?, count? }` |
| `forward_friend_single_msg` | 转发单条到好友 | `{ message_id, group_id }` |
| `forward_group_single_msg` | 转发单条到群 | `{ message_id, group_id }` |
| `mark_msg_as_read` | 标记已读 | `{ message_id }` |
| `mark_group_msg_as_read` | 标记群消息已读 | `{ message_id }` |
| `mark_private_msg_as_read` | 标记私聊已读 | `{ message_id }` |
| `_mark_all_as_read` | 全部标记已读 | `{}` |

## 消息表情

| action | 说明 | params |
|--------|------|--------|
| `set_msg_emoji_like` | 消息表情回应 | `{ message_id, emoji_id, set }` |
| `fetch_emoji_like` | 获取表情点赞详情 | `{ message_id, emojiId, emojiType, count }` |
| `get_emoji_likes` | 获取表情点赞列表 | `{ message_id, emoji_id }` |

## 群组接口

| action | 说明 | params |
|--------|------|--------|
| `get_group_list` | 获取群列表 | `{}` |
| `get_group_info` | 获取群信息 | `{ group_id }` |
| `get_group_detail_info` | 获取群详细信息 | `{ group_id }` |
| `get_group_info_ex` | 获取群详细信息(扩展) | `{ group_id }` |
| `get_group_member_list` | 获取群成员列表 | `{ group_id }` |
| `get_group_member_info` | 获取群成员信息 | `{ group_id, user_id }` |
| `set_group_name` | 修改群名 | `{ group_id, group_name }` |
| `set_group_card` | 设置群名片 | `{ group_id, user_id, card }` |
| `set_group_special_title` | 设置群头衔 | `{ group_id, user_id, special_title }` |
| `set_group_admin` | 设置管理员 | `{ group_id, user_id, enable }` |
| `set_group_ban` | 禁言成员 | `{ group_id, user_id, duration }` |
| `set_group_whole_ban` | 全员禁言 | `{ group_id, enable }` |
| `set_group_kick` | 踢出成员 | `{ group_id, user_id, reject_add_request? }` |
| `set_group_kick_members` | 批量踢人 | `{ group_id, user_id: string[], reject_add_request? }` |
| `set_group_leave` | 退出群 | `{ group_id, is_dismiss? }` |
| `set_group_add_request` | 处理加群请求 | `{ flag, sub_type, approve }` |
| `set_group_portrait` | 设置群头像 | `{ group_id, file }` |
| `set_group_remark` | 设置群备注 | `{ group_id, remark }` |
| `set_group_sign` / `send_group_sign` | 群打卡 | `{ group_id }` |
| `set_group_todo` | 设置群待办 | `{ group_id, message_id }` |

## 群公告/精华

| action | 说明 | params |
|--------|------|--------|
| `_send_group_notice` | 发群公告 | `{ group_id, content, image? }` |
| `_get_group_notice` | 获取群公告 | `{ group_id }` |
| `_del_group_notice` | 删除群公告 | `{ group_id, notice_id }` |
| `set_essence_msg` | 设置精华消息 | `{ message_id }` |
| `delete_essence_msg` | 移出精华消息 | `{ message_id }` |
| `get_essence_msg_list` | 获取精华消息列表 | `{ group_id }` |

## 群文件

| action | 说明 | params |
|--------|------|--------|
| `upload_group_file` | 上传群文件 | `{ group_id, file, name }` |
| `upload_private_file` | 上传私聊文件 | `{ user_id, file, name }` |
| `get_group_root_files` | 群根目录文件 | `{ group_id }` |
| `get_group_files_by_folder` | 文件夹内容 | `{ group_id, folder_id }` |
| `get_group_file_system_info` | 群文件系统信息 | `{ group_id }` |
| `get_group_file_url` | 获取群文件URL | `{ group_id, file_id, busid }` |
| `get_private_file_url` | 获取私聊文件URL | `{ user_id, file_id }` |
| `delete_group_file` | 删除群文件 | `{ group_id, file_id }` |
| `create_group_file_folder` | 创建群文件夹 | `{ group_id, folder_name }` |
| `delete_group_folder` | 删除群文件夹 | `{ group_id, folder_id }` |
| `move_group_file` | 移动群文件 | `{ group_id, file_id, current_parent_directory, target_parent_directory }` |
| `rename_group_file` | 重命名群文件 | `{ group_id, file_id, current_parent_directory, new_name }` |
| `trans_group_file` | 传输群文件 | `{ group_id, file_id }` |

## 用户接口

| action | 说明 | params |
|--------|------|--------|
| `get_login_info` | 获取登录号信息 | `{}` |
| `get_stranger_info` | 获取陌生人信息 | `{ user_id }` |
| `get_friend_list` | 获取好友列表 | `{}` |
| `get_friends_with_category` | 带分组好友列表 | `{}` |
| `get_unidirectional_friend_list` | 单向好友列表 | `{}` |
| `set_friend_add_request` | 处理好友请求 | `{ flag, approve, remark? }` |
| `set_friend_remark` | 设置好友备注 | `{ user_id, remark }` |
| `delete_friend` | 删除好友 | `{ user_id }` |
| `send_like` | 点赞 | `{ user_id, times }` |
| `get_recent_contact` | 最近会话 | `{ count? }` |
| `get_profile_like` | 获取资料点赞 | `{ user_id, start?, count? }` |

## 戳一戳

| action | 说明 | params |
|--------|------|--------|
| `group_poke` | 群戳一戳 | `{ user_id }` |
| `friend_poke` | 好友戳一戳 | `{ user_id }` |
| `send_poke` | 发送戳一戳 | `{ user_id }` |

## 群相册

| action | 说明 | params |
|--------|------|--------|
| `get_qun_album_list` | 获取群相册列表 | `{ group_id }` |
| `get_group_album_media_list` | 获取相册媒体 | `{ group_id, album_id }` |
| `upload_image_to_qun_album` | 上传到群相册 | `{ group_id, album_id, album_name, file }` |
| `del_group_album_media` | 删除相册媒体 | `{ group_id, album_id, lloc }` |
| `set_group_album_media_like` | 点赞相册媒体 | `{ group_id, album_id, lloc, id }` |
| `do_group_album_comment` | 评论相册 | `{ group_id, album_id, lloc, content }` |

## 系统接口

| action | 说明 | params |
|--------|------|--------|
| `get_version_info` | 版本信息 | `{}` |
| `get_status` | 运行状态 | `{}` |
| `can_send_image` | 能否发图 | `{}` |
| `can_send_record` | 能否发语音 | `{}` |
| `get_csrf_token` | CSRF Token | `{}` |
| `get_credentials` | 登录凭证 | `{ domain }` |
| `get_cookies` | Cookies | `{ domain }` |
| `get_clientkey` | ClientKey | `{}` |
| `clean_cache` | 清理缓存 | `{}` |
| `set_restart` | 重启服务 | `{}` |
| `nc_get_packet_status` | Packet状态 | `{}` |
| `get_group_system_msg` | 群系统消息 | `{ count? }` |
| `get_group_honor_info` | 群荣誉信息 | `{ group_id, type }` |
| `get_group_at_all_remain` | @全体剩余次数 | `{ group_id }` |
| `get_group_shut_list` | 群禁言列表 | `{ group_id }` |

## 扩展接口

| action | 说明 | params |
|--------|------|--------|
| `set_online_status` | 设置在线状态 | `{ status, ext_status, battery_status }` |
| `set_diy_online_status` | 自定义在线状态 | `{ face_id, face_type, wording }` |
| `nc_get_user_status` | 获取用户在线状态 | `{ user_id }` |
| `set_qq_avatar` | 设置QQ头像 | `{ file }` |
| `set_qq_profile` | 设置QQ资料 | `{ nickname, personal_note }` |
| `set_self_longnick` | 设置个性签名 | `{ longNick }` |
| `set_input_status` | 设置输入状态 | `{ user_id, event_type }` |
| `ocr_image` | 图片OCR | `{ image }` |
| `translate_en2zh` | 英译中 | `{ words: string[] }` |
| `download_file` | 下载文件 | `{ url, thread_count?, headers? }` |
| `check_url_safely` | URL安全检查 | `{ url }` |
| `create_collection` | 创建收藏 | `{ rawData, brief }` |
| `get_collection_list` | 获取收藏列表 | `{ category, count }` |
| `fetch_custom_face` | 获取自定义表情 | `{ count }` |
| `get_mini_app_ark` | 获取小程序Ark | `{ type, title, desc, picUrl, jumpUrl }` |
| `get_ai_characters` | AI角色列表 | `{ group_id }` |
| `get_ai_record` | 获取AI语音 | `{ character, group_id, text }` |
| `send_group_ai_record` | 发送群AI语音 | `{ character, group_id, text }` |

## 文件相关

| action | 说明 | params |
|--------|------|--------|
| `get_file` | 获取文件信息 | `{ file }` |
| `get_image` | 获取图片信息 | `{ file }` |
| `get_record` | 获取语音 | `{ file, out_format? }` |

## Ark 分享

| action | 说明 | params |
|--------|------|--------|
| `ArkShareGroup` | 群分享Ark | `{ group_id }` |
| `ArkSharePeer` | 用户分享Ark | `{ user_id }` |
| `click_inline_keyboard_button` | 点击内联键盘 | `{ group_id, bot_appid, button_id, callback_data, msg_seq }` |

## 频道接口

| action | 说明 | params |
|--------|------|--------|
| `get_guild_list` | 频道列表 | `{}` |
| `get_guild_service_profile` | 频道个人信息 | `{ guild_id }` |

## 可疑好友

| action | 说明 | params |
|--------|------|--------|
| `get_doubt_friends_add_request` | 获取可疑好友申请 | `{ count }` |
| `set_doubt_friends_add_request` | 处理可疑好友申请 | `{ flag, approve }` |

---

## 使用示例

通过 `onebot_api` 工具调用：

```json
// 获取群列表
{ "action": "get_group_list", "params": {} }

// 禁言某人 30 分钟
{ "action": "set_group_ban", "params": { "group_id": 123456, "user_id": 789, "duration": 1800 } }

// 获取群精华消息
{ "action": "get_essence_msg_list", "params": { "group_id": 123456 } }

// 设置群公告
{ "action": "_send_group_notice", "params": { "group_id": 123456, "content": "公告内容" } }

// 获取群文件列表
{ "action": "get_group_root_files", "params": { "group_id": 123456 } }
```
