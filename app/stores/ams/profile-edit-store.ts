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
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().optional().nullable(),
  middle_name: z.string().optional().nullable(),
  // Email wird oft separat oder gar nicht im Standard-Profil-Edit geändert
  email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  title: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(), // ID der DirectusFile, oder URL
  password: z.string().optional().nullable(),

  rsi_handle: z.string().optional().nullable(),
  discord_name: z.string().optional().nullable(),
  contact_email: z.string().email("Ungültige Kontakt-E-Mail").optional().nullable(),
  discord_id: z.string().optional().nullable(),

  sex: z.enum(['male', 'female']).optional().nullable(),
  department: z.string().optional().nullable(), // ID des Departments
  // leading_department: z.string().optional().nullable(), // ID des Departments
  // head_of_department: z.boolean().optional().nullable(),

  birthplace: z.string().optional().nullable(), // ID der LandingZone oder Name
  current_residence: z.string().optional().nullable(), // ID der LandingZone oder Name
  birthdate: z.string().optional().nullable(), // Ggf. als z.date() und dann transformieren. Format "YYYY-MM-DD" or similar.

  citizen: z.enum(['true', 'false']).optional().nullable(), // Storing as string from radio
  citizen_reason: z.enum(['military', 'special_education', 'social_commitment']).optional().nullable(),

  duty_state: z.boolean().optional().nullable(),
  duty_division: z.string().optional().nullable(),
  duty_end: z.enum(['honorable', 'dishonorable']).optional().nullable(),
  duty_dismissal_reason: z.string().optional().nullable(),
  duty_from_month: z.number().optional().nullable(),
  duty_from_year: z.number().optional().nullable(),
  duty_to_month: z.number().optional().nullable(),
  duty_to_year: z.number().optional().nullable(),

  roles: z.array(z.enum(['recruitment', 'marketing_and_press', 'content_writer'])).optional().nullable(), // Directus stores roles as a many-to-many relationship, not a simple string array
  // role: z.array(z.string()).optional().nullable(), // Array of role IDs/keys

  hair_color: z.string().optional().nullable(),
  eye_color: z.string().optional().nullable(),
  height: z.number().positive('Größe muss positiv sein').optional().nullable(),
  weight: z.number().positive('Gewicht muss positiv sein').optional().nullable(),

  hobbies: z.array(z.string()).optional().nullable(),
  hobbies_list: z.array(z.string()).optional().nullable(),
  habits_list: z.array(z.string()).optional().nullable(),
  talents_list: z.array(z.string()).optional().nullable(),
  tics_list: z.array(z.string()).optional().nullable(),
  activities_list: z.array(z.string()).optional().nullable(),
  mysterious_list: z.array(z.string()).optional().nullable(),
  character_trait_list: z.array(z.string()).optional().nullable(),
  fears_list: z.array(z.string()).optional().nullable(),
  books_list: z.array(z.string()).optional().nullable(),
  music_list: z.array(z.string()).optional().nullable(),
  movies_list: z.array(z.string()).optional().nullable(),
  clothing_list: z.array(z.string()).optional().nullable(),
  food_list: z.array(z.string()).optional().nullable(),
  drink_list: z.array(z.string()).optional().nullable(),
  alcohol_list: z.array(z.string()).optional().nullable(),
  loves_list: z.array(z.string()).optional().nullable(),
  hates_list: z.array(z.string()).optional().nullable(),

  habits: z.array(z.string()).optional().nullable(),
  talents: z.array(z.string()).optional().nullable(),
  tics: z.array(z.string()).optional().nullable(),
  activities: z.array(z.string()).optional().nullable(),
  mysterious_things: z.array(z.string()).optional().nullable(),
  character_trait: z.array(z.string()).optional().nullable(),
  fears: z.array(z.string()).optional().nullable(),
  books: z.array(z.string()).optional().nullable(),
  music: z.array(z.string()).optional().nullable(),
  movies: z.array(z.string()).optional().nullable(),
  // colors: z.array(z.string()).optional().nullable(), // Assuming these follow the same pattern
  clothing: z.array(z.string()).optional().nullable(),
  food: z.array(z.string()).optional().nullable(),
  drink: z.array(z.string()).optional().nullable(),
  alcohol: z.array(z.string()).optional().nullable(),
  loves: z.array(z.string()).optional().nullable(),
  hates: z.array(z.string()).optional().nullable(),
  medical_informations: z.string().optional().nullable(),
  biography: z.string().optional().nullable(), // Oft ein Rich-Text-Feld

  education_name: z.string().optional().nullable(),
  education_place: z.string().optional().nullable(),
  education_state: z.boolean().optional().nullable(),
  education_from_month: z.number().optional().nullable(),
  education_from_year: z.number().optional().nullable(),
  education_to_month: z.number().optional().nullable(),
  education_to_year: z.number().optional().nullable(),

  // Felder, die typischerweise nicht direkt vom Benutzer geändert werden:
  id: z.string().optional(), // ID ist für Updates wichtig, aber nicht editierbar
  // status: z.string().optional(),
  role: z.array(z.string()).optional().nullable(), // Array of role IDs/keys
  // email_notifications: z.boolean().optional(),
});

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
            errorMessages.forEach(message => {
              messages.push({ name: path, message }); // Nuxt UI erwartet 'name' statt 'path'
            });
          } else if (typeof errorMessages === 'string') {
            messages.push({ name: path, message: errorMessages });
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
        // Initialize with empty/default data to prevent errors with `formData` being undefined
        // and to ensure the form object has a defined structure.
        try {
          this.formData = userProfileSchema.parse({});
        } catch (e) {
          console.error("Fehler beim Parsen leerer Formulardaten für User Profile (Fallback):", e);
          // As an absolute fallback if even empty parse fails (should not with optional fields)
          const emptyData: UserProfileFormData = {} as any;
          for (const key in userProfileSchema.shape) {
            if (Object.prototype.hasOwnProperty.call(userProfileSchema.shape, key)) {
              // @ts-ignore
              if (userProfileSchema.shape[key]._def.typeName === 'ZodArray') {
                (emptyData as any)[key] = [];
              } else {
                (emptyData as any)[key] = null;
              }
            }
          }
          this.formData = emptyData;
        }
        this.apiValidationErrors = {};
        this.submitError = null;
        return;
      }

      this.apiValidationErrors = {};
      this.submitError = null;

      const formSchemaKeys = Object.keys(userProfileSchema.shape) as Array<keyof UserProfileFormData>;
      const pickedSourceData = _.pick(user, formSchemaKeys);

      const initialData: Partial<UserProfileFormData> = {
        id: user.id, // ID immer vom Quellobjekt übernehmen
        first_name: pickedSourceData.first_name ?? '',
        middle_name: pickedSourceData.middle_name ?? null,
        last_name: pickedSourceData.last_name ?? null,
        title: pickedSourceData.title ?? null,
        avatar: resolveToStringOrUndefined(pickedSourceData.avatar), // Assuming avatar is a file object or ID string
        rsi_handle: pickedSourceData.rsi_handle ?? null,
        discord_name: pickedSourceData.discord_name ?? null,
        discord_id: pickedSourceData.discord_id ?? null,
        contact_email: pickedSourceData.contact_email ?? null,
        sex: pickedSourceData.sex ?? null,
        department: resolveToStringOrUndefined(pickedSourceData.department),
        birthplace: resolveToStringOrUndefined(pickedSourceData.birthplace),
        current_residence: resolveToStringOrUndefined(pickedSourceData.current_residence),
        birthdate: pickedSourceData.birthdate ?? null, // Expects "YYYY-MM-DD" or similar string

        citizen: pickedSourceData.citizen ? 'true' : 'false', // Expects 'true' or 'false'
        // Map API values to UI/Zod values for citizen_reason
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
        roles: pickedSourceData.roles ?? [],
      };

      // Filtere undefined Werte heraus, wenn das Schema sie nicht als optional nullable erlaubt
      // oder Zod's `parse` wird fehlschlagen, wenn ein nicht-optionales Feld undefined ist.
      // Da die meisten Felder im Schema als .optional().nullable() definiert sind,
      // ist dieser Schritt weniger kritisch, aber gut für die Robustheit.
      const cleanedInitialData = _.omitBy(initialData, _.isUndefined);

      try {
        this.formData = userProfileSchema.parse(cleanedInitialData);
        console.log('User Profile Formular initialisiert:', this.formData);
      } catch (e) {
        console.error("Fehler beim Parsen der initialen Formulardaten für User Profile:", e);
        // Fallback auf leeres Objekt oder Standardwerte, um UI-Fehler zu vermeiden
        this.formData = userProfileSchema.parse({});
      }
    },

    async submitUserProfile (validatedDataFromForm: UserProfileFormData): Promise<boolean> {
      this.submitError = null;
      this.apiValidationErrors = {};
      this.isSubmitting = true;
      const authStore = useAuthStore(); // Zugriff auf den Auth-Store für User-ID

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $directus } = useNuxtApp(); // Import Directus client

      try {
        // Clone data to avoid modifying the form data directly if pre-processing is needed
        const payload = { ...validatedDataFromForm };

        // Example: Transform 'true'/'false' string for citizen to boolean if Directus expects boolean
        // This might be needed depending on your Directus field configuration for 'citizen'
        // if (typeof payload.citizen === 'string') {
        //   (payload as any).citizen = payload.citizen === 'true';
        // } else if (payload.citizen === null || payload.citizen === undefined) {
        //   (payload as any).citizen = null; // Ensure null is sent if that's what API expects for empty
        // }

        // TODO: Handle file uploads separately if payload.avatar is a File object.
        // For now, assuming avatar is already an ID or URL string.

        if (!payload.password) delete payload.password

        if ((payload.first_name != authStore.currentUser?.first_name) || (payload.last_name != authStore.currentUser?.last_name) || (payload.middle_name != authStore.currentUser?.middle_name)) {
          let email = `${payload.first_name}${payload.middle_name ? '.' + payload.middle_name : ''}${payload.last_name ? '.' + payload.last_name : ''}@ariscorp.de`
          payload.email = email
        }

        const userId = authStore.currentUser?.id; // Oder this.formData.id, falls es zuverlässig gesetzt ist

        if (!userId) {
          this.submitError = "Benutzer-ID konnte nicht ermittelt werden. Speichern nicht möglich.";
          console.error("SubmitUserProfile Error: User ID is missing.");
          this.isSubmitting = false;
          return false;
        }

        console.log(`Aktualisiere Benutzerprofil für User-ID ${userId}:`, payload);

        // const updatedUserDataFromApi = await $directus.users.updateOne(userId, payload as Partial<DirectusUser>);
        // console.log('Benutzerprofil erfolgreich aktualisiert via API:', updatedUserDataFromApi);

        // // Informiere den authStore, seine Daten neu zu laden (auch in der Simulation)
        // await authStore.refreshCurrentUser();
        // // Das Formular mit den (nun im authStore aktualisierten) Daten neu initialisieren
        // // Der Watcher in der Vue-Komponente auf authStore.currentUser sollte dies auch tun,
        // // aber ein direkter Aufruf hier ist expliziter.
        // if (authStore.currentUser) {
        //   this.initForm();
        // }

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
