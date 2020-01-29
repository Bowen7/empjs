<script>
import indexPage from './pages/index/index.vue'
import logsPage from './pages/logs/logs.vue'
import { createApp } from '../../src'
createApp({
  _configs: {
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
