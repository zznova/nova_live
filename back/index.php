<?php
/*
简介：
作者：zznova
版本：
日期：2017-4-1
*/
defined('FROM_STARTER') or exit('来路不正！');
class index {
	private $id;
	private $roomid;
	private $redis;
	private $default_expire1;
	private $default_expire2;
	function __construct() {
		$this->default_expire1=3600*24*3650;
		$this->default_expire2=$this->default_expire2;
		header("Content-Security-Policy: default-src 'self'");
		$header=getallheaders();
		if(isset($_POST['roomid'])&&ctype_digit($_POST['roomid']))$this->roomid=$_POST['roomid'];
		else if(isset($_GET['r'])&&ctype_digit($_GET['r']));
		else if(isset($header['Room'])&&ctype_digit($header['Room']));
		else exit('roomid requied');
		$this->redis=get_predis();
	}

	function upload(){
		$header=getallheaders();
		$_POST['token']=$header['Token'];
		$this->check_tk();
		if(ctype_digit($header['Room']))$room=$header['Room'];
		else exit('no such room.');
		if(isset($_FILES['wangEditorH5File']))$file = $_FILES['wangEditorH5File']; // 获取 h5 方式上传的文件
		if(isset($_FILES['wangEditorFormFile']))$file = $_FILES['wangEditorFormFile']; // 获取 form 方式上传的文件
		if(isset($_FILES['wangEditorPasteFile']))$file = $_FILES['wangEditorPasteFile']; // 获取粘贴截图 方式上传的文件
		if(isset($_FILES['wangEditorDragFile']))$file = $_FILES['wangEditorDragFile']; // 获取拖拽上传的文件
		if(!isset($file))exit("upload failed.");
		//var_dump($file);
		$allowed=array('jpg','jpeg','png','bmp','gif');
		$filetype = pathinfo($file['name'],PATHINFO_EXTENSION);
		if(!in_array($filetype,$allowed))exit('not allowed.');
		safe_img($file['tmp_name'],$filetype);
		$data='';
		$inputStream=fopen($file['tmp_name'], 'r');
		if(!file_exists($file['tmp_name'])){
				trigger_error('tmp file not exists.'); 
				exit("upload failed.");
		}
		while (is_resource($inputStream)&&!feof($inputStream))$data.= fread($inputStream, 1024);
		$filename=date('Ym').'_'.gen_token().'.'.$filetype;
		$path=UPLOAD_PATH.ROUTE_M.DIRECTORY_SEPARATOR.'imgs'.DIRECTORY_SEPARATOR.date('Ym');
		dir_create($path);
		if(copy($file['tmp_name'],$path.DIRECTORY_SEPARATOR.$filename)){
		redis_hset($filename,'room',$room,$this->default_expire2,'',$this->redis);
		redis_hset($filename,'raw',$data,$this->default_expire2,'',$this->redis);
		redis_hset($filename,'link',ENTRANCE.'?nova_p='.encrypt_data('m=nova_live&a=get_img&n='.$filename.'&r='.$room),$this->default_expire2,'',$this->redis);
		//echo $filename.'|data:image/'.$filetype.';base64,'.base64_encode($data);
		echo $filename.'|'.ENTRANCE.'?nova_p='.encrypt_data('m=nova_live&a=get_img&n='.$filename.'&r='.$room);

		}
		else echo "upload failed.";
	}

