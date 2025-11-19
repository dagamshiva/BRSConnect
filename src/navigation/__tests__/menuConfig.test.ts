import { getMenuForRole, menuConfig } from '../menuConfig';

describe('menuConfig', () => {
	it('provides a menu for each role', () => {
		expect(Object.keys(menuConfig)).toEqual(
			expect.arrayContaining(['member', 'localAdmin', 'superAdmin']),
		);
	});

	it('ensures member menu contains overview tab', () => {
		const memberMenu = getMenuForRole('member');
		expect(memberMenu.some((item) => item.title === 'Overview')).toBe(true);
	});

	it('ensures local admin menu has approvals tab', () => {
		const localMenu = getMenuForRole('localAdmin');
		expect(localMenu.some((item) => item.name === 'Approvals')).toBe(true);
	});
});


