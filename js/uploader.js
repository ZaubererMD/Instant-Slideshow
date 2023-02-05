/* -----------------------------------------------------
   STARTUP
   ----------------------------------------------------- */
/**
 * The directory where the images of the current slideshow are stored
 */
var directory = 'default';
document.addEventListener('DOMContentLoaded', (e) => {
    // get directory from URL anchor
    directory = window.location.hash.substring(1);
    if(directory === undefined || directory === null || directory.length === 0) {
        directory = 'default';
    }
    // load images of the user
    getUserImages();
});

/* -----------------------------------------------------
   FILE SUBMISSION
   ----------------------------------------------------- */
/**
 * Changes text of the Upload-Button to show the size of all selected images that are going to be uploaded in Megabytes
 */
function setUploadButtonText() {
    let input = $('image_input');

    let sum = 0;
    for(let i = 0; i < input.files.length; i++) {
        sum += input.files[i].size;
    };

    if(sum > 0) {
        // calculate MB from bytes and round to two decimal places
        let sumMB = Math.round(((sum * 100) / 1024) / 1024) / 100;
        $('submitButton').innerText = 'Hochladen (' + sumMB + ' MB)';
    } else {
        $('submitButton').innerText = 'Hochladen';
    }
}

/**
 * Submits all selected images to the server
 * @returns {Promise} A Promise that is resolved when the upload is complete
 */
function submitImages() {
    $('submitButton').disabled = true;
    $('submitButton').innerText = 'Bitte warten...';

    let input = $('image_input');

    let curSum = 0;
    let batches = [];
    let data = new FormData();
    let failed = false;
    for(let i = 0; i < input.files.length; i++) {

        // make sure to only put at most 32MB into one batch of images
        if(curSum + input.files[i].size >= 32*1024*1024) {
            if(curSum === 0) {
                // a single file is too big
                alert('Es können nur 32 MB am Stück hochgeladen werden. Die Datei ' + input.files[i].name + ' ist zu groß.');
                failed = true;
                break;
            }

            // batch is full, store it and start a new one
            batches.push(data);
            curSum = 0;
            data = new FormData();
        }

        // append file to batch
        curSum += input.files[i].size;
        data.append('uploads[]', input.files[i], input.files[i].name);
    };

    if(failed) {
        // restore Button to inital state
        $('submitButton').disabled = false;
        setUploadButtonText();
    }

    // add the last unfinished batch
    if(curSum > 0) {
        batches.push(data);
    }

    // start sending images in batches
    return submitImageBatches(batches)
    .then(() => {
        // Reload the users images
        clearImages();
        getUserImages();
        // Reset the form
        let input = $('image_input');
        input.value = '';
        $('submitButton').disabled = false;
        $('submitButton').innerText = 'Hochladen';
    });
}

/**
 * Urecursively uploads one batch after another
 * @param {FormData[]} batches Image-Batches to be uploaded
 * @returns {Promise} A Promise that resolves when all files have been uploaded
 */
function submitImageBatches(batches) {
    // Prepare data
    let data = batches[0];
    data.append('directory', directory);
    // Send request
    return request('./php/save.php', data)
    .then((response) => {
        // check whether the request was successful
        if(response.success) {
            // are there images left to be uploaded?
            batches.shift();
            if(batches.length > 0) {
                return submitImageBatches(batches);
            } else {
                // All images have been uploaded
                return Promise.resolve();
            }
        } else {
            alert('Beim Speichern der Bilder ist ein Fehler aufgetreten.');
            $('submitButton').disabled = false;
            $('submitButton').innerText = 'Hochladen';
            return Promise.reject();
        }
    });
}

/* -----------------------------------------------------
   DISPLAYED COLLECTION OF THE USERS IMAGES
   ----------------------------------------------------- */
/**
 * Displays an image in the collection of the users uploaded images
 * @param {string} id id of the image
 * @param {string} url url of the image
 * @param {integer} index index of the image in the slideshow
 */
