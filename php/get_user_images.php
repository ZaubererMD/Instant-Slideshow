<?php
include('common.php');

try {
    $data = array(
        'images' => getImagesOfUID($uid)
    );
} catch(Exception $ex) {
    $success = false;
    $scriptError = array('text' => $ex->getMessage());
}

respond();
?>