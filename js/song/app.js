{
  let view = {
    el: '#app',
    init(){
      this.$el = $(this.el)
    },

    render(data){
      let {song, status} = data
      // 【1、图片】 背景图片和 圆圈图片是同一个路径，
      this.$el.css('background-image', `url(${song.cover})`)
      this.$el.find('img.cover').attr('src', song.cover)

      // 【2、歌曲】
      if(this.$el.find('audio').attr('src') !== song.url){
        let audio = this.$el.find('audio').attr('src', song.url).get(0)

        // audio 自带的 end 事件不能冒泡， 无法通知页面歌曲已经播完，所以需要中枢

        // 歌曲播放结束的时候，通知中枢[我已经结束了~]
        audio.onended = ()=>{ window.eventHub.emit('songEnd')}
        // 开始歌词
        audio.ontimeupdate = ()=> { this.showLyric(audio.currentTime)}
      }

      // 【3、动画】 css 里面 .playing :  animation-play-state: running; 动画运行
      if(status === 'playing'){
        this.$el.find('.disc-container').addClass('playing')
      }else{
        this.$el.find('.disc-container').removeClass('playing')
      }

      // 【4、歌名】更改歌曲的名字
      this.$el.find('.song-description>h1').text(song.name)

      // 【5、歌词】
      let {lyrics} = song
      // 按照回车进行分行
      lyrics.split('\n').map((string)=>{
        let p = document.createElement('p')
        // 正则判断 [00:00:00]hi 这样的格式（数字、冒号、点）
        // 30分钟入门正则表达式
        let regex = /\[([\d:.]+)\](.+)/
        // 用我们现有的字符串去匹配正则
        let matches =string.match(regex)
        // 如果成功匹配上了
        if(matches){
          p.textContent = matches[2]
          let time = matches[1]
          let parts = time.split(':')
          let minutes = parts[0]
          let seconds = parts[1]
          let newTime = parseInt(minutes,10) * 60 + parseFloat(seconds,10)
          p.setAttribute('data-time', newTime)
          // 普通文本直接写进去
        }else{
          p.textContent = string
        }
        // 每次有 p 都可以加进去
        this.$el.find('.lyric>.lines').append(p)
      })

    },

    showLyric(time){
      // 让歌词按照时间顺序高亮
      let allP = this.$el.find('.lyric>.lines>p')
      let p
      for(let i =0;i<allP.length;i++){
        // 如果是最后一行，就一直显示最后一行
        if(i===allP.length-1){
          p = allP[i]
          break
        }else{
          let currentTime = allP.eq(i).attr('data-time')
          let nextTime = allP.eq(i+1).attr('data-time')
          if(currentTime <= time && time < nextTime){
            p = allP[i]
            break
          }
        }
      }
      let pHeight = p.getBoundingClientRect().top
      let linesHeight = this.$el.find('.lyric>.lines')[0].getBoundingClientRect().top
      let height = pHeight - linesHeight
      this.$el.find('.lyric>.lines').css({
        // 在中间那行高亮
        transform: `translateY(${- (height - 25)}px)`
      })
      $(p).addClass('active').siblings('.active').removeClass('active')
    },

    // 【6、暂停/恢复】局部更新，暂停恢复以后，连续播放
    play(){this.$el.find('audio')[0].play()},
    pause(){this.$el.find('audio')[0].pause()}

  }


  let model = {
    data:{
      song: {
        id: '',
        name: '',
        singer: '',
        url: ''
      },
      status: 'paused'
    },
    get(id){
      // 下面两行是由 leancloud 提供的
      var query = new AV.Query('Song')
      return query.get(id).then((song)=>{
        // 我还需要除了 data 以外的数据
        Object.assign(this.data.song, {id: song.id, ...song.attributes})
        return song
      })
    }
  }


  let controller = {
    init(view, model){
      this.view = view
      this.view.init()
      this.model = model
      let id = this.getSongId()
      // model.get(id)
      this.model.get(id).then(()=>{
        this.view.render(this.model.data)
      })
      this.bindEvents()
    },

    bindEvents(){
      // 点击播放键
      $(this.view.el).on('click', '.icon-play', ()=> {
        this.model.data.status = 'playing'
        this.view.render(this.model.data)
        this.view.play()
      })

      // 点击暂停键
      $(this.view.el).on('click', '.icon-pause', ()=> {
        this.model.data.status = 'paused'
        this.view.render(this.model.data)
        this.view.pause()
      })

      // 歌曲播放结束后，从中枢提取事件，暂停转圈
      window.eventHub.on('songEnd', ()=>{
        this.model.data.status = 'paused'
        this.view.render(this.model.data)
      })
    },

    // 从查询字符串里找到 需要的 key对应的value
    getSongId(){

      // 获取查询参数
      let search = window.location.search
      // 如果问号在第一个，就把问好删除
      if(search.indexOf('?') === 0){
        search = search.substring(1)
      }

      // (v=>v) 如果 v 是真值就要 是假值就不要 可以过滤掉5个假值
      let array = search.split('&').filter((v=>v))
      let id = ''

      for(let i = 0 ;i<array.length; i++){
        // 左边是 id 右边是值
        let kv = array[i].split('=')
        let key = kv[0]
        let value = kv[1]
        if(key ==='id'){
          id = value
          break
        }
      }

      return id
    }
  }


  controller.init(view, model)
}
