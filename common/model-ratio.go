package common

import (
	"encoding/json"
	"strings"
	"sync"
)

const (
	USD2RMB = 7.3 // 暂定 1 USD = 7.3 RMB
	USD     = 500 // $0.002 = 1 -> $1 = 500
	RMB     = USD / USD2RMB
)

var defaultModelRatio = map[string]float64{
	"gpt-4":          15,
	"gpt-4o":                    2.5,  // $0.01 / 1K tokens
	"gpt-4o-2024-08-06":         1.25, // $0.01 / 1K tokens
	"gpt-4o-mini":               0.075,
	"gpt-4o-mini-2024-07-18":    0.075,
	"gpt-4-turbo":               5,    // $0.01 / 1K tokens
	"gpt-3.5-turbo":             0.25, // $0.0015 / 1K tokens
	"whisper-1":                      15,  // $0.006 / minute -> $0.006 / 150 words -> $0.006 / 200 tokens -> $0.03 / 1k tokens
	"tts-1":                          7.5, // 1k characters -> $0.015
	"tts-1-hd":                       15,  // 1k characters -> $0.03
}

var defaultModelPrice = map[string]float64{
	"dall-e-3":          0.04,
}

var (
	modelPriceMap      map[string]float64 = nil
	modelPriceMapMutex                    = sync.RWMutex{}
)
var (
	modelRatioMap      map[string]float64 = nil
	modelRatioMapMutex                    = sync.RWMutex{}
)

var CompletionRatio map[string]float64 = nil
var defaultCompletionRatio = map[string]float64{}

func GetModelPriceMap() map[string]float64 {
	modelPriceMapMutex.Lock()
	defer modelPriceMapMutex.Unlock()
	if modelPriceMap == nil {
		modelPriceMap = defaultModelPrice
	}
	return modelPriceMap
}

func ModelPrice2JSONString() string {
	GetModelPriceMap()
	jsonBytes, err := json.Marshal(modelPriceMap)
	if err != nil {
		SysError("error marshalling model price: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateModelPriceByJSONString(jsonStr string) error {
	modelPriceMapMutex.Lock()
	defer modelPriceMapMutex.Unlock()
	modelPriceMap = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &modelPriceMap)
}

// GetModelPrice 返回模型的价格，如果模型不存在则返回-1，false
func GetModelPrice(name string, printErr bool) (float64, bool) {
	GetModelPriceMap()
	price, ok := modelPriceMap[name]
	if !ok {
		if printErr {
			SysError("model price not found: " + name)
		}
		return -1, false
	}
	return price, true
}

func GetModelRatioMap() map[string]float64 {
	modelRatioMapMutex.Lock()
	defer modelRatioMapMutex.Unlock()
	if modelRatioMap == nil {
		modelRatioMap = defaultModelRatio
	}
	return modelRatioMap
}

func ModelRatio2JSONString() string {
	GetModelRatioMap()
	jsonBytes, err := json.Marshal(modelRatioMap)
	if err != nil {
		SysError("error marshalling model ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateModelRatioByJSONString(jsonStr string) error {
	modelRatioMapMutex.Lock()
	defer modelRatioMapMutex.Unlock()
	modelRatioMap = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &modelRatioMap)
}

func GetModelRatio(name string) float64 {
	GetModelRatioMap()
	ratio, ok := modelRatioMap[name]
	if !ok {
		SysError("model ratio not found: " + name)
		return 30
	}
	return ratio
}

func DefaultModelRatio2JSONString() string {
	jsonBytes, err := json.Marshal(defaultModelRatio)
	if err != nil {
		SysError("error marshalling model ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func GetDefaultModelRatioMap() map[string]float64 {
	return defaultModelRatio
}

func CompletionRatio2JSONString() string {
	if CompletionRatio == nil {
		CompletionRatio = defaultCompletionRatio
	}
	jsonBytes, err := json.Marshal(CompletionRatio)
	if err != nil {
		SysError("error marshalling completion ratio: " + err.Error())
	}
	return string(jsonBytes)
}

func UpdateCompletionRatioByJSONString(jsonStr string) error {
	CompletionRatio = make(map[string]float64)
	return json.Unmarshal([]byte(jsonStr), &CompletionRatio)
}

func GetCompletionRatio(name string) float64 {
	if strings.HasPrefix(name, "gpt-3.5") {
		if name == "gpt-3.5-turbo" || strings.HasSuffix(name, "0125") {
			return 3
		}
		if strings.HasSuffix(name, "1106") {
			return 2
		}
		return 4.0 / 3.0
	}
	if strings.HasPrefix(name, "gpt-4") {
		if strings.HasPrefix(name, "gpt-4-turbo") || strings.HasSuffix(name, "preview") {
			return 3
		}
		if strings.HasPrefix(name, "gpt-4o") {
			if strings.HasPrefix(name, "gpt-4o-mini") || name == "gpt-4o-2024-08-06" {
				return 4
			}
			return 3
		}
		return 2
	}
	if ratio, ok := CompletionRatio[name]; ok {
		return ratio
	}
	return 3
}

func GetCompletionRatioMap() map[string]float64 {
	if CompletionRatio == nil {
		CompletionRatio = defaultCompletionRatio
	}
	return CompletionRatio
}
