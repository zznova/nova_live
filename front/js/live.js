
	var config= [
		'|',
		'fullscreen',
        'undo',
        'redo',
		'|',
        'img',
        //'video',
        'bold',
        'underline',
        'italic',
        'strikethrough',
        'eraser',
        'forecolor',
        'bgcolor',
        '|',
        //'quote',
        'fontfamily',
        'fontsize',
        'head',
        //'unorderlist',
        'orderlist',
        'alignleft',
        'aligncenter',
        'alignright',
        '|',
        'link',
        'unlink',
        //'table',
        //'emotion',
        
        //'location',
        //'insertcode',
		//'source',
		
    ];
	var ws;
	var token=localStorage.getItem('console_tk');
	var editor=null;
	var editing=0;
	var teditor=null;
	var editing_bt;
	var upload_path='/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJTUQ2and2d2NJbWVMSlk2TXRBQ2ZPST0@';
	var roomid=0;
	var id=0;
	var eptime='';
	var raw='';
	$(document).ready(function(){
		function myBrowser(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
		var isOpera = userAgent.indexOf("Opera") > -1;
		//console.log(userAgent);
		if (isOpera) {
			return "Opera"
		} //判断是否Opera浏览器
		else if((window.navigator.mimeTypes[40] ||!window.navigator.mimeTypes.length)&&userAgent.indexOf("Macintosh")==-1){
			return "360";
		}
		else if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
		} //判断是否Firefox浏览器
		else if (userAgent.indexOf("Chrome") > -1){
		
			return "Chrome";
		}
		else if (userAgent.indexOf("Safari") > -1) {
			return "Safari";
		} //判断是否Safari浏览器
			else if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
			return "IE";
		} //判断是否IE浏览器
			else return "unknown";
		}
	//以下是调用上面的函数
	var mb = myBrowser();
	if ("Chrome" !== mb) {
		alert('请使用谷歌浏览器登录后台！');
		$('#live').replaceWith(' ');
		return;
	}

		init();
	});
	if (typeof console == "undefined") {    this.console = { log: function (msg) {  } };}
   

	if(token==null)window.location.href="room.html";
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

	function init(){
	roomid=getParameter('id');
	console.log(token);
	$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJSVFwUVE0aEF2emU4ajRNSjBUK0xRbz0@",
			dataType: 'json',
			data: {roomid:roomid,token:token}
		})
		.done(function( msg ) {
			if(msg.state=='no auth')window.location.href="room.html";
			if(msg.error=='closed'){
				$('#parent').remove();
				$('#publish').remove();
				$('#list').append('<div class="cells"><h1>直播已结束。</h1></div>');
				return;
			}
			id=msg.maxid;
			document.title='直播间：'+msg.room_name;
			console.log(msg);
			$.each(msg.list,function(k,v){
				$('#list').append('<div id="'+v.id+'" class="cells"><div id="op_'+v.id+'"><span  class="opts"><input id="editbt_'+v.id+'" type="button" class="btn" onclick="edit('+v.id+',this)" value="修改"/><input id="delbt_'+v.id+'" type="button" class="btn" onclick="del('+v.id+')" value="删除"/></span></div><span class="date">'+v.ptime+'</span><span class="host">['+v.host+']</span><div id="c_'+v.id+'" class="content"><div id="content_'+v.id+'">'+v.content+'</div><!--{owner:'+v.owner+',editor:'+v.editor+'}--></div></div>');
			});

			//初始化ws连接
				ws = new WebSocket("wss://webapp.yunnan.cn/wss:443");
				var ms=null;
				ws.onopen = function() {
					console.log("连接成功");	
					ws.send('{"c":"reg","roomid":"'+roomid+'"}');
					setInterval(function(){ ws.send('{"c":"reg","roomid":"'+roomid+'"}');},60000);//刷新人数，保持链接
				};
				ws.onmessage = function(e) {
					console.log("服务端的消息：" + e.data);
					ms=jQuery.parseJSON(e.data);
					//console.log(token);
					$('#online').html('在线人数：'+ms.online+' 人&nbsp;&nbsp;&nbsp;<A HREF="index.html?id='+roomid+'" target="_blank">围观地址</A>');
					
					if(ms.c=='new'){
						$.each($('.cells'),function(k,v){$('#'+v.id).css('background-color','#FEFBF8')});
						content='<div id="'+ms.id+'" class="cells"><div id="op_'+ms.id+'"><span  class="opts"><input id="editbt_'+ms.id+'" type="button" class="btn" onclick="edit('+ms.id+',this)" value="修改"/><input id="delbt_'+ms.id+'" type="button" class="btn" onclick="del('+ms.id+')" value="删除"/></span></div><span class="date">'+gettime()+'</span><span class="host">['+ms.host+']</span><div id="c_'+ms.id+'" class="content"><div id="content_'+ms.id+'">'+decodeURIComponent(ms.data)+'</div></div></div>';
						$('#list').prepend(content);
						$('#'+ms.id).css('background-color','#EEFEBC');
						setTimeout(function(){$('#'+ms.id).css('background-color','#FEFBF8')},10000);
					}
					if(ms.c=='update'){
						content='<div id="'+ms.id+'" class="cells"><div id="op_'+ms.id+'"><span  class="opts"><input id="editbt_'+ms.id+'" type="button" class="btn" onclick="edit('+ms.id+',this)" value="修改"/><input id="delbt_'+ms.id+'" type="button" class="btn" onclick="del('+ms.id+')" value="删除"/></span></div><span class="date">'+eptime+'</span><span class="host">['+ms.host+']</span><div id="c_'+ms.id+'" class="content"><div id="content_'+ms.id+'">'+decodeURIComponent(ms.data)+'</div></div></div>';
						$('#'+ms.id).replaceWith(content);
					}
					if(ms.c=='del'){
						$('#'+ms.id).remove();
					}

				};

			
		});

    // 获取元素
    var div = document.getElementById('editor');
	
    // 生成编辑器
    editor = new wangEditor(div); 
	editor.config.menus = config;
	editor.config.menuFixed = false;
	editor.config.uploadHeaders = {
        'Room' : roomid,
		'Token' : token
    };
	// 将全屏时z-index修改为20000
    editor.config.zindex = 20000;
	// 上传图片（举例）
    editor.config.uploadImgUrl = upload_path;
    editor.create();

	// 菜单配置
	}

	function add(){
		content=editor.$txt.html();
		host=$('#host').val();
		if(editing!=0){
			console.log(editing);
			$("html,body").animate({scrollTop:$("#"+editing).offset().top},500);
			rs=confirm('还有修改中的内容未保存，保存并打开新的？');
			if(!rs)return;
			$("html,body").animate({scrollTop:$("#0").offset().top},500);
			save(editing,teditor,editing_bt);
		}
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJR2U0TXV4SEZKWWozQ2dZYnZhbWdLND0@",
			dataType: 'json',
			data: { roomid:roomid,id:id,content:content,host:host,token:token}
		})
		.done(function( msg ) {
			if(msg.state=='no auth'){
				localStorage.clear();
				r=confirm('会话已过期，选择是将重新登录，编辑器里的数据将丢失。选择否可以将编辑器里的内容复制保存到记事本后，再重新登录。');
				if(r)window.location.href="room.html";
				return;
			}
			id=msg.maxid;
			editor.clear();
			ws.send('{"token":"'+token+'","roomid":"'+roomid+'","c":"new","id":"'+id+'","host":"'+host+'","data":"'+encodeURIComponent(content)+'"}');
		});
	}

	function edit(id,bt){
		var div = document.getElementById('c_'+id);
		if(editing==0){
			editing=id;
			editing_bt=bt;
		}
		else {
			$("html,body").animate({scrollTop:$("#"+editing).offset().top},500);
			rs=confirm('还有修改中的内容未保存，保存并打开新的？');
			if(!rs)return;
			save(editing,teditor,editing_bt);
		}
    // 生成编辑器
		teditor = new wangEditor(div);
		teditor.config.menus = config;
		teditor.config.menuFixed = false;
		teditor.config.uploadHeaders = {
        'Room' : roomid,
		'Token' : token
		};
		// 将全屏时z-index修改为20000
		teditor.config.zindex = 20001;
	// 上传图片（举例）
		teditor.config.uploadImgUrl = upload_path;
		teditor.create();
		teditor.$txt.html($('#content_'+id).html());
		bt.value='保存';
		bt.style.color='#ff3366';
		bt.onclick=function(){save(id,teditor,bt);};
		$('#delbt_'+id).val('取消');
		$('#delbt_'+id).removeAttr("onclick");
		$('#delbt_'+id).attr("onclick","cancel("+id+",teditor,this);");
		$('#'+id+' .wangeditor-menu-img-enlarge2').click();
		editing=id;
		raw=$('#content_'+id).html();
	}

	function save(id,editor,bt){
		content=editor.$txt.html();
		host=$('#host').val();
		editor.destroy();
		$('#'+id+' .wangEditor-container').remove();
		$('#c_'+id).attr('class','content');
		$('#c_'+id).removeAttr('style');
		$('#c_'+id).removeAttr('height');
		bt.value='修改';
		bt.style.color='#000';
		bt.onclick=function(){edit(id,this);};
		editing=0;
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJS3NwL0xPYXdFVmdjS0xrZmxTTzlPND0@",
			dataType: 'json',
			data: {roomid:roomid,id:id,content:content,host:host,token:token}
		})
		.done(function( msg ) {
			if(msg.state=='no auth'){
				localStorage.clear();
				r=confirm('会话已过期，选择是将重新登录，编辑器里的数据将丢失。选择否可以将编辑器里的内容复制保存到记事本后，再重新登录。');
				if(r)window.location.href="room.html";
				return;
			}
			console.log(msg);
			eptime=msg.ptime;
			ws.send('{"token":"'+token+'","roomid":"'+roomid+'","c":"update","id":"'+id+'","host":"'+host+'","data":"'+encodeURIComponent(content)+'"}');
		});
		
	}

	function cancel(id,editor,bt){
		editor.$txt.html(raw);
		editor.destroy();
		$('#'+id+' .wangEditor-container').remove();
		$('#c_'+id).attr('class','content');
		$('#c_'+id).removeAttr('style');
		$('#c_'+id).removeAttr('height');
		bt.value='删除';
		bt.onclick=function(){del(id,this);};
		$('#editbt_'+id).val('修改');
		$('#editbt_'+id).css("color",'#000');
		$('#editbt_'+id).removeAttr("onclick");
		$('#editbt_'+id).attr("onclick","edit("+id+",this);");
		editing=0;
	}

	function del(id){
		//$('#'+id).style.background-color="red";
		rs=confirm('确定要删除么？');
		if(rs){
			$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=WnZUenM2SElPWE9jQzVKMjhvSnFJRWo5ZER2RDNLRG54bEtWb05OajNYUT0@",
			dataType: 'json',
			data: { roomid:roomid,id:id ,token:token}
			})
			.done(function( msg ) {
				if(msg.state=='no auth'){
				localStorage.clear();
				r=confirm('会话已过期，选择是将重新登录，编辑器里的数据将丢失。选择否可以将编辑器里的内容复制保存到记事本后，再重新登录。');
				if(r)window.location.href="room.html";
				return;
			}
				//console.log(msg);
				ws.send('{"token":"'+token+'","roomid":"'+roomid+'","c":"del","id":"'+id+'"}');
			});
			$('#'+id).remove();
		}
	}

	
	function quit(){
		r=confirm('要退出么？');
		if(r){
			$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltR3pkWWRrUGVuQ0hqa3c1cUt1cGNnOD0@",
			dataType: "json",
			data: {console_tk:token}
			})
			.done(function( msg ) {
				if(msg.state=='1'){
					localStorage.clear();
					$('#desk').replaceWith('<center><h3>已退出。<A HREF="javascript:window.location.reload();" target=_self>重新登录</A></h3></center>');
				}
			});
		}
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


