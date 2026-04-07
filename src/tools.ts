/**
 * Agent 工具注册
 * 供 OpenClaw cron 等场景下，AI 调用 OneBot 能力
 */

import WebSocket from "ws";
import { loadScript } from "./load-script.js";
import {
  getWs,
  sendOneBotAction,
  sendPrivateMsg,
  sendGroupMsg,
  sendGroupImage,
  sendPrivateImage,
  uploadGroupFile,
  uploadPrivateFile,
  getGroupMsgHistory,
  getGroupMsgHistoryInRange,
  getGroupInfo,
  getStrangerInfo,
  getGroupMemberInfo,
  getGroupMemberList,
  searchGroupMemberByName,
  getAvatarUrl,
  deleteMsg,
  setGroupName,
  sendGroupNotice,
  setGroupPortrait,
  setGroupBan,
  setGroupWholeBan,
  setGroupKick,
  setGroupAdmin,
  setGroupCard,
  setGroupSpecialTitle,
} from "./connection.js";
import { getRenderMarkdownToPlain } from "./config.js";
import { markdownToPlain } from "./markdown.js";

export interface OneBotClient {
  /** 通用 API 调用：传入 action 名和参数，直接发送到 OneBot */
  callApi: (action: string, params?: Record<string, unknown>) => Promise<any>;
  sendGroupMsg: typeof sendGroupMsg;
  sendGroupImage: typeof sendGroupImage;
  sendPrivateMsg: typeof sendPrivateMsg;
  sendPrivateImage: typeof sendPrivateImage;
  getGroupMsgHistory: typeof getGroupMsgHistory;
  getGroupMsgHistoryInRange: typeof getGroupMsgHistoryInRange;
  getGroupInfo: typeof getGroupInfo;
  getStrangerInfo: typeof getStrangerInfo;
  getGroupMemberInfo: typeof getGroupMemberInfo;
  searchGroupMemberByName: typeof searchGroupMemberByName;
  getAvatarUrl: typeof getAvatarUrl;
  setGroupName: typeof setGroupName;
  sendGroupNotice: typeof sendGroupNotice;
  setGroupBan: typeof setGroupBan;
  setGroupWholeBan: typeof setGroupWholeBan;
  setGroupKick: typeof setGroupKick;
  setGroupAdmin: typeof setGroupAdmin;
  setGroupCard: typeof setGroupCard;
  setGroupSpecialTitle: typeof setGroupSpecialTitle;
  setGroupPortrait: typeof setGroupPortrait;
  deleteMsg: typeof deleteMsg;
}

export const onebotClient: OneBotClient = {
  callApi: async (action: string, params?: Record<string, unknown>) => {
    const w = getWs();
    if (!w || w.readyState !== WebSocket.OPEN) throw new Error("OneBot 未连接");
    return sendOneBotAction(w, action, params ?? {});
  },
  sendGroupMsg,
  sendGroupImage,
  sendPrivateMsg,
  sendPrivateImage,
  getGroupMsgHistory,
  getGroupMsgHistoryInRange,
  getGroupInfo,
  getStrangerInfo,
  getGroupMemberInfo,
  searchGroupMemberByName,
  getAvatarUrl,
  setGroupName,
  sendGroupNotice,
  setGroupBan,
  setGroupWholeBan,
  setGroupKick,
  setGroupAdmin,
  setGroupCard,
  setGroupSpecialTitle,
  setGroupPortrait,
  deleteMsg,
};

