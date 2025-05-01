# Timezone Integration Plan for Food Truck Schedule System

**Goal:** Ensure schedule checks (open/closed status) and displays are accurate regardless of server, admin, or viewer location by associating each schedule entry with its specific operational timezone.

**Core Change:** Add a timezone identifier to each scheduled day/location.

**Implementation Steps:**

1.  **Modify Data Structure:**
    *   Add `timezone: string` to the `ScheduleDay` interface/type (affecting `lib/schedule-utils.ts`, `lib/schedule-utils-server.ts`, admin components, actions, DB schema). This will store IANA timezone names (e.g., `"America/New_York"`).
    *   **(Optional but Recommended):** Add `primaryTimezone: string` to the main food truck `config` object. This serves as a default for new entries and potentially for server-side "today" calculations.

2.  **Update Admin Interface (`app/admin/schedule/client.tsx` & Forms):**
    *   Add a "Timezone" selector (dropdown) to the schedule editing form for each day/entry.
    *   Populate the selector with common IANA timezone names.
    *   Default the selector to the truck's `primaryTimezone` (if set) or the existing `timezone` for the day being edited.
    *   Ensure the selected `timezone` is saved via `updateSchedule` / `batchUpdateSchedules` actions.

3.  **Update Server Actions (`app/admin/schedule/actions.ts`):**
    *   Modify `updateSchedule` and `batchUpdateSchedules` to accept and store the `timezone` string for each schedule day.
    *   **`closeToday`/`reopenToday`:**
        *   Store `closureTimestamp` reliably, preferably in UTC (e.g., `new Date().toISOString()`).
        *   Ensure comparison logic (in `isScheduledOpen*`) correctly compares against "today" *in the specific schedule day's timezone*.
    *   **`resetOutdatedClosures`:**
        *   Update logic to determine if a closure is "outdated" by comparing `closureTimestamp` against the current date *in the specific `timezone` of the schedule day being checked*.

4.  **Update Server Utility (`lib/schedule-utils-server.ts`):**
    *   **Integrate Timezone Library:** Add a robust date/time library supporting IANA timezones (e.g., `date-fns-tz`, `dayjs` with timezone plugin).
    *   **`isScheduledOpenServer` / `checkIfOpenBasedOnHours`:**
        *   Get the *current time* specifically for the `scheduleDay.timezone`.
        *   Parse `openTime` and `closeTime` *within the context* of `scheduleDay.timezone` to create timezone-aware date objects.
        *   Perform all time comparisons (`now >= openTime`, `now < closeTime`, 15-min buffer) using these timezone-aware objects.
        *   Update the `closureTimestamp` check: Compare the (UTC) `closureTimestamp` against the start of "today" *in the `scheduleDay.timezone`*.
    *   **`getTodayScheduleServer`:**
        *   Define "today" based on the truck's `primaryTimezone` (from config) or a sensible default. Get the current day name (e.g., "Monday") based on the current time *in that primary timezone*.
        *   Filter schedule days based on this timezone-aware "today".

5.  **Update Client Utility (`lib/schedule-utils.ts`):**
    *   **Integrate Same Timezone Library:** Use the same library as the server-side.
    *   **`isScheduledOpen` / `checkIfOpenBasedOnHours`:**
        *   Implement the same timezone-aware logic as `isScheduledOpenServer`. Use the browser's current time, but convert/compare it within the context of the `scheduleDay.timezone`.
    *   **`formatTimeRange`:**
        *   Append the relevant timezone abbreviation (e.g., "PDT", "EST") based on `scheduleDay.timezone` and the date (to handle DST). The library should provide this.
    *   **`getTodaySchedule`:** Keep using the *viewer's* local browser time to determine their "today" for finding the relevant schedule entry.

6.  **Update Public Display (`components/FoodTruckTemplate/FoodTruckSchedule.tsx` & `components/ui/schedule-card.tsx`):**
    *   Pass the `timezone` down to `ScheduleCard`.
    *   Display the timezone abbreviation (from updated `formatTimeRange`) next to the times in the `ScheduleCard`.
