/* -----------------------------------------------------
   GENERIC LIST IMPLEMENTATION
   ----------------------------------------------------- */
class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.previous = null;
    }
}
class List {
    constructor() {
        this.first = null;
        this.last = null;
    }

    length() {
        let length = 0;
        let cur = this.first;
        while(cur !== null) {
            length++;
            cur = cur.next;
        }
        return length;
    }

    append(value) {
        if(this.find(value) === null) {
            let newNode = new Node(value);
            if(this.length() === 0) {
                this.first = newNode;
                this.last = newNode;
            } else {
                newNode.previous = this.last;
                this.last.next = newNode;
                this.last = newNode;
            }
        }
    }

    find(value) {
        let cur = this.first;
        while(cur !== null) {
            if(cur.value === value) {
                return cur;
            }
            cur = cur.next;
        }
        return null;
    }

    indexOf(value) {
        let cur = this.first;
        let index = 0;
        while(cur !== null) {
            if(cur.value === value) {
                return index;
            }
            cur = cur.next;
            index++;
        }
        return -1;
    }

    remove(value) {
        let node = this.find(value);
        if(node !== null) {
            if(this.length() === 1) {
                this.first = null;
                this.last = null;
            } else {
                if(node.previous !== null) {
                    node.previous.next = node.next;
                } else {
                    this.first = node.next;
                }
                if(node.next !== null) {
                    node.next.previous = node.previous;
                } else {
                    this.last = node.previous;
                }
            }
        }
    }
}

/* -----------------------------------------------------
   GLOBAL CONTROL VARIABLES
   ----------------------------------------------------- */
var knownImages = new List();
var preloadedImages = [];
var currentImage = null;
var shuffle = false;
var currentImageContainerNum = 2;
var blendTimeout = null;
var skipping = false;
var animate = true;
var directory = 'default';
var qr = null;
var updateInterval = null;
var timeout = 5000;
var flip = true;

/* -----------------------------------------------------
   STARTUP
   ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // get directory from URL anchor
    directory = window.location.hash.substring(1);
    if(directory === undefined || directory === null || directory.length === 0) {
        directory = 'default';
    }

    // Create the QR Code
    // it is rendered much bigger on another canvas first and then scaled down
    let qrRenderCnv = $('qr_render');
    qr = new QRious({
        element : qrRenderCnv,
        value : window.location.href.replace('show.html',''),
        padding : 0,
        size : qrRenderCnv.width
    });
    // copy QR code to smaller canvas
    let qrCnv = document.getElementById('qr');
    qrCnv.getContext('2d').drawImage(qrRenderCnv, 0, 0, qrRenderCnv.width, qrRenderCnv.height, 0, 0, qrCnv.width, qrCnv.height);

    // load images for the first time
    updateImages()
    .then(() => {
        // show the first image
        showNextImage();
    });

    // start autoplay
    play();
});

/* -----------------------------------------------------
   CONTROLS
   ----------------------------------------------------- */
document.addEventListener('keydown', (event) => {
    // Map keypresses to control functions

    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
            skip(-1);
            break;
        case 'ArrowRight':
        case 'ArrowUp':
            skip(1);
            break;
        case ' ':
            playPause();
            break;
        case 'w':
            toggleControls();
            break;
        case 'q':
            toggleQR();
            break;
        case 'Escape':
            toggleMenu();
            break;
    }
});

/**
 * Toggles Autoplay
 */
function playPause() {
    if(updateInterval === null) {
        play();
    } else {
        pause();
    }
}
/**
 * Starts Autoplay
 */
function play() {
    console.log('play');
    restartUpdateInterval();
    $('playpause').classList.remove('fa-play');
    $('playpause').classList.add('fa-pause');
}
/**
 * Updates the images in the slideshow on every execution and swaps to the next image every second execution
 */
