var model = require('../models');

module.exports = function (userInfo, noUserCB, successCB, errorCB) {
  model.User.findOne({where: {name: userInfo.name}}).then(function (user) {
    if (!user) {
      return noUserCB();
    }
    user.comparePassword(userInfo.password, function (err, result) {
      if (result) {
        return successCB(user);
      } else {
        return errorCB();
      }
    });
  })
};
