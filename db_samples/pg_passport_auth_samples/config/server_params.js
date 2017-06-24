var state = {
    "gmail_email": "nagas@gmail.com",
    "gmail_password": "password",
    "server_loc": "localhost:3000"
};

module.exports.set = function (key, str) {
    state[key + ""] = str;
};

module.exports.get = function (key) {
    return state["" + key];
};