<?php 
include_once "config.php";
$fetch_query ="SELECT name, condition, ST_AsGeoJSON(geometry) FROM cases"; 

// $fetch_query = "select ST_AsGeoJSON(cases.*) from cases";
$resultArray = pg_fetch_all(pg_query($db_conn, $fetch_query));
echo json_encode($resultArray);

// $fetch_query = "SELECT name, condition, ST_AsGeoJson(geometry) FROM cases";
// $fetch_query = "SELECT
//   json_build_object(
//     'type', 'FeatureCollection',
//     'feature', json_agg(ST_AsGeoJSON(t.*)::json)
//   )
// FROM
//   cases AS t";

// $fetch_query = "
// SELECT json_build_object(
// 'type', 'FeatureCollection',

// 'features', json_agg(
//     json_build_object(
//         'type', 'Feature',
        
//         'geometry',   ST_AsGeoJSON(ST_ForceRHR(st_transform(geometry,4326)))::json,
//         'properties', jsonb_set(row_to_json(cases)::jsonb,'{geometry}','0',false)
//     )
// )
// )
// FROM cases";

// if($resultArray){
//     echo 'fetch success';
// }else{
//     echo 'something went wrong';
// }


?>