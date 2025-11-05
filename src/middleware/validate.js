export function validate(schema) {
  return (req, res, next) => {
    try {
      const data = {
        body: schema.body ? schema.body.parse(req.body) : undefined,
        params: schema.params ? schema.params.parse(req.params) : undefined,
        query: schema.query ? schema.query.parse(req.query) : undefined
      };
      req.validated = { ...(data.body||{}), ...(data.params||{}), ...(data.query||{}) };
      next();
    } catch (e) {
      return res.status(400).json({ error: 'Validation error', details: e.errors });
    }
  };
}