package common

import (
	"fmt"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	"github.com/gin-gonic/gin"
)

var StopFinishReason = "stop"

func GetFullRequestURL(baseURL string, requestURL string, channelType int) string {
	fullRequestURL := fmt.Sprintf("%s%s", baseURL, requestURL)
	return fullRequestURL
}

func GetAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString("api_version")
	}
	return apiVersion
}
