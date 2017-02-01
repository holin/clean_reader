var ReaderHelper = ReaderHelper || {
  clean: function(elem) {
    $(elem).removeAttr("style").removeAttr("class")
    $(elem).find("div,p,ul,li,a,img").removeAttr("style").removeAttr("class")
    return elem
  }
}

var Reader = Reader || {
  id: 'clean-reader-container',
  off: true,
  reading: false,
  current_zoom: 120,
  zoom_step: 10,

  resize: function() {
    var height = $(window).height()
    $(".clean-reader-container").css("height", ""+height+"px")
  },

  read: function(elem) {
    this.current_zoom = 120;
    $("body").addClass("clean-reader-body")
    this.make_container();
    var top = $("body").scrollTop();
    $("#"+Reader.id).css("top", ""+top+"px")
    $(".clean-reader-mask").css("top", ""+top+"px")
    var cloned_elem = $(elem).clone()
    cloned_elem = ReaderHelper.clean(cloned_elem);
    $("#"+Reader.id+" .clean-reader-container-inner").html(cloned_elem)
    this.resize()
    this.reading = true
  },

  send_message: function() {
    chrome.extension.sendMessage({is_off: this.off}, function(response) {
       console.log(response);
    });
  },

  toggle: function() {
    this.off = !this.off;
    this.send_message();
    if (this.off) {
      this.turn_off()
    } else {
      this.init_events()
    }
  },

  zoomin: function() {
    Reader.current_zoom += Reader.zoom_step;
    console.log("this.zoomin", Reader.current_zoom)
    $(".clean-reader-container-inner").css("zoom", ""+Reader.current_zoom+"%")
  },

  zoomout: function() {
    Reader.current_zoom -= Reader.zoom_step;
    console.log("this.zoomout", Reader.current_zoom)
    $(".clean-reader-container-inner").css("zoom", ""+Reader.current_zoom+"%")
  },

  close: function() {
    Reader.reading = false
    $(".clean-reader-mask").remove();
    $("#"+Reader.id).remove();
    $("body").removeClass("clean-reader-body");
  },

  turn_off: function() {
    this.close();
  },

  keycode_map: function() {
    if (!Reader.reading) {
      return {}
    }
    return {
      "27": Reader.close,
      "187": Reader.zoomin,
      "189": Reader.zoomout,
    }
  },

  init_events: function() {
    $(document).keyup(function(e) {
      if (Reader.off) {return;}
      var fn = Reader.keycode_map()[""+e.keyCode]
      if (typeof(fn) == "function") {
        fn()
      }
    });
    $("div").dblclick(function(){
      if (Reader.off) {return;}
      Reader.read($(this))
      return false;
    }).mouseenter(function(){
      if (Reader.off) {return;}
      var $this = $(this);
      $("div").removeClass("clean-reader-target");
      $this.addClass("clean-reader-target");
    }).mouseleave(function(){
      if (Reader.off) {return;}
      $("div").removeClass("clean-reader-target");
      var $this = $(this);
      $this.removeClass("clean-reader-target");
    })

    $('body').on("click", ".clean-reader-close", function(){
      Reader.close();
    });
    $('body').on("click", ".clean-reader-zoom-out", function(){
      Reader.zoomout()
    })
    $('body').on("click", ".clean-reader-zoom-in", function(){
      Reader.zoomin()
    })
  },

  //private
  make_container: function() {
    if ($("#"+Reader.id).length>0) {
      return
    }
    var h = $(window).height() - 50
    var w = $(window).width()
    var left = (w - 800) / 2
    var htmls = [
      '<div class="clean-reader-mask" style="background:black;"></div><div id="'+Reader.id+'" class="clean-reader-container">',
      //toolbar
      '<div class="clean-reader-toolbar">',
      '<ul>',
        '<li><span class="clean-reader-close" title="close">x</span></li>',
        '<li><span class="clean-reader-zoom-in" title="zoom in">+</span></li>',
        '<li><span class="clean-reader-zoom-out" title="zoom out">-</span></li>',
      '</ul>',
      '</div>',
      '<div class="clean-reader-container-inner">',
      "</div></div>"
    ]
    $("body").append(htmls.join(""))
  }
}

Reader.toggle();