	function get_img(){
		$filetype = pathinfo($_GET['n'],PATHINFO_EXTENSION);
		header_remove('X-Content-Type-Options');
		Header('Content-Disposition: Attachment;filename='.$_GET['n']);
		header('Content-Type:image/'.$filetype);
		$cache_time = 3600; 
		if(isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])){
			$modified_time = @$_SERVER['HTTP_IF_MODIFIED_SINCE']; 
		if( strtotime($modified_time)+$cache_time > time() ){ 
			header("HTTP/1.1 304"); 
			exit; 
		}
		}

		if(!redis_exists($_GET['n'],'',0,$this->redis)){
			$filename=$_GET['n'];
			$room=$_GET['r'];
			$date=explode('_',$filename);
			$path=UPLOAD_PATH.ROUTE_M.DIRECTORY_SEPARATOR.'imgs'.DIRECTORY_SEPARATOR.$date[0];
			if(!file_exists($path.DIRECTORY_SEPARATOR.$filename)){
				Header("HTTP/1.1 404 Not Found"); 
				header_remove('Content-Disposition');
				header_remove('Content-Type');
				exit();
			}
			$fp=fopen($path.DIRECTORY_SEPARATOR.$filename, 'r');
			while (is_resource($fp)&&!feof($fp))$data.= fread($fp, 1024);
			redis_hset($filename,'room',$room,$this->default_expire2,'',$this->redis);
			redis_hset($filename,'raw',$data,$this->default_expire2,'',$this->redis);
			redis_hset($filename,'link',ENTRANCE.'?nova_p='.encrypt_data('m=nova_live&a=get_img&n='.$filename.'&r='.$room),$this->default_expire2,'',$this->redis);
		}

		header("Last-Modified: ".gmdate("D, d M Y H:i:s", time() )." GMT");  
		echo redis_hget($_GET['n'],'raw','',$this->default_expire2,$this->redis);
	}

	function init(){
		if(isset($_POST['token']))$this->check_tk();
		$rs=array();
		$open=redis_hget('room:'.$this->roomid,'open','',$this->default_expire1,$this->redis);
		$alk=redis_hget('room:'.$this->roomid,'alink','',$this->default_expire1,$this->redis);
		if($open==0)exit(json_encode(array('state'=>0,'error'=>'closed','alk'=>$alk)));
		$list=redis_hget('room:'.$this->roomid,'list','',$this->default_expire2,$this->redis);
		//redis_del($list);
		$list=redis_lrange($list,0,redis_llen($list,$this->default_expire2,'',$this->redis),$this->default_expire2,'',$this->redis);
		foreach($list as $v){
			$c=redis_hgetall($v,'',$this->default_expire2,$this->redis);
			//echo var_dump($c);
			if(isset($c['hidden'])&&$c['hidden']==0)$rs[]=redis_hgetall($v,'',$this->default_expire2,$this->redis);
		}
		echo array2json(array('maxid'=>redis_hget('room:'.$this->roomid,'maxid','',$this->default_expire2,$this->redis),'room_name'=>redis_hget('room:'.$this->roomid,'room_name','',$this->default_expire2,$this->redis),'list'=>$rs));
	}

	function add(){
		$this->check_tk();
		$username=redis_get($_POST['token'],'',$this->default_expire2,$this->redis);
		if(isset($_POST['content'])&&$_POST['content']!='')$content=new_stripslashes(remove_xss($_POST['content']));
		else exit('content requied');
		if(isset($_POST['host'])&&$_POST['host']!='')$host=trim_script($_POST['host']);
		else exit('host requied');
		//exit(new_stripslashes($content));
		$this->id=redis_hincrby('room:'.$this->roomid,'maxid',1,$this->default_expire2,'',$this->redis);
		$cid='room:'.$this->roomid.'content:'.$this->id;
		redis_hset('room:'.$this->roomid,'list','list:'.$this->roomid,$this->default_expire2,'',$this->redis);//房间列表
		redis_hset($cid,'id',$this->id,$this->default_expire2,'',$this->redis);//内容id
		redis_hset($cid,'content',$content,$this->default_expire2,'',$this->redis);//内容
		redis_hset($cid,'owner',$username,$this->default_expire2,'',$this->redis);//创始人
		redis_hset($cid,'host',$host,$this->default_expire2,'',$this->redis);//主持人
		redis_hset($cid,'ptime',date('Y-m-d H:i:s'),$this->default_expire2,'',$this->redis);//发布时间
		redis_hset($cid,'editor',$username,$this->default_expire2,'',$this->redis);//修改人
		redis_hset($cid,'utime',date('Y-m-d H:i:s'),$this->default_expire2,'',$this->redis);//更新时间
		redis_hset($cid,'hidden',0,$this->default_expire2,'',$this->redis);//隐藏
		redis_lpush('list:'.$this->roomid,$cid,$this->default_expire2,'',$this->redis);
		$this->write2file();
		echo array2json(redis_hgetall('room:'.$this->roomid,'',$this->default_expire2,$this->redis));
	}

	function edit(){
		$this->check_tk();
		if(isset($_POST['id'])&&ctype_digit($_POST['id']))$id=$_POST['id'];
		else exit('id requied');
		if(isset($_POST['content'])&&$_POST['content']!='')$content=new_stripslashes(remove_xss($_POST['content']));
		else exit('content requied');
		if(isset($_POST['host'])&&$_POST['host']!='')$host=trim_script($_POST['host']);
		else exit('host requied');
		$username=redis_get($_POST['token'],'',$this->default_expire2,$this->redis);
		//exit(new_stripslashes($content));
		$cid='room:'.$this->roomid.'content:'.$id;
		redis_hset($cid,'content',$content,$this->default_expire2,'',$this->redis);//内容
		redis_hset($cid,'host',$host,$this->default_expire2,'',$this->redis);//主持人
		redis_hset($cid,'editor',$username,$this->default_expire2,'',$this->redis);//修改人
		redis_hset($cid,'utime',date('Y-m-d H:i:s'),$this->default_expire2,'',$this->redis);//更新时间
		$this->write2file();
		echo array2json(redis_hgetall($cid,'',$this->default_expire2,$this->redis));
	}

	function del(){
		$this->check_tk();
		if(isset($_POST['id'])&&ctype_digit($_POST['id']))$id=$_POST['id'];
		else exit('id requied');
		$cid='room:'.$this->roomid.'content:'.$id;
		$username=redis_get($_POST['token'],'',$this->default_expire2,$this->redis);
		redis_hset($cid,'hidden',1,$this->default_expire2,'',$this->redis);//隐藏
		redis_hset($cid,'operator',$username,$this->default_expire2,'',$this->redis);//删除人
		$this->write2file();
		echo '1';
	}

	protected function check_tk(){
		if(isset($_POST['token'])&&redis_exists($_POST['token'],'',3600))return true;
		else exit(json_encode(array('state'=>'no auth')));
	}

	protected function write2file(){
		$rs=array();
		$list=redis_hget('room:'.$this->roomid,'list','',$this->default_expire2,$this->redis);
		//redis_del($list);
		$list=redis_lrange($list,0,redis_llen($list,$this->default_expire2,'',$this->redis),$this->default_expire2,'',$this->redis);
		$html='';
		$json='';
		$json['room_info']=redis_hgetall('room:'.$this->roomid,'',$this->default_expire2,$this->redis);
		foreach($list as $v){
			$c=redis_hgetall($v,'',$this->default_expire2,$this->redis);
			$json['list'][]=$c;
			//echo var_dump($c);
			if(isset($c['hidden'])&&isset($c['content'])&&$c['hidden']==0){
				$rs=redis_hgetall($v,'',$this->default_expire2,$this->redis);
				$html="<p>".$rs['content']."</p>\n".$html;
			}
		}
		$html="<H1>".redis_hget('room:'.$this->roomid,'room_name','',$this->default_expire2,$this->redis)."</H1>\n".$html;
		$filename='room_'.$this->roomid.'.html';
		$path=UPLOAD_PATH.DIRECTORY_SEPARATOR.ROUTE_M.DIRECTORY_SEPARATOR.'html'.DIRECTORY_SEPARATOR.date('Ym');
		dir_create($path, $mode = 0707);
		$fp=fopen($path.DIRECTORY_SEPARATOR.$filename, 'w');
		fwrite($fp,$html);
		fclose($fp);
		$filename='room_'.$this->roomid.'.json';
		$path=UPLOAD_PATH.DIRECTORY_SEPARATOR.ROUTE_M.DIRECTORY_SEPARATOR.'json'.DIRECTORY_SEPARATOR.date('Ym');
		dir_create($path, $mode = 0707);
		$fp=fopen($path.DIRECTORY_SEPARATOR.$filename, 'w');
		fwrite($fp,json_encode($json));
		fclose($fp);
		//echo json_encode(array('state'=>'1','fulltext'=>$html));
	}

	function fulltext(){
		header("Content-type: text/html; charset=utf-8"); 
		$rs=array();
		$list=redis_hget('room:'.$this->roomid,'list','',$this->default_expire2,$this->redis);
		//redis_del($list);
		$list=redis_lrange($list,0,redis_llen($list,$this->default_expire2,'',$this->redis),$this->default_expire2,'',$this->redis);
		$html='';
		foreach($list as $v){
			$c=redis_hgetall($v,'',$this->default_expire2,$this->redis);
			//echo var_dump($c);
			if(isset($c['hidden'])&&isset($c['content'])&&$c['hidden']==0){
				$rs=redis_hgetall($v,'',$this->default_expire2,$this->redis);
				$html="<p>".$rs['content']."</p>\n".$html;
			}
		}
		$html="<H1>".redis_hget('room:'.$this->roomid,'room_name','',$this->default_expire2,$this->redis)."</H1>\n".$html;
		$filename='room_'.$this->roomid.'.html';
		$path=UPLOAD_PATH.DIRECTORY_SEPARATOR.ROUTE_M.DIRECTORY_SEPARATOR.'html'.DIRECTORY_SEPARATOR.date('Ym');
		dir_create($path, $mode = 0707);
		$fp=fopen($path.DIRECTORY_SEPARATOR.$filename, 'w');
		fwrite($fp,$html);
		echo json_encode(array('state'=>'1','fulltext'=>$html));
	}


}
?>