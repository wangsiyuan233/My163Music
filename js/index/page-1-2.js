{
  let view = {
    el: 'section > .songs',
    init(){this.$el = $(this.el)},

    // temmplate 是从 源码上拷贝来的； template 是 li 的模板
    template:`
        <li>
          <h3>{{song.name}}</h3>
          <p>
            <svg class="icon icon-sq">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-sq"></use>
            </svg>
            {{song.singer}}
          </p>
          <a class="playButton" href="./song.html?id={{song.id}}">
            <svg class="icon icon-play">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-play"></use>
            </svg>
          </a>
        </li>
    `,

    render(data){
      let {songs} = data  // songs 的全部是 data
      songs.map((song)=>{
        let $li = $(this.template
          .replace('{{song.name}}', song.name)
          .replace('{{song.singer}}', song.singer)
          .replace('{{song.id}}', song.id)
        )
        // li 元素是通过 js appen上去的
        this.$el.find('ol.list').append($li)
      })
    }
  }
  let model = {
    data: {songs: []},

    // 获取所有的歌曲
    find(){
      // 查询歌曲 找到了返回 songs
      // song? songs? Song?
      var query = new AV.Query('Song');
      return query.find().then((songs)=>{
        this.data.songs = songs.map((song)=>{
          // 返回的数据我都要 的意思
          return {id: song.id, ...song.attributes}
        })
        return songs
      })
    }
  }

  let controller = {
    init(view, model){
      this.view = view
      this.view.init()
      this.model = model

      // this.model.find() 就可以调用成功了
      // 后面加上 .then()  成功之后会渲染页面
      this.model.find().then(()=>{
        this.view.render(this.model.data)
      })

    }
  }
  controller.init(view, model)
}
