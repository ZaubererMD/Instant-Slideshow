/* -----------------------------------------------------
   COMMON HELPER FUNCTIONS REQUIRED BY BOTH HTML FILES
   ----------------------------------------------------- */
function $(id) { return document.getElementById(id); }
function $text(text) { return document.createTextNode(text); }
/**
 * @typedef {Object} NewElmProperties
 * @property {string} [id] string to be used as the elements id
 * @property {string|string[]} [classList] Array of strings or just a string to be used as class
 * @property {Object} [properties] Object holding further properties of the Element, e.g. to add foo="bar" to the element pass { foo : "bar" } to properties
 * @property {Object} [dataset] Like properties, but these properties will added to the elements dataset, e.g. { foo : "bar" } results in data-foo="bar"
 * @property {function () => void} [onClick] callback function that is called upon clicking the element
 * @property {Object|Object[]} [body] Array of DOM-Elements or just one DOM-Element to be used as children of the new element
 */
/**
 * Creates a new DOM-Element with the specified Tag.
 * @param {string} tag The HTML-Tag of the new element. Required.
 * @param {NewElmProperties} [properties={}] Can be an object specifying further properties of the Element. Optional, Defaults to {}.
 */
function $new(tag, options = {}) {
    let elm = document.createElement(tag);

    if(options === undefined || options === null) {
        options = {};
    }

    let id = options.id;
    if(id !== undefined && typeof(id) === 'string') {
        elm.id = id;
    }

    let classList = options.classList;
    if(classList !== undefined && typeof(classList) === 'string') {
        classList = [classList];
    }
    if(classList !== undefined && Array.isArray(classList)) {
        classList.forEach((className) => {
            elm.classList.add(className);
        });
    }

    let properties = options.properties;
    if(properties !== undefined && properties !== null && typeof(properties) === 'object') {
        for(let key in properties) {
            elm[key] = properties[key];
        }
    }

    let dataset = options.dataset;
    if(dataset !== undefined && dataset !== null && typeof(dataset) === 'object') {
        for(let key in dataset) {
            elm.dataset[key] = dataset[key];
        }
    }

    let onClick = options.onClick;
    if(onClick !== undefined && typeof(onClick) === 'function') {
        elm.addEventListener('click', onClick);
    }

    let body = options.body;
    if(body !== undefined && body !== null) {
        if(!Array.isArray(body)) {
            body = [body];
        }
        body.forEach((bodyElm) => {
            if(typeof(bodyElm) === 'string') {
                bodyElm = $text(bodyElm);
            }
            elm.appendChild(bodyElm);
        });
    }

    return elm;
}

/**
 * Sends a POST-Request to the given URL
 * @param {string} url Where to send the request to
 * @param {string} data POST-body data
 * @returns {Promise} Promise that will be resolved with the servers response
 */
function request(url, data = null) {
    return new Promise((resolve, reject) => {
        let options = { method : 'POST' };
        if(data !== null) {
            options.body = data;
        }
        fetch(url, options)
        .then((response) => {
            if(response.ok) {
                return response.text();
            } else {
                return Promise.reject('The API responded with an invalid HTTP status code ('+response.status+')');
            }
        }).then((responseText) => {
            try {
                let response = JSON.parse(responseText);
                resolve(response);
            } catch(e) {
                console.log('Malformed JSON', responseText);
                return Promise.reject(e);
            }
        }).catch((error) => {
            console.log(error);
            reject(error);
        });
    });
}