const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          resolve({});
        }
      });

    } catch (err) {
      reject(err);
    }
  });
}

const getUrlParams = (url) => {
  const urlArray = url.split('?');
  if (urlArray.length < 2) return {};

  const params = {};
  const query = urlArray[1];
  query[1].split('&').forEach((param) => {
    const [key, value = ''] = param.split('=');
    params[key] = value;
  });

  return params;
}

const getEndpoint = (url) => {
  return url.split('?')[0];
}

module.exports = {
  getRequestBody,
  getUrlParams,
  getEndpoint,
}
