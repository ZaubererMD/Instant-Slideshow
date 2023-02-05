<?php
include('common.php');

try {
    $images = array();
    foreach ($_FILES['uploads']['error'] as $key => $fileError) {
        if ($fileError == UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['uploads']['tmp_name'][$key];
            // basename() may prevent filesystem traversal attacks;
            // further validation/sanitation of the filename may be appropriate
            $name = basename($_FILES['uploads']['name'][$key]);
            $fileType = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            $nextID = nextImageID($uid);
            $filename = time().'_'.$uid.'_'.$nextID.'.'.$fileType;
            if(!move_uploaded_file($tmp_name, $uploadsDir.'/'.$filename)) {
                $success = false;
                $scriptError = 'Fehler beim Verschieben der Datei nach '.$filename;
            } else {
                $images[] = $filename;
            }
        } else {
            $success = false;
            $scriptError = 'File Error: '.$fileError.' - '.$phpFileUploadErrors[$fileError];
        }
    }
    $data = array(
        'new_images' => $images
    );
} catch(Exception $ex) {
    $success = false;
    $scriptError = array('text' => $ex->getMessage());
}

respond();
?>