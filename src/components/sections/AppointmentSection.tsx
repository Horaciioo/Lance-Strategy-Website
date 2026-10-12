import { BookingSection } from '@/components/sections/BookingSection'
import { GroupBuild } from '@/components/sections/GroupBuild'
import { SECTION_ANCHORS } from '@/declarations/routes'
import { APPOINTMENT_STYLES } from '@/declarations/ui/variants'

/**
 * Appointment calendar
 * @return {JSX.Element} - Rendered section
 */

export const AppointmentSection = () => (
  <GroupBuild className={APPOINTMENT_STYLES.section} replayAnchor={SECTION_ANCHORS.booking}>
    <BookingSection />
  </GroupBuild>
)
