<script setup lang="ts">
import { number, object, string, type InferType, ValidationError } from 'yup'

const { width } = useWindowSize()
const { createUser, updateUser, deleteUsers } = useDirectusUsers()
const user = transformUser(useDirectusAuth().user?.value)
const config = useRuntimeConfig()
const modalStore = useModalStore()
const userTable = ref()

class FetchError extends Error {
	constructor(message: string, type: string) {
		super(message)
		this.type = type
		this.name = 'FetchError'
	}
}

// USER - Actions
function resetUserFormData() {
	userFormData.firstname = ''
	userFormData.lastname = ''
	userFormData.title = ''
	userFormData.password = null
	userFormData.role = null
	userFormData.discordName = ''
}
const handleCreate = () => {
	resetUserFormData()
	modalStore.openSlide({ type: 'createUser' })
}
const handleUserCreation = async (event: FormSubmitEvent<UserCreationSchema>) => {
	userCreationForm.value.clear()
	try {
		await userCreationSchema.validate(userFormData)
		// TODO: GET DISCORD ID AND SET REF FOR CHECKBOX IN SUCCESS-MODAL FOR SENDING CREDENTIALS
		const userData = {
			status: 'draft',
			first_name: userFormData.firstname,
			last_name: userFormData.lastname,
			slug: useSlugify(userFormData.firstname.trim() + (userFormData.lastname && ' ' + userFormData.lastname.trim())),
			title: userFormData.title,
			email: userFormData.email,
			password:
        userFormData.password !== null && userFormData.password !== ''
        	? userFormData.password
        	: useSlugify(
        		userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()),
        		true,
        	),
			role: userFormData.role?.id,
			discordName: userFormData.discordName ?? '',
		}

		if (userTable.value.items?.find((e: IRawUser) => e.email === userData.email)) {
			throw new Error('Es existiert bereits ein Benutzer mit dieser Vor- Nachnamen-Kombination.')
		}
		const newUser = await createUser(userData)

		modalStore.closeSlide()

		await setTimeout(() => {
			userTable.value.refresh()
			modalStore.setData(transformUser(newUser))
			modalStore.openModal('Benutzer erstellt.', {
				hideCloseButton: true,
				hideXButton: true,
				type: 'userCreationSuccess',
			})
		}, 600)
	}
	catch (e) {
		console.error('Error:', createError)
		await setTimeout(
			() =>
				userCreationForm.value.setErrors([
					...userCreationForm.value.getErrors(),
					{
						path: 'customErrors',
						message:
              'Error! Es gab ein Problem bei der Erstellung des Benutzers. Bitte versuche es später erneut. Sollte dieser Fehler wiederholt auftreten melde dich bitte beim Website-Team. (@Thomas_Blakeney, @Decon_Malcom_Vorn)',
					},
				]),
			0,
		)
	}
}

const handleEdit = (user: any) => {
	console.log('edit')
}
const handleDelete = async (users: any[]) => {
	try {
		await deleteUsers(users?.map((obj: any) => obj.id))
	}
	catch (e) {
		console.error(e)
	}
	finally {
		userTable.value.refresh()
		userTable.value.selectedRows = []
	}
}
const handleLock = async (users: any[]) => {
	try {
		await Promise.all(
			users.value?.map(async (user: any) => {
				await updateUser(user.id, { status: 'suspended' }, {})
			}),
		)
	}
	catch (e) {
		console.error(e)
	}
	finally {
		userTable.value.refresh()
		userTable.value.selectedRows = []
	}
}
const handleUnlock = async (users: any[]) => {
	try {
		await Promise.all(
			users.value?.map(async (user: any) => {
				await updateUser(user.id, { status: 'active' }, {})
			}),
		)
	}
	catch (e) {
		console.error(e)
	}
	finally {
		userTable.value.refresh()
		userTable.value.selectedRows = []
	}
}
const handleArchive = async (users: any[]) => {
	try {
		await Promise.all(
			users.value?.map(async (user: any) => {
				await updateUser(user.id, { status: 'archived' }, {})
			}),
		)
	}
	catch (e) {
		console.error(e)
	}
	finally {
		userTable.value.refresh()
		userTable.value.selectedRows = []
	}
}

