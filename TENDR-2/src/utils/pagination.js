const { DEFAULTS } = require('../constants');

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(parseInt(query.limit) || DEFAULTS.PAGE_SIZE, 100));
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { parsePagination }; 