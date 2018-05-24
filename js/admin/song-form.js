
// 监听 new 事件 如果是新歌曲就展示没有id的数组
// 监听select 选中歌曲就展示内容
// 触发 update 事件，异步更新
{
  let view = {
    el: '.page > section> main',
    init(){this.$el = $(this.el)},

    template: `
      <form class="form">
        <div class="row">
          <label>
          歌名
          </label>
          <input name="name" type="text" value="__name__">
        </div>
        <div class="row">
          <label>
          歌手
          </label>
          <input name="singer" type="text" value="__singer__">
        </div>
        <div class="row">
          <label>
          外链
          </label>
          <input name="url" type="text" value="__url__">
        </div>
        <div class="row">
          <label>
          封面
          </label>
          <input name="cover" type="text" value="__cover__">
        </div>
        <div class="row">
          <label>
          歌词
          </label>
          <textarea cols=50 rows=5 name="lyrics">__lyrics__</textarea>
        </div>
        <div class="row actions">
          <button type="submit">确定</button>
        </div>
      </form>
      `,

    // 如果用户没有传 data 或者 传的 data为 undefined，那我们就让 data 为空
    render(data = {}){
      let placeholders = ['name', 'url', 'singer', 'id', 'cover', 'lyrics']
      let html = this.template

      // 遍历占位符 将模块里的字符串赋值为 data 的字符串
      placeholders.map((string)=>{
        html = html.replace(`__${string}__`, data[string] || '')
      })
      // 取 <main> 的 html，填充到页面内
      $(this.el).html(html)


      //如果上传的歌曲在库里有id,就是编辑歌曲
      if(data.id){$(this.el).prepend('<h1>编辑歌曲</h1>')}
      // 没有id，就是新建歌曲
      else{$(this.el).prepend('<h1>新建歌曲</h1>')}
    },

    // 重新渲染
    reset(){this.render({})}
  }


  let model = {
    // data:{}
    data: {
      name: '', singer: '', url: '', id: '', cover: '', lyrics: ''
    },

    update(data){
      var song = AV.Object.createWithoutData('Song', this.data.id)
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('lyrics', data.lyrics)
      song.set('url', data.url)
      song.set('cover', data.cover)
      return song.save().then((response)=>{
        Object.assign(this.data, data)
        return response
      })
    },

      // 以下 create(data) 全部都是抄文档的 哈哈
    create(data){
      var Song = AV.Object.extend('Song');
      var song = new Song();
      song.set('name',data.name);
      song.set('singer',data.singer);
      song.set('lyrics', data.lyrics)
      song.set('url',data.url);
      song.set('cover',data.cover);
      return song.save().then((newSong) =>{
        // 下面两行是自己写的哭哭
        let {id, attributes} = newSong
        // 这里的 data 的值发生了改变
        Object.assign(this.data, { id, ...attributes })

      }, (error) =>{
        console.error(error);
      });
    }
  }

  let controller = {
    init(view, model){
      this.view = view
      this.view.init()
      this.model = model
      this.view.render(this.model.data)
      this.bindEvents()

      // song-form 从event-Hub.js上知道了 用户的选项，并且对选项进行渲染
      window.eventHub.on('select', (data)=>{
        this.model.data = data
        this.view.render(this.model.data)
      })

      // 从 event-hub.js 中取出 激活的data
      window.eventHub.on('new', (data)=>{
        // 如果 data.id 存在，就清空 data （新建状态下每个框内就是空白的啊）
        if(this.model.data.id){
          this.model.data = {
            name: '', url: '', id: '', singer: '', lyrics: ''
          }
        // 如果不存在，就是用户正在编辑的歌曲，就新的data深拷贝到旧的 this.model.data 上
        }else{
          Object.assign(this.model.data, data)
        }
        this.view.render(this.model.data)
      })
    },

    //  song.id 不存在 时的代码
    create(){
      let needs = 'name singer url cover lyrics'.split(' ')
      let data = {}
      needs.map((string)=>{
        // data[string] = 标签里面的值   val()=value()
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.create(data)
        .then(()=>{
          this.view.reset()
          // this.model.data === 'ADDR 108'
          // let string = JSON.stringify(this.model.data)
          // let object = JSON.parse(string)
          // window.eventHub.emit('create', object)
          window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data)))
        })
    },

    //  song.id 存在时的代码
    update(){
      let needs = 'name singer url cover lyrics'.split(' ')
      let data = {}
      needs.map((string)=>{
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.update(data)
        .then(()=>{
          window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
        })
    },

    bindEvents(){
      // 这里不能先声明一个form ,因为 form 是在 controller.init() 中渲染出来的
      this.view.$el.on('submit', 'form', (e)=>{
        e.preventDefault()

        //如果id存在就是更新，不存在就创建
        if(this.model.data.id){this.update()}
        else{this.create()}
      })
    }
  }
  controller.init(view, model)

}
