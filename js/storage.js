function setItem(key, value){
window.localStorage.setItem(key, value);
}

function getItem(key){
return window.localStorage.getItem(key);
}

function clearDb(){
window.localStorage.clear();
}
