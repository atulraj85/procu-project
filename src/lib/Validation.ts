export function validateUsername(username: string) {
  if (typeof username !== "string") {
    return { isValid: false, message: "Username must be a string." };
  }

  const validChars = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*(?:[-'\s][a-zA-Z]+)*$/;

  if (!validChars.test(username)) {
    return {
      isValid: false,
      message: "Username should not contain special characters.",
    };
  }

  if (username.length < 5) {
    return {
      isValid: false,
      message: "Username must be at least 5 characters long.",
    };
  }

  return { isValid: true, message: "Username is valid." };
}

export function validateEmail(email: string) {
  if (typeof email !== "string") {
    return { isValid: false, message: "Email must be a string." };
  }

  if (/\s/.test(email)) {
    return { isValid: false, message: "Email should not contain spaces." };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, message: "Email is not in a valid format." };
  }

  return { isValid: true, message: "Email is valid." };
}



export const validateGstn = (gstn: string) => {
  const isValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstn);
  return  {isValid} ;
};



export function validateIndianPhoneNumber(phoneNumber: number | string) {
  const phoneStr = phoneNumber.toString();

  if (phoneStr.length !== 10) {
    return {
      isValid: false,
      message: "Phone number must be exactly 10 digits long.",
    };
  }
  const digitPattern = /^[0-9]+$/;
  if (!digitPattern.test(phoneStr)) {
    return {
      isValid: false,
      message: "Phone number should only contain digits.",
    };
  }

  if (!/^[6-9]/.test(phoneStr)) {
    return {
      isValid: false,
      message: "Phone number must start with a digit from 6 to 9.",
    };
  }

  return { isValid: true, message: "Phone number is valid." };
}

export function validateName(username: string) {
  if (typeof username !== "string") {
    return { isValid: false, message: "Username must be a string." };
  }

  const validChars = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*(?:[-'\s][a-zA-Z]+)*$/;

  if (!validChars.test(username)) {
    return {
      isValid: false,
      message: "Username should not contain special characters.",
    };
  }

  if (username.length < 5) {
    return {
      isValid: false,
      message: "Username must be at least 5 characters long.",
    };
  }

  return { isValid: true, message: "Username is valid." };
}
