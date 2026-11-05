// Occasion-specific form fields for the Tendr Invitation Studio — section 4
// of the brief. COMMON_FIELDS render for every occasion; OCCASION_FIELDS
// adds a few extra, occasion-specific fields on top. Toggle-able fields
// (end time, RSVP deadline, dress code) carry `optional:true` and render a
// "show on flyer" checkbox in the customizer rather than always appearing.

export const COMMON_FIELDS = [
  { key: "hostName",     label: "Host name",        placeholder: "e.g. Priya Sharma", required: true },
  { key: "eventTitle",   label: "Event title",      placeholder: "e.g. Rhea's Birthday Bash" },
  { key: "date",         label: "Date",              placeholder: "e.g. 15th June 2025", required: true },
  { key: "time",         label: "Start time",        placeholder: "e.g. 7:00 PM", required: true },
  { key: "endTime",      label: "End time",          placeholder: "e.g. 10:00 PM", optional: true },
  { key: "venue",        label: "Venue & address",   placeholder: "Venue name & full address", required: true },
  { key: "rsvp",         label: "RSVP contact",      placeholder: "+91 9XXXXXXXXX" },
  { key: "rsvpDeadline", label: "RSVP by",           placeholder: "e.g. 10th June", optional: true },
  { key: "dressCode",    label: "Dress code",        placeholder: "e.g. Pastels preferred", optional: true },
  { key: "message",      label: "Invitation message", placeholder: "A short personal note (optional)", optional: true },
];