function updateIntervalFn() {
    updateImages();

    // only progress images every second execution
    flip = !flip;
    if(flip) {
        if(shuffle) {
            // progress by a random number
            let shuffleBy = Math.floor(Math.random() * (knownImages.length() - 1));
            if(currentImage === null) {
                currentImage = knownImages.first;
            }
            for(let i = 0; i <= shuffleBy; i++) {
                currentImage = currentImage.next;
                if(currentImage === null) {
                    currentImage = knownImages.first;
                }
            }
        }
        
        showNextImage();
    }
}
/**
 * Stops autoplay
 */
function pause() {
    window.clearInterval(updateInterval);
    updateInterval = null;
    $('playpause').classList.add('fa-play');
    $('playpause').classList.remove('fa-pause');
}
/**
 * Stops the autoplay interval and starts it new, resetting the countdown time
 */
function restartUpdateInterval() {
    window.clearInterval(updateInterval);
    updateInterval = window.setInterval(() => {
        updateIntervalFn();
    }, timeout);
}

/**
 * Updates the autoplay interval duration depending on the control input
 */
function updateDuration() {
    // * (1000) to get to ms
    // / 2 because the interval must be executed twice as often as desired image changes
    timeout = $('input_duration').value * 500;
    restartUpdateInterval();
}

/**
 * Toggle display of the controls
 */
function toggleControls() {
    let isDisplayed = ($('bottom_text').style.display !== 'none');
    $('bottom_text').style.display = (isDisplayed ? 'none' : 'flex');
    $('input_controls').checked = !isDisplayed;
}
/**
 * Toggle display of the QR code
 */
function toggleQR() {
    let isDisplayed = ($('qr').style.display !== 'none');
    $('qr').style.display = (isDisplayed ? 'none' : 'flex');
    $('input_qr').checked = !isDisplayed;
}
/**
 * Toggle display of the menu
 */
function toggleMenu() {
    $('menu').style.display = ($('menu').style.display === 'flex' ? 'none' : 'flex');
}
/**
 * Toggle whether to blend images when swapping
 */
function toggleAnimation() {
    console.log('toggle animation');
    animate = !animate;
    $('input_animation').checked = animate;
}
/**
 * Toggles whether to randomly select the next image
 */
function toggleShuffle() {
    console.log('toggle shuffle');
    shuffle = !shuffle;
    $('input_shuffle').checked = shuffle;
}

/**
 * Skips a certain number of images
 * @param {integer} n how many images to skip, negative values skip backwards
 */
function skip(n) {
    // set control flag to suppress animations
    skipping = true;

    if(n > 0) {
        for(let i = 0; i < n; i++) {
            showNextImage();
        }
    } else {
        for(let i = 0; i > n; i--) {
            showPreviousImage();
        }
    }

    // Reset the countdown to the next image swap
    if(updateInterval !== null) {
        restartUpdateInterval();
    }
}

/**
 * Updates the displayed progress (which image is being shown and how many are in the slideshow)
 */
function updateProgress() {
    let curIndex = 0;
    if(currentImage !== null) {
        curIndex = knownImages.indexOf(currentImage.value) + 1;
    }
    $('progress').innerText = curIndex + '/' + knownImages.length();
}

/* -----------------------------------------------------
   UPDATE
   ----------------------------------------------------- */
/**
 * Checks the server for new any changes in the slideshow (new images or old ones deleted)
 * @returns {Promise} A Promise that is resolved when the update is finished
 */
function updateImages() {
    let data = new FormData();
    data.append('directory', directory);
    return request('./php/slideshow.php', data)
    .then((response) =>{

        // detect new images by looking for images in the data that are not known yet
        let toAdd = [];
        response.data.images.forEach((image) => {
            let cur = knownImages.first;
            let found = false;
            while(cur !== null && !found) {
                if(cur.value === image) {
                    found = true;
                }
                cur = cur.next;
            }
            if(!found) {
                // A new image has been found
                toAdd.push(image);
                // preload image so it can be displayed without load times later
                let img = new Image();
                img.src = './uploads/'+directory+'/'+image;
                preloadedImages.push(img);
            }
        });
        // Add the new images to the list of known images
        toAdd.forEach((value) => {
            knownImages.append(value);
        });

        // detect images that have been deleted by searching for known images that are missing in the response
        let cur = knownImages.first;
        let toRemove = [];
        while(cur !== null) {
            if(!response.data.images.find((image) => {
                return image === cur.value;
            })) {
                // The image was deleted
                toRemove.push(cur.value);
            }
            cur = cur.next;
        }
        // Remove all deleted images
        toRemove.forEach((value) => {
            knownImages.remove(value);
        });

        // Update the displayed total number of images in the slideshow
        updateProgress();
    });
}

