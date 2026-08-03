const { Joi, celebrate } = require('celebrate');
const validator = require('validator');

const validateURL = (value, helpers) => {
  if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
    return value;
  }
  return helpers.error("string.uri");
}


module.exports.validateUserCreation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximun lenght of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "Avatar URL" is required',
      "string.uri": 'Avatar must be valid URL',
    }),

    email: Joi.string().required().email().messages({
      "string.empty": 'Email is required',
      "string.email": 'Please provide a valid email address',
    }),

    password: Joi.string().required().min(8).messages({
      "string.empty": 'Password is required',
      "string.min": 'Password must be at least 8 characters long',
    })
  })
});

module.exports.validateClothingItem = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximun lenght of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    weather: Joi.string().valid('hot', 'warm', 'cold').required().messages({
      "string.empty": 'The "Radio" field must be chosen one',
    }),

    imageUrl: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be valid URL',
    }),
  })
});

module.exports.validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": 'Email is required',
      "string.email": 'Please provide a valid email address',
    }),

    password: Joi.string().required().min(8).messages({
      "string.empty": 'Password is required',
      "string.min": 'Password must be at least 8 characters long',
    })
  })
});

module.exports.validateFavorite = celebrate({
  body: Joi.object().keys({
    type: Joi.string().valid('photo', 'video').required().messages({
      "any.only": 'The "type" field must be either "photo" or "video"',
      "string.empty": 'The "type" field must be chosen',
    }),

    url: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "url" field must be filled in',
      "string.uri": 'The "url" field must be a valid URL',
    }),

    title: Joi.string().allow('').max(60).messages({
      "string.max": 'The "title" field must be 60 characters or fewer',
    }),
  })
});

module.exports.validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required().messages({
      'string.length': 'ID must be 24 characters long',
      'string.hex': 'ID must be a hexadecimal value',
    })
  })
})

module.exports.validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximun lenght of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "Avatar URL" is required',
      "string.uri": 'Avatar must be valid URL',
    }),
  })
});

module.exports.validateGalleryLink = celebrate({
  body: Joi.object().keys({
    kind: Joi.string().valid('photo', 'video').required().messages({
      "any.only": 'The "kind" field must be either "photo" or "video"',
      "string.empty": 'The "kind" field must be chosen',
    }),

    url: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "url" field must be filled in',
      "string.uri": 'The "url" field must be a valid URL',
    }),

    title: Joi.string().allow('').max(60).messages({
      "string.max": 'The "title" field must be 60 characters or fewer',
    }),
  })
});