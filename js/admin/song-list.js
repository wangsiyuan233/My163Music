
// 点击触发select事件 激活自己；监听update,更新li后render自己
{
  let view = {
    el:'#songList-container',
    template: `<ul class= 'songList'></ul>`,

    render(data){
      let $el = $(this.el)
      $el.html(this.template)
      let {songs,selectedSongId} = data

      let liList = songs.map((song)=>{
        // 在 li 元素上 ，把song.id，写在 data-song-id；示例：<li data-song-id = 'song.id'> </li>
        let $li = $('<li></li>').text(song.name).attr('data-song-id',song.id)
        // 被选中的节点不在domLi上，而是在 model 上
        if(song.id === selectedSongId){$li.addClass('active')}
        return $li
      })

      $el.find('ul').empty()
      liList.map((domLi)=>{$el.find('ul').append(domLi)})},

    clearActive(){
      $(this.el).find('.active').removeClass('active')
    }

  }


  let model = {
    data: {
      songs: [ ],
      selectSongId: undefined,
    },
    // 在 controller 里面会调用一下
    find(){
      var query = new AV.Query('Song');
      return query.find().then((songs)=>{
        this.data.songs = songs.map((song)=>{
          return {id: song.id, ...song.attributes}
        })
        return songs
      })
    }
  }


  let controller = {
    init(view, model){
      this.view = view
      this.model = model
      this.view.render(this.model.data)

      this.bindEvents()
      this.bindEventHub()
      this.getAllSongs()
    },


    bindEvents(){
      $(this.view.el).on('click', 'li', (e)=>{
        //操作 view.render里面取到的 song.id 值
        let songId = e.currentTarget.getAttribute('data-song-id')

        this.model.data.selectedSongId = songId
        this.view.render(this.model.data)

        let data
        let songs =this.model.data.songs
        for(let i = 0; i<songs.length; i++){
          if(songs[i].id === songId){
            data = songs[i]
            break
          }
        }
        // 把取到的 data 深拷贝后放到 event-Hub.js 上，别的模块可以去取了
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
        // 此时song-form.js / controller / window.eventHub.on('select', (data)=>{}) 就在eventHub 上取到了 data的值


        // [JSON.parse] turns a string of JSON text into a Javascript object.
        // [JSON.stringify] turns a Javascript object into JSON text and stores that JSON text in a string.
        // 也就是说 data 先变成 JSON,再变成 JS
        // 为啥啊？？？ ---> 为了深拷贝

      })
    },

    bindEventHub(){

      window.eventHub.on('create',(songData)=>{
        this.model.data.songs.push(songData)
        this.view.render(this.model.data)
      })

      window.eventHub.on('new',()=>{
        this.view.clearActive()
      })

      window.eventHub.on('updata',(song)=>{
        let songs = this.model.data.songs
        for (let i = 0; i < songs.length; i++) {
          if(songs[i].id === songId){Object.assign(songs[i],song)}
          //Object.assign() ES6中的深拷贝
        }
        this.view.render(this.model.data)
      })
    },

    // 调用 model 里面的 find()
    getAllSongs(){
      return this.model.find().then(()=>{
        this.view.render(this.model.data)
      })
    },


  }



  controller.init(view, model)
}