/* -----------------------------------------------------
   IMAGE SWAPPING
   ----------------------------------------------------- */
/**
 * Shows the next image
 */
function showNextImage() {
    // determine next image
    if(currentImage === null) {
        // start with first image
        currentImage = knownImages.first;
    } else {
        currentImage = currentImage.next;
        // if we reached the end, continue at the beginning
        if(currentImage === null) {
            currentImage = knownImages.first;
        }
    }
    // show the image
    showCurrentImage();
}
/**
 * Shows the previous image
 */
function showPreviousImage() {
    // determine next image
    if(currentImage === null) {
        // start with last image
        currentImage = knownImages.last;
    } else {
        currentImage = currentImage.previous;
        // if we reached the start, continue at the end
        if(currentImage === null) {
            currentImage = knownImages.last;
        }
    }
    // show the image
    showCurrentImage();
}

/**
 * Shows the image stored in currentImage in the slideshow
 */
function showCurrentImage() {
    if(currentImage === null) {
        return;
    }

    // Cancel previous blending if it has not finished yet
    if(blendTimeout !== null) {
        window.clearTimeout(blendTimeout);
        finishBlend();
    }

    // determine which of the two container to use
    let nextImageContainerNum = (currentImageContainerNum === 2 ? 1 : 2);
    let nextImageContainer = $('image'+nextImageContainerNum);
    let previousImageContainer = $('image'+currentImageContainerNum);

    // set the new image as background
    nextImageContainer.style.backgroundImage = 'url(uploads/'+directory+'/'+currentImage.value+')';

    // prepare to blend in the new image
    nextImageContainer.classList.add('blend_in');
    if(blendingAllowed()) {
        nextImageContainer.classList.add('blend_in_animation');
    }
    nextImageContainer.classList.remove('blended_out');

    // prepare to blend out the old image
    previousImageContainer.classList.add('blend_out');
    if(blendingAllowed()) {
        previousImageContainer.classList.add('blend_out_animation');
    }

    // put new image container on top
    nextImageContainer.style.zIndex = 1;
    previousImageContainer.style.zIndex = 0;
    
    // remember which container we used for the next swap
    currentImageContainerNum = nextImageContainerNum;

    // blend in the image (or switch instantly)
    if(blendingAllowed()) {
        blendTimeout = window.setTimeout(() => {
            finishBlend();
        }, 1000);
    } else {
        finishBlend();
    }

    // update progress counter
    updateProgress();
}

/**
 * This function is called when the switching and blending to a new image is completed
 */
function finishBlend() {

    // determine which container is new and which is old
    let currentImageContainer = $('image'+currentImageContainerNum);
    let previousImageContainerNum = (currentImageContainerNum === 2 ? 1 : 2);
    let previousImageContainer = $('image'+previousImageContainerNum);

    // set correct classes
    previousImageContainer.classList.add('blended_out');
    currentImageContainer.classList.add('blended_in');
    previousImageContainer.classList.remove('blended_in');
    currentImageContainer.classList.remove('blend_in');
    currentImageContainer.classList.remove('blend_in_animation');
    previousImageContainer.classList.remove('blend_out');
    previousImageContainer.classList.remove('blend_out_animation');

    // reset global control variables
    blendTimeout = null;
    skipping = false;
}

/**
 * Determines whether blending should be animated
 * @returns {boolean} true if blending should be animated
 */
function blendingAllowed() {
    return !skipping && animate;
}