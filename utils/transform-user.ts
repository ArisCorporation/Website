export default function (obj: any) {
	const roles = [
		obj.head_of_department ? 'Abteilungsleiter' : null,
		obj.roles?.includes('recruitment') ? 'Rekrutierung' : null,
		obj.roles?.includes('marketing_and_press') ? 'Marketing & Presse' : null,
		obj.roles?.includes('content_writer') ? 'Inhaltsersteller' : null,
	]
		.filter(Boolean)
		.sort()

	const directus_roles: { id: string, label: string, name: string, access_level: number }[] = [
		{
			id: '1de3fee4-090e-40fa-ad12-c0bf6c48f8dd',
			label: 'Verwaltung',
			name: 'Administration',
			access_level: 4,
		},
		{
			id: '35715c93-a203-46d6-8ae8-122e726eabaa',
			label: 'Freier Mitarbeiter',
			name: 'Freelancer',
			access_level: 2,
		},
		{
			id: '58566123-599f-4bd8-a1ac-ce25372d284b',
			label: 'Anwärter',
			name: 'Candidate',
			access_level: 1,
		},
		{
			id: 'bc712fc8-ce4f-4427-b431-4942eaaedaa6',
			label: 'Verwaltung',
			name: 'Administrator',
			access_level: 5,
		},
		{
			id: 'cd587d88-0ccd-4189-a2c2-46a3bbfc3c04',
			label: 'Mitarbeiter',
			name: 'Employee',
			access_level: 3,
		},
	]

	return {
		...(obj.id && { id: obj.id }),
		...(obj.status && { status: obj.status }),
		...(obj.first_name && { first_name: obj.first_name }),
		...(obj.last_name && { last_name: obj.last_name }),
		...(obj.title && { title: obj.title }),
		...(obj.temporary_password && { temporary_password: obj.temporary_password }),
		...(obj.hasOwnProperty('first_name')
		&& obj.hasOwnProperty('last_name') && {
			full_name: `${obj.title ? obj.title + ' ' : ''}${obj.first_name}${obj.last_name ? ' ' + obj.last_name : ''}`,
		}),
		...(obj.slug && { slug: obj.slug }),
		...(obj.email && { login_email: obj.email }),
		...(obj.contact_email && { contact_email: obj.contact_email }),
		...(obj.discord_name && { discord_name: obj.discord_name }),
		...(obj.discord_id && { discord_id: obj.discord_id }),
		...(obj.rsi_handle && { rsi_handle: obj.rsi_handle }),
		avatar: obj.avatar ? obj.avatar : '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492',
		avatar_url: obj.avatar
			? 'https://cms.ariscorp.de/assets/' + obj.avatar
			: 'https://cms.ariscorp.de/assets/' + '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492',
		...(obj.sex && {
			sex: obj.sex === 'female' ? 'Weiblich' : 'Männlich',
			sex_value: obj.sex,
			pronom: obj.sex === 'female' ? 'Sie' : 'Er',
		}),
		...(obj.hasOwnProperty('roles') && { roles: roles.length > 0 ? roles : null, roles_value: obj.roles }),
		...(obj.role?.hasOwnProperty('id')
			? {
					position: {
						id: obj.role.id,
						name: obj.role.label,
						...(obj.role.access_level && { access_level: obj.role.access_level }),
					},
					...(obj.role.access_level && { admin: obj.role.access_level >= 5 }),
				}
			: obj.role && {
				position: {
					id: directus_roles.find(e => e.id === obj.role)?.id,
					name: directus_roles.find(e => e.id === obj.role)?.label,
					access_level: directus_roles.find(e => e.id === obj.role)?.access_level ?? 0,
				},
				admin: directus_roles.find(e => e.id === obj.role)?.access_level ?? 0 >= 5,
			}),
		...(obj.head_of_department && { head_of_department: obj.head_of_department }),
		...(obj.department || obj.leading_department
			? {
					department:
            (obj.department || obj.leading_department) && obj.head_of_department
            	? transformDepartment(obj.leading_department)
            	: transformDepartment(obj.department),
					department_id:
            (obj.department || obj.leading_department) && obj.head_of_department
            	? obj.leading_department
            	: obj.department,
				}
			: {}),
		...(obj.birthplace && {
			birthplace: transformLandingZone(obj.birthplace),
			birthplace_value: obj.birthplace?.id || obj.birthplace,
		}),
		...(obj.birthdate && { birthdate: obj.birthdate }),
		...(obj.current_residence && {
			current_residence: transformLandingZone(obj.current_residence),
			current_residence_value: obj.current_residence?.id || obj.current_residence,
		}),
		...(obj.hasOwnProperty('citizen') && { citizen_state: obj.citizen }),
		...(obj.citizen_reason && {
			citizen_reason:
        obj.citizen_reason === 'military'
        	? 'Militärischer Dienst'
        	: obj.citizen_reason === 'special_education'
        		? 'Besondere Bildung'
        		: obj.citizen_reason === 'social_commitment'
        			? 'Soziales Engagement'
        			: null,
		}),
		...(obj.citizen_reason && { citizen_reason_value: obj.citizen_reason }),
		...(obj.duty_state !== null && { duty_state: obj.duty_state }),
		...(obj.duty_state === true && {
			duty: {
				period: obj.duty_period,
				end: obj.duty_end === 'honorable' ? 'Ehrenhaft' : obj.duty_end === 'dishonorable' ? 'Unehrenhaft' : null,
				end_value: obj.duty_end,
				division:
          obj.duty_division === 'army'
          	? 'UEE Arme'
          	: obj.duty_division === 'navy'
          		? 'UEE Marine'
          		: obj.duty_division === 'marines'
          			? 'UEE Luftwaffe'
          			: null,
				division_value: obj.duty_division,
			},
		}),
		...(obj.education_state !== null && { education_state: obj.education_state }),
		...(obj.education_state === true && {
			education: {
				name: obj.education_name,
				period: obj.education_period,
				// place: obj.education_place,
			},
		}),
		...(obj.social_state !== null && { social_state: obj.social_state }),
		...(obj.hair_color && { hair_color: obj.hair_color }),
		...(obj.eye_color && { eye_color: obj.eye_color }),
		...(obj.height && { height: obj.height }),
		...(obj.weight && { weight: obj.weight }),
		...(obj.hobbies && { hobbies: obj.hobbies }),
		...(obj.habits && { habits: obj.habits }),
		...(obj.talents && { talents: obj.talents }),
		...(obj.tics && { tics: obj.tics }),
		...(obj.activities && { activities: obj.activities }),
		...(obj.mysterious_things && { mysterious: obj.mysterious_things }),
		...(obj.character_trait && { character: obj.character_trait }),
		...(obj.fears && { fears: obj.fears }),
		...(obj.books && { books: obj.books }),
		...(obj.music && { music: obj.music }),
		...(obj.movies && { movies: obj.movies }),
		...(obj.colors && { colors: obj.colors }),
		...(obj.clothing && { clothing: obj.clothing }),
		...(obj.food && { food: obj.food }),
		...(obj.drink && { drink: obj.drink }),
		...(obj.alcohol && { alcohol: obj.alcohol }),
		...(obj.loves && { loves: obj.loves }),
		...(obj.hates && { hates: obj.hates }),
		...(obj.medical_informations && { medical_informations: obj.medical_informations }),
		...(obj.biography && { biography: obj.biography }),
		...(obj.slug && { hangar_link: `/ams/employees/hangar/${obj.slug}` }),
		...(obj.slug && { biography_link: `/biography/${obj.slug}` }),
		...(obj.slug && { biography_ams_link: `/ams/employees/biography/${obj.slug}` }),
		...(obj.hangar_items && { hangar: obj.hangar_items.map((item: any) => transformHangarItem(item)) }),
		...(obj.onboardings && { onboardings: obj.onboardings }),
	}
}
