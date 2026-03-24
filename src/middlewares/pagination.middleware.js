export const paginate = (req, res, next) => {
    const page = Number (req.query.page) || 1;
    const limit = Number (req.query.limit) || 3;
  
    req.pagination = {
      page,
      limit,
      startIndex: (page - 1) * limit,
      endIndex: page * limit,
    };
    next ();
  };
  