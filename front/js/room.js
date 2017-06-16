	var desk=null;
	var console_tk=localStorage.getItem('console_tk');
	var tel=null;
	var username=null;
	id=0;
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
		$('#desk').replaceWith(' ');
		alert('请使用谷歌浏览器登录后台！');
		return;
	}

		login();
	});

	function GetDateStr(AddDayCount) 
	{ 
			var dd = new Date(); 
			dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
			var y = dd.getFullYear(); 
			var m = dd.getMonth()+1;//获取当前月份的日期 
			var d = dd.getDate(); 
			return y+"-"+m+"-"+d; 
	} 

	function init(){
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltTzNybURBaVpmQ2VzOGNqR2FpY0EyZz0@",
			dataType: "json",
			data: {console_tk:console_tk,open:$("#open").val()}
		})
		.done(function( msg ) {
			//console.log(msg);
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('<br/>');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			id=msg.maxid;
			$.each(msg.rooms,function(k,v){
				$('#list').append('<div id="'+v.id+'" class="cells"><div style="float:left;width:15%"><span class="roomid">房号：'+v.id+'</span></div><div style="float:right;width:85%"><span class="room_name">名称：<INPUT TYPE="text" id="room_name_'+v.id+'" value="'+v.room_name+'"></span><span class="endtime">结束时间：<INPUT TYPE="text" id="endtime_'+v.id+'" value="'+v.endtime+'" class="et_input"></span><span class="alk">归档：<INPUT TYPE="text" id="alk_'+v.id+'" value="'+v.alink+'" placeholder="归档地址"></span><span  class="opts"><input type="button" class="btn" onclick="edit('+v.id+')" value="修改"/><input type="button" class="btn" onclick="del('+v.id+')" value="删除"/><a class="btn" href="/new/s/2017/zz/live/live.html?id='+v.id+'" target=_blank>进入</a><input type="button" class="btn" onclick="fulltext('+v.id+')" value="全文"/></span></div></div><!--{owner:'+v.owner+',editor:'+v.editor+'}--></div>');
				$('#endtime_'+v.id).datetimepicker({
				lang:'ch',
				timepicker:false,
				format:'Y-m-d',
				formatDate:'Y-m-d',
				maxDate: GetDateStr(7),
				minDate: '2017-1-1'
				});
				
			});
		});
		//console.log(GetDateStr(7));
		$('#endtime').val(GetDateStr(0));
		$('#endtime').datetimepicker({
			lang:'ch',
			timepicker:false,
			format:'Y-m-d',
			formatDate:'Y-m-d',
			maxDate: GetDateStr(7),
			minDate: '2017-1-1'
			});
		$('#sign').prepend('<div style="clear:both;color:#0066cc" ><A HREF="cookbook.pdf" target=_blank>使用说明</A></div>');
	}

	function add(){
		rn=$('#room_name').val();
		if(rn==''){
			alert('名称不得为空！');
			return;
		}
		$('#room_name').val('');
		et=$('#endtime').val();

		if(rn===undefined||et===undefined)return false;
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltSGVLcUhsVUhrS2pTZU93aS9lTGlnRT0@",
			dataType: "json",
			data: { room_name:rn,endtime:et,console_tk:console_tk}
		})
		.done(function( msg ) {
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			id=parseInt(msg.id);
			$('#list').prepend('<div id="'+id+'" class="cells"><div style="float:left;width:15%"><span class="roomid">房号：'+id+'</span></div><div style="float:right;width:85%"><span class="room_name">名称：<INPUT TYPE="text" id="room_name_'+id+'" value="'+rn+'"></span><span class="endtime">结束时间：<INPUT TYPE="text" id="endtime_'+id+'" value="'+et+'" class="et_input"></span><span class="alk">归档：<INPUT TYPE="text" id="alk_'+id+'" value="" placeholder="归档地址"></span><span  class="opts"><input type="button" class="btn" onclick="edit('+id+')" value="修改"/><input type="button" class="btn" onclick="del('+id+')" value="删除"/><a class="btn" href="/new/s/2017/zz/live/live.html?id='+id+'" target=_blank>进入</a><input type="button" class="btn" onclick="fulltext('+id+')" value="全文"/> </span></div></div>');
			$('#endtime_'+id).datetimepicker({
			lang:'ch',
			timepicker:false,
			format:'Y-m-d',
			formatDate:'Y-m-d',
			maxDate: GetDateStr(7),
			minDate: '2017-1-1'
			});
		});
	}

	function edit(id){
		rn=$('#room_name_'+id).val();
		et=$('#endtime_'+id).val();
		alk=$('#alk_'+id).val();
		//console.log($('#alk_'+id));
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltR3pNT0grdGdyQkx1TW1EcyttUHpDYz0@",
			dataType: 'json',
			data: {id:id,room_name:rn,endtime:et,alk:alk,console_tk:console_tk}
		})
		.done(function( msg ) {
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			if(msg.state)layer.msg('修改成功！');
			//if(msg.state)alert('修改成功！');
		});
	}

	function del(id){
		//$('#'+id).style.background-color="red";
		rs=confirm('确定要删除么？');
		if(rs){
			$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltQVJlUmUzZG9lTmtUKyt4NkN1QVNtbz0@",
			dataType: 'json',
			data: { id:id ,console_tk:console_tk}
			})
			.done(function( msg ) {
				if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
				}
			
			$('#'+id).remove();
				//console.log(msg);
			});
			
		}
	}

	function fulltext(id){
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltSFBUR3VkckhLb1dJOXlQMFljU0ljdkpSMDZoOXVILzJXaEZsZ000OUIrQQ@@",
			dataType: "json",
			data: { roomid:id}
		})
		.done(function( msg ) {
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
				}
			layer.open({
				type: 0,
				title: false,
				offset: '20px',
				area: ['70%', '90%'],
				maxmin: true,
				content: msg.fulltext
			});
			//$('#desk').replaceWith(msg.fulltext);
		});
	}
	
	function search(){
		open=$("#open").val();
		room_name=$('#room_name').val();
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltTzNybURBaVpmQ2VzOGNqR2FpY0EyZz0@",
			dataType: "json",
			data: {console_tk:console_tk,open:open,room_name:room_name}
		})
		.done(function( msg ) {
			//console.log(msg);
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('<br/>');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			$('#list').html(' ');
			$.each(msg.rooms,function(k,v){
				if(open=='1')$('#list').append('<div id="'+v.id+'" class="cells"><div style="float:left;width:15%"><span class="roomid">房号：'+v.id+'</span></div><div style="float:right;width:85%"><span class="room_name">名称：<INPUT TYPE="text" id="room_name_'+v.id+'" value="'+v.room_name+'"></span><span class="endtime">结束时间：<INPUT TYPE="text" id="endtime_'+v.id+'" value="'+v.endtime+'" class="et_input"></span><span class="alk">归档：<INPUT TYPE="text" id="alk_'+v.id+'" value="'+v.alink+'" placeholder="归档地址"></span><span  class="opts"><input type="button" class="btn" onclick="edit('+v.id+')" value="修改"/><input type="button" class="btn" onclick="del('+v.id+')" value="删除"/><a class="btn" href="/new/s/2017/zz/live/live.html?id='+v.id+'" target=_blank>进入</a><input type="button" class="btn" onclick="fulltext('+v.id+')" value="全文"/></span></div><!--{owner:'+v.owner+',editor:'+v.editor+'}--></div>');
				else $('#list').append('<div id="'+v.id+'" class="cells"><div style="float:left;width:15%"><span class="roomid">房号：'+v.id+'</span></div><div style="float:right;width:85%"><span class="room_name">名称：<INPUT TYPE="text" id="room_name_'+v.id+'" value="'+v.room_name+'" readonly></span><span class="endtime">结束时间：<INPUT TYPE="text" id="endtime_'+v.id+'" value="'+v.endtime+'" class="et_input" readonly></span><span class="alk">归档：<INPUT TYPE="text" id="alk_'+v.id+'" value="'+v.alink+'" placeholder="归档地址"></span><span  class="opts"><input type="button" class="btn" onclick="edit('+v.id+')" value="修改"/><input type="button" class="btn" onclick="fulltext('+v.id+')" value="全文"/></span></div><!--{owner:'+v.owner+',editor:'+v.editor+'}--></div>');
				$('#endtime_'+v.id).datetimepicker({
				lang:'ch',
				timepicker:false,
				format:'Y-m-d',
				formatDate:'Y-m-d',
				maxDate: GetDateStr(7),
				minDate: '2017-1-1'
				});
				
			});
		});
		//console.log(GetDateStr(7));
		

	}

	function login(){
		//console.log(console_tk);
		if(console_tk==null){
		localStorage.clear();
		localStorage.setItem('reg', '0');
		desk=$('#desk').html();
		login='<center id="desk"><div>NOVA图文直播</div><div><input id="username" type="textbox" placeholder="实名帐号"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="登录"/><input type="button" class="lgbtn" onclick="user_reg()" value="注册"/></div></center>';
		$('#desk').replaceWith(login);
		}
		else init();
	}

	function quit(){
		r=confirm('要退出么？');
		if(r){
			$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltR3pkWWRrUGVuQ0hqa3c1cUt1cGNnOD0@",
			dataType: "json",
			data: {console_tk:console_tk}
			})
			.done(function( msg ) {
				localStorage.clear();
				$('#desk').replaceWith('<center><h3>已退出。<A HREF="javascript:window.location.reload();" target=_self>重新登录</A></h3></center>');
			});
		}
	}

	function user_reg(){
		rhost=window.location.host;
		if(rhost.indexOf('172')!==0){
			alert('走错片场了，请打开手册上的注册地址！');
			return;
		}
		login='<center id="desk"><div>注册信息</div><div><input id="username" type="textbox" placeholder="请用实名"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="获取验证短信"/></div></center>';
		$('#desk').replaceWith(login);
		localStorage.setItem('reg', '1');
	}

	function getpwd(){
		reg=localStorage.getItem('reg');
		console.log(reg);
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltSWs1bnZJUGRtdUtTdzlJTlZMMDd2UT0@",
			dataType: "json",
			data: { username:$('#username').val(),tel:$('#tel').val(),reg:reg}
		})
		.done(function( msg ) {
			if(msg=='1'){
				tel=$('#tel').val();
				username=$('#username').val();
				$('#desk').replaceWith('<center id="desk"><div><input id="pwd" type="textbox" class="lgbtn" placeholder="短信验证码"></div><div><input id="lgbt" type="button" class="btn" onclick="ckpwd()" value="登录"/></div></center>');
			}
			else if(msg.state=='3'&&msg.error=='exist'){
				alert('帐号已注册！');
				$('#desk').replaceWith('<center id="desk"><div>NOVA图文直播</div><div><input id="username" type="textbox" placeholder="实名帐号"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="登录"/><input type="button" class="lgbtn" onclick="user_reg()" value="注册"/></div></center>');
				localStorage.setItem('reg', '0');
				return;
			}
			else if(msg.state=='3'){
				localStorage.setItem('reg_data',msg.data);
				tel=$('#tel').val();
				username=$('#username').val();
				if(msg.error=='inactive'){
					alert('帐号未激活！请联系管理员激活。');
					$('#desk').replaceWith('<center id="desk"><div>NOVA图文直播</div><div><input id="username" type="textbox" placeholder="实名帐号"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="登录"/><input type="button" class="lgbtn" onclick="user_reg()" value="注册"/></div></center>');
					localStorage.setItem('reg', '0');
					return;
				}
				$('#desk').replaceWith('<center id="desk"><div><input id="pwd" type="textbox" class="lgbtn" placeholder="短信验证码"></div><div><input id="lgbt" type="button" class="btn" onclick="ckpwd()" value="登录"/></div></center>');
				}
			else if(msg.state=='-1')alert('已超本小时过验证码获取上限！');
			else if(msg.error=='unregister'&&reg!='1')alert('查无此人！');
			else alert('发送失败！');
		});
	}

	function ckpwd(){
		reg=localStorage.getItem('reg');
		reg_data=localStorage.getItem('reg_data');
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltRWZFNWZoZTBIYjNhNVBvLzJacklsMD0@",
			dataType: "json",
			data: { pwd:$('#pwd').val(),tel:tel,username:username,reg:reg,reg_data:reg_data}
		})
		.done(function( msg ) {
			if(msg.state=='1'){
				$('#desk').replaceWith('<center id="desk">'+desk+'</center>');
				console_tk=msg.tk;
				localStorage.setItem('console_tk', msg.tk);
				init();
			}
			else if(msg.state=='2'){
					console.log(msg);
					if(msg.data=='inactive')alert('已注册！请联系管理员激活帐号后，方可登录！');
					$('#desk').replaceWith('<center id="desk"><div>NOVA图文直播</div><div><input id="username" type="textbox" placeholder="实名帐号"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="登录"/><input type="button" class="lgbtn" onclick="user_reg()" value="注册"/></div></center>');
				}
			else {
				alert('验证失败！');
				$('#desk').replaceWith('<center id="desk"><div>NOVA图文直播</div><div><input id="username" type="textbox" placeholder="实名帐号"></div><div><input id="tel" type="textbox" placeholder="手机号"></div><div><input type="button" class="lgbtn" onclick="getpwd()" value="登录"/><input type="button" class="lgbtn" onclick="user_reg()" value="注册"/></div></center>');
			}
		})
		localStorage.getItem('reg');
	}

	function user_list(){
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltR3NTNkZPaTZGeEFUOXJPUFFzVG9FK0IvT3B3VEdrUVJTNFFNc3RZeGNOTQ@@",
			dataType: "json",
			data: {console_tk:console_tk}
		})
		.done(function( msg ) {
			console.log(msg);
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('<br/>');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			list='';
			$.each(msg.data,function(k,v){
				if(v.valid=='1')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="warnbtn" onclick=user_del("'+k+'") value="删除"/></div>';
				if(v.valid=='0')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="btn" onclick=user_active("'+k+'") value="激活"/></div>';
			});
			layer.open({
				type: 0,
				title: '用户管理',
				offset: '10%',
				area: ['60%', '60%'],
				maxmin: true,
				content: '<div id="userlist">'+list+'</div>'
			});
			
		});
	}

	function user_del(id){
		rs=confirm('确定要删除么？');
		if(rs){
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltRjdnejViNytGUFkrZWsvcDlmOGJLZ3JjeGhMSVZJWkdxbklvOU1Hc29wcQ@@",
			dataType: "json",
			data: {console_tk:console_tk,id:id}
		})
		.done(function( msg ) {
			console.log(msg);
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('<br/>');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			list='';
			$.each(msg.data,function(k,v){
				if(v.valid=='1')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="warnbtn" onclick=user_del("'+k+'") value="删除"/></div>';
				if(v.valid=='0')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="btn" onclick=user_active("'+k+'") value="激活"/></div>';
			});
			$('#userlist').replaceWith('<div id="userlist">'+list+'</div>');
			
		});
		}
	}

	function user_active(id){
		$.ajax({
			method: "POST",
			url: "/new/index.php?nova_p=VE0xbDVOenI0eC9JOVFaOVd2WHltTGYvUFM4RVZ6VS83UUg5dExYZnRKMk92OGFIQkNXUmF6cVp6NXFRdHo0Rg@@",
			dataType: "json",
			data: {console_tk:console_tk,id:id}
		})
		.done(function( msg ) {
			console.log(msg);
			if(msg.state=='no auth'){
				localStorage.clear();
				$('#desk').replaceWith('<br/>');
				alert('会话已过期，请重新登录！');
				window.location.href="room.html";
				return;
			}
			list='';
			$.each(msg.data,function(k,v){
				if(v.valid=='1')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="warnbtn" onclick=user_del("'+k+'") value="删除"/></div>';
				if(v.valid=='0')list+='<div>'+v.username+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.tel+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_time+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.last_ip+'&nbsp;&nbsp;&nbsp;&nbsp;'+v.key+'<input type="button" class="btn" onclick=user_active("'+k+'") value="激活"/></div>';
			});
			$('#userlist').replaceWith('<div id="userlist">'+list+'</div>');
			
		});
	}


