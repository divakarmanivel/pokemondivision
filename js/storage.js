var storage = {
    setItem: function (key, value) {
        window.localStorage.setItem(key, value);
    },

    getItem: function (key) {
        return window.localStorage.getItem(key);
    },

    clearDb: function () {
        window.localStorage.clear();
    },

    count: function () {
        return window.localStorage.length;
    }
};