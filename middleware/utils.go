package middleware

import (
	"fmt"
	"one-api/common"

	"github.com/gin-gonic/gin"
)

func abortWithOpenAiMessage(c *gin.Context, statusCode int, message string) {
	userId := c.GetInt("id")
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"message": common.MessageWithRequestId(message, c.GetString(common.RequestIdKey)),
			"type":    "llms_api_error",
		},
	})
	c.Abort()
	common.LogError(c.Request.Context(), fmt.Sprintf("user %d | %s", userId, message))
}