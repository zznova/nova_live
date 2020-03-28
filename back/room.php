<?php
/*
简介：
作者：zznova
版本：
日期：2017-4-1
*/
defined('FROM_STARTER') or exit('来路不正！');
class room {
	private $id;
	private $username;
	private $phone;
	private $users;
	private $admin;
	private $redis;
	private $default_expire1;
	private $default_expire2;
	function __construct() {
		$this->default_expire1=3600*24*3650;
		$this->default_expire2=3600*24*30;
		header("Content-Security-Policy: default-src 'self'");
		$this->admin=array('张三','李四','王五');
		$this->users=json_decode(getcache('users'),true);
		$this->redis=get_predis();
		$this->id=redis_hget('room_info','maxid','',$this->default_expire1,$this->redis);
		if(!$this->id){
			$room_info=json_decode(getcache('room_info'),true);
			$this->id=$room_info['maxid'];
			redis_hset('room_info','maxid',$room_info['maxid'],$this->default_expire1,'',$this->redis);
			redis_hset('room_info','open',$room_info['open'],$this->default_expire1,'',$this->redis);
			redis_hset('room_info','closed',$room_info['closed'],$this->default_expire1,'',$this->redis);
		}
		if(!$this->id)
		{
			redis_hset('room_info','maxid',0,$this->default_expire1,'',$this->redis);
			redis_hset('room_info','open',0,$this->default_expire1,'',$this->redis);
			redis_hset('room_info','closed',0,$this->default_expire1,'',$this->redis);
			setcache('room_info',json_encode(array('maxid'=>0,'open'=>0,'closed'=>0)));
			$this->id=0;
		}
	}
	function init(){
		$this->check_tk();
		if(isset($_POST['open'])&&ctype_digit($_POST['open']))$id=$_POST['open'];
		else exit('open required');
		$rms=array();
		$rooms=redis_lrange('rooms',0,redis_llen('rooms'),$this->default_expire2,'',$this->redis);
		$i=0;
		foreach($rooms as $v){
			$i++;
			if($i>30)break;
			$c=redis_hgetall($v,'',$this->default_expire2,$this->redis);
			//echo var_dump($c);
			//redis_hset($v,'open',1);
			if(time()>strtotime($c['endtime'].' 23:59:59'))redis_hset($v,'open',0,$this->default_expire2,'',$this->redis);
			$assert=$c['hidden']==0&&redis_hget($v,'open','',$this->default_expire2,$this->redis)==$_POST['open'];
			if(isset($_POST['room_name'])&&$_POST['room_name']!='')$assert=$assert&&(strpos($c['room_name'],$_POST['room_name'])!==false);
			if($assert)$rms[]=redis_hgetall($v,'',$this->default_expire2,$this->redis);
		}
		echo array2json(array('maxid'=>$this->id,'rooms'=>$rms));
		//redis_del('rooms');
	}


	function add(){
		$this->check_tk();
		if(isset($_POST['room_name'])&&$_POST['room_name']!='')safe_detect($_POST['room_name']);
		else exit('name requied');
		if(isset($_POST['endtime'])&&$_POST['endtime']!='')safe_detect($_POST['endtime']);
		else exit('endtime requied');
		$this->id=redis_hincrby('room_info','maxid',1,$this->default_expire2,'',$this->redis);
		redis_hset('room_info','maxid',$this->id,$this->default_expire2,'',$this->redis);
		redis_hincrby('room_info','open',1,$this->default_expire2,'',$this->redis);
		$id=$this->id;
		redis_hset('room:'.$id,'id',$id,$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'maxid',0,$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'room_name',$_POST['room_name'],$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'stime',date('Y-m-d H:i:s'),$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'owner',$this->username,$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'hidden',0,$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'open',1,$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'endtime',$_POST['endtime'],$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'alink','',$this->default_expire2,'',$this->redis);
		redis_lpush('rooms','room:'.$id,$this->default_expire2,'',$this->redis);
		echo array2json(redis_hgetall('room:'.$id,'',$this->default_expire2,$this->redis));
	}

	function edit(){
		$this->check_tk();
		if(isset($_POST['id'])&&ctype_digit($_POST['id']))$id=$_POST['id'];
		else exit('id required');
		if(isset($_POST['room_name'])&&$_POST['room_name']!='')safe_detect($_POST['room_name']);
		else exit('name requied');
		if(isset($_POST['endtime'])&&$_POST['endtime']!='')safe_detect($_POST['endtime']);
		else exit('endtime requied');
		redis_hset('room:'.$id,'room_name',$_POST['room_name'],$this->default_expire2,'',$this->redis);
		redis_hset('room:'.$id,'endtime',$_POST['endtime'],$this->default_expire2,'',$this->redis);
		if(isset($_POST['alk']))redis_hset('room:'.$id,'alink',$_POST['alk']);
		redis_hset('room:'.$id,'editor',$this->username,$this->default_expire2,'',$this->redis);//修改人
		echo array2json(array("state"=>1,"data"=>redis_hgetall('room:'.$id,'',$this->default_expire2,$this->redis)));
	}

	function del(){
		$this->check_tk();
		if(isset($_POST['id'])&&ctype_digit($_POST['id']))$id=$_POST['id'];
		else exit('id required');
		$rid='room:'.$id;
		if(in_array($this->username,$this->admin)){
		redis_hset($rid,'hidden',1,$this->default_expire2,'',$this->redis);//隐藏
		redis_hincrby('room_info','open',-1,$this->default_expire2,'',$this->redis);
		redis_hincrby('room_info','closed',1,$this->default_expire2,'',$this->redis);
		echo json_encode(array('state'=>'1'));
		}
	}
	
