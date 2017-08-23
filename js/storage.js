setItem(key, value){
window.localStorage.setItem(key, value);
}

getItem(key){
return window.localStorage.getItem(key);
}

clearDb(){
window.localStorage.clear();
}
