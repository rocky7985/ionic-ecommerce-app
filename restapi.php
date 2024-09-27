<?php
require_once( ABSPATH.'wp-admin/includes/user.php' ); 
require_once( ABSPATH . 'wp-admin/includes/image.php' );
require_once( ABSPATH . 'wp-admin/includes/file.php' ); 
require_once( ABSPATH . 'wp-admin/includes/media.php' );


/**
 *
 * @wordpress-plugin
 * Plugin Name: Creator Rest API
 * Description: Test.
 * Version: 1.0
 * Author: Kanishk
**/ 

use Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class Custom_API extends WP_REST_Controller {
    private $api_namespace;
	private $api_version;
	private $required_capability;
	public  $user_token;
	public  $user_id;
	
	public function __construct() {
		$this->api_namespace = 'addapi/v';
		$this->api_version = '1';
		$this->required_capability = 'read';
		$this->init();
		/*------- Start: Validate Token Section -------*/
		$headers = getallheaders(); 
		if(isset($headers['Authorization'])){ 
        	if(preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)){ 
            	$this->user_token =  $matches[1]; 
        	}
        }
        /*------- End: Validate Token Section -------*/
	}
	private function successResponse($message='',$data=array(),$total = array()){ 
        $response =array();
        $response['status'] = "success";
        $response['message'] =$message;
        $response['data'] = $data;
        if(!empty($total)){
            $response['pagination'] = $total;
        }
        return new WP_REST_Response($response, 200);  
    }
     public function errorResponse($message='',$type='ERROR' , $statusCode = 400){
        $response = array();
        $response['status'] = "error";
        $response['error_type'] = $type;
        $response['message'] =$message;
        return new WP_REST_Response($response, $statusCode); 
    }
    public function register_routes(){  
		$namespace = $this->api_namespace . $this->api_version;
		
	    $privateItems = array('getShopData', 'getSpecificData', 'addcartData', 'wishlist', 'getWishlist', 'move_to_cart', 'delete_wishlist', 'checkItemInCart', 'inCartData', 'getCategory', 'getPostByCategory', 'getBestSell', 'deleteCartItem', 'doCheckout', 'getUserInfo', 'updateUserInfo', 'addcard', 'savedcards', 'updatecardinfo', 'deletecard', 'addaddress', 'savedaddress', 'delete_address', 'update_address', 'payout', 'orders', 'favourites', 'checkFavourite', 'favouriteData'); //Api Name  and use to token
	    $publicItems  = array('register', 'forgetPassword', 'verifyOtp', 'resetPassword'); //no needs for token 
		
		
		foreach($privateItems as $Item){
		    register_rest_route( $namespace, '/'.$Item, array( 
                'methods' => 'POST',    
                'callback' => array( $this, $Item), 
               'permission_callback' => !empty($this->user_token)?'__return_true':'__return_false' 
				//'permission_callback' => array( $this, 'isValidToken' ) // Ensure token is validated

                )  
	    	);  
		}
		foreach($publicItems as $Item){
		  	register_rest_route( $namespace, '/'.$Item, array(
                'methods' => 'POST',
                'callback' => array( $this, $Item )
                )
	    	);
		}
	}
	public function init(){
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
        // add_action('rest_api_init', 'add_custom_headers');
        add_action( 'rest_api_init', function() {
        remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
            add_filter( 'rest_pre_serve_request', function( $value ) {
                header( 'Access-Control-Allow-Origin: *' );
                header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE' );
                header( 'Access-Control-Allow-Credentials: true' );
                // header("Access-Control-Allow-Headers: Content-Type");
                return $value;
            });
        }, 15 );
     
    }
    public function register($request){
        global $wpdb;
        $param = $request->get_params();
        // $role  = 'customer';
    
        // Check if email is provided
        if(empty($param['email'])){
            return $this->errorResponse('Please provide email.');
        }
    
        // Check if email already exists
        if(email_exists($param['email'])){
            return $this->errorResponse('Email already exists.Please Login');
        }
    
        // Check if password and confirmPassword are provided and match
        if(empty($param['password']) || empty($param['confirmPassword'])){
            return $this->errorResponse('Please provide password and confirmPassword.');
        }
    
        if($param['password'] !== $param['confirmPassword']){
            return $this->errorResponse('Password does not match.');
        }

         // Check if role provided
         if(empty($param['role'])) {
            return $this->errorResponse('Please specify role');
        }

         // Check if role provided
         if(empty($param['phone'])) {
            return $this->errorResponse('Please specify phone');
        }
         // Check if role provided
         if(empty($param['address'])) {
            return $this->errorResponse('Please specify address');
        }

            // Create user
        $user_id = wp_create_user($param['email'],$param['password'],$param['email']);
        if(is_wp_error($user_id)) {
            return $this->errorResponse($user_id->get_error_message());
        }

        $user = new WP_User($user_id);
        $user->set_role($param['role']);
    
        // Update user meta
        update_user_meta($user_id, 'name', $param['name']);
        update_user_meta($user_id, 'phone', $param['phone']);
        update_user_meta($user_id, 'address', $param['address']);
      
        // Get user profile data
        // $data = $this->getProfile($user_id);
    
        // Check if user was successfully registered
        if(!empty($user_id)){
            return $this->successResponse('User created successfully.', $user);
        } else {
            return $this->errorResponse('Something went wrong. Please try again later.', $user);
        }
    }


    private function isValidToken(){
    	$this->user_id  = $this->getUserIdByToken($this->user_token);
    }
    public function getUserIdByToken($token){
        $decoded_array = array();
        $user_id = 0;
        if($token){
            try{
                $decoded = JWT::decode($token, new Key(JWT_AUTH_SECRET_KEY, apply_filters('jwt_auth_algorithm', 'HS256')));
                $decoded_array = (array) $decoded;
            }catch(\Firebase\JWT\ExpiredException $e){
                return false;
            }
        }
        if(count($decoded_array) > 0){
            $user_id = $decoded_array['data']->user->id;
        }
        if($this->isUserExists($user_id)){
            return $user_id;
        }else{
            return false;
        }
    }
    public function isUserExists($user){
        global $wpdb;
        $count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $wpdb->users WHERE ID = %d", $user));
        if ($count == 1) {return true;} else {return false;}
    }

    public function jwt_auth($data, $user){
		    $user_meta = get_user_meta($user->ID);
            $user_roles = $user->roles[0]; // Fetching roles from WP_User object
            // Get user roles
            $result = $this->getProfile($user->ID);
            $result['token'] =  $data['token'];
               return $this->successResponse('Successfully Logged In', $result);

       

        $code = $data['code'];

        if($code == '[jwt_auth] incorrect_password'){
            return $this->errorResponse('The password you entered is incorrect');
        }

        elseif($code == '[jwt_auth] invalid_email'  || $code == '[jwt_auth] invalid_username'){
            return $this->errorResponse('The email you entered is incorrect');
        }

		elseif($code == '[jwt_auth] empty_username'){
            return $this->errorResponse('The username field is empty.');
        }

        elseif($code == '[jwt_auth] empty_password'){
            return $this->errorResponse('The password field is empty.');
        }
		return $user;
    }

    public function forgetPassword($request){
        global $wpdb;
        $param = $request->get_params();
        $email = sanitize_email($param['user_email']);

        // Validate email presence
        if (empty($email)) {
            return $this->errorResponse('Email is required.', 'Email is required', 400);
        }

        // Check if the email exists in the database
        if (!email_exists($email)) {
            return $this->errorResponse('Email does not exist.');
        }
        
        $user = get_user_by('email', $email);
        $user_id = $user->ID;
        $otp = rand(1000, 9999);

        $wpdb->delete('forget_password', ['user_id' => $user_id]);
        
        // Insert new OTP and expiry time into the table
        $wpdb->insert('forget_password', [
            'user_id' => $user_id,
            'otp' => $otp,
        ]);

        return $this->successResponse('OTP sent successfully.', ['otp' => $otp, 'user_id' => $user_id]);
    }

    public function verifyOtp($request){
        global $wpdb;
        $param = $request->get_params();
        $user_id = $param['user_id'];
        $entered_otp = $param['otp'];
        if(empty($user_id) && empty($entered_otp)){
            return $this-> errorResponse('User ID and OTP are required.', 'Invalid input', 400);
        }
        // else{

            $otp_entry = $wpdb->get_var($wpdb->prepare("SELECT otp FROM forget_password WHERE user_id = %d", $user_id));
            // print_r($otp_entry);die;
            // Check if the entered OTP matches the stored OTP
            if ($otp_entry != $entered_otp) {
                return $this->errorResponse('Invalid OTP. Please try again.');
            }
        
            // Fetch the user's email
            $user = get_user_by('ID', $user_id);
            if (!$user) {
                return $this->errorResponse('User not found.');
            }

            // OTP is valid, delete it after successful verification
            $wpdb->delete('forget_password', ['user_id' => $user_id]);

            // Return success response with the user's email
            return $this->successResponse('OTP verified successfully.', ['user_email' => $user->user_email]);
        // }
    }

    public function resetPassword($request){
        global $wpdb;
        $param = $request->get_params();
        $user_id = $param['user_id'];
        $new_password = $param['new_password'];
        $confirm_new_password = $param['confirm_new_password'];
        
        if ( empty($user_id) || empty($new_password) || empty($confirm_new_password)) {
            return $this->errorResponse('User ID, new password, and confirm new password are required.', 'Invalid input', 400);
        }
        else{
    
            if(($new_password) != ($confirm_new_password)){
                return $this->errorResponse('Password and Confirm Password do not match.');
            }

            if (strlen($new_password) < 8) {
                return $this->errorResponse('Password must be at least 8 characters long.', 'Weak password', 400);
            }
        
            // Fetch the user by ID
            $user = get_user_by('ID', $user_id);
            if (!$user) {
                return $this->errorResponse('User not found.', 'Invalid user', 404);
            }

            wp_set_password($new_password, $user_id);
            return $this->successResponse('Password has been successfully reset.', $user);
        }
    }

	public function getShopData($request){ 
	    global $wpdb;
	    $param = $request->get_params();
	    $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id']; 
	 
	    if (empty($user_id)) {
          return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $paged = !empty($param['paged']) ? intval($param['paged']) : 1;
            $search = trim($param['search']);

            $shops = get_posts( array(
	            'numberposts'     => 6,
	            'orderby'        => 'date',
	            'post_type'      => 'shop_11',
	            'post_status'    => 'publish',
                'paged' => $paged,
                's' => $search
            ) );


		  
          $latestposts = array();
		    foreach($shops as $data){
        
                $latestposts[] = array(
			        'image' => get_the_post_thumbnail_url($data->ID,'full'),
			        'Id' => $data->ID,
			        'title' =>$data->post_title,
			        'description' =>get_field('description',$data->ID),
			        'price' => get_field('price',$data->ID),
			        'offers' => get_field('offers',$data->ID),
			        'age' => get_field('age',$data->ID),
			        'size' => get_field('size', $data->ID),
           	        'previous' => get_field('previous', $data->ID),
			        'color' => get_field('color',$data->ID),
                    'best_sell' => get_field('best_sell',$data->ID),
                );
            }
            return $this->successResponse('Post received successfully', $latestposts);
	    }
    }

    public function getSpecificData($request){
        global $wpdb;
	    $param = $request->get_params();
	    $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id']; 
        $post_id = $param['Id'];
	 
	    if (empty($user_id)) {
          return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $post_data = get_post($post_id);
            if (empty($user_id)) {
                return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
            } else{
                $post = array();
                $post[]=array(
                    'image' => get_the_post_thumbnail_url($post_data->ID,'full'),
                    'Id' => $post_data->ID,
                    'title' =>$post_data->post_title,
                    'description' =>get_field('description',$post_data->ID),
                    'price' => get_field('price',$post_data->ID),
                    'offers' => get_field('offers',$post_data->ID),
                    'age' => get_field('age',$post_data->ID),
                    'size' => get_field('size', $post_data->ID),
                    'previous' => get_field('previous', $post_data->ID),
                    'color' => get_field('color',$post_data->ID),
                    'best_sell' => get_field('best_sell',$post_data->ID),
                );
                return $this->successResponse('Post received successfully', $post);
            }
        }
    }

    public function search($data){
        global $wpdb;
        $param = $data-> get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];

        if(empty($user_id)){
            return $this-> errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
                $valid_vars = array_merge( $valid_vars, array( 'queryByTitle' ) );
                return $valid_vars;
            
        
            add_filter( 'rest_query_vars', 'wpse_20160526_rest_query_vars', PHP_INT_MAX, 1 );
        }
    }
	 
	public function addcartData($data){
	    global $wpdb;
	    $param = $data->get_params();
	    $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
	   
	   
		if (empty($user_id)) {
		   return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
		   
		}else{
		    $post_id = intval($param['post_id']);
            $quantity = isset($param['quantity']) ? intval($param['quantity']) : 1;

            $size = $param['size'];
            $color = $param['color'];
			
		    // Check if the product is already in the cart
            $cart_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM cartdata WHERE user_id = %d AND post_id = %d AND color = %s AND size = %s" ,$user_id, $post_id, $color, $size));

		    if($cart_item){
                // If product exists, update the quantity
                $updated = $wpdb->update('cartdata', 
                    array('quantity' => $cart_item->quantity + $quantity), 
                    array('user_id' => $user_id, 'post_id' => $post_id, 'color' => $color, 'size' => $size)
                );
                return $this->successResponse('Cart updated successfully', $updated);
		    }else {
		        // Add the product to the cart
			    $inserted = $wpdb->insert('cartdata', array(
				    'user_id' => $user_id,
				    'post_id' => $post_id,
                    'size' => $size,
                    'color' => $color,
                    'quantity' => $quantity,
                ));
			    return $this->successResponse('Added to cart successfully', $inserted);
		    }
        }
    }
    
	public function checkItemInCart($data) {
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
    
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        } else {
            $post_id = intval($param['post_id']);
    
            // Check if the product is already in the cart
            $cart_item = $wpdb->get_row($wpdb->prepare("SELECT * FROM cartdata WHERE user_id = %d AND post_id = %d", $user_id, $post_id));
    
            if ($cart_item) {
                return $this->successResponse('Item already in cart', true);
            } else {
                return $this->successResponse('Item not in cart', false);
            }
        }
    }
	   
	public function inCartData($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
           
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        } else {
            $incart_items = $wpdb->get_results($wpdb->prepare("SELECT * FROM cartdata WHERE user_id = %d", $user_id));
    
            if (empty($incart_items)) {
                return $this->successResponse('No items in cart for this user.');
            }
            $post_details = array();
    
            foreach ($incart_items as $item) {
                $post_id = $item->post_id;
                $post_data = get_post($post_id);
                $quantity = $item->quantity;
                $price = get_field('price', $post_data->ID) * $quantity; // Adjusted price
                $color = $item->color;
                $size = $item->size;
    
                if ($post_data) {           
                    $post_details[] = array(
                        'user_id' => $user_id,
                        'image' => get_the_post_thumbnail_url($post_data->ID, 'full'),
                        'Id' => $post_data->ID,
                        'title' => $post_data->post_title,
                        'description' => get_field('description', $post_data->ID),
                        'price' => $price,
                        'offers' => get_field('offers', $post_data->ID),
                        'age' => get_field('age', $post_data->ID),
                        'size' => $size,
                        'previous' => get_field('previous', $post_data->ID),
                        'color' => $color,
                        'quantity' => $quantity
                    );
                }
            }
            return $this->successResponse('Data retrieved successfully', $post_details);
        }
    }    

    public function wishlist($data){
        global $wpdb;
        $params = $data->get_params();
		$this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $params['user_id'];
        $post_id = $params['post_id'];
        $color = $params['color'];
        $size = $params['size'];
        $quantity = $params['quantity'];
		   
	    if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $existing_wishlist = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM wishlist WHERE user_id = %d AND post_id = %d AND color = %s AND size = %s", 
                $user_id, $post_id, $color, $size
            ));
            
            if(empty($existing_wishlist)){
                $inserted = $wpdb->insert('wishlist', 
                    array(
                        'user_id' => $user_id,
                        'post_id' => $post_id,
                        'size' => $size,
                        'color' => $color,
                        'quantity' => $quantity
                    ),
                    array('%d', '%d', '%s', '%s', '%d')
                );
                if (!$inserted) {
                    return $this->errorResponse('Failed to add item to wishlist');
                }
            }
            $wpdb->delete('cartdata', array(
                'user_id' => $user_id,
                'post_id' => $post_id,
                'color' => $color,
                'size' => $size
            ), array('%d', '%d', '%s', '%s'));
            return $this->successResponse('Item added to wishlist and removed from cart successfully');
        }
    }

    public function getWishlist($data) {
        global $wpdb;
        $param = $data->get_params(); // Get the parameters from the request
        $this->isValidToken(); // Validate the token
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
          
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        $wishlist_items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM wishlist WHERE user_id = %d", $user_id
        ));

        if (empty($wishlist_items)) {
            return $this->successResponse('No items in wishlist for this user.');
        }

        $wishlist_details = array();
        foreach ($wishlist_items as $item) {
            $post_data = get_post($item->post_id);
            if ($post_data) {
                $wishlist_details[] = array(
                    'user_id' => $user_id,
                    'post_id' => $post_data->ID,
                    'title' => $post_data->post_title,
                    'color' => $item->color,
                    'size' => $item->size,
                    'quantity' => $item->quantity,
                    'image' => get_the_post_thumbnail_url($post_data->ID, 'full'),
                    'description' => get_field('description', $post_data->ID),
                    'price' => get_field('price', $post_data->ID),
                    'offers' => get_field('offers', $post_data->ID)
                );
            }
        }
        return $this->successResponse('Wishlist data retrieved successfully', $wishlist_details);
    }

    public function move_to_cart($data){
        global $wpdb;
        $param= $data-> get_params();
        $this->isValidToken();
        $user_id=!empty($this->user_id) ? $this->user_id : $param['user_id'];
        $post_id = $param['post_id'];
        $color = $param['color'];
        $size = $param['size'];
        $quantity = $param['quantity'];
        
        if(empty($user_id)){
            return $this->errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
            $wishlist_items = $wpdb->get_row($wpdb->prepare("SELECT * FROM wishlist WHERE user_id = %d AND post_id = %d AND size = %s AND color = %s AND quantity = %d",
                $user_id, $post_id, $size, $color, $quantity
            ));
            if(!empty($wishlist_items)){
                $inserted = $wpdb->insert('cartdata',
                    array(
                        'user_id' => $user_id,
                        'post_id' => $post_id,
                        'color' => $color,
                        'size' => $size,
                        'quantity'=> $quantity
                    ),
                    array('%d', '%d', '%s', '%s', '%d')
                );
                if (!$inserted) {
                    return $this->errorResponse('Failed to add item to cart');
                }
            
                $deleted = $wpdb->delete('wishlist',
                    array(
                        'user_id' => $user_id,
                        'post_id' => $post_id,
                        'color' => $color,
                        'size' => $size,
                        'quantity' => $quantity
                    ),
                    array('%d', '%d', '%s', '%s', '%d')
                );
                if ($deleted) {
                    return $this->successResponse('Item added to cart and removed from wishlist successfully');
                } else {
                    return $this->errorResponse('Failed to remove item from wishlist');
                }
            }
            else{
                return $this->errorResponse('Item not found in Wishlist');
            }
        }
    }

    public function delete_wishlist($data){
        global $wpdb;
        $param = $request->get_params();
        $this-> isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        $post_id = $param['post_id'];
        $color = $param['color'];
        $size = $param['size'];
        $quantity = $param['quantity'];

        if(empty($user_id)){
            return $this->errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
            $existing_wishlist = $wpdb->get_row($wpdb->prepare("SELECT * FROM wishlist WHERE user_id = %d AND post_id = %d AND size = %s AND color = %s AND quantity =%d", 
                $user_id, $post_id, $size, $color, $quantity
            ));
            if(!empty($existing_wishlist)){
                $deleted = $wpdb->delete('wishlist',
                    array(
                        'user_id' => $user_id,
                        'post_id' => $post_id,
                        'color' => $color,
                        'size' => $size,
                        'quantity' => $quantity
                    ),
                    array(
                        '%d', '%d', '%s', '%s', '%d'
                    )
                );
                if ($deleted) {
                    return $this->successResponse('Item removed from wishlist successfully');
                } else {
                    return $this->errorResponse('Failed to remove item from wishlist');
                }
            }
            else{
                return $this->errorResponse('Item not found in wishlist');
            }
        }
    }

    public function doCheckout($request){
        global $wpdb;
        $param = $request->get_params();
		$this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   
	    if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $post_id = isset($param['post_id']) ? intval($param['post_id']) : null; 
            $size = isset($param['size']) ? sanitize_text_field($param['size']) : null; 
            $color = isset($param['color']) ? sanitize_text_field($param['color']) : null;     
            $quantity = isset($param['quantity']) ? intval($param['quantity']) : null; 
            
            // Modify query to get only the specific item when post_id is passed
            $query = "SELECT * FROM cartdata WHERE user_id = %d";
            $query_params = [$user_id];

            if ($post_id) {
                $query .= " AND post_id = %d";
                $query_params[] = $post_id;
            }
            if ($quantity) {
                $query .= " AND quantity = %d";
                $query_params[] = $quantity;
            }
            if ($size) {
                $query .= " AND size = %s";
                $query_params[] = $size;
            }
    
            if ($color) {
                $query .= " AND color = %s";
                $query_params[] = $color;
            }
            $incart_items = $wpdb->get_results($wpdb->prepare($query, ...$query_params));

            if(empty($incart_items)){
                return $this->errorResponse('No items in cart for this user.');
            }
            
            $post_details = array();
            $totalPrice = 0;         
            foreach ($incart_items as $item) {
                $post_id = $item->post_id;
                $post_data = get_post($post_id);
                $quantity = $item->quantity;
                $price = get_field('price', $post_data->ID); // Individual item price
                $item_total_price = $price * $quantity; // Calculate total price for the item
                $totalPrice += $item_total_price; // Add to the total cart price
        
                if($post_data){           
                    $post_details[] = array(
                        'user_id' => $user_id, // Adding user_id to the post details
                        'image' => get_the_post_thumbnail_url($post_data->ID, 'full'),
                        'Id' => $post_data->ID,
                        'title' => $post_data->post_title,
                        'description' => get_field('description', $post_data->ID),
                        'price' => $price, // Original price per item
                        'item_total_price' => $item_total_price, // Total price for this item based on quantity
                        'offers' => get_field('offers', $post_data->ID),
                        'age' => get_field('age', $post_data->ID),
                        'size' => $item->size,
                        'previous' => get_field('previous', $post_data->ID),
                        'color' => $item->color,
                        'quantity' => $quantity
                    );
                }
            }

            $checkout_details = array(
                'cart_items' => $post_details,
                'totalPrice' => $totalPrice 
            );
            return $this->successResponse('Checkout data retrieved successfully', $checkout_details);
        }
    }
    
    public function deleteCartItem($request) {
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
    
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        } else {
            $post_id = intval($param['post_id']);
            $deleted = $wpdb->delete('cartdata', array(
                'user_id' => $user_id,
                'post_id' => $post_id
            ));
    
            if ($deleted) {
                return $this->successResponse('Item removed from cart successfully.');
            } else {
                return $this->errorResponse('Failed to remove item from cart.');
            }
        }
    }

    public function getCategory($request) {
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   
	    if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $paged = !empty($param['paged']) ? intval($param['paged']) : 1;
            $search = trim($param['search']);

            $args = get_posts(array(
                'post_type' => 'shop_11',
                'post_status' => 'publish' ,  
                'posts_per_page' => -1,
                'paged'=> $paged,
                's' => $search
            ) ,
            array(
                'key' => 'category',
                'value'     => '$args',
                'compare'   => 'LIKE'
            ));
            
            
             
            
            $posts = get_posts($args);

            $categories = array();
            if(count($args)){
                foreach($args as $arg){
                    $category = get_field('category', $arg->ID);
                    if (!in_array($category, $categories)) {
                        $categories[]=$category;
                    }
                }
            }

            $data = array();
            $data['categories'] = $categories;
            return $this->successResponse('Posts retrieved successfully.', $data);
        }

    }

    public function getPostByCategory($request){
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   
	    if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $paged = !empty($param['paged']) ? intval($param['paged']) : 1;
		    $categories = $param['category'];		
            $args = array(
                'post_type' => 'shop_11',
                'post_status' => 'publish' ,  
                'posts_per_page' => 6 ,
                'paged' => $paged,
                'meta_query' => array(
                    array(
                        'key'     => 'category',
                        'value'   => $categories,
                        'compare' => '=',                    ),
                ),
            );

            $posts = get_posts($args);

            if (empty($posts)) {
              return $this->successResponse('No posts found for the specified category.');
            }

            $post_details = array();

            foreach ($posts as $post) {
                $post_details[] = array(
                    'Id' => $post->ID,
                    'title' => $post->post_title,
                    'price' => get_field('price', $post->ID),
                    'offers' => get_field('offers', $post->ID),
                    'image' => get_the_post_thumbnail_url($post->ID, 'full'),
                );
            }

            return $this->successResponse('Posts retrieved successfully.', $post_details);

        }
    }

    public function getBestSell($request){
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   
	    if (empty($user_id)) {
        return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $paged = !empty($param['paged']) ? intval($param['paged']) : 1;
            $search = trim($param['search']);

            $args = array(
                'post_type' => 'shop_11',
                'post_status' => 'publish' ,  
                'posts_per_page' => 6 ,
                'paged' => $paged,
                'meta_query' => array(
                    array(
                        'key'     => 'best_sell',
                        'value'   =>  '1',
                        'compare' => '='
                    ),
                ),
                's' => $search // Search across posts

            );

            $posts = get_posts($args);

            if (empty($posts)) {
                return $this->errorResponse('No posts found for the BestSell.');
            }

            $post_details = array();

            foreach ($posts as $post) {
                $post_details[] = array(
                    'Id' => $post->ID,
                    'title' => $post->post_title,
                    'price' => get_field('price', $post->ID),
                    'offers' => get_field('offers', $post->ID),
                    'image' => get_the_post_thumbnail_url($post->ID, 'full'),
                );
            }
            return $this->successResponse('Posts retrieved successfully.', $post_details);
        }
    }

    public function getProfile($user_id){

        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        $user = get_user_by('ID', $user_id);       

        $profile = array(
            'id' => $user->ID,
            'email' => $user->user_email,
            'name' => get_user_meta($user->ID, 'name', true),
            'phone' => get_user_meta($user->ID, 'phone', true),
            'address' => get_user_meta($user->ID, 'address', true),
            'roles' => $user->roles[0],
        );

        return $profile;
    
    }


    public function getUserInfo($request){
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   
	    if (empty($user_id)) {
        return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
		else{
            $user_info = $this->getProfile($user_id);
            if($user_info){
                return $this->successResponse('Profile Data retrieved successfully', $user_info);
            }
            else{
                return $this->errorResponse('Failed to retrieve user profile.');
            }
        }
    }

    public function updateUserInfo($request){
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
	    $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
		   

	    if (empty($user_id)) {
        return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
        else{
            $current_user_info = $this->getProfile($user_id);

            // Prepare the data to be updated
            $updated_data = array(
                'ID' => $user_id,
                'name' => isset($param['name']) ? $param['name'] : $current_user_info['name'],
                'phone' => isset($param['phone']) ? $param['phone'] : $current_user_info['phone'],
                'address' => isset($param['address']) ? $param['address'] : $current_user_info['address'],
            );
            // Update the user meta fields
            update_user_meta($user_id, 'name', $updated_data['name']);
            update_user_meta($user_id, 'phone', $updated_data['phone']);
            update_user_meta($user_id, 'address', $updated_data['address']);

            return $this->successResponse('Profile Data updated successfully', $this->getProfile($user_id));
        }
    }

    public function addcard($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        else{
            $card_num = $param['card_num'] ?? '';
            $exp_date = $param['exp_date'] ?? '';
            $cvv = $param['cvv'] ?? '';
            $card_name = $param['card_name'];


            // Check if the card number already exists for the user
            $existing_card = $wpdb->get_var($wpdb->prepare(
              "SELECT COUNT(*) FROM addcard WHERE user_id = %d AND card_num = %s",
               $user_id, $card_num
            ));

            if ($existing_card > 0) {
            return $this->errorResponse('This card number is already added.');
            }

            $inserted = $wpdb->insert('addcard', array(
			    'user_id' => $user_id,
				'card_num' => $card_num,
                'exp_date' => $exp_date,
                'cvv' => $cvv,
                'card_name' => $card_name,
            ));
            if($inserted){
                return $this->successResponse('Added to cart successfully', $inserted);
            } else {
                return $this->errorResponse('Failed to add card details. Please try again.');
            }
        }
    }

    public function savedcards($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        else{
          
		    $saved_cards = $wpdb->get_results($wpdb->prepare("SELECT * FROM addcard WHERE user_id = %d", $user_id));

            if(empty($saved_cards)){
                return $this->errorResponse('No items in cart for this user.');
            }
		    $card_details = array(); 
            foreach ($saved_cards as $card) {        
                $card_details[] = array(
                    'user_id' => $user_id,
                    'card_num' => $card->card_num,
                    'exp_date' => $card ->exp_date,
                    'cvv' => $card ->cvv, 
                    'card_name' => $card ->card_name,
                    'id' => $card ->id
                );
            }
            return $this->successResponse('Saved cards retrieved successfully', $card_details);
        }
    }

    public function updatecardinfo($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
           
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        } else {
            $card_id = $param['id'] ?? null;
            if (!$card_id) {
                return $this->errorResponse('Card ID is required.', 'Card ID missing', 400);
            }
    
            $saved_card = $wpdb->get_row($wpdb->prepare("SELECT * FROM addcard WHERE user_id = %d AND id = %d", $user_id, $card_id));
            if (!$saved_card) {
                return $this->errorResponse('No such card found for this user.', 'Card not found', 404);
            } else {
                $updated_data = array(
                    'card_num' => isset($param['card_num']) ? $param['card_num'] : $saved_card->card_num,
                    'exp_date' => isset($param['exp_date']) ? $param['exp_date'] : $saved_card->exp_date,
                    'cvv' => isset($param['cvv']) ? $param['cvv'] : $saved_card->cvv,
                    'card_name' => isset($param['card_name']) ? $param['card_name'] : $saved_card->card_name,
                );
                $updated = $wpdb->update('addcard', $updated_data, array('id' => $card_id, 'user_id' => $user_id));
                if ($updated !== false) {
                    return $this->successResponse('Card details updated successfully.', $updated_data );
                } else {
                    return $this->errorResponse('Failed to update card details. Please try again.', 'Update failed', 500);
                }
            }
        }
    }

    public function deletecard($data) {
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        $card_id = $param['id'] ?? null;
    
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        } elseif (empty($card_id)) {
            return $this->errorResponse('Card ID is required.', 'Card ID missing', 400);
        } else {
            // Check if the card exists for the user
            $existing_card = $wpdb->get_row($wpdb->prepare("SELECT * FROM addcard WHERE user_id = %d AND id = %d", $user_id, $card_id));
            if (!$existing_card) {
                return $this->errorResponse('No such card found for this user.', 'Card not found', 404);
            } else {
                // Delete the card
                $deleted = $wpdb->delete('addcard', array('user_id' => $user_id, 'id' => $card_id));
                if ($deleted) {
                    return $this->successResponse('Card removed successfully', $deleted);
                } else {
                    return $this->errorResponse('Failed to remove card. Please try again.', 'Delete failed', 500);
                }
            }
        }
    }    

    public function addaddress($data){
        global $wpdb;
        $param = $data ->get_params();
        $this -> isValidToken();
        $user_id = !empty($this -> user_id) ? $this -> user_id : $param['user_id'];
        
        if(empty($user_id)){
            $this -> errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
            $address = $param['address'] ?? '';
            $location = $param['location'] ?? '';

            $existing_address = $wpdb -> get_row($wpdb->prepare("SELECT * FROM 'saved_addresses' WHERE user_id = %d AND address = %s", $user_id, $address));
            if($existing_address){
                $this-> errorResponse('Address is already added.');
            }
            else{
                $inserted = $wpdb -> insert('saved_addresses', array(
                    'user_id' => $user_id,
                    'address' => $address,
                    'location' => $location
                ));

                if($inserted)
                {
                    return $this -> successResponse('Address inserted successfully', $inserted);
                } else{
                    return $this-> errorResponse('Failed to insert address');
                }
            }
        }
    }

    public function savedaddress($data){
        global $wpdb;
        $param = $data->get_params();
        $this-> isValidToken();
        $user_id= !empty($this->user_id) ? $this->user_id: $param['user_id'];
        
        if(empty($user_id)){
            $this->errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
            $address_id = $param['id'] ?? null;
            if ($address_id) {
                $saved_address = $wpdb->get_row($wpdb->prepare("SELECT * FROM saved_addresses WHERE user_id = %d AND id = %d", $user_id, $address_id));
                if (!$saved_address) {
                    return $this->errorResponse('No such address found for this user.', 'Address not found', 404);
                } else {
                    return $this->successResponse('Address retrieved successfully', $saved_address);
                }
            }else{
                $saved_address= $wpdb -> get_results($wpdb->prepare("SELECT * FROM saved_addresses WHERE user_id = %d", $user_id));

                if(empty($saved_address)){
                    return $this->successResponse('No Address Found');
                } else{
                    $address_details = array();
                    foreach($saved_address as $address){
                        $address_details[] = array(
                            'user_id' => $user_id,
                            'id' => $address-> id,
                            'address' => $address-> address,
                            'location' => $address-> location
                        );
                    }
                    return $this-> successResponse('Address retrieved successfully', $address_details);
                }
            }
        }
    }

    public function delete_address($data){
        global $wpdb;
        $param = $data->get_params();
        $this-> isValidToken();
        $user_id =  !empty($this -> user_id) ? $this->user_id : $param['user_id'];
        $address_id = $param['id'] ?? null; 

        if(empty($user_id)){
            return $this->errorResponse('Unauthorised', 'Unauthorised', 401);
        }
        else{
            $existing_address = $wpdb->get_row($wpdb->prepare("SELECT * FROM saved_addresses WHERE user_id = %d AND id = %d", $user_id, $address_id));
            if(!$existing_address){
              return $this->errorResponse('Address not found');
            }
            else{
                $deleted = $wpdb->delete('saved_addresses', array('user_id'=> $user_id, 'id'=> $address_id));
                if($deleted){
                    return $this->successResponse('Address deleted successfully');
                }
                else{
                    return $this->errorResponse('Some error occurred.Please try again.', 500);
                }
            }
        }
    }

    public function update_address($data){
        global $wpdb;
        $param = $data->get_params();
        $this-> isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        
        if(empty($user_id)){
            return $this-> errorResponse('Unautorised', 'Unauthorised', 401);
        }
        else{
            $address_id = $param['id'] ?? null;
            if(!$address_id){
                return $this->errorResponse('AddressId is missing', 'AddressId is missing', 400);
            }
            else{
                $saved_address = $wpdb->get_row($wpdb->prepare("SELECT * FROM saved_addresses WHERE user_id = %d AND id = %d", $user_id, $address_id));
                if(!$saved_address){
                    return $this->errorResponse('No such address found for this user.', 'Address not found', 404);
                }
                else{
                    $updated_address= array(
                        'address' => isset($param['address']) ? $param['address'] : $saved_address->address,
                        'location' => isset($param['location']) ? $param['location'] : $saved_address->location,
                    );
                    $updated_data = $wpdb->update('saved_addresses', $updated_address, array('user_id' => $user_id, 'id' => $address_id));
                    if($updated_data == false){
                        return $this->errorResponse('Address failed to update', 500);
                    }
                    else{
                        return $this-> successResponse('Address updated successfully', $updated_data);
                    }
                }
            }
        }
    }

    public function payout($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        $card_id = $param['card_id']; 
        $post_ids = $param['post_ids']; 
        $address_id = $param['address_id'];
        $size = $param['size'];
        $color = $param['color'];
        $quantity = $param['quantity'];

        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        else{
                $serialized_post_ids = maybe_serialize($post_ids);
                $serialized_color = maybe_serialize($color);
                $serialized_quantity = maybe_serialize($quantity);
                $serialized_size = maybe_serialize($size);

                $arr =  array(
                    'user_id' => $user_id,
                    'post_ids' => $serialized_post_ids,
                    'card_id' =>  $card_id,
                    'address_id' => $address_id,
                    'size' =>  $serialized_size,
                    'color' => $serialized_color,
                    'quantity'=> $serialized_quantity,
                );

                $inserted = $wpdb->insert('invoice', $arr);
                $deleted = $wpdb->delete('cartdata', array('user_id' => $user_id, 'post_id' => $post_ids), array('%d', '%d'));
                $deleted = $wpdb->delete(
                    'cartdata', 
                    array('user_id' => $user_id), 
                    array('%d')
                );
                
                // print_r($inserted);die();
    
                    if ($inserted == false) {
                        return $this->errorResponse('Failed to insert invoice data.');
                    }
                // }
        
    
            return $this->successResponse('Payout completed and invoice data inserted successfully.', $inserted);
        }
    }

    public function orders($data){
        global $wpdb;
        $param = $data->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
       
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }

        else{
               
            $invoices = $wpdb->get_results($wpdb->prepare("SELECT post_ids, card_id, color, size, quantity FROM invoice WHERE user_id = %d", $user_id));
            if(!$invoices){
                return $this->successResponse('No invoice data found for this user.');
            }

            $order_details=array();

            foreach ($invoices as $invoice) {
                $post_ids = maybe_unserialize($invoice->post_ids);
                $colors = maybe_unserialize($invoice->color);
                $sizes = maybe_unserialize($invoice->size);
                $quantities = maybe_unserialize($invoice->quantity);
                if (empty($post_ids) || !is_array($post_ids)) {
                    return $this->errorResponse('No post id found for this user.');
                }
                // print_r($post_ids);die();

                $card_id = $invoice->card_id;
                $saved_card = $wpdb->get_row($wpdb->prepare("SELECT * FROM addcard WHERE card_num = %d", $card_id));
                if(!$saved_card){
                    return $this->successResponse('No saved card found for this user.');
                    // continue;
                }

                $card_details = array(
                    'user_id' => $user_id,
                    'card_num' => $saved_card->card_num,
                    'exp_date' => $saved_card->exp_date,
                    'cvv' => $saved_card->cvv,
                    'card_name' => $saved_card->card_name
                );

                $post_details = array();
                foreach($post_ids as $index => $post_id){
                    $post_item = get_post($post_id);
                    if($post_item){
                        $quantity = floatval($quantities[$index]);
                        $size = $sizes[$index];
                        $color = $colors[$index];
                        // $quantity = $wpdb->get_var($wpdb->prepare("SELECT quantity FROM cartdata WHERE post_id = %d AND user_id = %d", $post_id, $user_id));
                        // $size = $wpdb->get_var($wpdb->prepare("SELECT size FROM cartdata WHERE post_id = %d AND user_id = %d", $post_id, $user_id));
                        // $color = $wpdb->get_var($wpdb->prepare("SELECT color FROM cartdata WHERE post_id = %d AND user_id = %d", $post_id, $user_id));
                        $price = floatval(get_field('price', $post_item->ID));
                        $item_total_price = $price * $quantity; 
        
                        $post_details[] = array(
                            'image' => get_the_post_thumbnail_url($post_item->ID, 'full'),
                            'Id' => $post_item->ID,
                            'title' => $post_item->post_title,
                            'description' => get_field('description', $post_item->ID),
                            'price' => $price,
                            'item_total_price' => $item_total_price,
                            'offers' => get_field('offers', $post_item->ID),
                            'age' => get_field('age', $post_item->ID),
                            'size' => $size,
                            'previous' => get_field('previous', $post_item->ID),
                            'color' => $color,
                            'quantity' => $quantity
                        );
                    }
                }
                $order_details= array(
                    'card_details' => $card_details,
                    'ordered_post_details' => $post_details
                );
            }
            return $this->successResponse('Order Details retrieved successfully.', $order_details);
        }
    }

    public function favourites($request){ 
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        $post_id = $param['post_id'];  
        
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
        else{
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM favourites WHERE user_id = %d AND post_id = %d", $user_id, $post_id));
            if($existing == 0){
                $arr =  array(
                    'user_id' => $user_id,
                    'post_id' => $post_id,            
                );
                $inserted = $wpdb->insert('favourites', $arr);
                   
                if($inserted){
                    return $this->successResponse('Favourite Added successfully', $arr);
                }
            }
            else{
                // Remove from favourites
                $deleted = $wpdb->delete('favourites', array('user_id' => $user_id, 'post_id' => $post_id));
                if($deleted) {
                    return $this->successResponse('Favourite Removed successfully');
                }
            }
        }
        return $this->errorResponse('Failed to update favourites', 'Failed to update favourites', 500);
    }

    public function checkFavourite($request) {
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];
        $post_id = $param['post_id'];  
        
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
        else{
            $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM favourites WHERE user_id = %d AND post_id = %d", $user_id, $post_id));
            if($existing > 0){
            return $this->successResponse('Product is in favourites');
            } else {
             return $this->successResponse('Product is not in favourites');
            }
        }
    }

    public function favouriteData($request){
        global $wpdb;
        $param = $request->get_params();
        $this->isValidToken();
        $user_id = !empty($this->user_id) ? $this->user_id : $param['user_id'];        
        if (empty($user_id)) {
            return $this->errorResponse('Unauthorized', 'Unauthorized', 401);
        }
        else{
            $paged = !empty($param['paged']) ? intval($param['paged']) : 1;
            $posts_per_page = 6;
            $offset = ($paged - 1) * $posts_per_page;

            $favourite = $wpdb->get_results($wpdb->prepare("SELECT * FROM favourites WHERE user_id = %d LIMIT %d OFFSET %d", $user_id, $posts_per_page, $offset));
            $favourite_post_data = array();
            if($favourite){
		        foreach ($favourite as $item) {
                    $post_id = $item->post_id;
                    $post_data = get_post($post_id);
                    if($post_data){
                        $favourite_post_data [] = array(
                            'image' => get_the_post_thumbnail_url($post_data->ID,'full'),
                            'Id' => $post_data->ID,
                            'title' =>$post_data->post_title,
                            'description' =>get_field('description',$post_data->ID),
                            'price' => get_field('price',$post_data->ID),
                            'offers' => get_field('offers',$post_data->ID),
                            'age' => get_field('age',$post_data->ID),
                            'size' => get_field('size', $post_data->ID),
                            'previous' => get_field('previous', $post_data->ID),
                            'color' => get_field('color',$post_data->ID),
                            'best_sell' => get_field('best_sell',$post_data->ID),
                        );
                    }
                }
                return $this->successResponse('Favourites Retrieved successfully', $favourite_post_data);
            } 
            else {
                return $this->successResponse('No favourites found', []);
            }
        }
    }  
}           
$serverApi = new Custom_API();
add_filter('jwt_auth_token_before_dispatch', array( $serverApi, 'jwt_auth' ), 20, 2);
 add_action('wp_error_added',  array($serverApi, 'errorResponse'), 99, 3);
?>