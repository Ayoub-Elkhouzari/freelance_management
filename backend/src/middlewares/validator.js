function validate(schema, target = "body") {
  return (req, res, next) => {
    try {
      const data = req[target];

      // ✅ Joi support
      if (schema && typeof schema.validate === "function") {
        const { error, value } = schema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          return res.status(400).json({
            status: "error",
            message: "Validation échouée",
            details: error.details.map((d) => d.message),
          });
        }

        // write back sanitized data
        req[target] = value;
        return next();
      }

      // ✅ Zod support
      if (schema && typeof schema.safeParse === "function") {
        const result = schema.safeParse(data);

        if (!result.success) {
          return res.status(400).json({
            status: "error",
            message: "Validation échouée",
            details: result.error.issues.map((i) => i.message),
          });
        }

        req[target] = result.data;
        return next();
      }

      return res.status(500).json({
        status: "error",
        message: "Schéma de validation non supporté",
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validate;