// USER - Data
const userCreationForm = ref()
const userCreationSendCredentials = ref(false)
const userCreationSchema = object({
	firstname: string().required('Bitte gib einen Vornamen an.'),
	lastname: string().nullable(),
	title: string().nullable(),
	email: string()
		.email('Es gab ein Fehler bei der Generierung der Email-Adresse.')
		.required('Es gab einen Fehler bei der Generierung der Email-Adresse.'),
	password: string().nullable(),
	role: object({
		id: string().required('Bitte wähle eine Position aus.'),
		position: string().required('Bitte wähle eine Position aus.'),
		permissionLevel: number().required('Bitte wähle eine Position aus.'),
	}).required('Bitte wähle eine Position aus.'),
	discordName: string().nullable(),
})
type UserCreationSchema = InferType<typeof userCreationSchema>
const userFormData: {
	firstname: string
	lastname?: string
	title?: string
	password: string | null
	email: string
	role?: object | null
	discordName?: string
} = reactive({
	firstname: '',
	lastname: '',
	title: '',
	password: null,
	email: computed(
		() =>
			useSlugify(userFormData.firstname.trim() + (userFormData.lastname && '.' + userFormData.lastname.trim()), true)
			+ '@ariscorp.de',
	),
	role: null,
	discordName: '',
})

// USER - Options
const titleOptions = ['Dr.', 'Dr. Med.', 'Prof. Med.', 'Dipl. Ing.']
const roleOptions = [
	{
		id: '030fee1b-0a1c-413c-a7c5-c1b2f10765ea',
		position: 'Anwärter',
		permissionLevel: 1,
	},
	{
		id: '175c81cc-7d77-4fe8-a115-c0092df766a0',
		position: 'Freier Mitarbeiter',
		permissionLevel: 2,
	},
	{
		id: '362f98a8-7be4-4b48-88bf-5ca35e4ac80e',
		position: 'Mitarbeiter',
		permissionLevel: 3,
	},
	{
		id: 'd55635b8-f203-4651-9a8a-8878044bc347',
		position: 'Verwaltung',
		permissionLevel: 4,
	},
]

if (user.position.permissionLevel >= 5) {
	roleOptions.push({
		id: 'bc712fc8-ce4f-4427-b431-4942eaaedaa6',
		position: 'Verwaltung + Administration',
		permissionLevel: 5,
	})
}

definePageMeta({
	layout: false,
	middleware: [
		'auth',
		async function (to, from) {
			const user = transformUser(useDirectusAuth().user?.value)
			if (user.position.permissionLevel < 4) {
				return navigateTo({
					path: '/ams',
				})
			}
		},
	],
})

useHead({
	title: 'Administration',
})
</script>

