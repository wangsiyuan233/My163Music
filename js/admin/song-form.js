
// 监听 new 事件 如果是新歌曲就展示没有id的数组
// 监听select 选中歌曲就展示内容
// 触发 update 事件，异步更新
{
  let view = {
    el: '.page > main',
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
          <textarea cols=100 rows=10 name="lyrics">__lyrics__</textarea>
        </div>
        <div class="row actions">
          <button type="submit">保存</button>
        </div>
      </form>
      `,

    render(data = {}){
      let placeholders = ['name', 'url', 'singer', 'id', 'cover', 'lyrics']
      let html = this.template

      // 遍历占位符 将模块里的字符串赋值为空字符串
      placeholders.map((string)=>{
        html = html.replace(`__${string}__`, data[string] || '')
      })

      // 取 <main> 的 html
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

      // 
      return song.save().then((response)=>{
        Object.assign(this.data, data)
        return response
      })
    },

    create(data){
      var Song = AV.Object.extend('Song');
      var song = new Song();
      song.set('name',data.name);
      song.set('singer',data.singer);
      song.set('lyrics', data.lyrics)
      song.set('url',data.url);
      song.set('cover',data.cover);
      return song.save().then((newSong) =>{
        let {id, attributes} = newSong
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

      window.eventHub.on('select', (data)=>{
        this.model.data = data
        this.view.render(this.model.data)
      })

      window.eventHub.on('new', (data)=>{
        if(this.model.data.id){
          this.model.data = {
            name: '', url: '', id: '', singer: '', lyrics: ''
          }
        }else{
          Object.assign(this.model.data, data)
        }
        this.view.render(this.model.data)
      })
    },

    create(){
      let needs = 'name singer url cover lyrics'.split(' ')
      let data = {}
      needs.map((string)=>{
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.create(data)
        .then(()=>{
          this.view.reset()
          //this.model.data === 'ADDR 108'
          let string = JSON.stringify(this.model.data)
          let object = JSON.parse(string)
          window.eventHub.emit('create', object)
        })
    },

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
      this.view.$el.on('submit', 'form', (e)=>{
        e.preventDefault()

        if(this.model.data.id){
          this.update()
        }else{
          this.create()
        }
      })
    }
  }
  controller.init(view, model)

}
