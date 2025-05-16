// stores/profileEditStore.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth-store'; // Annahme: Dein Auth-Store
import { z } from 'zod';
import type { FormError } from '@nuxt/ui'; // Für Nuxt UI <UForm> :validate Prop

/**
 * Definiert das Zod-Schema für die Profildaten.
 * Wichtig: Für eine problemlose Initialisierung (auch bei leerem Formular)
 * sollten erforderliche Felder, die einen Startwert haben sollen (z.B. leerer String),
 * einen .default() Wert erhalten.
 */
export const profileSchema = z.object({
  id: z.string().optional(), // ID ist oft nicht direkt im Formular editierbar, aber Teil des Datenmodells
  firstName: z.string({ required_error: 'Vorname ist ein Pflichtfeld.' })
    .min(2, 'Vorname muss mindestens 2 Zeichen lang sein.')
    .default(''), // Standardwert für problemlose Initialisierung
  lastName: z.string({ required_error: 'Nachname ist ein Pflichtfeld.' })
    .min(2, 'Nachname muss mindestens 2 Zeichen lang sein.')
    .default(''), // Standardwert
  email: z.string({ required_error: 'E-Mail ist ein Pflichtfeld.' })
    .email('Ungültige E-Mail-Adresse.')
    .default(''), // Standardwert
  address: z.object({
    street: z.string().optional().default(''),
    city: z.string().optional().default(''),
    zip: z.string().optional().default('').refine(
      val => val === '' || /^\d{5}$/.test(val), // Erlaubt leeren String oder 5 Ziffern
      'PLZ muss 5 Ziffern haben oder leer sein.'
    ),
  }).optional().default({ street: '', city: '', zip: '' }), // Standardwert für das gesamte Adressobjekt
  // Füge hier weitere Felder deines Profils hinzu, z.B.:
  // bio: z.string().optional().default(''),
  // username: z.string().optional().min(3, 'Benutzername zu kurz').default(''),
});

// Typ-Inferenz aus dem Zod-Schema für Typsicherheit
export type ProfileFormData = z.infer<typeof profileSchema>;

