// TODO this is super slow, needs up to 15 seconds ==> maybe do some kind of localstorage caching
function getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return; 
        }
            
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, maximumAge: 100_000 });
    });
}

export { getUserLocation };