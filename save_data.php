<?php 
include_once "config.php";

$name = $_POST['name'];
$condition = $_POST['condition'];
$long = $_POST['long'];
$lat = $_POST['lat'];
// echo $name;

// print_r($_POST);

$insert_query = "INSERT INTO cases (name, condition, geometry) VALUES ('$name', '$condition', ST_MakePoint($long, $lat))";

$query = pg_query($db_conn, $insert_query);

if($query){
    echo json_encode(array("statusCode"=>200));
    // echo "added successfully";
}else{
    echo json_encode(array("statusCode"=>201));
    // echo "insert error!";
}
?>