export const useProfileEditStore = defineStore('profileEdit', {
  state: () => ({
    /**
     * Die aktuell im Formular bearbeiteten Daten.
     * Wird durch `initForm` initialisiert und ist immer ein POJO.
     */
    formData: {} as ProfileFormData,
    /**
     * Speichert Validierungsfehler, die vom Backend nach einem Submit zurückkommen.
     * Format: { feldName: ["Fehlermeldung1", "Fehlermeldung2"], ... }
     */
    apiValidationErrors: {} as Record<string, string[] | undefined>,
    /**
     * Zeigt an, ob das Formular gerade an das Backend gesendet wird.
     */
    isSubmitting: false,
    /**
     * Speichert eine generelle Fehlermeldung, die beim Absenden aufgetreten ist
     * (z.B. Netzwerkfehler, Serverfehler ohne spezifische Feldfehler).
     */
    submitError: null as string | null,
  }),

  getters: {
    /**
     * Gibt die aktuellen Formulardaten zurück.
     * Wird von <UForm :state="..."> verwendet.
     */
    currentFormData (state): ProfileFormData {
      return state.formData;
    },
    /**
     * Gibt zurück, ob das Formular gerade gesendet wird.
     * Für Ladeindikatoren in Buttons etc.
     */
    isLoading (state): boolean {
      return state.isSubmitting;
    },
    /**
     * Gibt die generelle Submit-Fehlermeldung zurück.
     */
    getSubmitError (state): string | null {
      return state.submitError;
    },
    /**
     * Transformiert Backend-Feldfehler in das von Nuxt UI <UForm :validate="...">
     * erwartete Format: Array von { path: string, message: string }.
     */
    getApiFieldErrorMessages (state): FormError[] {
      const messages: FormError[] = [];
      if (state.apiValidationErrors) {
        for (const path in state.apiValidationErrors) {
          const errorMessages = state.apiValidationErrors[path];
          if (Array.isArray(errorMessages)) {
            errorMessages.forEach(message => {
              messages.push({ name: path, message });
            });
          } else if (typeof errorMessages === 'string') { // Falls Backend nur einen String sendet
            messages.push({ name: path, message: errorMessages });
          }
        }
      }
      return messages;
    }
  },

  actions: {
    /**
     * Initialisiert das Formular.
     * Füllt `formData` entweder mit Daten aus dem `authStore.user`
     * oder mit den Standardwerten aus dem `profileSchema`.
     * Stellt sicher, dass `formData` immer ein valides POJO gemäß Schema ist.
     */
    initForm () {
      const authStore = useAuthStore();
      this.apiValidationErrors = {}; // Alte API-Fehler zurücksetzen
      this.submitError = null;       // Alten generellen Fehler zurücksetzen

      let initialDataForParsing: Partial<ProfileFormData> = {};

      if (authStore.user) {
        // Kopiere nur die im Schema definierten Felder aus dem authStore.user.
        // Das verhindert, dass unerwartete oder nicht serialisierbare Daten
        // in den Parse-Vorgang gelangen.
        for (const key of Object.keys(profileSchema.shape) as Array<keyof ProfileFormData>) {
          if (authStore.user && (authStore.user as Record<string, any>)[key] !== undefined) {
            (initialDataForParsing as Record<string, any>)[key] = (authStore.user as Record<string, any>)[key];
          }
        }
        // Stelle sicher, dass die User-ID (falls vorhanden und benötigt) übernommen wird,
        // auch wenn sie nicht explizit Teil des editierbaren `profileSchema` ist.
        if (authStore.user.id) {
          initialDataForParsing.id = authStore.user.id;
        }
      }
      // Wenn `initialDataForParsing` hier leer ist (z.B. kein eingeloggter User),
      // wird `profileSchema.parse({})` die im Schema definierten Standardwerte verwenden.

      try {
        // `profileSchema.parse` validiert die Eingabedaten und wendet alle Defaults an.
        // Das Ergebnis ist garantiert ein POJO, das dem Schema entspricht.
        this.formData = profileSchema.parse(initialDataForParsing);
      } catch (error) {
        console.error("Zod-Fehler in initForm bei profileSchema.parse:", error);
        // Notfall-Fallback: Erzeuge ein minimales, aber valides POJO.
        // Dies sollte idealerweise nicht passieren, wenn das Schema robuste Defaults hat.
        this.formData = {
          id: initialDataForParsing.id || undefined,
          firstName: '',
          lastName: '',
          email: '',
          address: { street: '', city: '', zip: '' },
          // Füge hier ggf. weitere Felder mit Basis-Defaults hinzu
        } as ProfileFormData; // Type-Assertion, da manuell und minimal gebaut
      }

      // Zusätzliche Sicherheitsüberprüfung für die ID, falls sie nicht über
      // `profileSchema.parse` abgedeckt wurde (z.B. wenn 'id' im `profileSchema`
      // optional ist, aber vom `authStore.user` immer kommt und für API-Aufrufe benötigt wird).
      if (authStore.user?.id && this.formData.id !== authStore.user.id) {
        this.formData.id = authStore.user.id;
      }
    },

    /**
     * Sendet die validierten Formulardaten an das Backend.
     * @param validatedDataFromForm Die von <UForm> bereits validierten Daten.
     */
    async submitProfile (validatedDataFromForm: ProfileFormData): Promise<boolean> {
      const authStore = useAuthStore();
      this.submitError = null;
      this.apiValidationErrors = {}; // Alte API-Feldfehler vor neuem Versuch löschen
      this.isSubmitting = true;

      try {
        // Die Daten (`validatedDataFromForm`) wurden bereits von <UForm> mittels `profileSchema` validiert.
        // Wir können `profileSchema.parse(validatedDataFromForm)` hier erneut aufrufen,
        // um sicherzustellen, dass alle Transformationen des Schemas (z.B. toLowerCase, trim) angewendet wurden,
        // falls <UForm> dies nicht bereits vollständig tut (normalerweise schon).
        // Für dieses Beispiel vertrauen wir den Daten von <UForm>.
        const payload = validatedDataFromForm;

        // Ermittle die User-ID für den API-Endpunkt. Diese kann aus den Formulardaten
        // (falls 'id' Teil des `profileSchema` ist und mitgesendet wird) oder direkt
        // aus dem `authStore` oder dem initialisierten `formData` stammen.
        const userId = payload.id || this.formData.id || authStore.user?.id;

        if (!userId) {
          this.submitError = "Benutzer-ID konnte nicht ermittelt werden. Speichern nicht möglich.";
          this.isSubmitting = false;
          console.error("SubmitProfile Error: User ID is missing.", { payloadId: payload.id, formDataId: this.formData.id, authStoreUserId: authStore.user?.id });
          return false;
        }

        // Simulierter API-Endpunkt; ersetze dies durch deinen tatsächlichen $fetch Aufruf
        const apiUrl = `/api/user/profile/${userId}`;
        console.log(`Sende Daten an ${apiUrl}:`, payload);

        const updatedUser = await $fetch<ProfileFormData>(apiUrl, {
          method: 'PUT',
          body: payload,
        });

        authStore.setUser(updatedUser); // Aktualisiere den User im globalen Auth-Store
        this.initForm(); // Setze das Bearbeitungsformular mit den neuen, frischen Daten zurück

        return true; // Signalisiert Erfolg
      } catch (error: any) {
        console.error('Fehler beim Aktualisieren des Profils via API:', error);
        if (error.data) { // Fehlerdetails sind oft in error.data bei $fetch Fehlern
          this.submitError = error.data.message || 'Ein serverseitiger Fehler ist aufgetreten.';
          // Wenn das Backend spezifische Feldfehler zurückgibt (z.B. Validierungsfehler der API)
          // Beispielformat: error.data.errors = { "fieldName": ["Fehlermeldung"], ... }
          if (error.data.errors && typeof error.data.errors === 'object') {
            this.apiValidationErrors = error.data.errors;
          }
        } else {
          this.submitError = 'Ein Netzwerkfehler oder ein unbekannter Fehler ist aufgetreten.';
        }
        return false; // Signalisiert Fehler
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Löscht serverseitige Validierungsfehler.
     */
    clearApiValidationErrors () {
      this.apiValidationErrors = {};
    },

    /**
     * Löscht die generelle Submit-Fehlermeldung.
     */
    clearSubmitError () {
      this.submitError = null;
    },
  },
});