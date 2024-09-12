package constant

import (
	"one-api/common"
)

var StreamingTimeout = common.GetEnvOrDefault("STREAMING_TIMEOUT", 30)

// ForceStreamOption 覆盖请求参数，强制返回usage信息
var ForceStreamOption = common.GetEnvOrDefaultBool("FORCE_STREAM_OPTION", true)

var GetMediaToken = common.GetEnvOrDefaultBool("GET_MEDIA_TOKEN", true)

var GetMediaTokenNotStream = common.GetEnvOrDefaultBool("GET_MEDIA_TOKEN_NOT_STREAM", true)