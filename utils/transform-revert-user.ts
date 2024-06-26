export default function transformUserRevert(obj: any) {
	return {
		id: obj.id,
		first_name: obj.firstname,
		last_name: obj.lastname,
		email: obj.arisEmail,
		password: obj.password,
		title: obj.title,
		avatar: obj.potrait,
		status: obj.status,
		role: obj.position?.id,
		contactEmail: obj.contactEmail,
		discordName: obj.discordName,
		rsiHandle: obj.rsiHandle,
		slug: obj.slug,
		temporaryPassword: obj.temporaryPassword,
		sex: obj.sex,
		roles: obj.roles,
		head_of_department: obj.headOfDepartment,
		birthdate: obj.birthdate,
		birthplace: obj.birthplace?.id ?? null,
		citizen: obj.ueeState === 'citizen',
		citizenReason: obj.citizenReason,
		dutyPeriod: obj.duty?.period,
		dutyEnd: obj.duty?.end,
		dutyDivision: obj.duty?.divisionValue,
		study: obj.education?.name,
		studyPeriod: obj.education?.period,
		studyPlace: obj.education?.place,
		haircolor: obj.haircolor,
		eyecolor: obj.eyecolor,
		height: obj.height,
		weight: obj.weight,
		currentResidence: obj.currentplace?.id ?? null,
		habits: obj.habits,
		talents: obj.talents,
		tics: obj.tics,
		activities: obj.activities,
		mysteriousThings: obj.mysterious,
		characterTrait: obj.character,
		fears: obj.fears,
		books: obj.books,
		music: obj.music,
		movies: obj.movies,
		colors: obj.colors,
		clothing: obj.clothing,
		food: obj.food,
		drink: obj.drink,
		alcohol: obj.alcohol,
		loves: obj.loves,
		hates: obj.hates,
		medicalInformations: obj.medicalinfo,
		biography: obj.biography,
		dutyState: obj.dutyState,
		educationState: obj.educationState,
		hobbies: obj.hobbies,
	}
}
