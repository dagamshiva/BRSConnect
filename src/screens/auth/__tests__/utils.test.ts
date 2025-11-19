import { isValidMobile } from '../../auth/utils';

describe('isValidMobile', () => {
	it('accepts valid 10 digit numbers', () => {
		expect(isValidMobile('9876543210')).toBe(true);
		expect(isValidMobile(' 1234567890 ')).toBe(true);
	});

	it('rejects invalid lengths or characters', () => {
		expect(isValidMobile('12345')).toBe(false);
		expect(isValidMobile('12345678901')).toBe(false);
		expect(isValidMobile('abc1234567')).toBe(false);
	});
});


