<?php
include('common.php');

try {
    if(!isset($_POST['image'])) {
        $success = false;
        $scriptError = 'Kein Bild übergeben';
    } else {
        $image = $_POST['image'];
        // Only allow deletion of the users own images
        if(!preg_match('/([0-9]+)_'.$uid.'/', $image)) {
            $success = false;
            $scriptError = 'Nicht dein Bild';
        } else {
            // delete the image
            if(!unlink('../'.$image)) {
                $success = false;
                $scriptError = 'Löschen fehlgeschlagen';
            } else {
                // everything worked
                $data = array(
                    'deleted' => $image
                );
            }
        }
    }
} catch(Exception $ex) {
    $success = false;
    $scriptError = array('text' => $ex->getMessage());
}

respond();
?>