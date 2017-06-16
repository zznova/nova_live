<?php
/**
 * This file is part of workerman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link http://www.workerman.net/
 * @license http://www.opensource.org/licenses/mit-license.php MIT License
 */

/**
 * 用于检测业务代码死循环或者长时间阻塞等问题
 * 如果发现业务卡死，可以将下面declare打开（去掉//注释），并执行php start.php reload
 * 然后观察一段时间workerman.log看是否有process_timeout异常
 */
//declare(ticks=1);

use \GatewayWorker\Lib\Gateway;

/**
 * 主逻辑
 * 主要是处理 onConnect onMessage onClose 三个方法
 * onConnect 和 onClose 如果不需要可以不用实现并删除
 */
class Events
{
    /**
     * 当客户端连接时触发
     * 如果业务不需此回调可以删除onConnect
     * 
     * @param int $client_id 连接id
     */
	 /*
    public static function onConnect($client_id) {
         向当前client_id发送数据 
        //Gateway::sendToClient($client_id, "Hello $client_id\n");
         向所有人发送
        //Gateway::sendToAll("$client_id login\n");
    }
    */
   /**
    * 当客户端发来消息时触发
    * @param int $client_id 连接id
    * @param mixed $message 具体消息
    */
   public static function onMessage($client_id, $data) {
	  // echo "client:{$_SERVER['REMOTE_ADDR']}:{$_SERVER['REMOTE_PORT']} gateway:{$_SERVER['GATEWAY_ADDR']}:{$_SERVER['GATEWAY_PORT']}  client_id:$client_id session:".json_encode($_SESSION)." onMessage:".$data."\n";
	  $data=json_decode($data,true);
	  if(isset($data['roomid'])){
		  $room_id = $data['roomid'];
	   
	   if(isset($data['roomid'])&&ctype_digit($data['roomid'])&&isset($data['c'])&&$data['c']=='reg'){
		$_SESSION['roomid'] = $room_id;
		Gateway::joinGroup($client_id, $room_id);
		Gateway::sendToClient($client_id, json_encode(array('online'=>Gateway::getClientCountByGroup($room_id))));
		}
		if(isset($data['token'])&&strpos(self::decrypt_data($data['token'],'nova_live'),'Nov@_l1ve_')!==false){
			if(!isset($data['id']))$data['id']='';
			if(!isset($data['data']))$data['data']='';
			if(!isset($data['host']))$data['host']='';
			// 向房间所有人发送 
			Gateway::sendToGroup($room_id, json_encode(array('c'=>$data['c'],'id'=>$data['id'],'host'=>$data['host'],'data'=>$data['data'],'online'=>Gateway::getClientCountByGroup($room_id))));
	
		}
	  }
   }
   
   /**
    * 当用户断开连接时触发
    * @param int $client_id 连接id
    */
   public static function onClose($client_id) {
       // 向所有人发送 
       //GateWay::sendToAll("$client_id logout");
   }

   /*加密函数
*$data: 待加密的数据
*$key: 秘钥
*/
public static function encrypt_data($data,$key='')
{
    $key = substr(sha1($key, true), 0, 16);
    $iv = '道可道非常D';
	return self::base64_url_encode(openssl_encrypt($data, 'AES-128-CBC', $key, null, $iv));
}
/*解密函数
*$data: 待加密的数据
*$key: 秘钥
*/
public static function decrypt_data($data,$key='')
{
    $key = substr(sha1($key, true), 0, 16);
    $iv = '道可道非常D';
	return openssl_decrypt(self::base64_url_decode($data), 'AES-128-CBC', $key, null, $iv);
}
/*转换base64中的url保留字符，返回url安全的串
*$input: 待处理的数据
*
*/
public static function base64_url_encode($input) {
 return strtr(base64_encode($input), '+/=', '-_@');
}
/*还原base64中的url保留字符，返回base64编码
*$input: 待处理的数据
*
*/
public static function base64_url_decode($input) {
 return base64_decode(strtr($input, '-_@', '+/='));
}
}