// Occasion id -> a few extra fields, matching section 4B of the brief.
export const OCCASION_FIELDS = {
  "birthday-party":     [{ key: "celebrantName", label: "Birthday person's name", placeholder: "e.g. Rhea" }, { key: "age", label: "Turning (age)", placeholder: "e.g. 8" }, { key: "theme", label: "Theme", placeholder: "e.g. Unicorn Party", optional: true }],
  "first-birthday":     [{ key: "babyName", label: "Baby's name", placeholder: "e.g. Arjun" }, { key: "parentsNames", label: "Parents' names", placeholder: "e.g. Riya & Karan" }, { key: "theme", label: "First-birthday theme", placeholder: "e.g. One-derland", optional: true }],
  "anniversary":        [{ key: "coupleNames", label: "Couple's names", placeholder: "e.g. Meera & Dev" }, { key: "anniversaryNumber", label: "Anniversary number", placeholder: "e.g. 10th" }],
  "baby-shower":        [{ key: "parentsNames", label: "Parents-to-be", placeholder: "e.g. Ananya & Rohan" }, { key: "coHostName", label: "Co-host name", placeholder: "If different from host", optional: true }, { key: "theme", label: "Baby shower theme", placeholder: "e.g. Safari Baby Shower", optional: true }],
  "newborn-welcome":    [{ key: "babyName", label: "Baby's name", placeholder: "If already decided", optional: true }, { key: "parentsNames", label: "Parents' names", placeholder: "e.g. Nisha & Arjun" }],
  "gender-reveal":      [{ key: "parentsNames", label: "Parents' names", placeholder: "e.g. Sana & Vivek" }, { key: "revealTheme", label: "Reveal theme", placeholder: "e.g. Pink or Blue", optional: true }],
  "naming-ceremony":    [{ key: "babyName", label: "Baby's name", placeholder: "If already decided", optional: true }, { key: "parentsNames", label: "Parents' names", placeholder: "e.g. Divya & Rahul" }, { key: "familyNames", label: "Family / host names", placeholder: "e.g. The Sharma Family", optional: true }],
  "housewarming":       [{ key: "familyNames", label: "Host / family name", placeholder: "e.g. The Kapoor Family" }, { key: "homeName", label: "Home name", placeholder: "If applicable", optional: true }, { key: "ceremonyType", label: "Griha Pravesh or casual?", placeholder: "e.g. Griha Pravesh", optional: true }],
  "get-together":       [{ key: "partyTheme", label: "Party theme", placeholder: "e.g. Terrace Nights", optional: true }],
  "kitty-party":        [{ key: "partyTheme", label: "Kitty party theme", placeholder: "e.g. Tea Party", optional: true }],
  "office-party":       [{ key: "companyName", label: "Company name", placeholder: "e.g. Tendr Pvt Ltd" }, { key: "department", label: "Department", placeholder: "If applicable", optional: true }, { key: "organiserName", label: "Organiser name", placeholder: "e.g. HR Team", optional: true }],
  "graduation":         [{ key: "graduateName", label: "Graduate's name", placeholder: "e.g. Ishaan Mehta" }, { key: "course", label: "Degree / course", placeholder: "e.g. B.Tech Computer Science" }, { key: "institution", label: "Institution name", placeholder: "e.g. Delhi University" }],
  "bachelorette":       [{ key: "celebrantName", label: "Celebrant's name", placeholder: "e.g. Tara" }, { key: "hostGroupName", label: "Bride tribe / groom squad", placeholder: "e.g. The Bride Tribe", optional: true }, { key: "partyTheme", label: "Party theme", placeholder: "e.g. VIP Night", optional: true }],
  "farewell":           [{ key: "celebrantName", label: "Person's name", placeholder: "e.g. Mr. Verma" }, { key: "organisation", label: "Organisation / institution", placeholder: "e.g. ABC College" }, { key: "organiserName", label: "Host / organising team", placeholder: "e.g. Batch of 2025", optional: true }],
  "retirement":         [{ key: "celebrantName", label: "Retiree's name", placeholder: "e.g. Mr. Sharma" }, { key: "designation", label: "Designation", placeholder: "e.g. Senior Manager" }, { key: "organisation", label: "Organisation", placeholder: "e.g. ABC Corp" }, { key: "yearsOfService", label: "Years of service", placeholder: "e.g. 25 years", optional: true }],
  "diwali-party":       [{ key: "familyNames", label: "Host / family name", placeholder: "e.g. The Gupta Family", optional: true }, { key: "celebrationTheme", label: "Celebration theme", placeholder: "e.g. Royal Diwali", optional: true }],
  "holi-party":         [{ key: "partyTheme", label: "Party theme", placeholder: "e.g. Holi Splash", optional: true }],
  "navratri-garba":     [{ key: "organiserName", label: "Organiser's name", placeholder: "e.g. Shah Family" }, { key: "eventName", label: "Event name", placeholder: "e.g. Garba Nights 2025", optional: true }, { key: "gandaOrDandiya", label: "Garba, Dandiya, or both?", placeholder: "e.g. Both", optional: true }],
};

// Wedding sub-app — section 4C. Separate from the generic schema above;
// supports multiple functions, each with its own date/time/venue.
export const WEDDING_FIELDS = [
  { key: "brideName",  label: "Bride's full name",  placeholder: "e.g. Ananya Sharma", required: true },
  { key: "groomName",  label: "Groom's full name",  placeholder: "e.g. Vikram Mehta", required: true },
  { key: "brideParents", label: "Bride's parents' names", placeholder: "e.g. Mr. & Mrs. Sharma" },
  { key: "groomParents", label: "Groom's parents' names", placeholder: "e.g. Mr. & Mrs. Mehta" },
  { key: "hostingFamily", label: "Hosting family", placeholder: "If different from parents", optional: true },
  { key: "rsvp",        label: "RSVP contact",      placeholder: "+91 9XXXXXXXXX" },
  { key: "message",     label: "Invitation message", placeholder: "A short personal note (optional)", optional: true },
];

export const WEDDING_FUNCTION_TYPES = ["Engagement", "Mehendi", "Haldi", "Sangeet", "Cocktail", "Wedding Ceremony", "Reception"];

export function getOccasionFields(occasionId) {
  return OCCASION_FIELDS[occasionId] || [];
}
