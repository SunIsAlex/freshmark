# 分词器实测与选择

评测日期：2026-09-16。选择：**Qwen3.5（Qwen/Qwen3.5-9B 的 tokenizer）**。只加载分词器文件，不加载模型权重。

## 方法与范围

- 固定 60 个成语和 60 个中文技术词，见 [测试样本](tests/fixtures/tokenizer-evaluation.json)。比较后未调整样本或评分规则。
- 48 个样本使用项目中的第一个真实正文文本节点，其余 72 个使用统一语境“这里提到［词语］，请结合上下文理解。”。“有的放矢”采用原文章完整句子。
- 主要指标：目标词恰好对应一个独立 token，且没有吞并词外字符的数量。评分相同依次比较完整成语数量、目标词涉及的 token 数量、中文文章 token 总量。
- 另测全部 120 个词的孤立输入，检查选择是否过度依赖上下文模板；结果同样是 Qwen3.5 第一。
- 全文测试覆盖 82 篇中英文文章、15953 个正文文本节点；排除代码、公式及非内容隐藏标记，与文章 token 构建范围一致。中文路由正文包含 114242 个 Unicode 字符（包括其中的英文、标点）。
- 检查全文 token 字节可还原原文或其 NFC 形式，并对中文、组合音标、罕见字、emoji、换行及特殊 token 字面量检查显示文本无损。所有五个候选均通过。

## 结果

| 分词器 | 完整成语 / 60 | 完整术语 / 60 | 合计 / 120 | 孤立输入完整词 / 120 | 中文文章 token 数 |
|---|---:|---:|---:|---:|---:|
| Qwen/Qwen3.5-9B | 19 | 9 | 28 | 29 | 66,421 |
| deepseek-ai/DeepSeek-V3.2 | 9 | 12 | 21 | 21 | 64,883 |
| zai-org/GLM-4.5 | 10 | 7 | 17 | 17 | 67,271 |
| Qwen/Qwen3-8B | 7 | 6 | 13 | 13 | 72,382 |
| gpt-tokenizer/o200k_base | 0 | 4 | 4 | 4 | 79,000 |

Qwen3.5 在这组样本的词语完整性上最好；DeepSeek-V3.2 的术语完整数量和中文 token 总量更优。项目当前更重视成语、词语的阅读边界，因此选择 Qwen3.5。相对原 o200k_base，中文文章 token 数减少约 15.9%；英文文章从 42,825 增至 43,532（约增加 1.7%）。

## 实际切分示例

以下是目标词所在的显示片段。片段可能包含词外字符；同一个 Unicode 字符对应多个 token 时仍完整显示，保留其全部 ID。

| 分词器 | 有的放矢 | 循序渐进 | 举一反三 |
|---|---|---|---|
| Qwen/Qwen3.5-9B | 有的 · 放矢 | 循序渐进 | 举一反三 |
| deepseek-ai/DeepSeek-V3.2 | 有的 · 放 · 矢 | 循序渐进 | 举 · 一反 · 三 |
| zai-org/GLM-4.5 | 有的 · 放 · 矢 | 循序渐进 | 举 · 一 · 反 · 三 |
| Qwen/Qwen3-8B | 有的 · 放 · 矢 | 循 · 序 · 渐 · 进 | 举 · 一 · 反 · 三 |
| gpt-tokenizer/o200k_base | ，有 · 的 · 放 · 矢 | 循 · 序 · 渐 · 进 | 举 · 一 · 反 · 三 |

原句：“可见，在解决问题前，查看结果的形式，有的放矢，是非常重要的。”来自 [数学竞赛文章](content/posts/math/2026-math-olympiad-preliminary-a/index.md)。

**五个候选都没有把“有的放矢”编码成单个 token。** Qwen3.5 的结果是“有的｜放矢”（ID 97332、144318），没有额外合并成语或伪造模型边界。要强制完整成语，需要另加按词显示层。

这是针对本项目的小规模固定样本比较，不是通用中文分词准确率，也不评价模型能力。单 token 数量不能直接代表所有语义边界质量；词语列表和上下文选择会影响排序。

## 来源与复现

运行 `npm run build` 后执行 `npm run benchmark:tokenizers`。首次仅下载下列固定 revision 的 tokenizer 文件，后续读取本地缓存。完整逐项记录保存为 `.freshmark-cache/tokenizer-benchmark/results.json`。所有 Hugging Face 候选使用 `@huggingface/tokenizers@0.2.0`，基线使用 `gpt-tokenizer@4.0.0`。

- 基线：`gpt-tokenizer@4.0.0`，编码 `o200k_base`。
- [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218)，revision `b968826d9c46dd6066d109eabc6255188de91218`；tokenizer SHA-256：`aeb13307a71acd8fe81861d94ad54ab689df773318809eed3cbe794b4492dae4`。
- [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a)，revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`；tokenizer SHA-256：`5f9e4d4901a92b997e463c1f46055088b6cca5ca61a6522d1b9f64c4bb81cb42`。
- [deepseek-ai/DeepSeek-V3.2](https://huggingface.co/deepseek-ai/DeepSeek-V3.2/tree/a7e62ac04ecb2c0a54d736dc46601c5606cf10a6)，revision `a7e62ac04ecb2c0a54d736dc46601c5606cf10a6`；tokenizer SHA-256：`cd050be35cae877f8f0aa847f45aa87e23835a56ca32b29b28545597852784e5`。
- [zai-org/GLM-4.5](https://huggingface.co/zai-org/GLM-4.5/tree/cbb2c7cfb52fa128a9660cb1a7a78e017899e115)，revision `cbb2c7cfb52fa128a9660cb1a7a78e017899e115`；tokenizer SHA-256：`9340665016419c825c4bdabbcc9acc43b7ca2c68ce142724afa829abb1be5efd`。

测试样本 SHA-256：`28a3c140f822d8dbfd07e900e72934bb9bca58b0a41cdc8b39da228f5078e1ee`。

提取正文（JSON 序列化）SHA-256：`2cc61d46487326749355b3f7b23cc29353c9141447c6c54f2c466d81637eb606`。

生产构建使用 [本地词表及来源清单](vendor/tokenizer/source.json)，保留 Apache-2.0 许可证，加载时校验词表和配置的 SHA-256。原始文件未修改；仅将 tokenizer.json 做 gzip 压缩。完整分词器不会复制到 public/ 或浏览器包中；二进制文章只内嵌该文用到的解码条目，见 [二进制格式](TOKEN_FORMAT.md)。
