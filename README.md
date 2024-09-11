<img width="1379" alt="image" src="https://github.com/user-attachments/assets/2ff4198b-3468-4ab6-8312-5efec672ccf9">

# 主要变更

此分叉版本的主要变更如下：

1. 极简 `UI` 界面
2. 移除 `不必要` 的功能
3. 支持微信支付，配置即可使用

## 模型支持

额外支持以下模型：

1. 第三方模型 **gps** （gpt-4-gizmo-*）
2. 智谱glm-4v，glm-4v识图
3. Anthropic Claude 3
4. [Ollama](https://github.com/ollama/ollama?tab=readme-ov-file)，添加渠道时，密钥可以随便填写，默认的请求地址是[http://localhost:11434](http://localhost:11434)，如果需要修改请在渠道中修改
5. [Midjourney-Proxy(Plus)](https://github.com/novicezk/midjourney-proxy)接口，[对接文档](docs/Midjourney.md)
6. [零一万物](https://platform.lingyiwanwu.com/)
7. 自定义渠道，支持填入完整调用地址
8. [Suno API](https://github.com/Suno-API/Suno-API) 接口，[对接文档](docs/Suno.md)
9. Rerank模型，目前支持[Cohere](https://cohere.ai/)和[Jina](https://jina.ai/)，[对接文档](docs/Rerank.md)
10. Dify
11. Vertex AI，目前兼容Claude，Gemini，Llama3.1

您可以在渠道中添加自定义模型gpt-4-gizmo-*，此模型并非OpenAI官方模型，而是第三方模型，使用官方key无法调用。

## 比原版One API多出的配置

+ `STREAMING_TIMEOUT`：设置流式一次回复的超时时间，默认为 30 秒。

+ `DIFY_DEBUG`：设置 Dify 渠道是否输出工作流和节点信息到客户端，默认为 `true`。

+ `FORCE_STREAM_OPTION`：是否覆盖客户端stream_options参数，请求上游返回流模式usage，默认为 `true`，建议开启，不影响客户端传入stream_options
参数返回结果。
+ `GET_MEDIA_TOKEN`：是统计图片token，默认为 `true`，关闭后将不再在本地计算图片token，可能会导致和上游计费不同，此项覆盖
`GET_MEDIA_TOKEN_NOT_STREAM` 选项作用。
+ `GET_MEDIA_TOKEN_NOT_STREAM`：是否在非流（`stream=false`）情况下统计图片token，默认为 `true`。

+ `UPDATE_TASK`：是否更新异步任务（Midjourney、Suno），默认为 `true`，关闭后将不会更新任务进度。

+ `GEMINI_MODEL_MAP`：Gemini模型指定版本(v1/v1beta)，使用“模型:版本”指定，","分隔，例如：-e GEMINI_MODEL_MAP="gemini-1.5-pro-latest:v1beta,gemini-1.5-pro-001:v1beta"，为空则使用默认配置

+ `COHERE_SAFETY_SETTING`：Cohere模型[安全设置](https://docs.cohere.com/docs/safety-modes#overview)，可选值为 `NONE`, `CONTEXTUAL`，
`STRICT`，默认为 `NONE`。

## 部署

### 部署要求

+ 本地数据库（默认）：SQLite（Docker 部署默认使用 SQLite，必须挂载 `/data` 目录到宿主机）
+ 远程数据库：MySQL 版本 >= 5.7.8，PgSQL 版本 >= 9.6

### 缓存设置方法

1. `REDIS_CONN_STRING`：设置之后将使用 Redis 作为缓存使用。
    + 例子：`REDIS_CONN_STRING=redis://default:redispw@localhost:49153`
2. `MEMORY_CACHE_ENABLED`：启用内存缓存（如果设置了`REDIS_CONN_STRING`，则无需手动设置），会导致用户额度的更新存在一定的延迟，可选值为 `true` 和 `false`，未设置则默认为 `false`。
    + 例子：`MEMORY_CACHE_ENABLED=true`

### 为什么有的时候没有重试

这些错误码不会重试：400，504，524

### 我想让400也重试

在`渠道->编辑`中，将`状态码复写`改为

```json
{
  "400": "500"
}
```

可以实现400错误转为500错误，从而重试

## 相关项目

+ [neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool)：用key查询使用额度

```shell
env GOOS=linux GOARCH=amd64  CGO_ENABLED=0 go build -ldflags "-s -w" -o api-server
```
