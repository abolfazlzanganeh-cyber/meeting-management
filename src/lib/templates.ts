// src/lib/templates.ts
export const meetingTemplates = {
    weekly_team: {
      title: 'جلسه هفتگی تیم',
      subject: 'بررسی پیشرفت هفتگی',
      duration: 60,
      defaultAttendees: ['team_lead', 'members'],
      agenda: [
        'بررسی کارهای هفته گذشته',
        'برنامه‌ریزی هفته آینده',
        'بررسی چالش‌ها',
      ],
    },
    project_kickoff: {
      title: 'جلسه شروع پروژه',
      subject: 'بررسی اهداف و برنامه پروژه',
      duration: 120,
      defaultAttendees: ['project_manager', 'stakeholders'],
      agenda: [
        'معرفی پروژه',
        'بررسی اهداف',
        'تعیین زمان‌بندی',
        'تخصیص منابع',
      ],
    },
    safety_review: {
      title: 'جلسه بررسی ایمنی',
      subject: 'بررسی موارد HSE',
      duration: 90,
      defaultAttendees: ['hse_manager', 'supervisors'],
      agenda: [
        'بررسی حوادث',
        'بررسی اقدامات اصلاحی',
        'آموزش ایمنی',
      ],
    },
  };
  
  // src/pages/NewMeeting.tsx
  export function NewMeeting() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    
    const handleTemplateSelect = (templateKey: string) => {
      const template = meetingTemplates[templateKey];
      setFormData({
        title: template.title,
        subject: template.subject,
        // ... پر کردن خودکار
      });
    };
    
    return (
      <div>
        <select onChange={(e) => handleTemplateSelect(e.target.value)}>
          <option value="">انتخاب قالب...</option>
          <option value="weekly_team">جلسه هفتگی تیم</option>
          <option value="project_kickoff">شروع پروژه</option>
          <option value="safety_review">بررسی ایمنی</option>
        </select>
        {/* فرم جلسه */}
      </div>
    );
  }