export function registerTools(api: any): void {
  if (typeof api.registerTool !== "function") return;

  api.registerTool({
    name: "onebot_send_text",
    description: "通过 OneBot 发送文本消息。target 格式：user:QQ号 或 group:群号",
    parameters: {
      type: "object",
      properties: {
        target: { type: "string", description: "user:123456 或 group:789012" },
        text: { type: "string", description: "要发送的文本" },
      },
      required: ["target", "text"],
    },
    async execute(_id: string, params: { target: string; text: string }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      const cfg = (api as any)?.config;
      const textToSend = getRenderMarkdownToPlain(cfg) ? markdownToPlain(params.text) : params.text;
      const t = params.target.replace(/^onebot:/i, "");
      try {
        if (t.startsWith("group:")) {
          await sendGroupMsg(parseInt(t.slice(6), 10), textToSend);
        } else {
          const id = parseInt(t.replace(/^user:/, ""), 10);
          await sendPrivateMsg(id, textToSend);
        }
        return { content: [{ type: "text", text: "发送成功" }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `发送失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_send_image",
    description: "通过 OneBot 发送图片。target 格式：user:QQ号 或 group:群号。image 为本地路径(file://)或 URL 或 base64://",
    parameters: {
      type: "object",
      properties: {
        target: { type: "string" },
        image: { type: "string", description: "图片路径或 URL" },
      },
      required: ["target", "image"],
    },
    async execute(_id: string, params: { target: string; image: string }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      const t = params.target.replace(/^onebot:/i, "");
      try {
        if (t.startsWith("group:")) {
          await sendGroupImage(parseInt(t.slice(6), 10), params.image);
        } else {
          await sendPrivateImage(parseInt(t.replace(/^user:/, ""), 10), params.image);
        }
        return { content: [{ type: "text", text: "图片发送成功" }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `发送失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_upload_file",
    description: "通过 OneBot 上传文件到群或私聊。target: user:QQ号 或 group:群号。file 为本地绝对路径，name 为显示文件名",
    parameters: {
      type: "object",
      properties: {
        target: { type: "string" },
        file: { type: "string" },
        name: { type: "string" },
      },
      required: ["target", "file", "name"],
    },
    async execute(_id: string, params: { target: string; file: string; name: string }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      const t = params.target.replace(/^onebot:/i, "");
      try {
        if (t.startsWith("group:")) {
          await uploadGroupFile(parseInt(t.slice(6), 10), params.file, params.name);
        } else {
          await uploadPrivateFile(parseInt(t.replace(/^user:/, ""), 10), params.file, params.name);
        }
        return { content: [{ type: "text", text: "文件上传成功" }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `上传失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_get_group_msg_history",
    description: "获取群聊历史消息。可指定 hours 获取最近 N 小时内消息（分页拉取），不指定则返回单页（始终从旧到新）。需 Lagrange.Core",
    parameters: {
      type: "object",
      properties: {
        group_id: { type: "number", description: "群号" },
        hours: { type: "number", description: "可选。指定则获取从现在到过去 N 小时内的消息（如 24 即过去 24 小时）" },
        count: { type: "number", description: "单页条数（未指定 hours 时生效），默认 50" },
        message_seq: { type: "number", description: "可选，起始消息序号（分页用，未指定 hours 时生效）" },
        message_id: { type: "number", description: "可选，起始消息 ID（未指定 hours 时生效）" },
        limit: { type: "number", description: "指定 hours 时最多返回条数，默认 3000" },
      },
      required: ["group_id"],
    },
    async execute(
      _id: string,
      params: {
        group_id: number;
        hours?: number;
        count?: number;
        message_seq?: number;
        message_id?: number;
        limit?: number;
      }
    ) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      try {
        const hoursNum = params.hours != null ? Number(params.hours) : undefined;
        if (typeof hoursNum === "number" && Number.isFinite(hoursNum) && hoursNum > 0) {
          const startTime = Math.floor(Date.now() / 1000) - hoursNum * 3600;
          const msgs = await getGroupMsgHistoryInRange(params.group_id, {
            startTime,
            limit: params.limit ?? 3000,
            chunkSize: 100,
          });
          const summary = msgs.map((m) => {
            const text = typeof m.message === "string" ? m.message : JSON.stringify(m.message);
            const nick = m.sender?.nickname ?? m.sender?.user_id ?? "?";
            return `[${new Date(m.time * 1000).toISOString()}] ${nick}: ${text.slice(0, 200)}`;
          });
          return { content: [{ type: "text", text: summary.join("\n") || "无历史消息", metadata: { count: msgs.length } }] };
        }
        const msgs = await getGroupMsgHistory(params.group_id, {
          count: params.count ?? 50,
          message_seq: params.message_seq,
          message_id: params.message_id,
          reverse_order: true,
        });
        const summary = msgs.map((m) => {
          const text = typeof m.message === "string" ? m.message : JSON.stringify(m.message);
          const nick = m.sender?.nickname ?? m.sender?.user_id ?? "?";
          return `[${new Date(m.time * 1000).toISOString()}] ${nick}: ${text.slice(0, 200)}`;
        });
        return { content: [{ type: "text", text: summary.join("\n") || "无历史消息" }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `获取失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_search_group_member",
    description: "按名字模糊匹配群成员，返回匹配到的 QQ 号与展示名（群名片优先）。用于根据昵称/群名片查 QQ 号",
    parameters: {
      type: "object",
      properties: {
        group_id: { type: "number", description: "群号" },
        name: { type: "string", description: "要搜索的名字（群名片或昵称，支持模糊匹配）" },
      },
      required: ["group_id", "name"],
    },
    async execute(_id: string, params: { group_id: number; name: string }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      try {
        const list = await searchGroupMemberByName(params.group_id, params.name);
        if (!list.length) {
          return { content: [{ type: "text", text: `未找到匹配「${params.name}」的群成员` }] };
        }
        const lines = list.map((m) => `QQ: ${m.user_id}  展示名: ${m.displayName}`);
        return { content: [{ type: "text", text: lines.join("\n"), metadata: { count: list.length, matches: list } }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `搜索失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_group_admin",
    description: "QQ 群管理操作：修改群名、发公告、禁言、踢人、设置管理员等",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [
            "set_group_name", "send_group_notice", "set_group_portrait",
            "set_group_ban", "set_group_whole_ban", "set_group_kick",
            "set_group_admin", "set_group_card", "set_group_special_title",
            "delete_msg",
            "get_group_info", "get_group_member_list", "get_group_member_info",
          ],
          description: "要执行的操作",
        },
        group_id: { type: "number", description: "群号" },
        user_id: { type: "number", description: "用户 QQ 号" },
        duration: { type: "number", description: "禁言时长（秒），默认 600，0=解除禁言" },
        name: { type: "string", description: "群名（set_group_name 用）" },
        content: { type: "string", description: "公告内容（send_group_notice 用）" },
        file: { type: "string", description: "文件路径（set_group_portrait 用）" },
        card: { type: "string", description: "群名片（set_group_card 用）" },
        special_title: { type: "string", description: "群头衔（set_group_special_title 用）" },
        enable: { type: "boolean", description: "启用/禁用标志" },
        reject_add_request: { type: "boolean", description: "是否拒绝再加群（set_group_kick 用）" },
        message_id: { type: "number", description: "消息 ID（delete_msg 用）" },
      },
      required: ["action"],
    },
    async execute(_id: string, params: Record<string, any>) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      try {
        switch (params.action) {
          case "set_group_name":
            await setGroupName(params.group_id, params.name);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "send_group_notice":
            await sendGroupNotice(params.group_id, params.content);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_portrait":
            await setGroupPortrait(params.group_id, params.file);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_ban":
            await setGroupBan(params.group_id, params.user_id, params.duration ?? 600);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_whole_ban":
            await setGroupWholeBan(params.group_id, params.enable ?? true);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_kick":
            await setGroupKick(params.group_id, params.user_id, params.reject_add_request ?? false);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_admin":
            await setGroupAdmin(params.group_id, params.user_id, params.enable ?? true);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_card":
            await setGroupCard(params.group_id, params.user_id, params.card);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "set_group_special_title":
            await setGroupSpecialTitle(params.group_id, params.user_id, params.special_title, params.duration ?? -1);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "delete_msg":
            await deleteMsg(params.message_id);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
          case "get_group_info": {
            const data = await getGroupInfo(params.group_id);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }] };
          }
          case "get_group_member_list": {
            const data = await getGroupMemberList(params.group_id);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }] };
          }
          case "get_group_member_info": {
            const data = await getGroupMemberInfo(params.group_id, params.user_id);
            return { content: [{ type: "text", text: JSON.stringify({ ok: true, data }) }] };
          }
          default:
            return { content: [{ type: "text", text: `不支持的 action: ${params.action}` }] };
        }
      } catch (e: any) {
        return { content: [{ type: "text", text: `操作失败: ${e?.message}` }] };
      }
    },
  });

  api.registerTool({
    name: "onebot_run_script",
    description: "执行用户配置的 JS/TS 脚本（.mjs/.ts/.mts），脚本可调用 OneBot API（获取群历史、发图等）。用于定时任务中实现自定义逻辑（如 OG 图片生成、日报汇总）",
    parameters: {
      type: "object",
      properties: {
        scriptPath: { type: "string", description: "脚本路径，相对 process.cwd() 或绝对路径，支持 .mjs/.ts/.mts，如 ./daily-summary.mjs 或 ./daily-summary.ts" },
        groupIds: { type: "array", items: { type: "number" }, description: "要处理的群号列表" },
      },
      required: ["scriptPath"],
    },
    async execute(_id: string, params: { scriptPath: string; groupIds?: number[] }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      try {
        const mod = await loadScript(params.scriptPath);
        const fn = mod?.default ?? mod?.run ?? mod?.execute;
        if (typeof fn !== "function") {
          return { content: [{ type: "text", text: `脚本未导出 default/run/execute 函数` }] };
        }
        const ctx = {
          onebot: onebotClient,
          groupIds: params.groupIds ?? [],
        };
        const result = await fn(ctx);
        const out = result != null ? String(result) : "执行完成";
        return { content: [{ type: "text", text: out }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `脚本执行失败: ${e?.message}` }] };
      }
    },
  });

  // ── 通用 OneBot API 代理工具 ──────────────────────────
  api.registerTool({
    name: "onebot_api",
    description: `通用 OneBot API 调用。直接传入 OneBot action 名称和参数，无需逐个封装。
支持 OneBot v11 标准 API 及 NapCat/Lagrange 扩展 API。
action 即 OneBot 协议的 API 端点名（如 send_group_msg、get_group_list、set_group_ban 等），
params 为该 API 的参数对象，字段与 OneBot 协议文档一致。
返回 OneBot 响应的完整 JSON（含 retcode、data 等）。

常用 action 示例：
- get_login_info: 获取登录号信息（无参数）
- get_group_list: 获取群列表（无参数）
- get_friend_list: 获取好友列表（无参数）
- get_group_member_list: { group_id }
- get_group_member_info: { group_id, user_id }
- send_group_msg: { group_id, message }
- send_private_msg: { user_id, message }
- send_group_forward_msg: { group_id, messages }
- set_group_ban: { group_id, user_id, duration }
- set_group_card: { group_id, user_id, card }
- set_friend_add_request: { flag, approve }
- set_group_add_request: { flag, sub_type, approve }
- get_stranger_info: { user_id }
- get_msg: { message_id }
- delete_msg: { message_id }
- .can_send_image / .can_send_record: 检查能力
- NapCat 扩展: get_group_file_list, get_group_root_files, mark_msg_as_read 等

完整 API 列表参考 NapCat 文档或 OneBot v11 协议。`,
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", description: "OneBot API action 名称，如 get_group_list、send_group_msg" },
        params: {
          type: "object",
          description: "API 参数对象，字段与 OneBot 协议文档一致",
          additionalProperties: true,
        },
        timeout: { type: "number", description: "超时毫秒数，默认 15000" },
      },
      required: ["action"],
    },
    async execute(_id: string, args: { action: string; params?: Record<string, unknown>; timeout?: number }) {
      const w = getWs();
      if (!w || w.readyState !== WebSocket.OPEN) {
        return { content: [{ type: "text", text: "OneBot 未连接" }] };
      }
      try {
        const res = await sendOneBotAction(w, args.action, args.params ?? {}, undefined, args.timeout ?? 15000);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
          metadata: { retcode: res?.retcode, action: args.action },
        };
      } catch (e: any) {
        return { content: [{ type: "text", text: `API 调用失败: ${e?.message}` }] };
      }
    },
  });
}
