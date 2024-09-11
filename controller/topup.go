package controller

import (
	"fmt"
	"log"
	"net/http"
	"one-api/common"
	"one-api/constant"
	"one-api/model"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-pay/gopay"
	"github.com/go-pay/gopay/wechat"
)

type PayRequest struct {
	Amount        int    `json:"amount"`
}

type AmountRequest struct {
	Amount    int    `json:"amount"`
}

func GetPayClient() *wechat.Client {
	if constant.WeChatAppId == "" {
		return nil
	}

	client := wechat.NewClient(constant.WeChatAppId, constant.WeChatMerchantId, constant.WeChatApiV2Password, true)
	client.AddCertPemFileContent([]byte(constant.WeChatMerchantCert), []byte(constant.WeChatMerchantKey))
	return client
}

func getPayMoney(amount float64, group string) float64 {
	if !common.DisplayInCurrencyEnabled {
		amount = amount / common.QuotaPerUnit
	}
	// 别问为什么用float64，问就是这么点钱没必要
	topupGroupRatio := common.GetTopupGroupRatio(group)
	if topupGroupRatio == 0 {
		topupGroupRatio = 1
	}
	payMoney := amount * constant.Price * topupGroupRatio
	return payMoney
}

func getMinTopup() int {
	minTopup := constant.MinTopUp
	if !common.DisplayInCurrencyEnabled {
		minTopup = minTopup * int(common.QuotaPerUnit)
	}
	return minTopup
}

func RequestPay(c *gin.Context) {
	var req PayRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "参数错误"})
		return
	}
	if req.Amount < getMinTopup() {
		c.JSON(200, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", getMinTopup())})
		return
	}

	id := c.GetInt("id")
	group, err := model.CacheGetUserGroup(id)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}
	payMoney := getPayMoney(float64(req.Amount), group)
	if payMoney < 0.01 {
		c.JSON(200, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	callBackAddress := constant.ServerAddress + "/api/pay/notify"
	tradeNo := fmt.Sprintf("%s%d", common.GetRandomString(6), time.Now().Unix())
	tradeNo = fmt.Sprintf("USR%dNO%s", id, tradeNo)
	nonce := common.GetRandomString(32);
	client := GetPayClient()

	if client == nil {
		c.JSON(200, gin.H{"message": "error", "data": "当前管理员未配置支付信息"})
		return
	}

	// 初始化 BodyMap
	bm := make(gopay.BodyMap)
	bm.Set("nonce_str", nonce).
    Set("body", "余额充值").
    Set("out_trade_no", tradeNo).
    Set("total_fee", payMoney * 100).
    Set("notify_url", callBackAddress).
    Set("trade_type", wechat.TradeType_Native).
    Set("sign_type", wechat.SignType_MD5).
	Set("spbill_create_ip", "127.0.0.1")

	wxRsp, err := client.UnifiedOrder(c, bm)

	if err != nil {
		c.JSON(200, gin.H{"message": err.Error(), "data": "拉起支付失败"})
		return
	}

	ok, err := wechat.VerifySign(constant.WeChatApiV2Password, wechat.SignType_MD5, wxRsp)

	if err != nil || !ok {
		c.JSON(200, gin.H{"message": err.Error(), "data": "订单校验失败"})
		return
	}

	amount := req.Amount
	if !common.DisplayInCurrencyEnabled {
		amount = amount / int(common.QuotaPerUnit)
	}
	topUp := &model.TopUp{
		UserId:     id,
		Amount:     amount,
		Money:      payMoney,
		TradeNo:    tradeNo,
		CreateTime: time.Now().Unix(),
		Status:     "pending",
	}
	err = topUp.Insert()
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}
	c.JSON(200, gin.H{"message": "success", "data": wxRsp.CodeUrl })
}

// tradeNo lock
var orderLocks sync.Map
var createLock sync.Mutex

