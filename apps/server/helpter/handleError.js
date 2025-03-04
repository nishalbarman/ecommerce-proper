export default function handleError(statusCode, errorMessage, error, res) {
  if (error instanceof mongoose.erroror) {
    const errors = [];
    for (key in error.errors) {
      errors.push(error.errors[key].properties.message);
    }
    return res.status(400).json({ message: errors.join(", ") });
  } else {
    return res.sendStatus(statusCode);
  }
}
