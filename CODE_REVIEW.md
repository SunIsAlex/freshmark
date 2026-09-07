# VPS 分支代码审查与修复

审查日期：2026-09-08。基线：`vps` / `437f27fbc77fab182f7fbae161d66732b5987379`。
检查范围：VPS HTTP 适配、文件存储、认证与评论逻辑、构建 worker、PDF 构建、邮件桥接、部署脚本与 Nginx 配置。修复保留在本地工作区，未推送、未部署。

## 已修复的问题

| 优先级 | 位置 | 问题与影响 | 修复 |
| --- | --- | --- | --- |
| P1 | `lib/build-worker-pool.mjs` | worker 意外以退出码 0 结束时不处理；协议异常时提前丢失当前任务；关闭时仅拒绝排队任务。构建 Promise 可能长期不结束。失败后仍可向死亡 worker 派发任务。 | 任意非主动退出使整个池进入失败状态；拒绝运行中、排队和后续任务；终止 worker；捕获消息序列化错误。 |
| P1 | `ops/freshmark-mailer/server.mjs` | chunked 请求超过限制后仍不断累积字符串，直到客户端结束才响应；以字符数计算 4096 限制，无法限制 UTF-8 字节数。 | 按字节计数，超限立即清空缓冲、返回 413 并关闭连接，停止积累后续数据。 |
| P2 | `server/server.mjs` | 从默认异步迭代器抛出超限异常会销毁请求流，可能在写入 413 前断开连接。 | 退出迭代时保留 socket，返回 JSON 413 并关闭连接。 |
| P2 | `ops/freshmark-vps/deploy.sh` | 健康检查虽然有 20 次重试，但每次 curl 没有超时；服务接收连接却不响应时，脚本无法及时进入回滚。 | 每次连接超时 2 秒、总耗时限制 3 秒，保留最多 20 次重试。 |
| P2 | `ops/freshmark-vps/nginx-site.conf` | 验证码接口落入普通 API 限流；限流使用默认 503；普通 `/api/` 前缀可被静态文件正则匹配覆盖。 | 添加验证码精确 location，使用认证限流区；返回 429；API 前缀使用 `^~`。 |
| P2 | `scripts/build.mjs`、`lib/pdf.mjs` | 在清理/改写输出及耗时图片处理后才发现 WeasyPrint 缺失，浪费构建工作并破坏旧输出。 | 在创建 worker、改写输出前探测 PDF 渲染器，并复用探测结果。此项只保护依赖预检失败，不宣称所有构建失败都能保留输出。 |
| P2 | `scripts/build.mjs`、`scripts/dev.mjs`、`scripts/new.mjs` | 声明支持 Node 20.9，但使用该版本没有的 `import.meta.dirname`。 | 用 `fileURLToPath(new URL("../", import.meta.url))` 解析项目目录。 |
| P2 | `ops/freshmark-mailer/server.mjs` | sendmail 提前退出时，stdin 的错误事件未处理，可能终止邮件服务进程。 | 捕获 stdin 错误，清理超时及子进程，将失败交给请求错误处理。 |

另收紧 `FRESHMARK_WORKERS` 校验，拒绝 `1.5`、`2workers` 等原先会被截断接受的输入。邮件服务新增可选 `MAILER_PORT`（默认仍为 8788），便于使用临时端口隔离测试。

## 验证结果

- `npm ci --include=dev` 成功；安装时 npm audit 报告 0 个已知漏洞。这不等同于完整安全审计。
- `npm run lint` 成功（项目的 lint 实际为语法检查）。
- 下列测试命令执行 37 项，全部通过：

```sh
node --test tests/auth.test.mjs tests/comments.test.mjs tests/file-store.test.mjs tests/deploy-script.test.mjs tests/netlify-views.test.mjs tests/templates.test.mjs tests/build-worker-pool.test.mjs tests/vps-server.test.mjs tests/build-preflight.test.mjs
```

- 新增 10 项测试，覆盖 worker 失败及关闭、错误参数、真实 HTTP chunked 请求、UTF-8 超限提前响应、部署重试边界和 PDF 依赖失败时输出不变。
- `npm test` 已尝试，因 Termux 环境缺少 WeasyPrint 在构建预检处失败。因此未通过完整构建及 `tests/static-build.test.mjs`，不能把此次结果称为全量测试通过。
- 环境未安装 Nginx，也未执行 systemd、Postfix 集成或真实 VPS 部署。邮件测试不发送邮件，sendmail stdin 错误处理仅经过代码检查和语法验证。
- 当前使用 Node 26.4.0，未在 Node 20.9 上实际运行兼容性测试。

## 运行边界与后续检查

1. 文件存储的互斥锁位于单个实例内。当前单 API 进程架构适用；多个进程或多个 factory 同时写同一目录不具备跨实例条件写保证。扩展到多进程前需要数据库或跨进程事务锁。
2. 注册与会话记录仅在访问时删除过期项；从未再次访问的过期数据可能持续占用磁盘。后续可增加带并发保护的定期清理，不能直接按文件时间批量删除认证数据。
3. VPS 限流依赖 Nginx，Netlify handler 导出的平台限流配置不会被本地 Node 自动执行。保持 API 仅监听回环地址，并安装 `nginx-rate-limits.conf`。
4. 在有 WeasyPrint 和中文字体的构建环境执行 `npm ci --include=dev && npm test`；在 VPS 检查 `nginx -t`，再验证 429、正常注册、登录、评论及部署失败回滚。生产发送邮件、服务重启及部署均未在本次执行。

首次中断构建留下的 `public/` 和 `.freshmark-cache/` 是本地忽略文件；`public/` 不代表可部署的完整产物。取得 PDF 依赖后应重新完成全量构建。
