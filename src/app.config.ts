export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/chart/index',
    'pages/portfolio/index',
    'pages/mine/index',
    'pages/report/index',
    'pages/gold-detail/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    backgroundColor: '#f6f3ec',
    navigationBarBackgroundColor: '#f6f3ec',
    navigationBarTitleText: '积存金跟踪',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8f887c',
    selectedColor: '#c99a2e',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '行情',
        iconPath: 'assets/tabbar/home.svg',
        selectedIconPath: 'assets/tabbar/home-selected.svg'
      },
      {
        pagePath: 'pages/chart/index',
        text: '走势',
        iconPath: 'assets/tabbar/chart.svg',
        selectedIconPath: 'assets/tabbar/chart-selected.svg'
      },
      {
        pagePath: 'pages/portfolio/index',
        text: '持仓',
        iconPath: 'assets/tabbar/portfolio.svg',
        selectedIconPath: 'assets/tabbar/portfolio-selected.svg'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.svg',
        selectedIconPath: 'assets/tabbar/mine-selected.svg'
      }
    ]
  }
})
