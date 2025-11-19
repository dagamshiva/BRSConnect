const MOBILE_REGEX = /^\d{10}$/;

export const isValidMobile = (value: string): boolean => {
	return MOBILE_REGEX.test(value.trim());
};


