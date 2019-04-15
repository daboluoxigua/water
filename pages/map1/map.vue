<template>
	<view class="content">
		<!--地图容器-->
		<map id="myMap" :latitude="latitude" :longitude="longitude" scale='16' :circles="circles"
		 show-location @markertap='markertap' :controls='controls'>
		</map>
		<cover-view class="controls">
			<cover-view class="play" bindtap="play">
				按钮1
			</cover-view>
			<cover-view class="pause" bindtap="pause">
				按钮2
			</cover-view>
		  </cover-view>
		<button @tap="moveToLocation" class="page-body-button" type="primary">返回当前位置</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				key: 'SVDBZ-VAYKD-4ZB4Z-HZNP4-KZQEF-WZFHK',
				latitude: '',
				longitude: '',
				circles:[],
				controls:[]
			}
		},
		onLoad() {
			this.qqmapsdk = new this.$QQMapWX({
				key: this.$store.state.QQMapKey
			});
			this.mapCtx = wx.createMapContext('myMap')
		},
		onShow() {
			let that = this;

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
				this.circles=[{
					latitude:that.latitude,
					longitude:that.longitude,
					radius:200,
					fillColor:'#0079ffa0',
					color:'#000000ff',
					strokeWidth:0.5
				}]
				
				var info = wx.getSystemInfoSync()
				this.controls = [{
					id:1,
					position:{left:info.windowHeight-70,top:info.windowHeight/2 - 70},
					clickbale:true,
					iconPath:"../../static/img/sinaweibo.png"
				}]
				// console.log(info)
			},
			//移动位置
			moveToLocation() {
				this.mapCtx.moveToLocation()
			},
			
		}

	}
</script>

<style>
	#myMap {
		width: 100%;
		height: 60%;
		margin: 0;
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
