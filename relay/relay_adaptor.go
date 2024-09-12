package relay

import (
	"one-api/relay/channel"
	"one-api/relay/channel/openai"
)

func GetAdaptor(apiType int) channel.Adaptor {
	return &openai.Adaptor{}
}