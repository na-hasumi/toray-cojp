/*===========================================
base.js
===========================================*/

/* for Debug */
if (!console) console = {log: function(){}};

// UserAgent Judgment
var $UA = $UA || {};
;(function($, undefined) {
  $UA.SP = (navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0;
  $UA.name = window.navigator.userAgent.toLowerCase();
  $UA.isIE = ($UA.name.indexOf('msie') >= 0 || $UA.name.indexOf('trident') >= 0);
  $UA.isiPhone = $UA.name.indexOf('iphone') >= 0;
  $UA.isiPod = $UA.name.indexOf('ipod') >= 0;
  $UA.isiPad = $UA.name.indexOf('ipad') >= 0;
  $UA.isiOS = ($UA.isiPhone || $UA.isiPod || $UA.isiPad);
  $UA.isAndroid = $UA.name.indexOf('android') >= 0;
  $UA.isTablet = ($UA.isiPad || ($UA.isAndroid && $UA.name.indexOf('mobile') < 0));
  $UA.isMacSafari = ($UA.name.indexOf('mac os') >= 0 && $UA.name.indexOf('safari') >= 0 && $UA.name.indexOf('chrome') == -1 );

  if ($UA.isIE) {
    $UA.verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec($UA.name);
    if ($UA.verArray) {
        $UA.ver = parseInt($UA.verArray[2], 10);
    }
  }
  if ($UA.isiOS) {
    $UA.verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec($UA.name);
    if ($UA.verArray) {
        $UA.ver = parseInt($UA.verArray[2], 10);
    }
  }
  if ($UA.isAndroid) {
    $UA.verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec($UA.name);
    if ($UA.verArray) {
        $UA.ver = parseInt($UA.verArray[2], 10);
    }
  }
}(jQuery));

var TORAY = TORAY || {};
var MainComponent = MainComponent || {};
;(function($, undefined) {
  MainComponent.winW = $(window).width();
  MainComponent.breakpointSP = 768;
  MainComponent.breakpointTB = 960;

  MainComponent.windowSizeSp = function(){
    var result = false;
    if($(window).width() < MainComponent.breakpointSP){
      result = true;
    }else{
      result = false;
    }
    return result;
  };

  MainComponent.windowSizeTb = function(){
    var result = false;
    if($(window).width() < MainComponent.breakpointTB){
      result = true;
    }else{
      result = false;
    }
    return result;
  };

  MainComponent.openMenu = function(el){
    var _current = "is_current";
    if(!el.hasClass(_current)){
      el.addClass(_current)
        .next().slideDown(200);
    }else{
      el.removeClass(_current)
        .next().slideUp(100);
    }
  };

  MainComponent.menuAfterSubnavInc = function(){
    var $sitefunc = $('.ly_header .siteFunctions'),
        $gnavSp = $sitefunc.find('.gnavSp'),
        $menu = $gnavSp.find('.menuLv1 > li.parent > a, .menuLv2 > .parent > a, .menuLv3 > .parent > a');

    // メニューLv1, Lv2 sp
    //--------------------------------
    $menu.on('click',function(event){
      event.preventDefault();
      MainComponent.openMenu($(this));
    });
  };

  MainComponent.localNav = function(){
    var path = location.pathname,
        _current = 'is_current',
        $localNav = $('.ly_localNav'),
        $links = $localNav.find('a'),
        $parent = {};
    
    if(!MainComponent.windowSizeSp()){
      $parent = $localNav.find('.menuLv3 .parent > a');
    }else{
      $parent = $localNav.find('.parent > a');
    }
    // current
    $links.each(function(){
      var $href = $(this).attr('href');
      if(path === $href){
        $(this).addClass(_current);
        $(this).parents('.parent').children('a').addClass(_current);
        $(this).parents('.parent').find('.menuLv3').show();
        $(this).parents('.menuLv4').show();
      }
    });

    // open,close(sp)
    $parent.on('click',function(event){
      event.preventDefault();
      MainComponent.openMenu($(this));
    });
  }

  MainComponent.siteSearchSettings = function(){
    var search_css = document.createElement('link'),
    search_script = document.createElement('script');
    search_css.href = 'https://ce.mf.marsflag.com/latest/css/mf-search.css';
    search_css.rel = 'stylesheet';
    search_css.type = 'text/css';
    search_css.media = 'all';
    search_css.charset = 'UTF-8';
    document.head.appendChild(search_css);

    if($('body').attr('id') != 'mf_Result'){
        var G = GALFSRAM = window.GALFSRAM || {}
        G.mfx = G.mfx || {}
        G.mfx.router_mode = 'history'
      search_script.src = 'https://ce.mf.marsflag.com/latest/js/mf-search.js';
      search_script.charset='UTF-8';
      document.body.appendChild(search_script);
    }
  }

  MainComponent.menu = function(){
    $('.ly_header').before('<div class="ly_gnavOverlay"></div>');
    var $gnav = $('#globalNav'),
        $glink = $gnav.find('.menuLv1 > li > a'),
        $ovly = $('.ly_gnavOverlay'),
        $header = $('.ly_header'),
        $sitefunc = $header.find('.siteFunctions'),
        $drawer = $sitefunc.find('.drawer'),
        $searchDialog = $header.find('#headerSearchDialog'),
        $regionDialog = $header.find('#headerRegionDialog'),
        $openSearch = $sitefunc.find('.searchOpen'),
        $openRegion = $sitefunc.find('.regionOpen'),
        $headerToolDialog = $header.find('.headerToolDialog'),
        $dialogClose = $header.find('.headerToolDialog .close'),
        $spMenuBtn = $header.find('#headerSpMenuBtn'),
        $spRegionBtn = $header.find('#headerSpRegionBtn'),
        $menuLv2 = $('.menuLv2',$gnav),
        $subnav = $('.subGnav',$gnav),
        $gnavSp = $sitefunc.find('.gnavSp'),
        $location = document.location.pathname.split('/'),
        _current = 'is_current',
        _open = 'is_open',
        _off = 'off',
        _show = 'is_show',
        ovlyout = function(){
          $ovly.fadeOut(200);
        },
        ovlyin = function(){
          $ovly.fadeIn(300);
        },
        closeFuncs = function(){
          if($gnav.length){
            $glink.removeClass(_off);
            $glink.removeClass(_open);
            $subnav.slideUp(200);
          }
          $('html').removeClass('js_overWindowHeight');
        },
        dialogControl = function(el,dialog){
          if (dialog.hasClass(_show)) {
            el.attr('aria-expanded', false);
            dialog.attr('aria-hidden', true);
            dialog.removeClass(_show);
            dialog.find('a,button,input').attr('tabindex','-1');
          }else{
            closeFuncs();
            ovlyout();
            el.attr('aria-expanded', true);
            dialog.attr('aria-hidden', false);
            dialog.addClass(_show);
            dialog.find('a,button,input').attr('tabindex','0').eq(0).focus();
            $('input[type="text"]',dialog).focus();
          }
        },
        dialogClose = function(){
          $searchDialog.attr('aria-hidden', true).removeClass(_show);
          $regionDialog.attr('aria-hidden', true).removeClass(_show);
          $openSearch.attr('aria-expanded', false);
          $openRegion.attr('aria-expanded', false);
          $headerToolDialog.find('a,button,input').attr('tabindex','-1');
        },
        drawerControl = function(el){
          var $bodyHeight = window.innerHeight - 70;
          $drawer.height($bodyHeight);

          if(el.is(':hidden')){
            el.attr('aria-hidden', false);
            el.slideDown(200,function(){
              $('html').css({'overflow-y':'hidden'});
            });
          }else{
            $('html,body').css({'-webkit-overflow-scrolling': 'none','height': 'auto'});
            el.attr('aria-hidden', true);
            el.slideUp(200,function(){
              $('html').css({'overflow-y':'auto'});
            });
          }
        },
        tabindexControl = function(el){
          el.each(function(){
            var status = Boolean($(this).attr('aria-hidden'));
            if(status){
              $(this).find('a,button,input').attr('tabindex','-1');
            }else{
              $(this).find('a,button,input').attr('tabindex','0');
            }
          })
        };

    if($gnav.length){
      // スマホ用にクローン
      var $gclone = $gnav.clone(true);
      $gclone.attr('id','gNavSP').removeClass('ly_globalNav').addClass('gnavSp');
      $searchDialog.after($gclone);
      // クローン後に発火
      MainComponent.menuAfterSubnavInc();

      // current nav (pc)
      $glink.each(function(){
        var glinkPath = $(this).data('path');
        if(glinkPath === $location[1]){
          $(this).addClass(_current);
        }
      })

      // current nav (sp)
      var locationPath = location.pathname,
          $links = $menuLv2.find('a:not(.otherDir)'),
          $parent = $menuLv2.find('.parent > a');
    
      $links.each(function(){
        var $href = $(this).attr('href');
        if(locationPath === $href){
          $(this).addClass(_current);
          $(this).parents('.parent').children('a').addClass(_current);
          $(this).parents('.parent').find('.menuLv3').show();
        }
      });

      // メガナビエリア内クリックで閉じる
      $subnav.on('click',function(event){
        ovlyout();
        closeFuncs();
      });

      // サブナビにはイベント伝搬させない
      $('.parent > a',$subnav).on('click',function(event){
        event.stopPropagation();
        return false;
      });

      // aタグにはイベント伝搬させない
      $('a',$subnav).on('click',function(event){
        event.stopPropagation();
      });


      // メガメニュー Lv1 pc
      $glink.stop().on('click', function(e){
        var $p = $(this).parent(),
            $sub = $(this).parent().children('.subGnav'),
            subHeight = $sub.outerHeight(),
            windowHeight = parseInt($(window).height() - 150);
        
        if(!MainComponent.windowSizeTb()){
          if($sub.length === 0){
            // no subGnav
            closeFuncs();
          }else{
            // メニュー項目が多い場合はbodyにクラス付与してsubGnavをスクロール可能にする
            if(subHeight > windowHeight){
              $('html').addClass('js_overWindowHeight');
            }else{
              $('html').removeClass('js_overWindowHeight');
            }

            // current class
            $p.siblings().children('a').removeClass(_open).addClass(_off);
            $(this).removeClass(_off).addClass(_open);

            // subGnav open/close
            if ($sub.is(':hidden')) {
              // e.stopPropagation();
              $('div.subGnav:visible',$gnav).hide();
              $sub.stop().slideDown(300);
              $(this).addClass(_open);
              ovlyin();
              $searchDialog.removeClass(_show);
              $regionDialog.removeClass(_show);
            }else{
              $sub.slideUp(200);
              $p.siblings().children().removeClass(_off);
              $(this).removeClass(_open);
              ovlyout();
              $('html').removeClass('js_overWindowHeight');
            }

            if($(this).parent().hasClass('parent')){
              $(this).attr('href','javascript:;');
            }
            
          }
        }
      });

      // メガメニュー Lv2
        $gnav.find('.menuLv2 .parent > a').on('click',function(event){
        var _current = 'is_current',
            _active = 'is_active',
            $parent = $(this).parent(),
            $uncle = $parent.siblings(),
            $child = $(this).next(),
            $menuLv = $parent.closest('ul'),
            $childHeight = $child.height(),
            firstSubHeight = $parent.parents('.subGnav').outerHeight(),
            subPadding = parseInt($parent.parents('.subGnav').width() * 0.08),
            windowHeight = parseInt($(window).height() - 150),
            subNavHeight = parseInt($childHeight + subPadding + 50),
            menuColums = $(this).parents('.menus').find('.menuLv2');

        if(!MainComponent.windowSizeTb()){
          event.stopPropagation();
          event.preventDefault();
          $uncle.removeClass(_current);
          $uncle.removeAttr('style');
          if(menuColums.length >= 2){
            menuColums.removeClass(_active).removeAttr('style');
            menuColums.children().removeClass(_current);
          }
          
          $menuLv.css({
            'min-height': $childHeight
          });

          // メニューの高さ調整
          if((firstSubHeight - subPadding) < $childHeight){
            $parent.parents('.subGnav').css({
              'height': $childHeight + subPadding + 50
            });
          }
          if(subNavHeight > windowHeight || firstSubHeight > windowHeight){
            $('html').addClass('js_overWindowHeight');
          }else{
            $('html').removeClass('js_overWindowHeight');
          }

          if(!$parent.hasClass(_current)){
            $parent.addClass(_current);
            $menuLv.addClass(_active);
            if($menuLv.hasClass('menuLv2')){
              $menuLv.find('.menuLv3').removeClass(_active);
              $menuLv.find('.menuLv4').removeClass(_current);
              $menuLv.find('.menuLv4').parent().removeClass(_current);
            }
          }
        }
      });

      // close menu
      $('#globalNav').on('click','.close', function(event){
        ovlyout();
        closeFuncs();
      });


      // for PC
      //--------------------------------
      if(!MainComponent.windowSizeSp()){
        // メニューに改行がある場合
        var $checkgnav = '';
        $glink.each(function(){
          $checkgnav += $(this).html();
        });
        if ( $checkgnav.indexOf('<br>') != -1) {
          $('body').addClass('gnavMultipleLines');
        }

        // メニューからフォーカスが外れたら
        $('#contents a').on('focus', function(event){
          closeFuncs();
          ovlyout();
        });

        // 非表示ダイアログ(Region, search)はフォーカス除外
        tabindexControl($headerToolDialog);
      }

    }else{// no globalNav
      $drawer.addClass('noGnav');
      $ovly.addClass('noGnav');
    }//END if[#globalNav]

    // Overlay
    $ovly.on('click',function(){
      $('.subGnav',$gnav).slideUp(200);
      closeFuncs();
      ovlyout();
    });

    // Search button
    $openSearch.on('click',function(){
      dialogControl($(this),$searchDialog);
    });

    // Region button
    $openRegion.on('click',function(){
      dialogControl($(this),$regionDialog);
    });

    // Dialog close
    $dialogClose.on('click',function(){
      $(this).parents('.headerToolDialog').removeClass(_show);
      dialogClose();
    });

    // Dialog close
    $(document).on('click touchend focusout', function(event) {
      if (!$(event.target).closest('.ly_header').length) {
        dialogClose();
      }
    });

    // drawer menu
    $spMenuBtn.on('click', function(event) {
      $regionDialog.slideUp(200);
      $spRegionBtn.removeClass(_current);
      drawerControl($sitefunc);
      $(this).toggleClass(_current);
    });

    $spRegionBtn.on('click', function(event) {
      $sitefunc.slideUp(200);
      $spMenuBtn.removeClass(_current);
      drawerControl($regionDialog);
      $(this).toggleClass(_current);
    });
  };

  MainComponent.copyright = function(){
    var $copy = $('#copyright'),
        tDate = new Date(),
        tYear = "Copyright &copy; "+tDate.getFullYear()+" TORAY INDUSTRIES, INC.";
    $copy.html(tYear);
  };

  MainComponent.bxwrap = function(h) {
    $('.kvWrap').each(function(){
      $(this).after('<hr>');
      var optname = $(this).data('change');
      if(optname == 'toggleImg'){
        var $t = $(this).find('img');
        $t.each(function(){
          $(this).attr("src", $(this).attr("src").replace("/kv_","/sp_kv_"));
        });
      }
    });
  };

  MainComponent.loader = function(){
    $('#overlay').css('display','block');
  };

  MainComponent.spkvchange = function(){
    var currentIndex = 0,
        intv,
        current = 'current',
        $container = $('.spKVSubstitution');
    // $kvSet.parent().height(MainComponent.winW+30);

    intv = setInterval(function() {
      currentIndex = (currentIndex + 1) % 3;

      $container.each(function(){
        var $kvSet = $('.kvSet > li',this),
            $kvSetDots = $('.kvSetDots > li',this);
        $kvSet.each( function(i) {
          if ( i == currentIndex ) {
            $(this).addClass(current);
          } else {
            $(this).removeClass(current);
          }
        });
        $kvSetDots.each( function(i) {
          if ( i == currentIndex ) {
            $(this).addClass(current);
          } else {
            $(this).removeClass(current);
          }
        });
      });
    }, 5000);
  };

  MainComponent.util = {
    hashCtrl: function(){
      try{
        var h = location.hash;
        if(h.indexOf('#/') == 0){
          // throw new Error('#/ exists.');
        }else if($(h).length > 0){
          var target = $(h), position = 0;
          if (target.length >= 1) {
            position = Number(target.offset().top) || position;
            $('html, body').animate({
              scrollTop : position - 150
            }, 500, 'easeOutExpo');
          }
        }
      }catch(e){
        // Proceed to the next process
      }
      $('a[href^="#"]').filter(function(){
        return $(this).parent().attr('id') != 'pagetop' &&
          !$(this).parent().parent().parent().hasClass('tabNav') &&
          !$(this).parent().parent().is('#skipLink') &&
          $(this).attr('href').indexOf('#modalWin') == -1 &&
          !$(this).hasClass('boxer');
      }).on('click.o',  function() {
        var target = $($(this).attr("href")),
            position = 0;
          if (target.length >= 1) {
            position = Number(target.offset().top) || position;
            $('html, body').animate({
              scrollTop : position - 150
            }, 500, 'easeOutExpo');
          }
        return;
      });
    }
  };

  MainComponent.pagetop = (function() {
    if(!'debounce' in $) return;
    var elm = '',
    scTop = 90,
    settings = function(){
      bindElement();
      if(elm.length > 0){
        setDefault();
        attachUIEvent();
        attachScrollEvent();
      }
    },
    setDefault = function (){
      elm.children('a').attr('href','javascript:;');
      elm.css({
        '-webkit-transition': 'all 500ms cubic-bezier(.21,.66,.54,.94)',
        '-moz-transition': 'all 500ms cubic-bezier(.21,.66,.54,.94)',
        '-o-transition': 'all 500ms cubic-bezier(.21,.66,.54,.94)',
        'transition': 'all 500ms cubic-bezier(.21,.66,.54,.94)',
        '-webkit-transform': 'translateY(200px)',
        'transform': 'translateY(200px)',
        'display': 'block'
      });
    },
    attachUIEvent = function(){
      elm.on('click.o touchend.o', 'a', function(){
        elm.css({'-webkit-transform': 'translateY(0px)','transform': 'translateY(0px)'});
        $('html, body').stop().animate({
            scrollTop : 0
        }, 500, 'easeOutExpo');
        return;
      });
    },
    attachScrollEvent = function(){
      $(window).on('scroll.o', $.debounce(50, function(){
        if ($(window).scrollTop() > scTop) {
          elm.css({'-webkit-transform': 'translateY(0px)','transform': 'translateY(0px)'});
        } else {
          elm.css({'-webkit-transform': 'translateY(200px)','transform': 'translateY(200px)'});
        }
       }));
    },
    bindElement = function(){
      elm = $('#pagetop');
    };
    return {
      init:function(){
        settings();
      }
    };
  }());

  MainComponent.snsShare = function(){
    var url = encodeURIComponent(location.href),
        // title = encodeURI(document.title),
        title = encodeURI($('.bl_headingLv1.rt_cf_n_title').text() + ' | TORAY'),
        $p = $('.bl_snsShare'),
        fbLink = 'http://www.facebook.com/share.php?u=' + url + '&t=' + title,
        twLink = 'https://twitter.com/share?text=' + title + '&url=' + url,
        likedinLink = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;

    $p.find('.fb').attr('href',fbLink);
    $p.find('.tw').attr('href',twLink);
    $p.find('.in').attr('href',likedinLink);

    if(!MainComponent.windowSizeSp()){
      $p.find('a').on('click',function(){
        window.open(this.href, 'snswindow', 'width=550, height=450,personalbar=0,toolbar=0,scrollbars=1,resizable=1'); return false;
      })
    }
  }

  // 開発環境判定
  MainComponent.devLocalDecision = function() {
    var siteName1 = 'toray-cojp-renew.moose-inc.jp',// テスト環境URL1
        siteName2 = '|' + 'test.toray.co.jp';// テスト環境URL2
        siteName3 = '|' + '188.test55.net';// テスト環境URL3
    var regExp = new RegExp("(".concat(siteName1, siteName2, siteName3, "|localhost|127.0.0.|192.168.0.|192.168.11.|192.168.1.)"), 'g');
    return regExp.test(location.hostname);
  };

  // 開発環境判定（ローカル環境ならincludeをAjaxで読み込む）
  MainComponent.devIncludeLoading = function() {
    var self = this;
    var key = 'inc_';
    var ajaxArray = [];
    var ajaxArrayList = [];
    var i, j;
    var includeClass = document.querySelectorAll("[class*=\"".concat(key, "\"]"));
    var includeClassLen = includeClass.length;

    for (i = 0; i < includeClassLen; i++) {
      var path = includeClass[i].innerHTML.split(' ')[1];
      ajaxArray.push(path);
    }

    var ajaxLen = ajaxArray.length;

    if (ajaxLen > 0) {
      return new Promise(function(resolve, reject) {
        for (i = 0; i < ajaxLen; i++) {
          ajaxArrayList[i] = $.ajax({
            type: 'GET',
            url: ajaxArray[i] + '.html',
            dataType: 'html',
            timeout: 5000
          });
        }

        // $.when.apply($, ajaxArrayList).done(function () {
        $.when
        .apply($, ajaxArrayList)
        .then(function () {
          var regExp = new RegExp(key);

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          for (i = 0; i < args.length; i++) {
            var result = args[i];
            var position = $(result[0]).filter(':first').attr('class').split(' ');

            for (j = 0; j < position.length; j++) {
              if (position[j].match(regExp)) {
                position = position[j];
                break;
              }
            }

            $('.' + position).html(result[0]).children().unwrap();
            // console.log('Succeeded to read the include file!:', position);
          }
          resolve();
        });
      });// end promise
    } else {}
  };

  // お問い合わせ
  MainComponent.contactLink = function(pass) {
    var path = document.location.pathname.split('/')[1],
        pathF = document.location.pathname,
        num = pass;
    function openContactWin(url){
      window.open(url + "?s=" + location.href.replace(/\?.*/,""), "contactwin");
    };

    switch (path) {
      case 'ir': num = '181';
        break;
      case 'saiyou': num = '458';
        break;
      case 'sustainability': num = '169';
        break;
      case 'technology': num = '139';
        break;
      default:
        break;
    }

    switch (pathF) {
      case '/sustainability/stance/contribution/edu_01.html': num = '590';
        break;
      case '/sustainability/stance/contribution/edu_02.html': num = '591';
        break;
      case '/sustainability/activity/compliance/medical.html': num = '194';
        break;
      case '/sustainability/activity/compliance/patient.html': num = '194';
        break;
      case '/technology/preventing-misconduct/': num = '1241';
        break;
      default:
        break;
    }

    if(num == '000'){openContactWin("/contact/");//宣伝室コンタクトDB
    }else if(num == '133'){openContactWin("https://www.contact.toray/input/133");//総務部コンタクトDB
    }else if(num == '135'){openContactWin("https://www.contact.toray/input/135");//長･短繊維部コンタクトDB
    }else if(num == '136'){openContactWin("https://www.contact.toray/input/136");//長･短繊維部コンタクトDB ＆＋
    }else if(num == '204'){openContactWin("https://www.contact.toray/input/204");//産資・不織布部コンタクトDB
    }else if(num == '205'){openContactWin("https://www.contact.toray/input/205");//不織布部
    }else if(num == '213'){openContactWin("https://www.contact.toray/input/213");//ウルトラスエード部コンタクトDB
    }else if(num == '210'){openContactWin("https://www.contact.toray/input/210");//婦人紳士部コンタクトDB
    }else if(num == '149'){openContactWin("https://www.contact.toray/input/149");//シルックきものコンタクトDB
    }else if(num == '151'){openContactWin("https://www.contact.toray/input/151");//シルックきものコンタクトDB 2
    }else if(num == '155'){openContactWin("https://www.contact.toray/input/155");//NANODESIGNコンタクトDB
    }else if(num == '206'){openContactWin("https://www.contact.toray/input/206");//スポーツ・衣料資材部コンタクトDB
    }else if(num == '215'){openContactWin("https://www.contact.toray/input/215");//機能製品部コンタクトDB
    }else if(num == '163'){openContactWin("https://www.contact.toray/input/163");//LIVMOA
    }else if(num == '173'){openContactWin("https://www.contact.toray/input/173");//hitoeコンタクトDB
    }else if(num == '216'){openContactWin("https://www.contact.toray/input/216");//樹脂部門コンタクトDB
    }else if(num == '221'){openContactWin("https://www.contact.toray/input/221");//樹脂部門（環境負荷）コンタクトDB
    }else if(num == '219'){openContactWin("https://www.contact.toray/input/219");//樹脂部門(SDS)コンタクトDB
    }else if(num == '226'){openContactWin("https://www.contact.toray/input/226");//ケミカル部門コンタクトDB
    }else if(num == '175'){openContactWin("https://www.contact.toray/input/175");//動物薬コンタクトDB
    }else if(num == '223'){openContactWin("https://www.contact.toray/input/223");//フィルム本部コンタクトDB
    }else if(num == '186'){openContactWin("https://www.contact.toray/input/186");//複材本部コンタクトDB
    }else if(num == '189'){openContactWin("https://www.contact.toray/input/189");//電子情報材料本部コンタクトDB
    }else if(num == '192'){openContactWin("https://www.contact.toray/input/192");//印写部コンタクトDB
    }else if(num == '143'){openContactWin("https://www.contact.toray/input/143");//HBCグローバル室コンタクトDB
    }else if(num == '194'){openContactWin("https://www.contact.toray/input/194");//医薬・医療本部コンタクトDB
    }else if(num == '179'){openContactWin("https://www.contact.toray/input/179");//メンブレン部コンタクトDB
    }else if(num == '160'){openContactWin("https://www.contact.toray/input/160");//水処理システム部コンタクトDB
    }else if(num == '196'){openContactWin("https://www.contact.toray/input/196");//トレビーノ部コンタクトDB
    }else if(num == '197'){openContactWin("https://www.contact.toray/input/197");//トレシー室（工業用）コンタクトDB
    }else if(num == '199'){openContactWin("https://www.contact.toray/input/199");//トレシー室（一般用）コンタクトDB
    }else if(num == '176'){openContactWin("https://www.contact.toray/input/176");//トレシー室（一般用）コンタクトDB
    }else if(num == '201'){openContactWin("https://www.contact.toray/input/201");//トレシー室（カスタム）コンタクトDB
    }else if(num == '180'){openContactWin("https://www.contact.toray/input/180");//オプティカル部コンタクトDB
    }else if(num == '456'){openContactWin("https://www.contact.toray/input/456");//エアフィルター部コンタクトDB
    }else if(num == '459'){openContactWin("https://www.contact.toray/input/459");//新事業部門コンタクトDB
    }else if(num == '161'){openContactWin("https://www.contact.toray/input/161");//APOA2コンタクトDB
    }else if(num == '146'){openContactWin("https://www.contact.toray/input/146");//ナノアロイコンタクトDB
    }else if(num == '144'){openContactWin("https://www.contact.toray/input/144");//合繊クラスターコンタクトDB
    }else if(num == '139'){openContactWin("https://www.contact.toray/input/139");//マーケティング企画室コンタクトDB
    }else if(num == '183'){openContactWin("https://www.contact.toray/input/183");//広報室コンタクトDB
    }else if(num == '177'){openContactWin("https://www.contact.toray/input/177");//宣伝室コンタクトDB
    }else if(num == '181'){openContactWin("https://www.contact.toray/input/181");//IR室コンタクトDB
    }else if(num == '458'){openContactWin("https://www.contact.toray/input/458");//人事採用課コンタクトDB
    }else if(num == '172'){openContactWin("https://www.contact.toray/input/172");//国際勤労部コンタクトDB
    }else if(num == '169'){openContactWin("https://www.contact.toray/input/169");//CSR室コンタクトDB
    }else if(num == '590'){openContactWin("https://www.contact.toray/input/590");//CSR教育支援活動コンタクトDB
    }else if(num == '591'){openContactWin("https://www.contact.toray/input/591");//CSR教育支援活動コンタクトDB 2
    }else if(num == '1241'){openContactWin("https://www.contact.toray/input/1241");//コンプライアンスに関する通報・相談窓口
    }else if(num == '164'){openContactWin("https://www.contact.toray/input/164");//滋賀ボート部コンタクトDB
    }else if(num == '165'){openContactWin("https://www.contact.toray/input/165");//GDPR対応コンタクトDB
    }else if(num == '595'){openContactWin("https://www.contact.toray/input/595");//電気カーペットコンタクトDB
    }else if(num == '010'){openContactWin("http://www.toray.jp/contact2/con_010.html");//ファイバー部門コンタクトDB
    }else if(num == '020'){openContactWin("http://www.toray.jp/contact2/con_020.html");//産資・機能素材部門コンタクトDB
    }else if(num == '021'){openContactWin("http://www.toray.jp/contact2/con_021.html");//繊維グリーンイノベーション室
    }else if(num == '030'){openContactWin("http://www.toray.jp/contact2/con_030.html");//テキスタイル部門コンタクトDB
    }else if(num == '033'){openContactWin("https://go.mktg.toray/t006-WF-202011xx-1404-01-Inquiry.html");//婦人・紳士部コンタクト 展示会 DB
    }else if(num == '040'){openContactWin("http://www.toray.jp/contact2/con_040.html");//エクセーヌ部コンタクトDB
    }else if(num == '051'){openContactWin("http://www.toray.jp/contact2/con_051.html");//トーレペフコンタクトDB
    }else if(num == '111'){openContactWin("http://www.toray.jp/contact2/con_111.html");//光ファイバコンタクトDB
    }else if(num == '112'){openContactWin("http://www.toray.jp/contact2/con_112.html");//電材1部(電気カーペット)コンタクトDB
    }else if(num == '130'){openContactWin("http://www.toray.jp/contact2/con_130.html");//電材２部無機材コンタクトDB
    }else if(num == '200'){openContactWin("http://www.toray.jp/contact2/con_200.html");//TOREXショップコンタクトDB
    }else if(num == '251'){openContactWin("http://www.toray.jp/contact2/con_251.html");//エコドリームコンタクトDB
    }else if(num == '252'){openContactWin("http://www.toray.jp/contact2/con_252.html");//ウェブショップコンタクトDB
    }else if(num == '0010'){openContactWin("http://www.toray-medical.com/contact/con_00.html");//東レ・メディカル
    }else if(num == '0020'){openContactWin("http://www.toray-taf.co.jp/contact/index.html");//東レフィルム加工
    }else if(num == '0030'){openContactWin("http://www.tbr.co.jp/contact/contact.html");//東レ経営研究所
    }else if(num == '0040'){openContactWin("http://www.toray-intl.co.jp/contact/contact.html");//東レインターナショナル
    }else if(num == '0050'){openContactWin("http://www.toray-system.co.jp/contact/index.html");//東レシステムセンター
    }else if(num == '0060'){openContactWin("http://www.toray-mono.com/contact/contact.html");//東レ・モノフィラメント
    }else if(num == '0070'){openContactWin("http://www.toray-opt.co.jp/contact2/contact.html");//東レ・オペロンテックス
    }else if(num == '0080'){openContactWin("http://www.td-net.co.jp/contact2/contact.html");//東レ・デュポン（全社）
    }else if(num == '0081'){openContactWin("http://www.td-net.co.jp/kevlar/contact2/contact.html");//東レ・デュポン（ケブラー）
    }else if(num == '0082'){openContactWin("http://www.td-net.co.jp/kapton/contact2/contact.html");//東レ・デュポン（カプトン）
    }else if(num == '0083'){openContactWin("http://www.td-net.co.jp/hytrel/contact2/contact.html");//東レ・デュポン（ハイトレル）
    }else if(num == '0090'){openContactWin("http://www.toray.jp/contact2/con_0090.html");//東レリサーチセンター(分析)
    }else if(num == '0091'){openContactWin("http://www.toray.jp/contact2/con_0091.html");//東レリサーチセンター(出版)
    }else if(num == '0092'){openContactWin("http://www.toray.jp/contact2/con_0092.html");//東レリサーチセンター(人事)
    }else if(num == '0093'){openContactWin("http://www.toray.jp/contact2/con_0093.html");//東レリサーチセンター(受託調査研究)
    }else if(num == '0100'){openContactWin("http://www.toray-ace.com/contact/index.html");//東レACE
    }else if(num == '0110'){openContactWin("http://www.toray.jp/contact2/con_0110.html");//セティーラ
    }else if(num == '0120'){openContactWin("http://www.toray.jp/contact2/con_0120.html");//東レハイブリットコード
    }else if(num == '0130'){openContactWin("http://www.toray.jp/contact2/con_0130.html");//東レコーテックス
    }else if(num == '0140'){openContactWin("http://www.toray.jp/contact2/con_0140.html");//東レファインケミカル
    }else if(num == '0150'){openContactWin("http://www.toray.jp/contact2/con_0150.html");//東レ建設
    }else if(num == '0160'){openContactWin("http://www.toray.jp/contact2/con_0160.html");//東レエンジニアリング
    }else if(num == '0170'){openContactWin("http://www.toplaseiko.com/contact/con_001.html");//東レプラスチック精工
    }else if(num == '0180'){openContactWin("http://www.toray-enter.co.jp/contact/");//東レエンタープライズ
    }else{
      location.href="/" + "?" + location.href;
    }
  };

  // Referrer
  MainComponent.contactReferrer = function(href) {
    var path = location.href,
        url = href.replace("?Openform&&","?Openform&"+path+"&");
    window.open(url, "_blank");
  }

  // window close
  MainComponent.closeWindow = function(){
    window.opener = window;
    var win = window.open(location.href,"_self");
    win.close();
  };

  // Tab
  MainComponent.tab = function(){
    var tab = $('[role="tab"]'),
        tabpanel = $('[role="tabpanel"]');

    tab.stop().on('click', function(event) {
      event.preventDefault();
      var _self = $(this),
        select = _self.attr('aria-selected'),
        id = _self.attr('aria-controls'),
        id_body = $('#' + id);

      if (select === 'true') {
        return false;
      }

      tabpanel.attr('aria-hidden', true);
      id_body.attr('aria-hidden', false);

      tab.attr('aria-selected', false);
      _self.attr('aria-selected', true);
    });
  };

  // サイトロゴ挿入（ヘッダー）
  MainComponent.addSiteLogo = function(site){
    var $target = $('.ly_header .groupLogo'),
        elem = "";
    switch(site){
      case 'lifeinnovation':
        elem = '<div class="siteLogo"><a href="/lifeinnovation/" aria-label=""><img src="/shared/images/toray_life_innovation_logo.svg" alt="lifeinnovation"></a></div>';
        break;
      case 'greeninnovation':
        elem = '<div class="siteLogo"><a href="/greeninnovation/" aria-label=""><img src="/shared/images/toray_green_innovation_logo.svg" alt="greeninnovation"></a></div>';
        break;
    }

    $target.after(elem);
  };

  // Chapter Ornament
  MainComponent.chapterOrnament = function(){
    if($('.bl_chapterOrnament').length){
      var $selector = $('.bl_chapterOrnament'),
      $elm = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
      $selector.append($elm).addClass('is_show');
    }
  };

  // Code to carry out after an HTML road
  $(function() {
    MainComponent.windowSizeSp();

    if (MainComponent.devLocalDecision()) {
      MainComponent.devIncludeLoading()
      .then(MainComponent.siteSearchSettings)
      .then(MainComponent.menu)
      .then(MainComponent.localNav)
      .then(MainComponent.copyright)
      .then($('body').addClass('is_loaded'))
      .then(MainComponent.chapterOrnament);
    }else{
      MainComponent.siteSearchSettings();
      MainComponent.menu();
      MainComponent.localNav();
      MainComponent.copyright();
      MainComponent.chapterOrnament();
      $('body').addClass('is_loaded');
    }

    MainComponent.pagetop.init();
    MainComponent.util.hashCtrl();


    // header height
    //--------------------------------
    $(window).on('load scroll.h', $.debounce(10, function(){
      var scrollPos = $(this).scrollTop();
      if ( scrollPos > 70 ) {
        $('body').addClass('is_scrolled');
      } else {
        $('body').removeClass('is_scrolled');
      }
     }));


    //--------------------------------
    if($('.kvWrap').length && MainComponent.winW < 768){
      MainComponent.bxwrap();
    }

    if($('#overlay').length){
      MainComponent.loader();
    }

    if($('.spKVSubstitution').length){
      $('.spKVSubstitution').each(function(){
        MainComponent.spkvchange();
      });
    }

    if($('.bl_tabLink [role="tab"], .tabNav [role="tab"]').length){
      MainComponent.tab();
    }

    // more btn
    //--------------------------------
    if($('.js_moreList').length){
      $('.js_moreList').each(function(index){
        var $list = $(this).children();
        var itemLength = $list.length;
        var showLength = Number($(this).data('more'));
        var btnId = String('list' + index);
        var moreBtn = '<div class="bl_btnWrap"><button type="button" class="el_moreBtn" aria-controls="'+ btnId +'">もっと見る</button></div>';

        if(itemLength > showLength){
          $(this).after(moreBtn);
          $list.each(function(index){
            if(showLength < (index + 1)){
              $(this).addClass('is_hide');
            }
          });

        }
      });
    }

    $('.el_moreBtn').on('click',function(event){
      var targetId = $(this).attr('aria-controls');
      var $targetwrap = $('#'+targetId);
      var $list = $targetwrap.children();
      var dispNum = Number($targetwrap.data('more'));

      $(".is_hide",$targetwrap).slice(0, dispNum).removeClass('is_hide');
      if ($(".is_hide",$targetwrap).length == 0) {
        $(this).parent().fadeOut();
      }
    });

    //sns
    //--------------------------------
    if($('.bl_snsShare').length){
      MainComponent.snsShare();
    }

    // IE picturefill
    //--------------------------------
    if($UA.isIE){
      var el = document.createElement("script");
      el.src = "/shared/js/picturefill.min.js";
      document.body.appendChild(el);
    }

    // products photo
    //--------------------------------
    $('.bl_changeImg').each(function(){
      var click_flg = false,
          $pd = $('.bl_changeImg'),
          $photo = $(".screen",this),
          $media = $('.thumbs',this);
      $media.find('a').on('click',function(e){
      if(click_flg == false) {
          click_flg = true;
          if($(this).hasClass('media')){
            e.preventDefault();
            var $target = $(this).attr('data-label');
            $photo.children().eq(0).before($($target).clone());
            // $($target).addClass('current');
          }else{
            $photo.children().eq(0).before("<img src='"+$(this).attr("href")+"' alt=''>");
          }
          $photo.children().eq(1).stop(true, false).fadeOut("fast",function(){
            $(this).remove();
            click_flg = false;
          });
          return false;
        }else{
          return false;
        }
      });
    })

    //match height
    //--------------------------------
    $('.insideLinksWid li').matchHeight();
    // $('ul[class*="fluid"]:not(.fluid) li').matchHeight();
    $('.row [class*="inner-col"]').matchHeight();
    $('.row [class*="img-cap"]').matchHeight();
    $('.linksWrap li').matchHeight();


    // Accordion
    //--------------------------------
    if($('.accWrap').length){
      var locationSearch = window.location.search.substr(1);
      if( locationSearch !== '' && locationSearch.indexOf('bTabOpen=') !== -1 ){
        var tabNo = locationSearch.replace ('bTabOpen=','');
        $('.accWrap .accHead').filter(':eq('+tabNo+')').trigger('click');
        $('.accWrap .accHead').filter(':eq('+tabNo+')').addClass('accordion-open').removeClass('accordion-close');
      }
    }

  });
}(jQuery));



// after load
//--------------------------------
$(window).on('load',function () {
  $('#overlay').fadeOut(500);

  if(!$('#globalNav').length){
    $('body').addClass('is_noGnav');
  }

  // header site logo
  //--------------------------------
  if(typeof($('body').data('header')) != "undefined"){
    var site = $('body').data('header');
    MainComponent.addSiteLogo(site);
  }
});


// Window Resize Event
//--------------------------------
(function(){
  var $timer = false;
  $(window).resize(function() {
    if ($timer !== false) {
      clearTimeout($timer);
    }
    $timer = setTimeout(function(){
      MainComponent.windowSizeSp();
    }, 200);
  });
})();