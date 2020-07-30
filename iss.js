const request = require("request");

const fetchMyIP = (callback) => {
  // use request to fetch IP address from JSON API
  request("https://api.ipify.org?format=json", (err, res, body) => {
    if (err) {
      return callback(err, null);
    }
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);
    callback(null, data.ip);
    return;
  });
};

const fetchCoordsByIP = (ip, callback) => {
  request(`https://ipvigilante.com/${ip}`, (err, res, body) => {
    if (err) {
      return callback(err, null);
    }
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching IP co-ordinates. Response: ${body}`;
      return callback(Error(msg), null);
    }
    const { latitude, longitude } = JSON.parse(body).data;

    callback(null, { latitude, longitude });
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  request(
    `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`,
    (err, res, body) => {
      if (err) {
        return callback(err, null);
      }
      if (res.statusCode !== 200) {
        const msg = `Status Code ${res.statusCode} when fetching ISS fly over times. Response: ${body}`;
        return callback(Error(msg), null);
      }
      const passes = JSON.parse(body).response;

      callback(null, passes);
    }
  );
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, passes) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, passes);
      });
    });
  });
};

module.exports = {
  nextISSTimesForMyLocation,
};
