export class CustomErrorHandler extends Error {
  constructor (status, message) {
    super (message);
    this.status = status;
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error ('Error:', err.message);

  res.status (err.status || 500).render ('notFound', {
    errorMessage: err.message || 'Oops! Something went wrong.',
  });
};
