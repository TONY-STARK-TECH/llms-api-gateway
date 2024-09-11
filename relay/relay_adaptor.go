package relay

import (
	commonconstant "one-api/constant"
	"one-api/relay/channel"
	"one-api/relay/channel/claude"
	"one-api/relay/channel/gemini"
	"one-api/relay/channel/openai"
	"one-api/relay/constant"
)

func GetAdaptor(apiType int) channel.Adaptor {
	switch apiType {
	case constant.APITypeAnthropic:
		return &claude.Adaptor{}
	case constant.APITypeGemini:
		return &gemini.Adaptor{}
	case constant.APITypeOpenAI:
		return &openai.Adaptor{}
	}
	return nil
}

func GetTaskAdaptor(platform commonconstant.TaskPlatform) channel.TaskAdaptor {
	switch platform {
		// case commonconstant.TaskPlatformSuno:
		// 	return &suno.TaskAdaptor{}
	}
	return nil
}
