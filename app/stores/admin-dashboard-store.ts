import { defineStore } from 'pinia'
import type { DirectusUser } from '~~/types'

export const useAdminDashboardStore = defineStore('admin-dashboard', {
  state: () => ({
    allUsers: null as DirectusUser[] | null,
    loading: false,
    employeeTimelineLoading: false,
    processedChartDataWithRevisions: [] as any[],
  }),
  actions: {
    async fetchAllUsers() {
      if (this.allUsers) {
        return
      }

      this.loading = true
      try {
        this.allUsers = (await useDirectus(
          readUsers({
            filter: {
              api_account: { _eq: false },
              hidden: { _eq: false },
            },
            fields: [
              '*',
              'status',
              'date_updated',
              { primary_department: ['name'] },
              { secondary_department: ['name'] },
              { role: ['name'] },
            ],
            sort: ['first_name'],
          })
        )) as DirectusUser[]
        this.processChartData()
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },
    async processChartData() {
      if (!this.allUsers || this.processedChartDataWithRevisions.length > 0) {
        return
      }

      this.employeeTimelineLoading = true

      const activeMembersByMonth: Record<string, number> = {}
      const archivedMembersByMonth: Record<string, number> = {}

      const revisionPromises = this.allUsers.map(async (member) => {
        if (member.status === 'active' && member.date_created) {
          const date = new Date(member.date_created)
          const year = date.getFullYear()
          const month = (date.getMonth() + 1).toString().padStart(2, '0')
          const key = `${year}-${month}`

          if (activeMembersByMonth[key]) {
            activeMembersByMonth[key]++
          } else {
            activeMembersByMonth[key] = 1
          }
        } else if (member.status === 'archived') {
          let archivedDate: Date | null = null
          try {
            const revisionsResponse = await useDirectus(
              readRevisions({
                filter: {
                  collection: { _eq: 'directus_users' },
                  item: { _eq: member.id },
                },
                sort: ['activity.timestamp'],
                limit: 10,
                fields: [{ activity: ['timestamp'] }, 'delta'],
              })
            )

            for (const revision of revisionsResponse) {
              if (
                revision.delta &&
                typeof revision.delta === 'object' &&
                'status' in revision.delta &&
                revision.delta.status === 'archived'
              ) {
                if (
                  revision.activity &&
                  typeof revision.activity === 'object' &&
                  'timestamp' in revision.activity
                ) {
                  archivedDate = new Date(revision.activity.timestamp)
                  break
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching revisions for user ${member.id}:`, error)
          }

          if (archivedDate) {
            const year = archivedDate.getFullYear()
            const month = (archivedDate.getMonth() + 1).toString().padStart(2, '0')
            const key = `${year}-${month}`

            if (archivedMembersByMonth[key]) {
              archivedMembersByMonth[key]++
            } else {
              archivedMembersByMonth[key] = 1
            }
          } else {
            const fallbackDate = member.date_updated
              ? new Date(member.date_updated)
              : member.date_created
              ? new Date(member.date_created)
              : null
            if (fallbackDate) {
              const year = fallbackDate.getFullYear()
              const month = (fallbackDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')
              const key = `${year}-${month}`

              if (archivedMembersByMonth[key]) {
                archivedMembersByMonth[key]++
              } else {
                archivedMembersByMonth[key] = 1
              }
            }
          }
        }
      })

      await Promise.all(revisionPromises)

      const allMonthKeys = new Set([
        ...Object.keys(activeMembersByMonth),
        ...Object.keys(archivedMembersByMonth),
      ])
      const sortedMonthKeys = Array.from(allMonthKeys).sort((keyA, keyB) =>
        keyA.localeCompare(keyB)
      )

      this.processedChartDataWithRevisions = sortedMonthKeys.map((dateKey) => {
        const [year, monthNum] = dateKey.split('-')
        const date = new Date(parseInt(year), parseInt(monthNum) - 1)
        const monthName = date.toLocaleString('default', { month: 'long' })
        const displayMonth = `${monthName} ${year}`

        return {
          month: displayMonth,
          dateKey: dateKey, // Add dateKey here
          active: activeMembersByMonth[dateKey] || 0,
          archived: archivedMembersByMonth[dateKey] || 0,
        }
      })
      this.employeeTimelineLoading = false
    },
  },
})
