<script>
import indexPage from './pages/index/index.vue'
import logsPage from './pages/logs/logs.vue'
import { createApp } from 'empjs'
import store from './store'
createApp({
  store,
  configs: {
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    style: 'v2'
  },
  pages: [indexPage, logsPage],
  onLaunch: function() {
    console.log('app launch')
  }
})
</script>
