<?php
include('common.php');

try {
    $data = array(
        'images' => getImages()
    );
} catch(Exception $ex) {
    $success = false;
    $scriptError = array('text' => $ex->getMessage());
}

respond();
?>