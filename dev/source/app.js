import indexPage from './pages/index/index.vue'
import logsPage from './pages/logs/logs.vue'
const createApp = options => {
  const { _pages, _configs } = options
  return {
    _pages,
    _configs
  }
}

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
