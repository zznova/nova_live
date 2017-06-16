	var ws=true;
	var token=null;
	var roomid=0;
	var id=0;
	if (typeof console == "undefined") {    this.console = { log: function (msg) {  } };}

	function getParameter(name) 
    { 
	var paramStr=location.search; 
	if(paramStr.length==0)return null; 
	if(paramStr.charAt(0)!='?')return null; 
	paramStr=unescape(paramStr); 
	paramStr=paramStr.substring(1); 
	if(paramStr.length==0)return null; 
	var params=paramStr.split('&'); 
	for(var i=0;i<params.length;i++) 
	{ 
	var parts=params[i].split('=',2); 
	if(parts[0]==name) 
	{ 
	if(parts.length<2||typeof(parts[1])=="undefined"||parts[1]=="undefined"||parts[1]=="null"||parts[1]=="")return null; 
	return parts[1]; 
	} 
	} 
	return null; 
	}
	
	function gettime(){
		var myDate = new Date();
			y=myDate.getFullYear();    //获取完整的年份(4位,1970-????)
			m=myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
			d=myDate.getDate();        //获取当前日(1-31)
			h=myDate.getHours();       //获取当前小时数(0-23)
			i=myDate.getMinutes();     //获取当前分钟数(0-59)
			s=myDate.getSeconds();     //获取当前秒数(0-59)
			return y+'-'+m+'-'+d+' '+h+':'+i+':'+s;
	}

	function init(){
	if(typeof WebSocket == 'undefined'){
		$('#tool').html('抱歉您的浏览器不支持自动更新，请<A HREF="javascript:window.location.reload();">手动刷新</A>');
		ws=false;
	}
	roomid=getParameter('id');

	$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJSVFwUVE0aEF2emU4ajRNSjBUK0xRbz0@",
			dataType: 'json',
			data: {roomid:roomid}
		})
		.done(function( msg ) {
			if(msg.error=='closed'){
				$('#tool').remove();
				if(msg.alk!='')$('#list').append('<div class="cells"><h2>直播已结束。<A HREF="'+msg.alk+'" target=_blank>[查看实录]</A></h2></div>');
				else $('#list').append('<div class="cells"><h2>直播已结束。</h2></div>');
				return;
			}
			id=msg.maxid;
			document.title=msg.room_name+'[直播]';
			$.each(msg.list,function(k,v){
				$('#list').append('<div id="'+v.id+'" class="cells"><span class="date">'+v.ptime+'</span><span class="host">['+v.host+']</span><div id="c_'+v.id+'" class="content"><div id="content_'+v.id+'">'+v.content+'</div></div></div>');
			});
		
		
　		if(ws){
		ws = new WebSocket("wss://webapp.yunnan.cn/wss:443");
		var ms=null;
			ws.onopen = function() {
				console.log("连接成功 ["+gettime()+']');
				ws.send('{"c":"reg","roomid":"'+roomid+'"}');
				setInterval(function(){ ws.send('{"c":"reg","roomid":"'+roomid+'"}');},60000);//保持链接
			};
			ws.onmessage = function(e) {
				ms=jQuery.parseJSON(e.data);
				
				if(ms.c=='new'){
					$.each($('.cells'),function(k,v){$('#'+v.id).css('background-color','#FEFBF8')});
					content='<div id="'+ms.id+'" class="cells"><span class="date">'+gettime()+'</span><span class="host">['+ms.host+']</span><div id="c_'+ms.id+'" class="content"><div id="content_'+ms.id+'">'+decodeURIComponent(ms.data)+'</div></div></div>';
					$('#list').prepend(content);
					$('#'+ms.id).css('background-color','#EEFEBC');
					setTimeout(function(){$('#'+ms.id).css('background-color','#FEFBF8')},10000);

				}
				if(ms.c=='update'){
					content='<div id="'+ms.id+'" class="cells"><span class="date">'+gettime()+'</span><span class="host">['+ms.host+']</span><div id="c_'+ms.id+'" class="content"><div id="content_'+ms.id+'">'+decodeURIComponent(ms.data)+'</div></div></div>';
					$('#'+ms.id).replaceWith(content);
				}
				if(ms.c=='del'){
					$('#'+ms.id).remove();
				}
				$('#online').html('<!--围观人数：'+ms.online+'-->');
			};
			ws.onerror = function(){
				console.log('连接错误 ['+gettime()+']');
				setTimeout(function(){ window.location.reload();},60000);
			}
			ws.onclose = function(){
				console.log('连接已断开 ['+gettime()+']');
				setTimeout(function(){ window.location.reload();},60000);
			}
			}
		});
	}

	function scollbt()
	{
		window.scroll(0,document.body.scrollHeight);
	}
	function scolltp()
	{
		window.scroll(0,-document.body.scrollHeight);
	}


	

	