	function getpwd(){
		$users=$this->users;
		$this->username=$_POST['username'];
		$this->phone=$_POST['tel'];
		if(!redis_exists(CLIENT_IP.'_getpwd','',0,$this->redis))redis_set(CLIENT_IP.'_getpwd',0,3600,'',$this->redis);
		if(redis_incr(CLIENT_IP.'_getpwd','',$this->redis)>10)exit(json_encode(array('state'=>-1,'error'=>'reach limits')));

		if(isset($users[$this->username.$this->phone])&&$users[$this->username.$this->phone]['tel']==$_POST['tel']&&$_POST['reg']=='0'){
			if($users[$this->username.$this->phone]['valid']=='1'){
				$key=rand(100000,999999);
				redis_set($this->phone.'_pwd',$key,60,'',$this->redis);
				$users[$this->username.$this->phone]['key']=$key;
				setcache('users',json_encode($users));
				$rs=curlGet('http://172.16.201.206/OAsms/sendNotice.php?p='.$this->phone.'&c=NOVA直播验证码（30秒内有效）：'.$key);
				if(strpos($rs,'sent'))echo '1';
			}
			else echo json_encode(array('state'=>3,'error'=>'inactive'));
		}
		else if(isset($_POST['reg'])&&$_POST['reg']=='1'&&defined('INTRANET')){
			if(isset($users[$this->username.$this->phone]))echo json_encode(array('state'=>3,'error'=>'exist'));
			else{
				$key=rand(100000,999999);
				redis_set($this->phone.'_pwd',$key,60,'',$this->redis);
				$rs=curlGet('http://短信发送平台ip/sendMessageApi.php?p='.$this->phone.'&c=NOVA直播注册验证码（30秒内有效）：'.$key);
				if(strpos($rs,'sent'))echo json_encode(array('state'=>3,'data'=>encrypt_data($this->username.'|'.$this->phone,'nova_live')));
			}
		}
		else if(defined('INTRANET'))echo json_encode(array('state'=>0,'error'=>'unregister'));
		else exit(CLIENT_IP);
	}

	function ckpwd(){
		$this->phone=$_POST['tel'];
		$this->username=$_POST['username'];
		$pwd=redis_get($this->phone.'_pwd','',0,$this->redis);
		redis_del($this->phone.'_pwd','',$this->redis);
		if($_POST['pwd']==$pwd){
			if(isset($_POST['reg'])&&$_POST['reg']=='1')$this->user_reg();
			else{
				$users=$this->users;
				$users[$this->username.$this->phone]=array('username'=>$this->username,'tel'=>$this->phone,'valid'=>'1','last_time'=>date('Y-m-d H:i:s'),'last_ip'=>CLIENT_IP);
				setcache('users',json_encode($users));
				$tk=encrypt_data('zhibo_'.date('Ymd').$this->phone,'nova_live');
				redis_set($tk,$_POST['username'],3600*2,'',$this->redis);
				echo json_encode(array('state'=>'1','tk'=>$tk));
			}
		}
		else echo json_encode(array('state'=>'0','tk'=>$pwd));
	}

	protected function check_tk(){
		if(isset($_POST['console_tk'])&&redis_exists($_POST['console_tk'],'',3600,$this->redis))
		{
			$this->username=redis_get($_POST['console_tk'],'',3600,$this->redis);
			return true;
		}
		else exit(json_encode(array('state'=>'no auth')));
	}

	function quit(){
		if(isset($_POST['console_tk'])&&redis_exists($_POST['console_tk'],'',3600,$this->redis))
		{
			redis_del($_POST['console_tk'],'',$this->redis);
			echo json_encode(array('state'=>'1'));
		}
		else exit(json_encode(array('state'=>'no auth')));
	}

	function user_reg(){
		if(!defined('INTRANET'))exit(CLIENT_IP);
		$users=$this->users;
		$reg_data=decrypt_data($_POST['reg_data'],'nova_live');
		$reg_data=explode('|',$reg_data);
		$this->username=$reg_data[0];
		$this->phone=$reg_data[1];
		if(isset($users[$this->username.$this->phone]))exit(json_encode(array('state'=>2,'data'=>"exist")));
		else{
			$users[$this->username.$this->phone]=array('username'=>$this->username,'tel'=>$this->phone,'valid'=>'0');
			setcache('users',json_encode($users));
			echo json_encode(array('state'=>2,'data'=>'inactive'));
		}
	}

	function user_list(){
		if(!defined('INTRANET'))exit(CLIENT_IP);
		$this->check_tk();
		if(in_array($this->username,$this->admin)||$_POST['console_tk']==''){
		$users=$this->users;
		echo json_encode(array('state'=>1,'data'=>$users));
		}
	}

	function user_active(){
		if(!defined('INTRANET'))exit(CLIENT_IP);
		$this->check_tk();
		if(in_array($this->username,$this->admin)){
		$users=$this->users;
		$users[$_POST['id']]['valid']='1';
		setcache('users',json_encode($users));
		echo json_encode(array('state'=>1,'data'=>$users));
		}
	}

	function user_del(){
		if(!defined('INTRANET'))exit(CLIENT_IP);
		$this->check_tk();
		if(in_array($this->username,$this->admin)){
		$users=$this->users;
		unset($users[$_POST['id']]);
		setcache('users',json_encode($users));
		echo json_encode(array('state'=>1,'data'=>$users));
		}
	}
}
?>
