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
  first_name: z.string().min(1, 'Vorname ist erforderlich').optional().nullable(),
  last_name: z.string().min(1, 'Nachname ist erforderlich').optional().nullable(),
  // Email wird oft separat oder gar nicht im Standard-Profil-Edit geändert
  // email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  location: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(), // Könnte ein Rich-Text-Editor sein
  // tags: z.array(z.string()).optional().nullable(), // Beispiel für ein Array-Feld
  // avatar: z.string().optional().nullable(), // ID der DirectusFile, oder komplexeres Objekt für Upload
  language: z.string().optional().nullable(),

  rsi_handle: z.string().optional().nullable(),
  discord_name: z.string().optional().nullable(),
  contact_email: z.string().email("Ungültige Kontakt-E-Mail").optional().nullable(),

  sex: z.enum(['male', 'female']).optional().nullable(),
  // department: z.string().optional().nullable(), // ID des Departments
  // leading_department: z.string().optional().nullable(), // ID des Departments
  // head_of_department: z.boolean().optional().nullable(),

  // birthplace: z.string().optional().nullable(), // ID der LandingZone
  // current_residence: z.string().optional().nullable(), // ID der LandingZone

  // citizen: z.boolean().optional().nullable(),
  // citizen_reason: z.enum(['military', 'special_education', 'social_commitment']).optional().nullable(),
  // duty_state: z.boolean().optional().nullable(),
  // duty_period: z.string().optional().nullable(),
  // duty_division: z.string().optional().nullable(),
  // duty_end: z.enum(['honorable', 'dishonorable']).optional().nullable(),

  hair_color: z.string().optional().nullable(),
  eye_color: z.string().optional().nullable(),
  height: z.number().positive('Größe muss positiv sein').optional().nullable(),
  weight: z.number().positive('Gewicht muss positiv sein').optional().nullable(),

  hobbies: z.string().optional().nullable(),
  habits: z.string().optional().nullable(),
  talents: z.string().optional().nullable(),
  tics: z.string().optional().nullable(),
  activities: z.string().optional().nullable(),
  mysterious_things: z.string().optional().nullable(),
  character_trait: z.string().optional().nullable(),
  fears: z.string().optional().nullable(),
  books: z.string().optional().nullable(),
  music: z.string().optional().nullable(),
  movies: z.string().optional().nullable(),
  colors: z.string().optional().nullable(),
  clothing: z.string().optional().nullable(),
  food: z.string().optional().nullable(),
  drink: z.string().optional().nullable(),
  alcohol: z.string().optional().nullable(),
  loves: z.string().optional().nullable(),
  hates: z.string().optional().nullable(),
  medical_informations: z.string().optional().nullable(),
  biography: z.string().optional().nullable(), // Oft ein Rich-Text-Feld

  // education_name: z.string().optional().nullable(),
  // education_period: z.string().optional().nullable(),
  discord_id: z.string().optional().nullable(),
  // education_state: z.boolean().optional().nullable(),
  birthdate: z.string().optional().nullable(), // Ggf. als z.date() und dann transformieren

  // Felder, die typischerweise nicht direkt vom Benutzer geändert werden:
  id: z.string().optional(), // ID ist für Updates wichtig, aber nicht editierbar
  // status: z.string().optional(),
  // role: z.string().optional(),
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
    initForm (user: DirectusUser) {
      this.apiValidationErrors = {};
      this.submitError = null;

      const formSchemaKeys = Object.keys(userProfileSchema.shape) as Array<keyof UserProfileFormData>;
      const pickedSourceData = _.pick(user, formSchemaKeys);

      const initialData: Partial<UserProfileFormData> = {
        id: user.id, // ID immer vom Quellobjekt übernehmen
        first_name: pickedSourceData.first_name ?? null,
        last_name: pickedSourceData.last_name ?? null,
        location: pickedSourceData.location ?? null,
        title: pickedSourceData.title ?? null,
        description: pickedSourceData.description ?? null,
        // tags: pickedSourceData.tags ?? null,
        // avatar: resolveToStringOrUndefined(pickedSourceData.avatar), // Hängt davon ab, wie Avatare gehandhabt werden
        language: pickedSourceData.language ?? null,
        rsi_handle: pickedSourceData.rsi_handle ?? null,
        discord_name: pickedSourceData.discord_name ?? null,
        contact_email: pickedSourceData.contact_email ?? null,
        sex: pickedSourceData.sex ?? null,
        // department: resolveToStringOrUndefined(pickedSourceData.department),
        hair_color: pickedSourceData.hair_color ?? null,
        eye_color: pickedSourceData.eye_color ?? null,
        height: pickedSourceData.height ?? null, // Zod behandelt number | null
        weight: pickedSourceData.weight ?? null, // Zod behandelt number | null
        hobbies: pickedSourceData.hobbies ?? null,
        habits: pickedSourceData.habits ?? null,
        talents: pickedSourceData.talents ?? null,
        tics: pickedSourceData.tics ?? null,
        activities: pickedSourceData.activities ?? null,
        mysterious_things: pickedSourceData.mysterious_things ?? null,
        character_trait: pickedSourceData.character_trait ?? null,
        fears: pickedSourceData.fears ?? null,
        books: pickedSourceData.books ?? null,
        music: pickedSourceData.music ?? null,
        movies: pickedSourceData.movies ?? null,
        colors: pickedSourceData.colors ?? null,
        clothing: pickedSourceData.clothing ?? null,
        food: pickedSourceData.food ?? null,
        drink: pickedSourceData.drink ?? null,
        alcohol: pickedSourceData.alcohol ?? null,
        loves: pickedSourceData.loves ?? null,
        hates: pickedSourceData.hates ?? null,
        medical_informations: pickedSourceData.medical_informations ?? null,
        biography: pickedSourceData.biography ?? null,
        discord_id: pickedSourceData.discord_id ?? null,
        birthdate: pickedSourceData.birthdate ?? null, // Ggf. Format anpassen, falls als Date-Objekt benötigt
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

      try {
        const payload = validatedDataFromForm;
        const userId = authStore.currentUser?.id; // Oder this.formData.id, falls es zuverlässig gesetzt ist

        if (!userId) {
          this.submitError = "Benutzer-ID konnte nicht ermittelt werden. Speichern nicht möglich.";
          console.error("SubmitUserProfile Error: User ID is missing.");
          return false;
        }

        console.log(`Aktualisiere Benutzerprofil für User-ID ${userId}:`, payload);

        // --- ECHTER API AUFRUF ---
        // const { $directus } = useNuxtApp();
        // const updatedUserData = await $directus.users.updateOne(userId, payload as Partial<DirectusUser>);
        // console.log('Benutzerprofil erfolgreich aktualisiert via API:', updatedUserDataFromApi);
        // // Informiere den authStore, seine Daten neu zu laden
        // await authStore.refreshCurrentUser();
        // // Das Formular mit den (nun im authStore aktualisierten) Daten neu initialisieren
        // if (authStore.currentUser) {
        //  this.initForm(authStore.currentUser);
        // }
        // --- ENDE ECHTER API AUFRUF ---

        // Simulierter Erfolg für Testzwecke
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Benutzerprofil erfolgreich aktualisiert (simuliert)');
        // Informiere den authStore, seine Daten neu zu laden (auch in der Simulation)
        await authStore.refreshCurrentUser();
        // Das Formular mit den (nun im authStore aktualisierten) Daten neu initialisieren
        // Der Watcher in der Vue-Komponente auf authStore.currentUser sollte dies auch tun,
        // aber ein direkter Aufruf hier ist expliziter.
        if (authStore.currentUser) {
          this.initForm(authStore.currentUser);
        }

        return true;
      } catch (error: any) {
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
          this.submitError = error.message || 'Ein Netzwerkfehler oder ein unbekannter Fehler ist aufgetreten.';
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
