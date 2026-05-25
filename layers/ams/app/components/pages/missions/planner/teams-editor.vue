<script setup lang="ts">
import type {
  MissionPlannerPositionDraft,
  MissionPlannerPositionType,
  MissionPlannerShipDraft,
  MissionPlannerTeamDraft,
} from "~~/types";

defineProps<{
  teams: MissionPlannerTeamDraft[];
  currentUserId: string | null | undefined;
  totalDraftPrimarySummary: string;
  totalDraftSecondarySummary: string;
  totalDraftPositionsHint?: string;
  showRoleSummary?: boolean;
  teamDepartmentFieldLabel: string;
  teamDepartmentFieldHint?: string;
  teamDepartmentFieldPlaceholder: string;
  departmentSelectItems: any[];
  departmentsPending: boolean;
  fleetOptions: any[];
  fleetPending: boolean;
  positionTypeOrder: MissionPlannerPositionType[];
  positionTypeLabels: Record<MissionPlannerPositionType, string>;
  positionTypeBadgeLabels: Record<MissionPlannerPositionType, string>;
  addTeam: () => void;
  removeTeam: (index: number) => void;
  addShip: (team: MissionPlannerTeamDraft) => void;
  removeShip: (team: MissionPlannerTeamDraft, index: number) => void;
  onShipHangarChange: (ship: MissionPlannerShipDraft) => void;
  isShipOverCrewLimit: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => boolean;
  getShipPositionSummary: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => string;
  getShipCrewLimitHint: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => string;
  getShipRoleSummary: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => string | null;
  getShipPositionsByType: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => MissionPlannerPositionDraft[];
  isShipPositionTypeLocked: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => boolean;
  getAssignedUserId: (position: MissionPlannerPositionDraft) => string | null;
  getUserLabel: (user: any) => string;
  tryAssignSelf: (
    ship: MissionPlannerShipDraft,
    position: MissionPlannerPositionDraft,
  ) => void;
  unassignSelf: (
    ship: MissionPlannerShipDraft,
    position: MissionPlannerPositionDraft,
  ) => void;
  getShipRoleOptions: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => Array<{ label: string; value: string }>;
  addPosition: (
    ship: MissionPlannerShipDraft,
    positionType: MissionPlannerPositionType,
  ) => void;
  removePosition: (
    ship: MissionPlannerShipDraft,
    position: MissionPlannerPositionDraft,
  ) => void;
}>();
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg-muted)/50"
  >
    <div
      class="flex items-center justify-between border-b border-(--ui-primary)/10 bg-(--ui-primary)/5 px-5 py-4"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-layers" class="h-4 w-4 text-(--ui-primary)" />
        <h2
          class="m-0! text-sm font-semibold uppercase tracking-wider text-(--ui-primary)"
        >
          Teams & Schiffe
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="subtle" size="sm">
          Primär {{ totalDraftPrimarySummary }}
        </UBadge>
        <UBadge color="neutral" variant="subtle" size="sm">
          Sekundär {{ totalDraftSecondarySummary }}
        </UBadge>
        <UButton
          size="sm"
          variant="outline"
          icon="i-lucide-plus"
          label="Team hinzufügen"
          @click="addTeam"
        />
      </div>
    </div>

    <div class="space-y-4 p-5">
      <div
        v-if="showRoleSummary"
        class="rounded-xl border border-(--ui-primary)/10 bg-(--ui-bg)/60 px-4 py-3"
      >
        <p
          class="text-[0.6rem] uppercase tracking-[0.24em] text-(--ui-text-muted)"
        >
          Rollenübersicht
        </p>
        <div class="mt-2 grid gap-3 sm:grid-cols-2">
          <p class="text-sm font-medium text-white">
            Primär {{ totalDraftPrimarySummary }}
          </p>
          <p class="text-sm font-medium text-white">
            Sekundär {{ totalDraftSecondarySummary }}
          </p>
        </div>
        <p
          v-if="totalDraftPositionsHint"
          class="mt-2 text-xs text-(--ui-text-muted)"
        >
          {{ totalDraftPositionsHint }}
        </p>
      </div>

      <div
        v-if="!teams.length"
        class="py-10 text-center text-sm text-(--ui-muted-foreground)"
      >
        <UIcon name="i-lucide-users" class="mx-auto mb-2 h-8 w-8 opacity-30" />
        <p>Noch keine Teams.</p>
        <div
          class="mt-4 flex items-center justify-center gap-1.5 text-(--ui-primary)"
        >
          <span class="text-xs font-medium">
            Klicke auf "Team hinzufügen" oben rechts
          </span>
          <UIcon
            name="i-lucide-corner-right-up"
            class="h-4 w-4 shrink-0 animate-bounce"
          />
        </div>
      </div>

      <div
        v-for="(team, ti) in teams"
        :key="team.id ?? ti"
        class="overflow-hidden rounded-lg border border-(--ui-primary)/10 bg-(--ui-bg)/50"
      >
        <div
          class="space-y-3 border-b border-(--ui-primary)/10 bg-(--ui-primary)/5 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-5 shrink-0 text-center text-xs font-bold text-(--ui-primary)/50"
            >
              {{ ti + 1 }}
            </span>
            <UInput
              v-model="team.name"
              placeholder="Team Name"
              variant="ghost"
              class="flex-1 font-semibold"
            />
            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              @click="removeTeam(ti)"
            />
          </div>

          <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <UInput
              v-model="team.description"
              placeholder="Beschreibung (optional)"
              variant="ghost"
              class="text-sm text-(--ui-muted-foreground)"
            />
            <UFormField
              size="sm"
              :label="teamDepartmentFieldLabel"
              :hint="teamDepartmentFieldHint"
              class="min-w-0"
            >
              <USelectMenu
                v-model="team.department"
                :items="departmentSelectItems"
                value-key="id"
                label-key="name"
                :placeholder="teamDepartmentFieldPlaceholder"
                :loading="departmentsPending"
                searchable
                clearable
                class="w-3/4"
              />
            </UFormField>
          </div>
        </div>

        <div class="divide-y divide-(--ui-primary)/5">
          <div
            v-if="!team.ships.length"
            class="px-4 py-3 text-center text-sm text-(--ui-muted-foreground)"
          >
            Kein Schiff zugewiesen.
          </div>

          <div
            v-for="(ship, si) in team.ships"
            :key="ship.id ?? si"
            class="space-y-3 px-4 py-3"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-rocket"
                class="h-4 w-4 shrink-0 text-(--ui-primary)/50"
              />
              <USelectMenu
                v-model="ship.hangar_id"
                :items="fleetOptions"
                value-key="value"
                label-key="label"
                placeholder="Schiff aus der Flotte wählen…"
                :loading="fleetPending"
                class="flex-1"
                searchable
                @update:model-value="onShipHangarChange(ship)"
              />
              <UBadge
                :color="
                  isShipOverCrewLimit(ship, 'primary') ? 'error' : 'neutral'
                "
                variant="subtle"
                size="sm"
              >
                Primär {{ getShipPositionSummary(ship, "primary") }}
              </UBadge>
              <UBadge
                :color="
                  isShipOverCrewLimit(ship, 'secondary') ? 'error' : 'neutral'
                "
                variant="subtle"
                size="sm"
              >
                Sekundär {{ getShipPositionSummary(ship, "secondary") }}
              </UBadge>
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-x"
                @click="removeShip(team, si)"
              />
            </div>

            <p
              class="ml-6 text-xs"
              :class="
                isShipOverCrewLimit(ship, 'primary') ||
                isShipOverCrewLimit(ship, 'secondary')
                  ? 'text-red-400'
                  : 'text-(--ui-text-muted)'
              "
            >
              Primär: {{ getShipCrewLimitHint(ship, "primary") }} • Sekundär:
              {{ getShipCrewLimitHint(ship, "secondary") }}
            </p>
            <p
              v-if="ship.hangar_id"
              class="ml-6 text-xs text-(--ui-primary)/75"
            >
              Primäre Rollen:
              {{ getShipRoleSummary(ship, "primary") || "Standardrollen" }}
              <span class="text-(--ui-text-muted)">•</span>
              Sekundäre Rollen:
              {{ getShipRoleSummary(ship, "secondary") || "Standardrollen" }}
            </p>

            <div class="ml-6 grid gap-4 md:grid-cols-2">
              <div
                v-for="positionType in positionTypeOrder"
                :key="positionType"
                class="space-y-2 rounded-xl border border-(--ui-primary)/8 bg-(--ui-bg-muted)/25 p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold text-white">
                      {{ positionTypeLabels[positionType] }}
                    </p>
                    <p class="text-[11px] text-(--ui-text-muted)">
                      {{ getShipPositionSummary(ship, positionType) }}
                    </p>
                  </div>
                  <UButton
                    v-if="!isShipPositionTypeLocked(ship, positionType)"
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-plus"
                    :label="positionTypeBadgeLabels[positionType]"
                    @click="addPosition(ship, positionType)"
                  />
                  <UBadge
                    v-else
                    color="neutral"
                    variant="subtle"
                    size="xs"
                    icon="i-lucide-lock"
                  >
                    Fixiert
                  </UBadge>
                </div>

                <div
                  v-if="getShipPositionsByType(ship, positionType).length"
                  class="space-y-2"
                >
                  <div
                    v-for="(pos, pi) in getShipPositionsByType(
                      ship,
                      positionType,
                    )"
                    :key="pos.id ?? `${positionType}-${pi}`"
                    :class="[
                      'grid gap-2 sm:items-center',
                      isShipPositionTypeLocked(ship, positionType)
                        ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
                        : 'sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto]',
                    ]"
                  >
                    <span
                      v-if="isShipPositionTypeLocked(ship, positionType)"
                      class="break-words text-sm text-white"
                      :title="pos.role"
                    >
                      {{ pos.role }}
                    </span>
                    <USelectMenu
                      v-else
                      v-model="pos.role"
                      :items="getShipRoleOptions(ship, positionType)"
                      value-key="value"
                      label-key="label"
                      class="w-full min-w-0"
                    />
                    <div class="flex min-w-0 items-center gap-1">
                      <template v-if="positionType === 'secondary'">
                        <span
                          v-if="getAssignedUserId(pos) === currentUserId"
                          class="flex-1 truncate text-xs font-medium text-(--ui-primary)"
                        >
                          Ich
                        </span>
                        <span
                          v-else-if="getAssignedUserId(pos)"
                          class="flex-1 truncate text-xs text-white"
                          :title="getUserLabel(pos.assigned_user)"
                        >
                          {{ getUserLabel(pos.assigned_user) }}
                        </span>
                        <span
                          v-else
                          class="flex-1 truncate text-xs text-(--ui-text-muted)"
                        >
                          Automatisch mit Primär
                        </span>
                      </template>
                      <template
                        v-else-if="getAssignedUserId(pos) === currentUserId"
                      >
                        <span
                          class="flex-1 truncate text-xs font-medium text-(--ui-primary)"
                        >
                          Ich
                        </span>
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="error"
                          icon="i-lucide-user-minus"
                          @click="unassignSelf(ship, pos)"
                        />
                      </template>
                      <template v-else-if="getAssignedUserId(pos)">
                        <span
                          class="flex-1 truncate text-xs text-white"
                          :title="getUserLabel(pos.assigned_user)"
                        >
                          {{ getUserLabel(pos.assigned_user) }}
                        </span>
                        <UTooltip text="Durch mich ersetzen">
                          <UButton
                            size="xs"
                            variant="ghost"
                            color="warning"
                            icon="i-lucide-repeat-2"
                            @click="tryAssignSelf(ship, pos)"
                          />
                        </UTooltip>
                      </template>
                      <template v-else>
                        <UButton
                          size="xs"
                          variant="ghost"
                          icon="i-lucide-user-plus"
                          label="Mir zuweisen"
                          class="flex-1 justify-start"
                          @click="tryAssignSelf(ship, pos)"
                        />
                      </template>
                    </div>
                    <div
                      v-if="!isShipPositionTypeLocked(ship, positionType)"
                      class="flex justify-end sm:justify-start"
                    >
                      <UButton
                        size="xs"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-minus"
                        @click="removePosition(ship, pos)"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="rounded-lg border border-dashed border-(--ui-primary)/12 px-3 py-4 text-center text-xs text-(--ui-text-muted)"
                >
                  Noch keine
                  {{ positionTypeLabels[positionType].toLowerCase() }}.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="border-t border-(--ui-primary)/5 bg-(--ui-bg-muted)/20 px-4 py-2"
        >
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-plus"
            label="Schiff hinzufügen"
            @click="addShip(team)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
