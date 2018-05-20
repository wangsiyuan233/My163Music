{
  let view = {
    el: '#tabs',
    init(){
      this.$el = $(this.el)
    }
  }

  let model = {}

  let controller = {
    init(view, model){
      this.view = view
      this.view.init()
      this.model = model
      this.bindEvents()
    },

    bindEvents(){
      this.view.$el.on('click', '.tabs-nav > li', (e)=>{
        let $li = $(e.currentTarget)
        let tabName = $li.attr('data-tab-name')
        $li.addClass('active')
          .siblings().removeClass('active')
        window.eventHub.emit('selectTab', tabName)
        // 向中枢提供一个切换方案
      })
    }
  }
  controller.init(view, model)
}
