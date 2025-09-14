export function parseJsonFields(fields: string[]) {
  return (req:any, res:any, next:any) => {
    fields.forEach((field) => {
      if (req.body[field]) {
         console.log(`>>> Before parse ${field}:`, req.body[field]);
        try {
          req.body[field] = JSON.parse(req.body[field]);
          console.log(`>>> After parse ${field}:`, req.body[field]);
        } catch (err) {
          console.log(`>>> Failed parse ${field}:`, req.body[field]);
          return res.status(400).json({
            status: false,
            message: `${field} must be valid JSON`,
          });
        }
      }
    });
    next();
  };
}