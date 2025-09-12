// /home/lgruber/Development/ArisCorporation/Website/app/stores/ams/user-profile-edit-store.ts
import { defineStore } from 'pinia';
import _ from 'lodash';
import { z } from 'zod';
import type { FormError } from '@nuxt/ui';
import type { DirectusUser, Department, LandingZone, DirectusFile, DirectusRole } from '~~/types'; // Pfade anpassen
import { useAuthStore } from '~/stores/auth'; // Pfad zu deinem Auth-Store anpassen
import resolveToStringOrUndefined from '~~/layers/ams/app/utils/resolve-string-or-undefined'; // Pfad anpassen

// Definiere, welche Felder des DirectusUser editierbar sein sollen.
// Passe dies genau an die Felder an, die du im Profil-Bearbeitungsformular haben möchtest.
export const userProfileSchema = z.object({
  first_name: z.string().trim().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().trim().optional().nullable(),
  middle_name: z.string().trim().optional().nullable(),
  // Email wird oft separat oder gar nicht im Standard-Profil-Edit geändert
  email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  title: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(), // ID der DirectusFile, oder URL
  password: z.string().optional().nullable(),

  rsi_handle: z.string().trim().optional().nullable(),
  discord_name: z.string().optional().nullable(),
  contact_email: z.string().email("Ungültige Kontakt-E-Mail").optional().nullable(),
  discord_id: z.string().optional().nullable(),

  sex: z.enum(['male', 'female']).optional().nullable(),
  primary_department: z.string().optional().nullable(), // ID des Departments
  secondary_department: z.string().optional().nullable(), // ID des Departments
  // leading_department: z.string().optional().nullable(), // ID des Departments
  head_of_department: z.boolean().optional().nullable(),

  birthplace: z.string().optional().nullable(), // ID der LandingZone oder Name
  current_residence: z.string().optional().nullable(), // ID der LandingZone oder Name
  birthdate: z.string().optional().nullable(), // Ggf. als z.date() und dann transformieren. Format "YYYY-MM-DD" or similar.
  birthdate_day: z.number().min(1, 'Ungültiger Tag').max(31, 'Ungültiger Tag').optional().nullable(),
  birthdate_month: z.number().min(1, 'Ungültiger Tag').max(12, 'Ungültiger Monat').optional().nullable(),
  birthdate_year: z.number().min(2800, 'Ungültiges Jahr').max(3000, 'Ungültiges Jahr').optional().nullable(),
  // birthdate: z.string()
  //   .refine((val) => {
  //     // Diese Validierung greift nur, wenn val ein String ist.
  //     // optional() und nullable() werden separat behandelt.
  //     if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false; // Prüft das Format YYYY-MM-DD
  //     const date = new Date(val);
  //     // Zerlegt den String in Jahr, Monat, Tag als Zahlen
  //     const [year, month, day] = val.split('-').map(Number);
  //     // Prüft, ob das Datum gültig ist (z.B. nicht 2023-02-30)
  //     // und ob die Komponenten des Date-Objekts mit den ursprünglichen Werten übereinstimmen.
  //     return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  //   }, {
  //     message: 'Ungültiges Datum.'
  //   })
  //   .optional()
  //   .nullable(),

  citizen_state: z.enum(['true', 'false']).optional().nullable(), // Storing as string from radio
  citizen: z.boolean().optional().nullable(), // Storing as string from radio
  citizen_reason: z.enum(['military', 'special_education', 'social_commitment']).optional().nullable(),

  duty_state: z.boolean().optional().nullable(),
  duty_division: z.enum(['army', 'marines', 'navy']).optional().nullable(),
  duty_end: z.enum(['honorable', 'dishonorable']).optional().nullable(),
  duty_dismissal_reason: z.string().optional().nullable(),
  duty_from_month: z.number().min(1, 'Ungültiger Monat').max(12, 'Ungültiger Monat').optional().nullable(),
  duty_from_year: z.number().min(2900, 'Ungültiges Jahr').max(3000, 'Ungültiges Jahr').optional().nullable(),
  duty_to_month: z.number().min(1, 'Ungültiger Monat').max(12, 'Ungültiger Monat').optional().nullable(),
  duty_to_year: z.number().min(2900, 'Ungültiges Jahr').max(3000, 'Ungültiges Jahr').optional().nullable(),

  roles: z.array(z.enum(['recruitment', 'marketing_and_press', 'content_writer'])).optional().nullable(), // Directus stores roles as a many-to-many relationship, not a simple string array
  // role: z.array(z.string().trim()).optional().nullable(), // Array of role IDs/keys

  hair_color: z.string().optional().nullable(),
  eye_color: z.string().optional().nullable(),
  height: z.number().min(120, 'Du kannst nicht kleiner als 120cm sein').max(250, 'Du kannst nicht größer als 250cm sein').optional().nullable(),
  weight: z.number().min(40, 'Du kannst nicht leichter als 40kg sein').max(300, 'Du kannst nicht schwerer als 300kg sein').optional().nullable(),

  hobbies_list: z.array(z.string().trim()).optional().nullable(),
  habits_list: z.array(z.string().trim()).optional().nullable(),
  talents_list: z.array(z.string().trim()).optional().nullable(),
  tics_list: z.array(z.string().trim()).optional().nullable(),
  activities_list: z.array(z.string().trim()).optional().nullable(),
  mysterious_list: z.array(z.string().trim()).optional().nullable(),
  character_trait_list: z.array(z.string().trim()).optional().nullable(),
  fears_list: z.array(z.string().trim()).optional().nullable(),
  books_list: z.array(z.string().trim()).optional().nullable(),
  music_list: z.array(z.string().trim()).optional().nullable(),
  movies_list: z.array(z.string().trim()).optional().nullable(),
  clothing_list: z.array(z.string().trim()).optional().nullable(),
  food_list: z.array(z.string().trim()).optional().nullable(),
  drink_list: z.array(z.string().trim()).optional().nullable(),
  alcohol_list: z.array(z.string().trim()).optional().nullable(),
  loves_list: z.array(z.string().trim()).optional().nullable(),
  hates_list: z.array(z.string().trim()).optional().nullable(),

  medical_informations: z.string().optional().nullable(),
  biography: z.string().optional().nullable(), // Oft ein Rich-Text-Feld

  education_name: z.string().trim().optional().nullable(),
  education_place: z.string().optional().nullable(),
  education_state: z.boolean().optional().nullable(),
  education_from_month: z.number().min(1, 'Ungültiger Monat').max(12, 'Ungültiger Monat').optional().nullable(),
  education_from_year: z.number().min(2900, 'Ungültiges Jahr').max(3000, 'Ungültiges Jahr').optional().nullable(),
  education_to_month: z.number().min(1, 'Ungültiger Monat').max(12, 'Ungültiger Monat').optional().nullable(),
  education_to_year: z.number().min(2900, 'Ungültiges Jahr').max(3000, 'Ungültiges Jahr').optional().nullable(),

  // Felder, die typischerweise nicht direkt vom Benutzer geändert werden:
  id: z.string().optional(), // ID ist für Updates wichtig, aber nicht editierbar
  // status: z.string().optional(),
  role: z.array(z.string().trim()).optional().nullable(), // Array of role IDs/keys
  // email_notifications: z.boolean().optional(),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const useUserProfileEditStore = defineStore('userProfileEdit', {
  state: () => ({
    formData: {} as UserProfileFormData,
    apiValidationErrors: {} as Record<string, string[] | undefined>,
    isSubmitting: false,
    submitError: null as string | null,
  }),

  getters: {
    currentFormData: (state): UserProfileFormData => state.formData,
    isLoading: (state): boolean => state.isSubmitting,
    getSubmitError: (state): string | null => state.submitError,
    getApiFieldErrorMessages: (state): FormError[] => {
      const messages: FormError[] = [];
      if (state.apiValidationErrors) {
        for (const path in state.apiValidationErrors) {
          const errorMessages = state.apiValidationErrors[path];
          if (Array.isArray(errorMessages)) {
            errorMessages.forEach(message => { // Nuxt UI FormError uses 'path'
              messages.push({ path, message });
            });
          } else if (typeof errorMessages === 'string') {
            messages.push({ path, message: errorMessages });
          }
        }
      }
      return messages;
    }
  },

  actions: {
    initForm () {
      const authStore = useAuthStore();
      const user = authStore.currentUser;

      if (!user) {
        console.warn('ProfileEditStore: initForm called but authStore.currentUser is not available. Form will be initialized with empty/default data.');
        // Initialize with a default structure that is compliant with userProfileSchema
        // to prevent hydration mismatches.
        const defaultData: Partial<UserProfileFormData> = {
          first_name: "-", // Placeholder to satisfy min(1). Consider schema adjustment or ClientOnly for the form.
          last_name: null,
          middle_name: null,
          email: null,
          title: null,
          avatar: null,
          password: null,
          rsi_handle: null,
          discord_name: null,
          contact_email: null,
          discord_id: null,
          sex: null,
          primary_department: null,
          secondary_department: null,
          head_of_department: null,
          birthplace: null,
          current_residence: null,
          birthdate: null,
          birthdate_day: null,
          birthdate_month: null,
          birthdate_year: null,
          citizen: null, // Schema allows null
          citizen_reason: null,
          duty_state: null,
          duty_division: null,
          duty_end: null,
          duty_dismissal_reason: null,
          duty_from_month: null, duty_from_year: null, duty_to_month: null, duty_to_year: null,
          roles: null, // Or [] if preferred for nullable arrays and schema allows
          hair_color: null, eye_color: null, height: null, weight: null,
          hobbies_list: [], habits_list: [], talents_list: [], tics_list: [],
          activities_list: [], mysterious_list: [], character_trait_list: [], fears_list: [],
          books_list: [], music_list: [], movies_list: [], clothing_list: [], food_list: [],
          drink_list: [], alcohol_list: [], loves_list: [], hates_list: [],
          // Ensure all fields from schema are covered with valid defaults
          medical_informations: null,
          biography: null,
          education_name: null, education_place: null, education_state: null,
          education_from_month: null, education_from_year: null, education_to_month: null, education_to_year: null,
          id: undefined, // Optional
          role: null, // Or []
        };
        try {
          this.formData = userProfileSchema.parse(defaultData);
        } catch (parseError) {
          console.error("Fehler beim Parsen der Standard-Formulardaten für User Profile:", parseError, defaultData);
          // If parsing defaultData fails, the schema or defaultData is incorrect.
          // Assigning a potentially invalid object to this.formData should be avoided.
          // As a last resort, create an absolutely minimal valid object if possible,
          // but this indicates a deeper issue with schema/defaults.
          this.formData = {} as UserProfileFormData; // Avoids runtime error but data is not ideal
        }
        this.apiValidationErrors = {};
        this.submitError = null;
        return;
      }

      this.apiValidationErrors = {};
      this.submitError = null;

      const formSchemaKeys = Object.keys(userProfileSchema.shape) as Array<keyof UserProfileFormData>;

      // Pre-process user.avatar to be string | null | undefined before picking.
      // This helps _.pick if it has trouble with the DirectusFile type within DirectusUser.
      // The error indicates _.pick expects a simpler structure for 'avatar' than DirectusUser provides.
      const userForPicking = {
        ...user,
      };
      const pickedSourceData = _.pick(userForPicking, formSchemaKeys);

      const initialData: Partial<UserProfileFormData> = {
        id: user.id, // ID immer vom Quellobjekt übernehmen
        first_name: pickedSourceData.first_name ?? '',
        middle_name: pickedSourceData.middle_name ?? null,
        last_name: pickedSourceData.last_name ?? null,
        title: pickedSourceData.title ?? null,
        // avatar: resolveToStringOrUndefined(pickedSourceData.avatar), // Assuming avatar is a file object or ID string
        rsi_handle: pickedSourceData.rsi_handle ?? null,
        discord_name: pickedSourceData.discord_name ?? null,
        discord_id: pickedSourceData.discord_id ?? null,
        contact_email: pickedSourceData.contact_email ?? null,
        sex: pickedSourceData.sex ?? null,
        primary_department: resolveToStringOrUndefined(pickedSourceData.primary_department),
        secondary_department: resolveToStringOrUndefined(pickedSourceData.secondary_department),
        head_of_department: pickedSourceData.head_of_department ?? null,
        birthplace: resolveToStringOrUndefined(pickedSourceData.birthplace),
        current_residence: resolveToStringOrUndefined(pickedSourceData.current_residence),
        birthdate: pickedSourceData.birthdate ?? null, // Expects "YYYY-MM-DD" or similar string
        birthdate_day: Number(pickedSourceData.birthdate?.split('-')[2]) ?? null,
        birthdate_month: Number(pickedSourceData.birthdate?.split('-')[1]) ?? null,
        birthdate_year: Number(pickedSourceData.birthdate?.split('-')[0]) ?? null,

        citizen_state: (() => {
          if (pickedSourceData.citizen === true) return 'true';
          if (pickedSourceData.citizen === false) return 'false';
          return null; // Preserve null if source is null/undefined, schema allows null
        })(),

        citizen: pickedSourceData.citizen,

        citizen_reason: pickedSourceData.citizen_reason,

        duty_state: pickedSourceData.duty_state ?? null,
        duty_division: pickedSourceData.duty_division ?? null,
        duty_end: pickedSourceData.duty_end ?? null,
        duty_dismissal_reason: pickedSourceData.duty_dismissal_reason ?? null,
        duty_from_month: pickedSourceData.duty_from_month ?? null,
        duty_from_year: pickedSourceData.duty_from_year ?? null,
        duty_to_month: pickedSourceData.duty_to_month ?? null,
        duty_to_year: pickedSourceData.duty_to_year ?? null,

        hair_color: pickedSourceData.hair_color ?? null,
        eye_color: pickedSourceData.eye_color ?? null,
        height: pickedSourceData.height ?? null, // Zod behandelt number | null
        weight: pickedSourceData.weight ?? null, // Zod behandelt number | null

        hobbies_list: pickedSourceData.hobbies_list ?? [],
        habits_list: pickedSourceData.habits_list ?? [],
        talents_list: pickedSourceData.talents_list ?? [],
        tics_list: pickedSourceData.tics_list ?? [],
        activities_list: pickedSourceData.activities_list ?? [],
        mysterious_list: pickedSourceData.mysterious_list ?? [],
        character_trait_list: pickedSourceData.character_trait_list ?? [],
        fears_list: pickedSourceData.fears_list ?? [],
        books_list: pickedSourceData.books_list ?? [],
        music_list: pickedSourceData.music_list ?? [],
        movies_list: pickedSourceData.movies_list ?? [],
        clothing_list: pickedSourceData.clothing_list ?? [],
        food_list: pickedSourceData.food_list ?? [],
        drink_list: pickedSourceData.drink_list ?? [],
        alcohol_list: pickedSourceData.alcohol_list ?? [],
        loves_list: pickedSourceData.loves_list ?? [],
        hates_list: pickedSourceData.hates_list ?? [],

        // habits: pickedSourceData.habits ?? [],
        // talents: pickedSourceData.talents ?? [],
        // tics: pickedSourceData.tics ?? [],
        // activities: pickedSourceData.activities ?? [],
        // mysterious_things: pickedSourceData.mysterious_things ?? [],
        // character_trait: pickedSourceData.character_trait ?? [],
        // fears: pickedSourceData.fears ?? [],
        // books: pickedSourceData.books ?? [],
        // music: pickedSourceData.music ?? [],
        // movies: pickedSourceData.movies ?? [],
        // // colors: pickedSourceData.colors ?? [],
        // clothing: pickedSourceData.clothing ?? [],
        // food: pickedSourceData.food ?? [],
        // drink: pickedSourceData.drink ?? [],
        // alcohol: pickedSourceData.alcohol ?? [],
        // loves: pickedSourceData.loves ?? [],
        // hates: pickedSourceData.hates ?? [],
        medical_informations: pickedSourceData.medical_informations ?? null,
        biography: pickedSourceData.biography ?? null,

        education_state: pickedSourceData.education_state ?? null,
        education_name: pickedSourceData.education_name ?? null,
        education_place: pickedSourceData.education_place ?? null,
        education_from_month: pickedSourceData.education_from_month ?? null,
        education_from_year: pickedSourceData.education_from_year ?? null,
        education_to_month: pickedSourceData.education_to_month ?? null,
        education_to_year: pickedSourceData.education_to_year ?? null,

        // role: pickedSourceData.role ?? [],
        roles: pickedSourceData.roles
        //   ? [pickedSourceData.roles as ('recruitment' | 'marketing_and_press' | 'content_writer' | null | undefined)[]]
        //   : pickedSourceData.roles, // Keeps null or undefined as is, which is valid for .optional().nullable()
      };

      // Filtere undefined Werte heraus, wenn das Schema sie nicht als optional nullable erlaubt
      // oder Zod's `parse` wird fehlschlagen, wenn ein nicht-optionales Feld undefined ist.
      // Da die meisten Felder im Schema als .optional().nullable() definiert sind,
      // ist dieser Schritt weniger kritisch, aber gut für die Robustheit.
      const cleanedInitialData = _.omitBy(initialData, _.isUndefined);

      try {
        this.formData = userProfileSchema.parse(cleanedInitialData);
        // console.log('User Profile Formular initialisiert:', this.formData);
      } catch (e) {
        console.error("Fehler beim Parsen der initialen Formulardaten für User Profile:", e);
        // Fallback auf leeres Objekt oder Standardwerte, um UI-Fehler zu vermeiden
        this.formData = userProfileSchema.parse({});
      }
    },

    // Admin: init form for arbitrary user (not the current auth user)
    initFormForUser (user: DirectusUser) {
      this.apiValidationErrors = {};
      this.submitError = null;

      if (!user) {
        console.warn('ProfileEditStore: initFormForUser called without a user payload.');
        return;
      }

      const formSchemaKeys = Object.keys(userProfileSchema.shape) as Array<keyof UserProfileFormData>;

      const userForPicking = { ...user };
      const pickedSourceData = _.pick(userForPicking, formSchemaKeys);

      const initialData: Partial<UserProfileFormData> = {
        id: user.id,
        first_name: pickedSourceData.first_name ?? '',
        middle_name: pickedSourceData.middle_name ?? null,
        last_name: pickedSourceData.last_name ?? null,
        title: pickedSourceData.title ?? null,
        // avatar: resolveToStringOrUndefined(pickedSourceData.avatar),
        rsi_handle: pickedSourceData.rsi_handle ?? null,
        discord_name: pickedSourceData.discord_name ?? null,
        discord_id: pickedSourceData.discord_id ?? null,
        contact_email: pickedSourceData.contact_email ?? null,
        sex: pickedSourceData.sex ?? null,
        primary_department: resolveToStringOrUndefined(pickedSourceData.primary_department),
        secondary_department: resolveToStringOrUndefined(pickedSourceData.secondary_department),
        head_of_department: pickedSourceData.head_of_department ?? null,
        birthplace: resolveToStringOrUndefined(pickedSourceData.birthplace),
        current_residence: resolveToStringOrUndefined(pickedSourceData.current_residence),
        birthdate: pickedSourceData.birthdate ?? null,
        birthdate_day: Number(pickedSourceData.birthdate?.split('-')[2]) ?? null,
        birthdate_month: Number(pickedSourceData.birthdate?.split('-')[1]) ?? null,
        birthdate_year: Number(pickedSourceData.birthdate?.split('-')[0]) ?? null,
        citizen_state: (() => {
          if (pickedSourceData.citizen === true) return 'true';
          if (pickedSourceData.citizen === false) return 'false';
          return null;
        })(),
        citizen: pickedSourceData.citizen,
        citizen_reason: pickedSourceData.citizen_reason,
        duty_state: pickedSourceData.duty_state ?? null,
        duty_division: pickedSourceData.duty_division ?? null,
        duty_end: pickedSourceData.duty_end ?? null,
        duty_dismissal_reason: pickedSourceData.duty_dismissal_reason ?? null,
        duty_from_month: pickedSourceData.duty_from_month ?? null,
        duty_from_year: pickedSourceData.duty_from_year ?? null,
        duty_to_month: pickedSourceData.duty_to_month ?? null,
        duty_to_year: pickedSourceData.duty_to_year ?? null,
        hair_color: pickedSourceData.hair_color ?? null,
        eye_color: pickedSourceData.eye_color ?? null,
        height: pickedSourceData.height ?? null,
        weight: pickedSourceData.weight ?? null,
        hobbies_list: pickedSourceData.hobbies_list ?? [],
        habits_list: pickedSourceData.habits_list ?? [],
        talents_list: pickedSourceData.talents_list ?? [],
        tics_list: pickedSourceData.tics_list ?? [],
        activities_list: pickedSourceData.activities_list ?? [],
        mysterious_list: pickedSourceData.mysterious_list ?? [],
        character_trait_list: pickedSourceData.character_trait_list ?? [],
        fears_list: pickedSourceData.fears_list ?? [],
        books_list: pickedSourceData.books_list ?? [],
        music_list: pickedSourceData.music_list ?? [],
        movies_list: pickedSourceData.movies_list ?? [],
        clothing_list: pickedSourceData.clothing_list ?? [],
        food_list: pickedSourceData.food_list ?? [],
        drink_list: pickedSourceData.drink_list ?? [],
        alcohol_list: pickedSourceData.alcohol_list ?? [],
        loves_list: pickedSourceData.loves_list ?? [],
        hates_list: pickedSourceData.hates_list ?? [],
        medical_informations: pickedSourceData.medical_informations ?? null,
        biography: pickedSourceData.biography ?? null,
        education_state: pickedSourceData.education_state ?? null,
        education_name: pickedSourceData.education_name ?? null,
        education_place: pickedSourceData.education_place ?? null,
        education_from_month: pickedSourceData.education_from_month ?? null,
        education_from_year: pickedSourceData.education_from_year ?? null,
        education_to_month: pickedSourceData.education_to_month ?? null,
        education_to_year: pickedSourceData.education_to_year ?? null,
        roles: pickedSourceData.roles,
      };

      const cleanedInitialData = _.omitBy(initialData, _.isUndefined);

      try {
        this.formData = userProfileSchema.parse(cleanedInitialData);
      } catch (e) {
        console.error('Fehler beim Parsen der initialen Formulardaten (Admin) für User Profile:', e);
        this.formData = userProfileSchema.parse({});
      }
    },

    async submitUserProfile (validatedDataFromForm: UserProfileFormData, targetUserId?: string): Promise<boolean> {
      this.submitError = null;
      this.apiValidationErrors = {};
      this.isSubmitting = true;
      const authStore = useAuthStore(); // Zugriff auf den Auth-Store für User-ID

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $directus } = useNuxtApp(); // Import Directus client

      try {
        // Clone data to avoid modifying the form data directly if pre-processing is needed
        const payload = { ...validatedDataFromForm };

        // Handle password: remove if empty to avoid sending an empty string
        if (!payload.password) delete payload.password

        // Auto-generate email based on name parts if they changed (only for self edits)
        if (!targetUserId && ((payload.first_name != authStore.currentUser?.first_name) || (payload.last_name != authStore.currentUser?.last_name) || (payload.middle_name != authStore.currentUser?.middle_name))) {
          let email = `${payload.first_name}${payload.middle_name ? '.' + payload.middle_name : ''}${payload.last_name ? '.' + payload.last_name : ''}@ariscorp.de`
            ; (payload as any).email = email.replace(/\s/g, ''); // Assign to the payload that will be sent
        }

        // Transform citizen_state (string from form) to citizen (boolean | null for API)
        if (payload.citizen_state === 'true') {
          (payload as any).citizen = true;
        } else if (payload.citizen_state === 'false') {
          (payload as any).citizen = false;
        } else {
          (payload as any).citizen = null; // DirectusUser.citizen is boolean | null
        }
        delete (payload as any).citizen_state; // Remove the form-specific field

        // Transform roles (array from form) to single string enum or null for API
        // if (Array.isArray(payload.roles) && payload.roles.length > 0) {
        //   (payload as any).roles = payload.roles[0] as 'recruitment' | 'marketing_and_press' | 'content_writer';
        // } else {
        //   (payload as any).roles = null; // DirectusUser.roles is 'recruitment' | ... | null
        // }

        // Birthdate from day, month and year
        if (payload.birthdate_year && payload.birthdate_month && payload.birthdate_day) {
          const year = payload.birthdate_year;
          const month = String(payload.birthdate_month).padStart(2, '0');
          const day = String(payload.birthdate_day).padStart(2, '0');
          payload.birthdate = `${year}-${month}-${day}`;
        } else {
          payload.birthdate = null;
        }


        // Remove read-only Data
        delete payload.id
        delete payload.head_of_department
        delete payload.role
        delete payload.roles

        // Delete utilities
        delete payload.birthdate_day
        delete payload.birthdate_month
        delete payload.birthdate_year

        const userId = targetUserId ?? authStore.currentUser?.id; // Allow override for admin edits

        if (!userId) {
          this.submitError = "Benutzer-ID konnte nicht ermittelt werden. Speichern nicht möglich.";
          console.error("SubmitUserProfile Error: User ID is missing.");
          this.isSubmitting = false;
          return false;
        }

        console.log(`Aktualisiere Benutzerprofil für User-ID ${userId}:`, payload);

        const apiPayload = payload as Partial<DirectusUser>
        delete apiPayload.avatar
        // The payload should now conform to Partial<DirectusUser> for the relevant fields
        // @ts-ignore
        const updatedUserDataFromApi = await useDirectus(updateUser(userId, apiPayload));
        // console.log('Benutzerprofil erfolgreich aktualisiert via API:', updatedUserDataFromApi);

        // Informiere den authStore, seine Daten neu zu laden (auch in der Simulation)
        await authStore.refreshCurrentUser();
        // Das Formular mit den (nun im authStore aktualisierten) Daten neu initialisieren
        // Der Watcher in der Vue-Komponente auf authStore.currentUser sollte dies auch tun,
        // aber ein direkter Aufruf hier ist expliziter.
        if (authStore.currentUser) {
          this.initForm();
        }

        return true;
      } catch (error: any) {
        // Log the raw error for more details
        console.error('Raw error object:', JSON.parse(JSON.stringify(error)));

        // Check for Directus specific error structure
        // Directus errors often come in `error.errors` array
        const directusErrors = error.errors || (error.data && error.data.errors) || (error.response && error.response._data && error.response._data.errors);

        // More robust error message extraction
        let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
        if (error.message) errorMessage = error.message;
        if (directusErrors && directusErrors.length > 0 && directusErrors[0].message) errorMessage = directusErrors[0].message;
        else if (error.data && error.data.message) errorMessage = error.data.message;
        else if (error.response && error.response._data && error.response._data.message) errorMessage = error.response._data.message;

        console.error('Fehler beim Aktualisieren des Benutzerprofils:', error);
        if (error.data && error.data.errors) {
          // Directus gibt Feldfehler oft in error.data.errors zurück
          // Dieses Format muss ggf. an dein Backend angepasst werden
          this.apiValidationErrors = {};
          error.data.errors.forEach((err: { message: string, extensions?: { field?: string, code?: string } }) => {
            const field = err.extensions?.field || 'general';
            if (!this.apiValidationErrors[field]) {
              this.apiValidationErrors[field] = [];
            }
            this.apiValidationErrors[field]?.push(err.message);
          });
          if (!Object.keys(this.apiValidationErrors).length) {
            this.submitError = error.data.message || 'Ein serverseitiger Fehler ist aufgetreten.';
          }
        } else if (error.response && error.response._data && error.response._data.errors) {
          // Manchmal sind Fehler in error.response._data.errors (ältere $fetch Versionen oder Konfigurationen)
          this.apiValidationErrors = error.response._data.errors;
          this.submitError = error.response._data.message || 'Ein Validierungsfehler ist aufgetreten.';
        }
        else {
          this.submitError = errorMessage;
        }
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    clearApiValidationErrors () {
      this.apiValidationErrors = {};
    },

    clearSubmitError () {
      this.submitError = null;
    },
  },
});