// LockOrder 尝试对给定订单号加锁
func LockOrder(tradeNo string) {
	lock, ok := orderLocks.Load(tradeNo)
	if !ok {
		createLock.Lock()
		defer createLock.Unlock()
		lock, ok = orderLocks.Load(tradeNo)
		if !ok {
			lock = new(sync.Mutex)
			orderLocks.Store(tradeNo, lock)
		}
	}
	lock.(*sync.Mutex).Lock()
}

// UnlockOrder 释放给定订单号的锁
func UnlockOrder(tradeNo string) {
	lock, ok := orderLocks.Load(tradeNo)
	if ok {
		lock.(*sync.Mutex).Unlock()
	}
}

func PayNotify(c *gin.Context) {
	// 异步通知，返回给微信平台的信息
	rsp := new(wechat.NotifyResponse) 
	client := GetPayClient()

	if client == nil {
		log.Println("回调失败 未找到配置信息")
		rsp.ReturnCode = gopay.FAIL
		rsp.ReturnMsg = gopay.FAIL
		// 此写法是 gin 框架返回微信的写法
		c.String(http.StatusBadRequest, "%s", rsp.ToXmlString())
		return 
	}

	notifyReq, err := wechat.ParseNotifyToBodyMap(c.Request)
	ok, err := wechat.VerifySign(constant.WeChatApiV2Password, wechat.SignType_MD5, notifyReq)

	if err != nil {
		log.Println("回调签名验证失败")
		rsp.ReturnCode = gopay.FAIL
		rsp.ReturnMsg = "回调签名验证失败"
		// 此写法是 gin 框架返回微信的写法
		c.String(http.StatusBadRequest, "%s", rsp.ToXmlString())
		return
	}

	if ok {
		OutTradeNo := notifyReq.Get("OutTradeNo")
		defer UnlockOrder(OutTradeNo)
		topUp := model.GetTopUpByTradeNo(OutTradeNo)

		if topUp == nil {
			rsp.ReturnCode = gopay.FAIL
			rsp.ReturnMsg = "支付回调未找到订单"
			log.Printf("支付回调未找到订单: %v", OutTradeNo)
			c.String(http.StatusOK, "%s", rsp.ToXmlString())
			return
		}

		if topUp.Status == "pending" {
			topUp.Status = "success"
			err := topUp.Update()

			if err != nil {
				rsp.ReturnCode = gopay.FAIL
				rsp.ReturnMsg = "支付回调更新订单失败"
				log.Printf("支付回调更新订单失败: %v", topUp)
				c.String(http.StatusOK, "%s", rsp.ToXmlString())
				return
			}
			
			err = model.IncreaseUserQuota(topUp.UserId, topUp.Amount*int(common.QuotaPerUnit))
			if err != nil {
				rsp.ReturnCode = gopay.FAIL
				rsp.ReturnMsg = "支付回调更新用户失败"
				log.Printf("支付回调更新用户失败: %v", topUp)
				c.String(http.StatusOK, "%s", rsp.ToXmlString())
				return
			}

			log.Printf("支付回调更新用户成功 %v", topUp)
			model.RecordLog(topUp.UserId, model.LogTypeTopup, fmt.Sprintf("使用在线充值成功，充值金额: %v，支付金额：%f", common.LogQuota(topUp.Amount*int(common.QuotaPerUnit)), topUp.Money))
		}
		rsp.ReturnCode = gopay.SUCCESS
		rsp.ReturnMsg = gopay.OK
	} else {
		rsp.ReturnCode = gopay.FAIL
		rsp.ReturnMsg = "异常回调"
		log.Printf("异常回调: %v", ok)
	}

	c.String(http.StatusOK, "%s", rsp.ToXmlString())
}

func RequestAmount(c *gin.Context) {
	var req AmountRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	if req.Amount < getMinTopup() {
		c.JSON(200, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", getMinTopup())})
		return
	}
	id := c.GetInt("id")
	group, err := model.CacheGetUserGroup(id)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}
	payMoney := getPayMoney(float64(req.Amount), group)
	if payMoney <= 0.01 {
		c.JSON(200, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}
	c.JSON(200, gin.H{"message": "success", "data": strconv.FormatFloat(payMoney, 'f', 2, 64)})
}
