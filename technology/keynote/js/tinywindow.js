window.onload = function(){
  if(window.parent && window.self){
    if(window.parent.location == window.self.location){
      document.getElementsByTagName('body')[0].id = "directOpen";
    }else{
    }
  }
}
$(function(){
  if($UA.isTablet){
    $('body').addClass('tbAdjust');
  }
});// END