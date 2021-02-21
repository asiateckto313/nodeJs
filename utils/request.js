let axios = require ('axios');

exports.makePostRequest = async (url) => {
    let res = await axios.post(url);
    return res.data;
}
exports.makeGestRequest = async (url) => {
    let res = await axios.get(url);
    return res.data;
}