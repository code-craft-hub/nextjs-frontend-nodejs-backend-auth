export const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const validateE164PhoneNumber = (phone: string): boolean => {
  const cleanPhoneNumber = phone.replace(/[\s\-\(\)\.]/g, "");
  console.log("Cleaned Phone Number:", cleanPhoneNumber);
  if (E164_PHONE_REGEX.test(cleanPhoneNumber)) {
    console.log(E164_PHONE_REGEX.test(cleanPhoneNumber));
    return true;
  }
  return false;
};


export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\.]/g, "");
};