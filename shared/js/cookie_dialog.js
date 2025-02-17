/*---------------------
cookie dialog
----------------------*/
TORAY.cookieDialogString = {
  // Default
  "en": {
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Japanese
  "ja":{
    "message": "当ウェブサイトでは、お客様のニーズに合ったより良いサービスを提供するために、クッキーを使用しています。",
    "dismiss": "OK",
    "link": "クッキーポリシー"
  },
  // Portuguese
  "pt":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // German
  "de":{
    "message": "This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // French
  "fr":{
    "message": "This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Indonesian
  "id":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Thai
  "th":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Chinese
  "zh-cn":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Korean
  "ko":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Taiwan
  "zh-tw":{
    "message":"This website uses cookies to ensure you get the best experience on our website.",
    "dismiss": "OK",
    "link": "Cookie Policy"
  },
  // Taiwan
  "ru":{
    "message":"Этот веб-сайт использует файлы cookie, чтобы улучшить качество предоставляемых услуг по интересующим Вас вопросам.",
    "dismiss": "OK",
    "link": "Политика использования файлов cookie"
  }
}

TORAY.cookieDialogInit = function(href){
  if (arguments.length < 1) href = '/common/cookie.html';
  window.addEventListener("load", function(){
    var data = TORAY.cookieDialogString;
    var setting = [
      data['en'].message,
      data['en'].dismiss,
      data['en'].link,
      data['href']
    ]
    var $lang = $('html').attr('lang');
    if($lang.length > 0){
      setting[0] = data[$lang].message;
      setting[1] = data[$lang].dismiss;
      setting[2] = data[$lang].link;
    }
    window.cookieconsent.initialise({
      "palette": {
        "popup": {
          "background": "#333",
          "text": "#fff"
        },
        "button": {
          "background": "#014099",
          "text": "#fff"
        }
      },
      "position": "bottom",
      "content": {
        "message": setting[0],
        "dismiss": setting[1],
        "link": setting[2],
        "href": href
      }
    })
  });
}
