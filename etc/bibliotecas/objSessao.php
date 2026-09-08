<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class Session
	{
		public static function start()
		{
			session_start();
		}

		public static function setVenda($vendid)
		{
			$_SESSION['vendid'] = $vendid;
		}
		
		public static function getVenda()
		{
			if (isset($_SESSION['vendid']) && $_SESSION['vendid'] != '') {
				return $_SESSION['vendid'];
			} else {
				return null;
			}
		}
		
		public static function limpar(){
			$_SESSION['vendid'] = null;
		}
		
		public static function permitido()
		{
			if (isset($_SESSION['ok']) && $_SESSION['ok']) {
				return true;
			} else {
				return false;
			}
		}
		
		public static function permitir()
		{
			$_SESSION['ok'] = true;
		}
		
		
		public static function destroy()
		{
			session_destroy();
		}
	}

?>