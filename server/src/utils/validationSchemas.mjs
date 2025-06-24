export const createUserValidationSchema = {
  username: {
    in: ['body'],
    isString: true,
    notEmpty: { errorMessage: 'Username is required' }
  },
  displayName: {
    in: ['body'],
    isString: true,
    notEmpty: { errorMessage: 'Display name is required' }
  },
  email: {
    in: ['body'],
    optional: true,
    isEmail: { errorMessage: 'Invalid email' }
  },
  password: {
    in: ['body'],
    isString: true,
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters'
    },
    notEmpty: { errorMessage: 'Password is required' }
  }
};

export const loginValidationSchema = {
  username: {
    in: ['body'],
    isString: true,
    notEmpty: { errorMessage: 'Username is required' }
  },
  password: {
    in: ['body'],
    isString: true,
    notEmpty: { errorMessage: 'Password is required' }
  }
};

export const clothingItemValidationSchema = {
  type: {
    in: ['body'],
    isString: true,
    exists: {
      errorMessage: 'Type is required'
    },
    isIn: {
      options: [['shirt', 'pants', 'shoes', 'hat', 'jacket', 'accessory']],
      errorMessage: 'Invalid clothing type'
    }
  },
  color: {
    in: ['body'],
    isString: true,
    exists: {
      errorMessage: 'Color is required'
    },
    isIn: {
      options: [['red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'orange', 'gray', 'brown']],
      errorMessage: 'Invalid color'
    }
  }
}; 