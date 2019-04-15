<template>
	<view class="content">
		<!--地图容器-->
		<map id="myMap" :latitude="latitude" :longitude="longitude" :markers="markers" scale='12' :polyline="polyline"
		 show-location @markertap='markertap'>
		</map>
		<view class="text_box">
			<view class="text">{{distance}}</view>
		</view>
		<button type="primary" @tap="openLocation">导航</button>
		<button @tap="moveToLocation" class="page-body-button" type="primary">返回当前位置</button>
		<button @tap="chooseLocation" class="page-body-button" type="primary">选择地址</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				latitude: '',
				longitude: '',
				polyline: '', //途经点 格式：lat1,lng1;lat2,lng2;… 最大支持10个
				markers: [], //地图标记
				lng: [], //从服务器获取到的经纬度
				distance: '',
				Navlatitude: '', //地图选点后的经纬度
				Navlongitude: '', //地图选点后的经纬度
			}
		},
		onLoad() {
			this.qqmapsdk = new this.$QQMapWX({
				key: "SVDBZ-VAYKD-4ZB4Z-HZNP4-KZQEF-WZFHK"
			});
			this.mapCtx = wx.createMapContext('myMap')
		},
		onShow() {
			let that = this;

			// 从服务器获取的路径点 22.560284,113.88395
			this.lng = [{
					latitude: 22.53332,
					longitude: 113.93041
				},
				{
					latitude: 22.609391001,
					longitude: 114.029377912
				},
				{
					latitude: 22.560284,
					longitude: 113.88395
				},
				{
					latitude: 22.58176,
					longitude: 113.87376
				}
			];

			//获取当前地址，每次打开重置
			wx.getLocation({
				type: 'gcj02',
				success(res) {
					that.latitude = res.latitude
					that.longitude = res.longitude

					that.init() //初始化
				}
			});

		},
		methods: {
			init() {
				let that = this;

				//重置路径图
				this.polyline = '';
				// 导航用的经纬度 默认为坐标的第一组 用户点击标记点后执行markertap 修改为当前所选点
				this.Navlatitude = this.lng[0].latitude
				this.Navlongitude = this.lng[0].longitude

				//根据坐标设置markers标记
				that.lng.map((item, index) => {
					that.markers[index] = {
						id: index,
						width: 24,
						height: 26,
						latitude: item.latitude,
						longitude: item.longitude,
						label: {
							content: '站点' + (index + 1),
							textAlign: 'left',
							anchorX: -10
						},
						callout: {
							// content: res.result.address_component.street_number
						}
					}

					//第一个点和最后一个点用不同的图标
					if (index == that.lng.length - 1) {
						that.markers[index].iconPath = "../../static/img/sinaweibo.png";
						that.markers[index].label = {
							content: '最后一站',
							textAlign: 'left',
							anchorX: -10
						}
					} else {
						//设置途经点的样式
						that.markers[index].iconPath = "../../static/img/qq.png";

						//途经点路径
						that.polyline += item.latitude + ',' + item.longitude + ';'
					}
				})

				that.polyline = that.polyline.replace(/;$/gi, ""); //需要去掉最后一个分号 ;
				that.getDrivingRoute() //规划路线

			},
			//规划路线
			getDrivingRoute() {
				let that = this;
				//调用距离计算接口
				this.qqmapsdk.direction({
					mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
					//from参数不填默认当前地址
					// from: that.lng[0].latitude+',' + that.lng[0].longitude,
					to: that.lng[that.lng.length - 1].latitude + ',' + that.lng[that.lng.length - 1].longitude,
					waypoints: that.polyline,
					policy: 'REAL_TRAFFIC,LEAST_FEE,NAV_POINT_FIRST', //https://lbs.qq.com/qqmap_wx_jssdk/method-direction.html
					plate_number: '粤B66666', //车牌限行
					success(res) {
						console.log(res)
						var ret = res;
						var coors = ret.result.routes[0].polyline,
							pl = [];
						//坐标解压（返回的点串坐标，通过前向差分进行压缩）
						var kr = 1000000;
						for (var i = 2; i < coors.length; i++) {
							coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
						}
						//将解压后的坐标放入点串数组pl中
						for (var i = 0; i < coors.length; i += 2) {
							pl.push({
								latitude: coors[i],
								longitude: coors[i + 1]
							})
						}
						//设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
						that.latitude = pl[0].latitude
						that.longitude = pl[0].longitude
						that.polyline = [{
							points: pl,
							arrowLine: true,
							color: '#FF0000DD',
							width: 8
						}]
					},
					fail: function(error) {
						console.error(error);
					},
					complete: function(res) {
						console.log('路线规划成', res);
						if (res.result.routes[0] && res.result.routes[0].distance) {
							that.distance = res.result.routes[0].distance + '米'
							console.log(res.result.routes[0].distance)
						}
					}
				});
			},
			//打开导航
			openLocation() {
				let that = this;
				//坐标转地址
				this.qqmapsdk.reverseGeocoder({
					location: {
						latitude: that.Navlatitude,
						longitude: that.Navlongitude
					},
					success(res) {
						console.log(res)
						//打开导航
						wx.openLocation({
							latitude: that.Navlatitude,
							longitude: that.Navlongitude,
							scale: 12,
							name: res.result.ad_info.district,
							address: res.result.address,
							complete: function() {
								console.log('complete', arguments);
							}
						});
					}
				})

			},
			//移动位置
			moveToLocation() {
				this.mapCtx.moveToLocation()
				wx.showToast({
					title: '成功',
					icon: 'success',
					duration: 2000
				})
			},
			//设置导航位置 点击地图标记 更换坐标
			markertap(e) {
				console.log(this.markers[e.markerId])
				this.Navlatitude = this.markers[e.markerId].latitude
				this.Navlongitude = this.markers[e.markerId].longitude
			},
			//打开地址选择
			chooseLocation() {
				uni.chooseLocation({
					success(res) {
						let name = res.name //位置名称
						let address = res.address //详细地址
						let latitude = res.latitude //纬度
						let longitude = res.longitude //经度
						console.log(res)
					}
				})
			}
		}

	}
</script>

<style>
	#myMap {
		width: 100%;
		height: 60%;
	}

	.text_box {
		position: absolute;
		height: 90px;
		bottom: 0px;
		left: 0px;
		right: 0px;
	}

	.text_box .text {
		margin: 15px;
	}
</style>
