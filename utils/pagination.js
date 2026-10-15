// Shared limit/page parsing for public list endpoints.
// Defaults: limit 20, page 1. Limit is capped at 50.
module.exports.parsePagination = (query) => {
  let limit = parseInt(query.limit, 10);
  let page = parseInt(query.page, 10);
  if (Number.isNaN(limit) || limit < 1) limit = 20;
  if (limit > 50) limit = 50;
  if (Number.isNaN(page) || page < 1) page = 1;
  return { limit, page };
};
