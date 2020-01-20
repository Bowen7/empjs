<script>
// 其实这儿应该是app.js?
// 但是它又必须要过loader, 暂定为app.vue
import indexPage from './pages/index/index.vue'
import logsPage from './pages/logs/logs.vue'

createApp({
  _config: {
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    style: 'v2'
  },
  _pages: [indexPage, logsPage],
  onLaunch: function() {
    console.log('app launch')
  }
})
</script>