<template>
	<NuxtLayout name="ams">
		<Test />
		<template #modalContent>
			<div v-if="modalStore.type === 'userCreationSuccess'">
				<h4>Daten:</h4>
				<table class="prose prose-invert">
					<tbody>
						<tr class="border-aris-400">
							<td>Vorname:</td>
							<td>{{ modalStore.data?.firstname }}</td>
						</tr>
						<tr
							v-if="modalStore.data?.lastname"
							class="border-aris-400"
						>
							<td>Nachname:</td>
							<td>{{ modalStore.data?.lastname }}</td>
						</tr>
						<tr class="border-aris-400">
							<td>Position:</td>
							<td>{{ modalStore.data?.position.position }}</td>
						</tr>
						<tr class="border-aris-400">
							<td>Benutzername(login):</td>
							<td>{{ modalStore.data?.login_email.replace('@ariscorp.de', '') }}</td>
						</tr>
						<tr class="border-aris-400">
							<td>Passwort:</td>
							<td>
								{{
									userFormData.password !== null && userFormData.password !== ''
										? userFormData.password
										: useSlugify(userFormData.firstname + (userFormData.lastname && '.' + userFormData.lastname), true)
								}}
							</td>
						</tr>
					</tbody>
				</table>
				<h4 class="text-danger">
					Wichtig: Der Benutzer ist <span class="italic text-red-400">noch nicht freigeschaltet</span>. Dies muss aus
					Sicherheitsgründen manuell erfolgen. Wähle ihn hierzu einfach in der Tabelle aus und klicke auf:
					&quot;Freischalten&quot;
				</h4>
				<div class="mx-auto mt-4">
					<ArisUFormGroup
						label="Benutzer Anmeldeinformationen schicken?"
						class="flex items-center gap-x-4"
					>
						<UCheckbox v-model="userCreationSendCredentials" />
						<template #hint>
							<p>
								Wenn sie den Discord-Namen angegeben haben, können dem Benutzer automatisch per PN die
								Anmeldeinformationen zugeschickt werden.
							</p>
						</template>
					</ArisUFormGroup>
				</div>
				<div class="mx-auto mt-4">
					<ButtonDefault
						class="w-1/3"
						color="danger"
						@click="
							modalStore.closeModal();
							resetUserFormData();
						"
					>
						Schließen
					</ButtonDefault>
				</div>
			</div>
		</template>
		<template #slideCard>
			<div class="flex-1">
				<UForm
					ref="userCreationForm"
					class="h-full"
					:state="userFormData"
					:schema="userCreationSchema"
					validate-on="submit"
					@submit="onEditSubmit"
				>
					<UCard class="flex flex-col flex-1 h-screen scrollbar-gray-thin">
						<template #header>
							<h2 class="my-0">
								<span>
									Neues Mitglied hinzufügen
									<UPopover mode="hover">
										<UButton
											icon="i-heroicons-information-circle"
											variant="inputInfo"
										/>
										<template #panel>
											<div class="p-1 text-xs text-left text-tbase/60 whitespace-break-spaces">
												<slot name="help" />
											</div>
										</template>
									</UPopover>
								</span>
							</h2>
						</template>
						<div class="flex w-full text-center">
							<UFormGroup
								class="mx-auto"
								name="customErrors"
							/>
						</div>
						<h4 class="mt-0 mb-1 text-left">
							Basisdaten {{ userFormData.email }}
						</h4>
						<div class="items-center justify-between space-y-6 gap-x-4">
							<ArisUFormGroup
								required
								size="xl"
								label="Vorname"
								name="firstname"
							>
								<UInput
									v-model="userFormData.firstname"
									placeholder="Chris"
									icon="i-heroicons-user"
								/>
								<button
									v-if="userFormData.firstname !== ''"
									type="button"
									class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
									@click="userFormData.firstname = ''"
								>
									<UIcon
										name="i-heroicons-x-mark-16-solid"
										class="my-auto transition opacity-75 hover:opacity-100"
									/>
								</button>
							</ArisUFormGroup>
							<ArisUFormGroup
								size="xl"
								label="Nachname"
								name="lastname"
							>
								<UInput
									v-model="userFormData.lastname"
									placeholder="Roberts"
									icon="i-heroicons-user"
								/>
								<button
									v-if="userFormData.lastname !== ''"
									type="button"
									class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
									@click="userFormData.lastname = ''"
								>
									<UIcon
										name="i-heroicons-x-mark-16-solid"
										class="my-auto transition opacity-75 hover:opacity-100"
									/>
								</button>
							</ArisUFormGroup>
							<ArisUFormGroup
								size="xl"
								label="Titel"
								name="title"
							>
								<div class="relative">
									<USelectMenu
										v-model="userFormData.title"
										:options="titleOptions"
										:ui="
											userFormData.title
												? {
													leading: {
														padding: {
															xl: 'ps-10',
														},
													},
												}
												: { leading: { padding: { xl: 'hidden' } } }
										"
									>
										<template
											v-if="userFormData.title"
											#leading
										/>
										<template #label>
											<span v-if="userFormData.title">{{ userFormData.title }}</span>
											<span v-else>Kein Titel ausgewählt</span>
										</template>
										<template #option="{ option }">
											<span v-if="option">{{ option }}</span>
											<span v-else>Kein Titel</span>
										</template>
									</USelectMenu>
									<template v-if="userFormData.title">
										<button
											v-if="userFormData.title"
											class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
											@click="userFormData.title = ''"
										>
											<UIcon
												name="i-heroicons-x-mark-16-solid"
												class="my-auto transition opacity-75 hover:opacity-100"
											/>
										</button>
									</template>
								</div>
							</ArisUFormGroup>
							<ArisUFormGroup
								size="xl"
								label="Passwort"
								name="password"
							>
								<UInput
									v-model="userFormData.password"
									placeholder="Chris"
									icon="i-heroicons-lock-closed"
								/>
								<button
									v-if="userFormData.password"
									type="button"
									class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
									@click="userFormData.password = null"
								>
									<UIcon
										name="i-heroicons-x-mark-16-solid"
										class="my-auto transition opacity-75 hover:opacity-100"
									/>
								</button>
							</ArisUFormGroup>
							<ArisUFormGroup
								required
								size="xl"
								label="Position"
								name="role"
							>
								<div class="relative">
									<USelectMenu
										v-model="userFormData.role"
										:options="roleOptions"
										:ui="
											userFormData.role
												? {
													leading: {
														padding: {
															xl: 'ps-10',
														},
													},
												}
												: { leading: { padding: { xl: 'hidden' } } }
										"
									>
										<template
											v-if="userFormData.role"
											#leading
										/>
										<template #label>
											<span v-if="userFormData.role">{{ userFormData.role.position }}</span>
											<span v-else>Keine Position ausgewählt</span>
										</template>
										<template #option="{ option }">
											<span v-if="option">{{ option.position }}</span>
											<span v-else>Keine Position</span>
										</template>
									</USelectMenu>
									<template v-if="userFormData.role">
										<button
											v-if="userFormData.role"
											class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
											@click="userFormData.role = null"
										>
											<UIcon
												name="i-heroicons-x-mark-16-solid"
												class="my-auto transition opacity-75 hover:opacity-100"
											/>
										</button>
									</template>
								</div>
								<template #help>
									<span
										v-if="userFormData?.role?.id === '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb'"
										class="text-danger"
									>
										Achtung: Du hast die Administrator-Position ausgewählt. Dies bedeutet das jemand alle Daten der
										Website verändern kann!
									</span>
								</template>
							</ArisUFormGroup>
						</div>
						<template #footer>
							<div class="flex flex-wrap justify-between w-full px-8 my-auto">
								<ButtonDefault
									type="button "
									class="w-1/3"
									color="danger"
									@click="
										modalStore.closeSlide();
										resetUserFormData();
									"
								>
									Schließen
								</ButtonDefault>
								<ButtonDefault
									:disabled="
										userFormData.firstname !== '' && userFormData.firstname !== null && userFormData.role !== null
											? false
											: true
									"
									class="w-1/3"
									color="success"
									@click="
										userFormData.firstname !== ''
											&& userFormData.firstname !== null
											&& userFormData.role !== null
											&& handleUserCreation()
									"
								>
									Speichern
								</ButtonDefault>
							</div>
						</template>
					</UCard>
				</UForm>
			</div>
		</template>
		<div class="max-w-[calc(100vw_-_20rem)] mx-auto mb-4">
			<h1 class="text-center">
				Verwaltungsdashboard
			</h1>
			<UTabs
				:items="[{ label: 'Home' }, { label: 'Verwaltungsübersicht' }, { label: 'Benutzer' }, { label: 'Hangars' }]"
				:ui="{ list: { background: 'bg-bsecondary', marker: { background: 'bg-bprimary' } } }"
				:orientation="width > 1024 ? 'horizontal' : 'vertical'"
			>
				<template #item="{ item }">
					<div v-if="item.label === 'Home'">
						<h2>Home</h2>
					</div>
					<div v-else-if="item.label === 'Verwaltungsübersicht'">
						<h2>Verwaltungsübersicht</h2>
					</div>
					<div v-else-if="item.label === 'Benutzer'">
						<div>
							<!-- TODO: ADD LOCK AND UNLOCK FUNCTIONS -->
							<AmsAdministrationUserTable
								ref="userTable"
								@create="handleCreate"
								@edit="handleEdit"
								@delete="handleDelete"
								@lock="handleLock"
								@unlock="handleUnlock"
								@archive="handleArchive"
							/>
						</div>
					</div>
					<div v-else-if="item.label === 'Hangars'">
						<h2>Hangars</h2>
					</div>
				</template>
			</UTabs>
		</div>
	</NuxtLayout>
</template>
