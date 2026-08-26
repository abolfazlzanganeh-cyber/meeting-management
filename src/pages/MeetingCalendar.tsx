// src/pages/MeetingCalendar.tsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export function MeetingCalendar() {
  const { meetings } = useApp();
  
  const events = meetings.map(m => ({
    id: m.id,
    title: m.title,
    start: new Date(toGregorian(m.date) + 'T' + m.startTime),
    end: new Date(toGregorian(m.date) + 'T' + (m.endTime || m.startTime)),
    resource: m,
  }));
  
  const handleSelectSlot = (slotInfo: any) => {
    // ایجاد جلسه جدید در این زمان
    navigate('/meetings/new', { state: { date: slotInfo.start } });
  };
  
  const handleSelectEvent = (event: any) => {
    // نمایش جزئیات جلسه
    navigate(`/meetings/${event.id}`);
  };
  
  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        culture="fa"
        messages={{
          today: 'امروز',
          previous: 'قبلی',
          next: 'بعدی',
          month: 'ماه',
          week: 'هفته',
          day: 'روز',
        }}
      />
    </div>
  );
}