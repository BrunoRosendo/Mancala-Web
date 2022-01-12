const sendStaticResource = (path) => (req, res) => {
    res.write(JSON.stringify("online"));
}

module.exports = {
    sendStaticResource,
}
