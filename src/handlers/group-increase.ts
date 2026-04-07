/**
 * 新成员入群欢迎
 *
 * 支持：
 * 1. 简单文本模板（message），占位符：{name}、{userId}、{groupName}、{groupId}、{avatarUrl}
 * 2. 自定义脚本（script）：通过 loadScript 动态加载用户脚本，脚本导出 default/run/execute 函数
 *    函数接收 GroupIncreaseContext，返回 GroupIncreaseResult（或 void）
 *
 * 注意：旧版 command 字段（shell 执行）已废弃，改用 script 字段（动态 import）以通过插件安全检查。
 * 配置迁移：将 command + cwd 改为 script（脚本路径）+ cwd（可选）
 */

import type { OneBotMessage } from "../types.js";
import {
    sendGroupMsg,
    sendGroupImage,
    getStrangerInfo,
    getGroupMemberInfo,
    getGroupInfo,
    getAvatarUrl,
} from "../connection.js";
import { getRenderMarkdownToPlain } from "../config.js";
import { markdownToPlain } from "../markdown.js";
import { resolve } from "path";
import { loadScript } from "../load-script.js";

export interface GroupIncreaseContext {
    groupId: number;
    groupName: string;
    userId: number;
    userName: string;
    avatarUrl: string;
}

export interface GroupIncreaseResult {
    text?: string;
    imagePath?: string;
    imageUrl?: string;
}

async function resolveContext(groupId: number, userId: number): Promise<GroupIncreaseContext> {
    const [groupInfo, memberInfo] = await Promise.all([
        getGroupInfo(groupId),
        getGroupMemberInfo(groupId, userId),
    ]);
    const groupName = groupInfo?.group_name ?? String(groupId);
    let userName: string;
    if (memberInfo) {
        userName = (memberInfo.card || memberInfo.nickname || "").trim() || memberInfo.nickname || String(userId);
    } else {
        const stranger = await getStrangerInfo(userId);
        userName = stranger?.nickname?.trim() || String(userId);
    }
    return {
        groupId,
        groupName,
        userId,
        userName,
        avatarUrl: getAvatarUrl(userId),
    };
}

function applyTemplate(template: string, ctx: GroupIncreaseContext): string {
    return template
        .replace(/\{name\}/g, ctx.userName)
        .replace(/\{userId\}/g, String(ctx.userId))
        .replace(/\{groupName\}/g, ctx.groupName)
        .replace(/\{groupId\}/g, String(ctx.groupId))
        .replace(/\{avatarUrl\}/g, ctx.avatarUrl);
}

async function runScript(
    scriptPath: string,
    cwd: string | undefined,
    ctx: GroupIncreaseContext,
    logger?: any,
): Promise<GroupIncreaseResult> {
    const mod = await loadScript(scriptPath, { cwd });
    const fn = mod?.default ?? mod?.run ?? mod?.execute;
    if (typeof fn !== "function") {
        logger?.error?.(`[onebot] groupIncrease script: 脚本未导出 default/run/execute 函数`);
        return {};
    }
    const raw = await fn(ctx);
    if (!raw || typeof raw !== "object") return {};
    return {
        text: typeof raw.text === "string" ? raw.text : undefined,
        imagePath: typeof raw.imagePath === "string" ? raw.imagePath : undefined,
        imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    };
}

export async function handleGroupIncrease(api: any, msg: OneBotMessage): Promise<void> {
    const cfg = api.config;
    const gi = (cfg?.channels?.onebot as Record<string, unknown>)?.groupIncrease as Record<string, unknown> | undefined;
    if (!gi?.enabled) return;

    const groupId = msg.group_id as number;
    const userId = msg.user_id as number;

    let ctx: GroupIncreaseContext;
    try {
        ctx = await resolveContext(groupId, userId);
    } catch (e: any) {
        api.logger?.error?.(`[onebot] groupIncrease resolveContext failed: ${e?.message}`);
        return;
    }

    let result: GroupIncreaseResult = {};

    // 优先使用 script 字段（动态 import），兼容旧版 command 字段（也当作 script 路径处理）
    const script = ((gi?.script ?? gi?.command) as string | undefined)?.trim();
    const cwd = (gi?.cwd as string | undefined)?.trim();
    if (script) {
        try {
            result = await runScript(script, cwd, ctx, api.logger);
        } catch (e: any) {
            api.logger?.error?.(`[onebot] groupIncrease script failed: ${e?.message}`);
        }
    }

    const message = gi?.message as string | undefined;
    if (message?.trim() && !result.text && !script) {
        result.text = applyTemplate(message, ctx);
    }

    let text = (result.text ?? "").trim();
    if (text && getRenderMarkdownToPlain(cfg)) text = markdownToPlain(text);
    const imagePath = result.imagePath?.trim();
    const imageUrl = result.imageUrl?.trim();

    if (!text && !imagePath && !imageUrl) return;

    try {
        if (text) await sendGroupMsg(groupId, text);
        if (imagePath) {
            const baseDir = cwd || process.cwd();
            const abs = imagePath.startsWith("file://") || imagePath.startsWith("http://") || imagePath.startsWith("https://")
                ? imagePath
                : resolve(baseDir, imagePath);
            await sendGroupImage(groupId, abs);
        }
        if (imageUrl && !imagePath) await sendGroupImage(groupId, imageUrl);
        api.logger?.info?.(`[onebot] sent group welcome to ${groupId} for user ${userId} (${ctx.userName})`);
    } catch (e: any) {
        api.logger?.error?.(`[onebot] group welcome failed: ${e?.message}`);
    }
}
