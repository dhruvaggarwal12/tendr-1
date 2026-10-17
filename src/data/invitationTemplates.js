// Shared template catalogue for the Invitation Builder flow
// (InvitationFlyerPicker -> TemplateGallery -> InvitationCustomizer)

export const EVENT_TYPES = [
  { id: "dinner-eve",            name: "Dinner Eve",           icon: "🍽️" },
  { id: "family-gathering",      name: "Family Gathering",     icon: "👨‍👩‍👧‍👦" },
  { id: "lunch-celebrations",    name: "Lunch Celebrations",   icon: "🥗" },
  { id: "marriage-ceremony",     name: "Marriage Ceremony",    icon: "💒" },
  { id: "magical-ring-ceremony", name: "Ring Ceremony",        icon: "💍" },
  { id: "birthday-party",        name: "Birthday Party",       icon: "🎂" },
  { id: "marriage-anniversary",  name: "Anniversary",          icon: "💕" },
];

export const EVENT_TYPE_DATA = {
  'dinner-eve': {
    name: 'DINNER EVE',
    icon: '🍽️',
    color: 'from-purple-500 to-pink-500',
    templates: [
      { id: 1, name: 'Elegant Blooms', image: 'https://images.greetingsisland.com/images/invitations/party%20theme/dinner-party/previews/dramatic-blooms-40747.gif?auto=format,compress', description: 'Dramatic floral design with elegant typography' },
      { id: 2, name: 'Vintage Elegance', image: 'https://marketplace.canva.com/EAGgXnszJS8/2/0/1143w/canva-red-beige-vintage-elegant-dinner-party-invitation-qu0zEI8ttv4.jpg', description: 'Classic vintage style with warm colors' },
      { id: 3, name: 'Modern Minimalist', image: 'https://i.pinimg.com/564x/fd/33/1d/fd331da950ed6542653be22635fa7c5a.jpg', description: 'Clean, modern design with bold typography' },
      { id: 4, name: 'Artistic Floral', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/c4c084daa80070ef666db4b64d3ba1078c7edea41683626561.jpg', description: 'Beautiful watercolor floral elements' },
      { id: 5, name: 'Golden Luxury', image: 'https://i.pinimg.com/736x/d9/16/f1/d916f1a020292f059766557137830567.jpg', description: 'Luxurious gold accents with sophisticated design' },
      { id: 6, name: 'Rustic Charm', image: 'https://i.pinimg.com/736x/f3/cd/7c/f3cd7c6a167851b6b28b7d76c1841503.jpg', description: 'Warm rustic style with natural elements' },
      { id: 7, name: 'Contemporary Chic', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/1e7ecf9aed7479811b69c61450602540ec2faac31683626512.jpg', description: 'Contemporary design with chic elements' },
      { id: 8, name: 'Classic Black & White', image: 'https://i.pinimg.com/564x/da/ca/fd/dacafd9fdb486ac790549d197bbb89e4.jpg', description: 'Timeless black and white elegance' },
    ],
  },
  'family-gathering': {
    name: 'FAMILY GATHERING',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-green-500 to-blue-500',
    templates: [
      { id: 1, name: 'Warm Family Reunion', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/96b848a1d8030cb27020e0cc390a7f13cba3083c1727931019.jpg', description: 'Cozy family reunion with warm colors' },
      { id: 2, name: 'Vintage Family', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/6ce5d9fd9cd471f86b21e40a2956ca1d1f2bc3111685450201.jpg', description: 'Nostalgic vintage family gathering design' },
      { id: 3, name: 'Illustrative Family', image: 'https://marketplace.canva.com/EAGmx2jyQY4/1/0/1135w/canva-cream-and-brown-illustrative-family-reunion-invitation-jC29fAWB3qQ.jpg', description: 'Beautiful illustrated family scene' },
      { id: 4, name: 'Modern Family', image: 'https://i.pinimg.com/736x/68/bd/a4/68bda45169a18714c5e1908ddc2fdc6d.jpg', description: 'Contemporary family gathering design' },
      { id: 5, name: '2025 Family Reunion', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/2025-family-reunion-design-template-f4e0a7b49604ee241b79a593d96f9daa.jpg?ts=1745204756', description: 'Trendy 2025 family reunion template' },
      { id: 6, name: 'Rustic Family', image: 'https://i.pinimg.com/474x/1f/29/32/1f29327c24a077844024e83f669227ce.jpg', description: 'Rustic family gathering with natural elements' },
      { id: 7, name: 'Elegant Family', image: 'https://i.etsystatic.com/8446563/r/il/cf2609/6118218381/il_fullxfull.6118218381_i9hf.jpg', description: 'Elegant family reunion invitation' },
      { id: 8, name: 'Classic Family', image: 'https://i.etsystatic.com/49103742/r/il/bdbb71/6025498524/il_570xN.6025498524_1sxc.jpg', description: 'Classic family gathering design' },
    ],
  },
  'lunch-celebrations': {
    name: 'LUNCH CELEBRATIONS',
    icon: '🥗',
    color: 'from-yellow-500 to-orange-500',
    templates: [
      { id: 1, name: 'Bright Lunch Party', image: 'https://i.pinimg.com/736x/6d/e1/90/6de19091700b94f6bc4caad44ed626f6.jpg', description: 'Bright and cheerful lunch celebration' },
      { id: 2, name: 'Elegant Lunch', image: 'https://images.template.net/424408/Lunch-Invitation-Template-edit-online.png', description: 'Elegant lunch invitation template' },
      { id: 3, name: 'Modern Lunch', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/555a2aec0266dbfb4457058c605fbde948af118f1733201833.jpg', description: 'Modern lunch celebration design' },
      { id: 4, name: 'Vintage Lunch', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/0b5959b124464775952ea7e51dcc025373d30ae51733201819.jpg', description: 'Vintage-style lunch invitation' },
      { id: 5, name: 'Floral Lunch', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/c49d2e70e97e2c546804c23ba5d3753fcf2eb0e91685440518.jpg', description: 'Beautiful floral lunch celebration' },
      { id: 6, name: 'Contemporary Lunch', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/f65fb24004e0d83fd7abc95a88b5de22de26cf8a1685447000.jpg', description: 'Contemporary lunch party design' },
      { id: 7, name: 'Classic Lunch', image: 'https://i.pinimg.com/736x/6d/e1/90/6de19091700b94f6bc4caad44ed626f6.jpg', description: 'Classic lunch celebration template' },
      { id: 8, name: 'Minimalist Lunch', image: 'https://images.template.net/424408/Lunch-Invitation-Template-edit-online.png', description: 'Clean minimalist lunch invitation' },
    ],
  },
  'marriage-ceremony': {
    name: 'MARRIAGE CEREMONY',
    icon: '💒',
    color: 'from-pink-500 to-red-500',
    templates: [
      { id: 1, name: 'Elegant Wedding', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/wedding-ceremony-invitation-flyer%2C-wedding-in-design-template-8a7aecfae5538654866aea9ae94be6ef_screen.jpg?ts=1718460048', description: 'Elegant wedding ceremony invitation' },
      { id: 2, name: 'Classic Wedding', image: 'https://i.pinimg.com/564x/00/00/d3/0000d3ba29588e2e60a244a5837e604d.jpg', description: 'Classic wedding invitation design' },
      { id: 3, name: 'Modern Wedding', image: 'https://i.pinimg.com/474x/72/07/da/7207da51cf62e37fcae06642cceefad1.jpg', description: 'Modern wedding ceremony template' },
      { id: 4, name: 'Floral Wedding', image: 'https://i.pinimg.com/474x/af/37/e6/af37e63a5282a522042cd75385744917.jpg', description: 'Beautiful floral wedding invitation' },
      { id: 5, name: 'Luxury Wedding', image: 'https://cdn.dribbble.com/userupload/13614973/file/original-40169a7cf79c13446bfc3ba79f1f504c.png?resize=752x&vertical=center', description: 'Luxurious wedding ceremony design' },
      { id: 6, name: 'Vintage Wedding', image: 'https://i.pinimg.com/originals/9a/63/45/9a6345aa706b11d8abb8dd47e7fdb4be.jpg', description: 'Vintage-style wedding invitation' },
      { id: 7, name: 'Contemporary Wedding', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/f065c129c8d3b8cd169e1a60d0ad10815418714e1728896478.jpg', description: 'Contemporary wedding design' },
      { id: 8, name: 'Elegant Floral Wedding', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/elegant-floral-wedding-invitation-flyer-design-template-865e407c56fe6007e04a31f0a158d0f4_screen.jpg?ts=1751527526', description: 'Elegant floral wedding invitation' },
    ],
  },
  'magical-ring-ceremony': {
    name: 'MAGICAL RING CEREMONY',
    icon: '💍',
    color: 'from-indigo-500 to-purple-500',
    templates: [
      { id: 1, name: 'Romantic Engagement', image: 'https://i.etsystatic.com/21541398/r/il/e45e77/3824002173/il_fullxfull.3824002173_kftw.jpg', description: 'Romantic engagement party invitation' },
      { id: 2, name: 'Elegant Ring Ceremony', image: 'https://i.pinimg.com/736x/8b/65/e6/8b65e66b5d807059d1358aca87d03d8d.jpg', description: 'Elegant ring ceremony design' },
      { id: 3, name: 'Floral Engagement', image: 'https://marketplace.canva.com/EAGEnDm0Yd0/1/0/571w/canva-green-white-floral-engagement-party-invitation-j67hXWgwRx8.jpg', description: 'Beautiful floral engagement invitation' },
      { id: 4, name: 'Modern Engagement', image: 'https://marketplace.canva.com/EAFogjaXQ28/4/0/571w/canva-black-and-gold-modern-elegant-save-the-date-engagement-invitation-av-WrWAUqfk.jpg', description: 'Modern elegant engagement design' },
      { id: 5, name: 'Luxury Engagement', image: 'https://suavasarinvites.com/wp-content/uploads/2024/02/engagement-invitation-08.jpeg', description: 'Luxurious engagement party invitation' },
      { id: 6, name: 'Traditional Engagement', image: 'https://shaadivibes.in/wp-content/uploads/2023/08/Engagement-invitation-card.webp', description: 'Traditional engagement ceremony design' },
      { id: 7, name: 'Rustic Engagement', image: 'https://cdn.easyinvite.in/designs/english/engagement/Rustic-Engagement-Invitation---Edit-with-Ease!-1739038554038.png', description: 'Rustic engagement invitation' },
      { id: 8, name: 'Classic Engagement', image: 'https://i.pinimg.com/474x/28/58/0c/28580cecc9d27254cf791805c3b92b86.jpg', description: 'Classic engagement ceremony design' },
    ],
  },
  'birthday-party': {
    name: 'BIRTHDAY PARTY',
    icon: '🎂',
    color: 'from-pink-500 to-purple-500',
    templates: [
      { id: 1, name: 'Elegant Birthday', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/elegant-birthday-party-invitation-design-template-5170d76fed909e305e239e47fcb9600d_screen.jpg?ts=1699027421', description: 'Elegant birthday party invitation design' },
      { id: 2, name: 'Festive Celebration', image: 'https://img.freepik.com/premium-vector/birthday-party-invitation-flyer-template_1166152-252.jpg', description: 'Vibrant and festive birthday celebration' },
      { id: 3, name: 'Modern Birthday', image: 'https://i.etsystatic.com/54538291/r/il/20cddf/6844343112/il_1080xN.6844343112_rm60.jpg', description: 'Modern birthday party invitation' },
      { id: 4, name: 'Colorful Party', image: 'https://static.wixstatic.com/media/4e389b_4632f4e155df4cbab867fee2ec1f67b2~mv2.jpg/v1/fill/w_520,h_780,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4e389b_4632f4e155df4cbab867fee2ec1f67b2~mv2.jpg', description: 'Colorful and fun birthday party design' },
      { id: 5, name: 'Birthday Celebration', image: 'https://freehindidesign.com/wp-content/uploads/2024/11/Birthday-celebration-invitation-card-template-cdr-and-psd-file-download-111124-min.webp', description: 'Beautiful birthday celebration template' },
      { id: 6, name: 'Rose Gold Glitter', image: 'https://images.greetingsisland.com/images/invitations/birthday/previews/rose-gold-glitter-21356.jpeg?auto=format,compress', description: 'Elegant rose gold glitter birthday design' },
      { id: 7, name: 'Party Fun', image: 'https://i.pinimg.com/736x/b6/16/af/b616af2a4183a44ba4e34ccde13ac639.jpg', description: 'Fun and playful birthday party invitation' },
      { id: 8, name: 'Birthday Bash', image: 'https://i.ebayimg.com/images/g/ORgAAOSwGwdjRpjN/s-l400.jpg', description: 'Exciting birthday bash invitation' },
      { id: 9, name: 'Celebration Time', image: 'https://i.etsystatic.com/18820507/r/il/c114a0/4739504939/il_1080xN.4739504939_es1y.jpg', description: 'Time to celebrate birthday invitation' },
    ],
  },
  'marriage-anniversary': {
    name: 'MARRIAGE ANNIVERSARY',
    icon: '💕',
    color: 'from-red-500 to-pink-500',
    templates: [
      { id: 1, name: '10th Anniversary', image: 'https://shaadivibes.in/wp-content/uploads/2024/01/10th-wedding-anniversary-invitation-template.webp', description: 'Elegant 10th wedding anniversary invitation' },
      { id: 2, name: 'Golden Anniversary', image: 'https://i.pinimg.com/736x/5f/f1/88/5ff1884ae4712c7c574eddf352d8f8ed.jpg', description: 'Beautiful golden anniversary celebration' },
      { id: 3, name: 'Anniversary Celebration', image: 'https://m.media-amazon.com/images/I/717vOqCGhOL.jpg', description: 'Romantic anniversary celebration invitation' },
      { id: 4, name: 'Victory Anniversary', image: 'https://www.victoryinvitations.com/cdn/shop/files/1499-scaled.jpg?v=1747480894&width=1200', description: 'Victory anniversary invitation design' },
      { id: 5, name: 'Cherry Blossom 50th', image: 'https://seemymarriage1.b-cdn.net/wp-content/uploads/2024/07/Cherry-Blossom-50th-Wedding-Anniversary-Invitation-Card-with-Pink-Beige-Theme-Background.jpg', description: 'Cherry blossom 50th anniversary with pink theme' },
      { id: 6, name: 'Classic Anniversary', image: 'https://seemymarriage1.b-cdn.net/wp-content/uploads/2021/07/aniversery-card-3.jpg', description: 'Classic anniversary card design' },
      { id: 7, name: 'Anniversary Card', image: 'https://media.craftyartapp.com/uploadedFiles/thumb_file/f69b41b5c5c5a2969df67b09d5d0dca4978717251715860722.jpg', description: 'Beautiful anniversary card template' },
      { id: 8, name: 'Deckle Anniversary', image: 'https://sample4.planetart.com/preview/15-68073-5-663-663-2025-dcpDeckle.jpg', description: 'Elegant deckle edge anniversary invitation' },
    ],
  },
};

export function getTemplate(eventType, id) {
  const group = EVENT_TYPE_DATA[eventType];
  if (!group) return null;
  const numId = Number(id);
  return group.templates.find(t => t.id === numId) || null;
}
