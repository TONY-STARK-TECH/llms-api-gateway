package common

import (
	"one-api/common"
	"one-api/relay/constant"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type RelayInfo struct {
	ChannelType          int
	ChannelId            int
	TokenId              int
	UserId               int
	Group                string
	TokenUnlimited       bool
	StartTime            time.Time
	FirstResponseTime    time.Time
	setFirstResponse     bool
	ApiType              int
	IsStream             bool
	RelayMode            int
	UpstreamModelName    string
	OriginModelName      string
	RequestURLPath       string
	ApiVersion           string
	PromptTokens         int
	ApiKey               string
	Organization         string
	BaseUrl              string
	SupportStreamOptions bool
	ShouldIncludeUsage   bool
}

func GenRelayInfo(c *gin.Context) *RelayInfo {
	channelType := c.GetInt("channel_type")
	channelId := c.GetInt("channel_id")

	tokenId := c.GetInt("token_id")
	userId := c.GetInt("id")
	group := c.GetString("group")
	tokenUnlimited := c.GetBool("token_unlimited_quota")
	startTime := time.Now()
	// firstResponseTime = time.Now() - 1 second

	apiType, _ := constant.ChannelType2APIType(channelType)

	info := &RelayInfo{
		RelayMode:         constant.Path2RelayMode(c.Request.URL.Path),
		BaseUrl:           c.GetString("base_url"),
		RequestURLPath:    c.Request.URL.String(),
		ChannelType:       channelType,
		ChannelId:         channelId,
		TokenId:           tokenId,
		UserId:            userId,
		Group:             group,
		TokenUnlimited:    tokenUnlimited,
		StartTime:         startTime,
		FirstResponseTime: startTime.Add(-time.Second),
		OriginModelName:   c.GetString("original_model"),
		UpstreamModelName: c.GetString("original_model"),
		ApiType:           apiType,
		ApiVersion:        c.GetString("api_version"),
		ApiKey:            strings.TrimPrefix(c.Request.Header.Get("Authorization"), "Bearer "),
		Organization:      c.GetString("channel_organization"),
	}
	if info.BaseUrl == "" {
		info.BaseUrl = common.ChannelBaseURLs[channelType]
	}
	if info.ChannelType == common.ChannelTypeOpenAI {
		info.SupportStreamOptions = true
	}
	return info
}

func (info *RelayInfo) SetPromptTokens(promptTokens int) {
	info.PromptTokens = promptTokens
}

func (info *RelayInfo) SetIsStream(isStream bool) {
	info.IsStream = isStream
}

func (info *RelayInfo) SetFirstResponseTime() {
	if !info.setFirstResponse {
		info.FirstResponseTime = time.Now()
		info.setFirstResponse = true
	}
}