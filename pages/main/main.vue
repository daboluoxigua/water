<template>
	<view class="content">
		<view v-if="hasLogin" class="hello">
			<view class="title">
				您好 {{userName}}，您已成功登录。
			</view>
			<view class="ul">
				<view>这是 uni-app 带登录模板的示例App首页。</view>
				<view>在 “我的” 中点击 “退出” 可以 “注销当前账户”</view>
			</view>
		</view>
		<button type="primary" open-type="getUserInfo" @getuserinfo="getuserinfo" withCredentials="true">微信登录</button>
		<view v-if="!hasLogin" class="hello">
			<van-popup :show="show" class='loginPop'>
				<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
					<van-icon name="manager-o" />手机</button>
			</van-popup>
		</view>

	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'

	export default {
		data() {
			return {
				show: true,
				// hasLogin: this.$store.state.asLogin
				hasLogin: uni.getStorageSync('hasLogin')
			}
		},
		computed: mapState(['forcedLogin', 'userName']),
		onLoad() {
			// 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
			wx.getSetting({
				success(res) {
					console.log(res)
					if (!res.authSetting['scope.record']) {
						wx.authorize({
							scope: 'scope.record',
							success() {
								// 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
								wx.startRecord()
							}
						})
					}
				}
			})
		},
		onShow() {
		},
		methods: {
			getuserinfo(res1) {
				console.log('res1', res1);
				wx.login({
					success: function(res2) {
						console.log('res2', res2)
						//获取 sessionKey
						wx.request({
							url: 'https:///hoa.hcoder.net/xcxencode/?c=sk&appid=wxbb7f9f1f2c6f4f33&secret=739b970b832f0df158f54c494a08e440&code=' +
								res2.code,
							success: function(res3) {
								console.log('res3', res3);
								//记录到本地
								try {
									uni.setStorageSync('sk', res3.data.session_key);
									uni.setStorageSync('openid', res3.data.openid);
								} catch (e) {
									//TODO handle the exception
								}
								uni.hideLoading();
								//以下步骤可以获取加密信息，需要授权
								//获取加密信息
								if (!res1.detail.iv) {
									uni.showToast({
										title: "您取消了授权,登录失败",
										icon: "none"
									});
									return false;
								}
								try {
									var sessionKey = uni.getStorageSync('sk');
									console.log(sessionKey);
								} catch (e) {
									//TODO handle the exception
								}
								uni.request({
									/**
									* $appid         = $_POST['appid'];
									 $sessionKey    = $_POST['sessionKey'];
									 $encryptedData = $_POST['encryptedData'];
									 $iv            = $_POST['iv'];
									*/
									method: "POST",
									url: 'https:///hoa.hcoder.net/xcxencode/',
									header: {
										'content-type': 'application/x-www-form-urlencoded'
									},
									data: {
										appid: "wxbb7f9f1f2c6f4f33",
										sessionKey: sessionKey,
										iv: res1.detail.iv,
										encryptedData: res1.detail.encryptedData
									},
									success: function(res4) {
										//"﻿﻿﻿{"openId":"oS6of0V0rdp9nY_BuvCnQUasOHYc","nickName":"深海",
										//"gender":1,"language":"zh_CN","city":"Xi'an","province":"Shaanxi",
										//"country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/7iags6YD4enyU"
										console.log(res4);
										//至此登录完成
									}
								});
							}
						})
					}
				});
			},
			getPhoneNumber(e) {
				if (e.detail.errMsg == 'getPhoneNumber:ok') {
					this.show = false;
					uni.setStorageSync('hasLogin', true)
					wx.login({
						success(res) {
							if (res.code) {
								// 发起网络请求
								wx.request({
									url: 'https://test.com/onLogin',
									data: {
										code: res.code
									}
								})
							} else {
								console.log('登录失败！' + res.errMsg)
							}
						}
					})
				}
				console.log(e.detail.errMsg)
				console.log(e.detail.iv)
				console.log(e.detail.encryptedData)
			}
		},

	}
</script>

<style lang="scss" scoped="">
	.hello {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.title {
		color: #8f8f94;
		margin-top: 50upx;
	}

	.ul {
		font-size: 30upx;
		color: #8f8f94;
		margin-top: 50upx;
	}

	.ul>view {
		line-height: 50upx;
	}
</style>
