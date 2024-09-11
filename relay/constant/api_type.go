package constant

import (
	"one-api/common"
)

const (
	APITypeOpenAI = iota
	APITypeAnthropic
	APITypeGemini
	APITypeAIProxyLibrary
	
	APITypeDummy // this one is only for count, do not add any channel after this
)

func ChannelType2APIType(channelType int) (int, bool) {
	apiType := -1
	switch channelType {
	case common.ChannelTypeOpenAI:
		apiType = APITypeOpenAI
	case common.ChannelTypeAnthropic:
		apiType = APITypeAnthropic
	case common.ChannelTypeGemini:
		apiType = APITypeGemini
	}
	if apiType == -1 {
		return APITypeOpenAI, false
	}
	return apiType, true
}