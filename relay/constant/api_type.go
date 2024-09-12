package constant

import (
	"one-api/common"
)

const (
	APITypeOpenAI = iota
	
	APITypeDummy // this one is only for count, do not add any channel after this
)

func ChannelType2APIType(channelType int) (int, bool) {
	apiType := -1
	switch channelType {
	case common.ChannelTypeOpenAI:
		apiType = APITypeOpenAI
		if apiType == -1 {
			return APITypeOpenAI, false
		}
	}
	return apiType, true
}