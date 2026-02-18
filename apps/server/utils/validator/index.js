function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidImage(image) {
  const { type } = image;
  return (
    type.toLowerCase() === "image/png" ||
    type.toLowerCase() === "image/jpg" ||
    type.toLowerCase() === "image/jpeg" ||
    type.toLowerCase() === "image/webp" ||
    type.toLowerCase() === "image/gif"
  );
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return passwordRegex.test(password);
}

function hasOneSpaceBetweenNames(name) {
  const nameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
  return nameRegex.test(name);
}

function isValidIndianMobileNumber(mobileNumber) {
  const indianMobileNumberRegex = /^[6-9]\d{9}$/;
  return indianMobileNumberRegex.test(mobileNumber);
}

function generateRandomCode() {
  const min = 1000;
  const max = 9999;

  const randomCode =
    Math.floor(Math.random() * (max - min + 1)) + min;

  return randomCode.toString();
}

function isValidUrl(url) {
  const urlRegex =
    /^((http|https|ftp):\/\/)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,6}$/;

  return urlRegex.test(url);
}

function isValid4DigitOtp(value) {
  const otpRegex = /^\d{4}$/;
  return otpRegex.test(value);
}

module.exports = {
  isValidEmail,
  isValidImage,
  isValidPassword,
  hasOneSpaceBetweenNames,
  isValidIndianMobileNumber,
  generateRandomCode,
  isValidUrl,
  isValid4DigitOtp,
};
