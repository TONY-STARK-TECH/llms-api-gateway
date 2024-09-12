<img width="1379" alt="image" src="https://github.com/user-attachments/assets/2ff4198b-3468-4ab6-8312-5efec672ccf9">

# 主要变更

此分叉版本的主要变更如下：

1. 极简 `UI` 界面
2. 移除 `不必要` 的功能
3. 支持微信支付，配置即可使用
4. 只做 OpenAI 官方直连代理，不支持其他大模型 [专业]
5. 官方中转直连，接口耗时降低至 `500ms` 左右

<img width="1379" alt="image" src="https://github.com/user-attachments/assets/4d2dab48-1ea5-40ed-ac40-2e32cb21547c">

<img width="1379" alt="image" src="https://github.com/user-attachments/assets/3b8ba9de-f06d-482a-9db7-ce3441551211">

## 新增配置项目

+ `STREAMING_TIMEOUT`：设置流式一次回复的超时时间，默认为 30 秒。
+ `FORCE_STREAM_OPTION`：是否覆盖客户端stream_options参数，请求上游返回流模式usage，默认为 `true`，建议开启，不影响客户端传入stream_options
参数返回结果。
+ `GET_MEDIA_TOKEN`：是统计图片token，默认为 `true`，关闭后将不再在本地计算图片token，可能会导致和上游计费不同，此项覆盖
`GET_MEDIA_TOKEN_NOT_STREAM` 选项作用。
+ `GET_MEDIA_TOKEN_NOT_STREAM`：是否在非流（`stream=false`）情况下统计图片token，默认为 `true`。

## 部署

```shell
cd web && pnpm install && pnpm run build
cd ..

env GOOS=linux GOARCH=amd64  CGO_ENABLED=0 go build -ldflags "-s -w" -o api-server
```

### 部署要求

+ 本地数据库（默认）：SQLite（Docker 部署默认使用 SQLite，必须挂载 `/data` 目录到宿主机）
+ 远程数据库：MySQL 版本 >= 5.7.8，PgSQL 版本 >= 9.6

### 为什么有的时候没有重试

这些错误码不会重试：400，504，524

### 我想让400也重试

在`渠道->编辑`中，将`状态码复写`改为

```json
{
  "400": "500"
}
```

## 相关项目

+ [neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool)：用key查询使用额度

## 鸣谢

One API
New API
