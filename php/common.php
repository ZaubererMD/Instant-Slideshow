<?php
// Define the directory where uploads are stored
$uploadsDir = '../uploads';

// detect slideshow directories
$directories = array_filter(glob($uploadsDir.'/*'), 'is_dir');
for($i = 0; $i < count($directories); $i++) {
    $directories[$i] = str_replace($uploadsDir.'/', '', $directories[$i]);
}

// check whether a directory parameter was set that corresponds to a valid directory
if(isset($_POST['directory']) && !empty($_POST['directory']) && in_array($_POST['directory'], $directories)) {
    $uploadsDir .= '/'.$_POST['directory'];
} else {
    // fallback to default
    $uploadsDir .= '/default';
}

header('Content-Type: application/json');

// prepare global variables for reponse
$scriptError = null;
$success = true;
$data = null;

// load uid to identify the user
$uid = getUID();

// define an error handler so php errors do not break the communication with the client which expects JSON
function errorHandler($errorCode, $errorText, $errorFile, $errorLine) {
    global $scriptError;
    global $success;
    $scriptError = array(
        'code' => $errorCode,
        'text' => $errorText,
        'file' => $errorFile,
        'line' => $errorLine
    );
    $success = false;
}
set_error_handler('errorHandler', E_ALL | E_STRICT | E_WARNING);
error_reporting(E_ALL);

/**
 * Returns a User-ID based on the clients IP and User-Agent
 */
function getUID() {
    global $_SERVER;
    $idString = $_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_USER_AGENT'];
    return md5($idString);
}

/**
 * Gets the maximum Image-ID in the current directory
 */
function getHighestImageID() {
    $images = getImages();
    $max = 0;
    foreach($images as $image) {
        $parts1 = explode('.', $image);
        $parts2 = explode('_', $parts1[0]);
        $id = $parts2[2] * 1;
        if($id > $max) {
            $max = $id;
        }
    }
    return $max;
}
/**
 * Gets the id for the next image in the current directory
 */
function nextImageID() {
    return getHighestImageID() + 1;
}

/**
 * Retrieves all images in the current directory
 */
function getImages() {
    global $uploadsDir;
    $allFiles = scandir($uploadsDir, SCANDIR_SORT_ASCENDING);
    $images = array();
    foreach($allFiles as $file) {
        if(preg_match('/^([0-9]+)_([a-zA-Z0-9]+)_([0-9]+)\\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF|bmp|BMP)$/', $file)) {
            $images[] = $file;
        }
    }
    return $images;
}
/**
 * Retrieves all images in the current directory that were uploaded by the client
 */
function getImagesOfUID($uid) {
    $allImages = getImages();
    $imagesOfUser = array();
    for($i = 0; $i < count($allImages); $i++) {
        $image = $allImages[$i];
        if(preg_match('/^([0-9]+)_'.$uid.'/', $image)) {
            $imagesOfUser[] = array(
                'filename' => $image,
                'index' => $i
            );
        }
    }
    $imagesOfUser = array_reverse($imagesOfUser);
    return $imagesOfUser;
}

/**
 * Returns the index of an image within all images of the current directory
 */
function getIndexOfImage($image) {
    $images = getImages();
    for($i = 0; $i < count($images); $i++) {
        if($images[$i] == $image) {
            return $i;
        }
    }
    return -1;
}

/**
 * Sends a JSON response to the client using the global response-variables
 */
function respond() {
    global $success;
    global $scriptError;
    global $uid;
    global $data;
    $response = array(
        'success' => $success,
        'error' => $scriptError,
        'uid' => $uid,
        'data' => $data
    );
    echo json_encode($response, JSON_PRETTY_PRINT);
}

/**
 * Explanations for PHP File Upload errors in human readable form
 */
$phpFileUploadErrors = array(
    0 => 'There is no error, the file uploaded with success',
    1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
    2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
    3 => 'The uploaded file was only partially uploaded',
    4 => 'No file was uploaded',
    6 => 'Missing a temporary folder',
    7 => 'Failed to write file to disk.',
    8 => 'A PHP extension stopped the file upload.',
);
?>