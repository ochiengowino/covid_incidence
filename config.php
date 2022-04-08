<?php 
$server = 'localhost';
$username = 'postgres';
$password = 'geospatial';
$db_name = 'covid_range';

// make database connection
$db_conn = pg_connect("host=$server port=5432 dbname=$db_name user=$username password=$password");

if($db_conn){
    // echo "connected successfully";
}else{
    echo "connection failed".pg_last_error();
}
?>