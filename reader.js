var ReaderHelper = ReaderHelper || {
    clean: function(elem) {
        if ($(elem).find("svg").height() === 0) {
            $(elem).find("svg").css("max-height", "0px")
        }
        $(elem).removeAttr("style").removeAttr("class")
        $(elem).find("div,p,ul,li,a,img,iframe").removeAttr("style").removeAttr("class")
        return elem
    }
}

var Reader = Reader || {
    id: 'clean-reader-container',
    off: true,
    reading: false,
    target_selector: 'div,section,article',
    current_zoom: 100,
    origin_width: 800,
    zoom_step: 10,

    resize: function() {
        var height = $(window).height()
        $(".clean-reader-container").css("height", "" + height + "px")
        var w = Reader.origin_width / Reader.current_zoom * 100;
        $(".clean-reader-container-inner").css("width", "" + w + "px")
    },

    //main worker
    read: function(elem) {
        this.current_zoom = Reader.zoomPercents[self.location.hostname] || 100;
        this.update_zoom()
        $("html").addClass("clean-reader-body").removeClass("clean-reader-body-prepare")
        this.make_container();
        var top = $("body").scrollTop();
        $("#" + Reader.id).css("top", "" + top + "px")
        $(".clean-reader-mask").css("top", "" + top + "px")
        $elem = $(elem)
        if ($elem.parents(".clean-reader-target").length > 0) {
            $elem = $elem.parents(".clean-reader-target")
        }
        var cloned_elem = $elem.clone()
        cloned_elem = ReaderHelper.clean(cloned_elem);
        $("#" + Reader.id + " .clean-reader-container-inner .clean-reader-container-inner-content").html(cloned_elem)
        Reader.dozoom()
        this.reading = true
    },

    //messages
    msg_toggle: function() {
        chrome.extension.sendMessage({
            action: "toggle",
            is_off: this.off
        }, function(response) {
            // console.log(response);
        });
    },

    msg_init_zoom_percents: function() {
        chrome.extension.sendMessage({
            action: "init_zoom_percents"
        }, function(response) {
            Reader.zoomPercents = response || {}
            // console.log("after init Reader.zoomPercents", Reader.zoomPercents)
        });
    },

    msg_update_zoom_percent: function() {
        chrome.extension.sendMessage({
            action: "update_zoom_percent",
            domain: self.location.hostname,
            percent: Reader.current_zoom,
        }, function(response) {
        });
    },

    //end messages

    toggle: function() {
        this.off = !this.off;
        this.msg_toggle();
        if(this.off) {
            this.turn_off()
        } else {
            this.init_events()
        }
    },

    zoomin: function() {
        Reader.current_zoom += Reader.zoom_step;
        Reader.dozoom()
    },

    zoomout: function() {
        Reader.current_zoom -= Reader.zoom_step;
        Reader.dozoom()
    },

    dozoom: function() {
        // console.log("Reader.current_zoom", Reader.current_zoom)
        $(".clean-reader-container-inner").css("zoom", "" + Reader.current_zoom + "%")
        Reader.resize()
        Reader.update_zoom()
    },

    update_zoom: function() {
        Reader.zoomPercents[self.location.hostname] = this.current_zoom
        Reader.msg_update_zoom_percent()
    },

    close: function() {
        Reader.reading = false
        $(".clean-reader-mask").remove();
        $(".clean-reader-target").removeClass("clean-reader-target")
        $("#" + Reader.id).remove();
        $("html").removeClass("clean-reader-body").removeClass("clean-reader-body-prepare");
        if(!Reader.off) {
          $("html").addClass("clean-reader-body-prepare");
        }
    },

    turn_off: function() {
        this.close();
    },

    keycode_map: function() {
        if(!Reader.reading) {
            return {}
        }
        return {
            "27": Reader.close,
            "187": Reader.zoomin,
            "189": Reader.zoomout,
        }
    },

    init_events: function() {
        //addClass to body
        $("body").addClass("clean-reader-body-prepare")

        $(window).resize(function(){
          Reader.resize()
        })

        $(document).keyup(function(e) {
            // console.log("reader.js init init_events", e.keyCode)
            if(Reader.off) {
                return;
            }
            var fn = Reader.keycode_map()["" + e.keyCode]
            if(typeof(fn) == "function") {
                fn()
            }
        });

        $(document).mousemove(function(e) {
            if(Reader.off || Reader.reading) {
                return;
            }
            var $this = $(e.target);
            if($this.is(".clean-reader-target")) {
                return;
            }

            if(!$this.is(Reader.target_selector)) {
                if ($this.parents(Reader.target_selector).length == 0) {
                    $(".clean-reader-target").removeClass("clean-reader-target");
                }
                return;
            }
            $(".clean-reader-target").removeClass("clean-reader-target");
            $this.addClass("clean-reader-target");
        })

        $(Reader.target_selector).dblclick(function() {
            if(Reader.off) {
                return;
            }
            Reader.read($(this))
            return false;
        })
        // .mousemove(function(e) {
        //     if(Reader.off) {
        //         return;
        //     }
        //     var $this = $(this);
        //     if($this.is(".clean-reader-target")) {
        //         return;
        //     }
        //     $(Reader.target_selector).removeClass("clean-reader-target");
        //     $this.addClass("clean-reader-target");
        // })
        // .mouseenter(function() {
        //     if(Reader.off) {
        //         return;
        //     }
        //     var $this = $(this);
        //     $(Reader.target_selector).removeClass("clean-reader-target");
        //     $this.addClass("clean-reader-target");
        // }).mouseleave(function() {
        //     if(Reader.off) {
        //         return;
        //     }
        //     $(Reader.target_selector).removeClass("clean-reader-target");
        //     var $this = $(this);
        //     $this.removeClass("clean-reader-target");
        // })

        $('body').on("click", ".clean-reader-close", function() {
            Reader.close();
        });
        $('body').on("click", ".clean-reader-zoom-out", function() {
            Reader.zoomout()
        })
        $('body').on("click", ".clean-reader-zoom-in", function() {
            Reader.zoomin()
        })
    },

    //private
    make_container: function() {
        if($("#" + Reader.id).length > 0) {
            return
        }
        var h = $(window).height() - 50
        var w = $(window).width()
        var left = (w - 800) / 2
        var htmls = [
            '<div class="clean-reader-mask" style="background:black;"></div><div id="' + Reader.id + '" class="clean-reader-container">',
            //toolbar
            '<div class="clean-reader-toolbar">',
            '<ul>',
            '<li><span class="clean-reader-close cricon-cancel" title="close"></span></li>',
            '<li><span class="clean-reader-zoom-in cricon-zoom-in" title="zoom in"></span></li>',
            '<li><span class="clean-reader-zoom-out cricon-zoom-out" title="zoom out"></span></li>',
            '</ul>',
            '</div>',
            '<div class="clean-reader-container-inner"><div class="clean-reader-container-inner-content"></div>',
            "<div class='cr-clear'></div>",
            "</div>",
            "</div>"
        ]
        $("body").append(htmls.join(""))
    }
}


Reader.zoomPercentss = Reader.zoomPercentss || {}
Reader.msg_init_zoom_percents()

