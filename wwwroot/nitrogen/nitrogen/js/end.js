

Nitrogen.$event_loop();
Nitrogen.Page({id : 'page'});

// For Base URI
function baseURI() {
    if (N.$bu !== null && N.$bu !== "/") {
        return N.$bu + "/";
    }
    return "/";
}
