import { defineStore } from 'pinia';
import _ from 'lodash'; // Importiere Lodash
// import { useAuthStore } from './auth-store'; // Annahme: Dein Auth-Store
import { z } from 'zod';
import type { FormError } from '@nuxt/ui'; // Für Nuxt UI <UForm> :validate Prop
import type { UserHangar } from '~~/types';
import resolveToStringOrUndefined from '~~/layers/ams/app/utils/resolve-string-or-undefined';

export const hangarItemSchema = z.object({
  name: z.string().max(50, 'Der Schiffsname darf maximal 50 Zeichen lang sein.').trim().optional(),
  name_public: z.boolean(),
  serial: z.string().trim().optional(),
  group: z.enum(['ariscorp', 'private']),
  visibility: z.enum(['public', 'internal', 'hidden']),
  department: z.string().nullable().optional(),
  buy_status: z.enum(['pledged', 'in_game', 'planned']),
  active_module: z.string().nullable().optional(),
  // NOT EDITABLE:
  id: z.string().optional(),
  date_created: z.string().optional(),
  user_id: z.string().optional(),
  ship_id: z.string().optional(),
});

// Typ-Inferenz aus dem Zod-Schema für Typsicherheit
export type HangarItemFormData = z.infer<typeof hangarItemSchema>;

export const useHangarItemEditStore = defineStore('hangarItemEdit', {
  state: () => ({
    /**
     * Die aktuell im Formular bearbeiteten Daten.
     * Wird durch `initForm` initialisiert und ist immer ein POJO.
     */
    formData: {} as HangarItemFormData,
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
    currentFormData (state): HangarItemFormData {
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
    initForm (item: UserHangar) {
      this.apiValidationErrors = {}; // Alte API-Fehler zurücksetzen
      this.submitError = null;       // Alten generellen Fehler zurücksetzen

      // 1. Definiere die Schlüssel, die für das Formular relevant sind (basierend auf dem Zod-Schema).
      //    Dies stellt sicher, dass wir nur Felder aus `item` betrachten, die auch im Formularschema existieren.
      const formSchemaKeys = Object.keys(hangarItemSchema.shape) as Array<keyof HangarItemFormData>;

      // 2. Extrahiere nur diese relevanten Schlüssel aus dem (potenziell großen) 'item'-Objekt.
      //    `pickedSourceData` enthält nun nur die Felder aus `item`, die auch im Schema vorkommen,
      //    oder `undefined`, falls ein Schlüssel aus `formSchemaKeys` nicht in `item` existiert.
      const pickedSourceData = _.pick(item, formSchemaKeys);

      // 3. Wende die notwendigen Transformationen und Standardwerte auf die extrahierten Daten an.
      const initialData: Partial<HangarItemFormData> = {
        // id: UserHangar.id ist number, schema.id ist string().optional()
        id: pickedSourceData.id !== undefined ? String(pickedSourceData.id) : undefined,
        // name: UserHangar.name ist string | null, schema.name ist string().optional()
        name: pickedSourceData.name ?? undefined,
        // name_public: UserHangar.name_public ist boolean | null, schema.name_public ist z.boolean()
        name_public: pickedSourceData.name_public ?? true,
        // serial: UserHangar.serial ist string | null, schema.serial ist string().optional()
        serial: pickedSourceData.serial ?? undefined,
        // group: UserHangar.group ist enum | null, schema.group ist z.enum(['ariscorp', 'private']) (erforderlich)
        group: (pickedSourceData.group === 'ariscorp' || pickedSourceData.group === 'private')
          ? pickedSourceData.group
          : 'ariscorp',
        // visibility: UserHangar.visibility ist enum | null, schema.visibility ist z.enum(...) (erforderlich)
        visibility: (pickedSourceData.visibility === 'public' || pickedSourceData.visibility === 'internal' || pickedSourceData.visibility === 'hidden')
          ? pickedSourceData.visibility
          : 'public',
        // department: UserHangar.department ist Department | string | null, schema.department ist string().optional()
        department: resolveToStringOrUndefined(pickedSourceData.department?.id),
        // buy_status: UserHangar.buy_status ist string | null, schema.buy_status ist z.enum() (erforderlich)
        buy_status: pickedSourceData.buy_status ?? 'pledged',
        // active_module: UserHangar.active_module ist ShipModule | string | null, schema.active_module ist string().optional()
        active_module: resolveToStringOrUndefined(pickedSourceData.active_module),
        // date_created: UserHangar.date_created ist string | null, schema.date_created ist string().optional()
        date_created: pickedSourceData.date_created ?? undefined,
        // user_id: UserHangar.user_id ist DirectusUser | string | null, schema.user_id ist string().optional()
        user_id: resolveToStringOrUndefined(pickedSourceData.user_id),
        // ship_id: UserHangar.ship_id ist Ship | string | null, schema.ship_id ist string().optional()
        ship_id: resolveToStringOrUndefined(pickedSourceData.ship_id),
      };

      // Weise die aufbereiteten Daten dem Formularstatus deiner Komponente zu
      this.formData = hangarItemSchema.parse(initialData);
    },

    /**
     * Sendet die validierten Formulardaten an das Backend.
     * @param validatedDataFromForm Die von <UForm> bereits validierten Daten.
     */
    async submitHangarItem (): Promise<boolean> {
      const validatedDataFromForm = this.formData
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
        const itemId = payload.id || this.formData.id

        if (!itemId) {
          this.submitError = "Hangar-Item-ID konnte nicht ermittelt werden. Speichern nicht möglich.";
          this.isSubmitting = false;
          console.error("SubmitHangarItem Error: Item ID is missing.", { payloadId: payload.id, formDataId: this.formData.id });
          return false;
        }

        const updatedItem = await useDirectus(updateItem('user_hangars', itemId, payload))

        // TODO Update Logic

        // Simulierter API-Endpunkt; ersetze dies durch deinen tatsächlichen $fetch Aufruf
        // const apiUrl = `/api/user/profile/${userId}`;
        // console.log(`Sende Daten an ${apiUrl}:`, payload);

        // const updatedUser = await $fetch<ProfileFormData>(apiUrl, {
        //   method: 'PUT',
        //   body: payload,
        // });

        // authStore.setUser(updatedUser); // Aktualisiere den User im globalen Auth-Store
        // TODO MIT ITEM VON API: this.initForm(); // Setze das Bearbeitungsformular mit den neuen, frischen Daten zurück

        return true; // Signalisiert Erfolg
      } catch (error: any) {
        console.error('Fehler beim Aktualisieren des Items via API:', error);
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