function addUserImage(id, url, index) {
    $('portfolio').appendChild($new('div', {
        id : 'image_'+id,
        classList : ['col-md-6', 'col-lg-4', 'mb-5'],
        body : [
            $new('div', {
                classList : ['portfolio-item', 'mx-auto'],
                dataset : {
                    bsToggle : 'modal',
                    bsTarget : '#modal_'+id
                },
                body : [
                    $new('div', {
                        classList : ['portfolio-item-caption', 'd-flex', 'align-items-center', 'justify-content-center', 'h-100', 'w-100'],
                        body : $new('div', {
                            classList : ['portfolio-item-caption-content', 'text-center', 'text-white'],
                            body : $new('i', {
                                classList : ['fas', 'fa-minus', 'fa-3x']
                            })
                        })
                    }),
                    $new('img', {
                        classList : 'img-fluid',
                        properties : {
                            src : url
                        }
                    })
                ]
            }),
            $new('div', {
                classList : 'image_index',
                body : $text('Nr. ' + (index+1))
            })
        ]
    }));
    
    // prepare a modal for the deletion of the image
    addDeletionModal(id, url);

    // remember the image so it can be removed later
    currentImages.push(id);
}

/**
 * Prepares a modal for the deletion of an image
 * @param {string} id id of the image
 * @param {string} url url of the image
 */
function addDeletionModal(id, url) {
    document.body.appendChild($new('div', {
        id : 'modal_'+id,
        classList : ['portfolio-modal', 'modal', 'fade'],
        body : $new('div', {
            classList : ['modal-dialog', 'modal-xl'],
            body : $new('div', {
                classList : 'modal-content',
                body : [
                    $new('div', {
                        classList : ['modal-header', 'border-0'],
                        body : $new('button', {
                            classList : 'btn-close',
                            dataset : {
                                bsDismiss : 'modal'
                            }
                        })
                    }),
                    $new('div', {
                        classList : ['modal-body', 'text-center', 'pb-5'],
                        body : $new('div', {
                            classList : 'container',
                            body : [
                                $new('div', {
                                    classList : ['row', 'justify-content-center'],
                                    body : $new('div', {
                                        classList : 'col-lg-8',
                                        body : [
                                            $new('p', {
                                                classList : 'mb-4',
                                                body : $text('Wirklisch Löschen?')
                                            }),
                                            $new('button', {
                                                classList : ['btn', 'btn-primary', 'delete_button'],
                                                dataset : {
                                                    bsDismiss : 'modal'
                                                },
                                                onClick : () => {
                                                    deleteImage(url);
                                                },
                                                body : [
                                                    $new('i', {
                                                        classList : ['fas', 'fa-xmark', 'fa-fw']
                                                    }),
                                                    $text('Löschen')
                                                ]
                                            }),
                                            $new('img', {
                                                classList : ['img-fluid', 'rounded', 'mb-5'],
                                                properties : {
                                                    src : url
                                                }
                                            }),
                                            $new('p', {
                                                classList : 'mb-4',
                                                body : $text(url)
                                            })
                                        ]
                                    })
                                })
                            ]
                        })
                    })
                ]
            })
        })
    }));
}

/**
 * Deletes an image from the slideshow
 * @param {string} url url of the image to be deleted
 * @returns {Promise} A promise that is resolved when the image has been deleted
 */
function deleteImage(url) {
    const data = new FormData();
    data.append('image', url);
    data.append('directory', directory);
    return request('./php/delete.php', data)
    .then(() => {
        // reload the users images
        clearImages();
        getUserImages();
    });
}

/**
 * Loads all images submitted by the user and displays them in the collection of the users images
 * @returns {Promise} A Promise that is resolved when all images have been loaded
 */
function getUserImages() {
    let data = new FormData();
    data.append('directory', directory);
    return request('./php/get_user_images.php', data)
    .then((response) => {
        response.data.images.forEach((image) => {
            addUserImage(image.filename.toString().split('.')[0], 'uploads/' + directory + '/' + image.filename, image.index);
        });
    });
}

var currentImages = [];
/**
 * Clears the displayed collection of images uploaded by the user
 */
function clearImages() {
    currentImages.forEach((id) => {
        removeImage(id);
    });
    currentImages = [];
}
/**
 * Removes an image from the displayed collection of the users uploaded images and also the associated modal
 * @param {string} id id of the image to delete
 */
function removeImage(id) {
    $('image_'+id).parentElement.removeChild($('image_'+id));
    removeModal(id);
}
/**
 * Removes the modal associated with the given image-id
 * @param {string} id id of the image for which to delete the modal
 */
function removeModal(id) {
    $('modal_'+id).parentElement.removeChild($('modal_'+id));
}