// The 95 Tendr Invitation Studio templates (18 occasions x 5 + 5 wedding).
// Each entry is plain data — kit + palette + font-pair + layout + accent
// icon — rendered by the single InvitationFlyerEngine. Names/taglines are
// the user's own spec; combos were chosen so no two of an occasion's five
// read as a recolor of each other (kit and/or layout always differs).

export const INVITATION_STUDIO_TEMPLATES = [
  // ── Birthday Party ────────────────────────────────────────────────────
  { id: "birthday-elegant-celebration", occasionId: "birthday-party", name: "The Elegant Celebration", tagline: "Cream, gold and sophisticated typography", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "serif-display", layoutId: "centered-stack", accentIcon: "flourish" },
  { id: "birthday-colourful-bash", occasionId: "birthday-party", name: "The Colourful Bash", tagline: "Balloons, confetti and playful graphics", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "party" },
  { id: "birthday-luxury-night", occasionId: "birthday-party", name: "The Luxury Night", tagline: "Black, gold and premium typography", kitId: "neonVipDark", paletteId: "vip-black-gold", fontPairId: "classic-serif-formal", layoutId: "centered-stack", accentIcon: "vip" },
  { id: "birthday-modern", occasionId: "birthday-party", name: "The Modern Birthday", tagline: "Contemporary editorial design", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "flourish" },
  { id: "birthday-illustrated-party", occasionId: "birthday-party", name: "The Illustrated Party", tagline: "Custom birthday illustrations and playful elements", kitId: "illustratedPlayful", paletteId: "pastel-teddy-brown", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "party" },

  // ── First Birthday ────────────────────────────────────────────────────
  { id: "first-birthday-little-prince", occasionId: "first-birthday", name: "Little Prince", tagline: "Royal blue, gold and crown elements", kitId: "royalFrame", paletteId: "navy-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "crown" },
  { id: "first-birthday-little-princess", occasionId: "first-birthday", name: "Little Princess", tagline: "Soft pink, floral and elegant details", kitId: "botanicalFloral", paletteId: "blush-pink-gold", fontPairId: "script-elegant", layoutId: "centered-stack", accentIcon: "floral" },
  { id: "first-birthday-teddy-bear", occasionId: "first-birthday", name: "Teddy Bear Celebration", tagline: "Cute teddy illustrations and pastel colours", kitId: "safariAnimal", paletteId: "pastel-teddy-brown", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "teddy" },
  { id: "first-birthday-onederland", occasionId: "first-birthday", name: "One-derland", tagline: "Whimsical first-birthday theme", kitId: "pastelClouds", paletteId: "sky-cloud", fontPairId: "script-casual", layoutId: "badgeGridRows", accentIcon: "wonderland" },
  { id: "first-birthday-minimal", occasionId: "first-birthday", name: "Minimal Baby Celebration", tagline: "Elegant neutral colours and minimal graphics", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "minimalBaby" },

  // ── Anniversary Celebration ───────────────────────────────────────────
  { id: "anniversary-golden-memories", occasionId: "anniversary", name: "Golden Memories", tagline: "Gold and sophisticated typography", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "serif-display", layoutId: "centered-stack", accentIcon: "gold" },
  { id: "anniversary-romantic-blooms", occasionId: "anniversary", name: "Romantic Blooms", tagline: "Floral and romantic composition", kitId: "botanicalFloral", paletteId: "blush-pink-gold", fontPairId: "script-elegant", layoutId: "splitRibbon", accentIcon: "romantic" },
  { id: "anniversary-forever-together", occasionId: "anniversary", name: "Forever Together", tagline: "Elegant minimal design", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "fraunces-editorial", layoutId: "topBarEditorial", accentIcon: "forever" },
  { id: "anniversary-luxury", occasionId: "anniversary", name: "Luxury Anniversary", tagline: "Deep colours and metallic accents", kitId: "luxuryDarkGold", paletteId: "royal-maroon-gold", fontPairId: "classic-serif-formal", layoutId: "cornerFramed", accentIcon: "luxury" },
  { id: "anniversary-love-story", occasionId: "anniversary", name: "Love Story", tagline: "Editorial layout with romantic details", kitId: "modernEditorial", paletteId: "wedding-blush-modern", fontPairId: "fraunces-editorial", layoutId: "badgeGridRows", accentIcon: "loveStory" },

  // ── Baby Shower ───────────────────────────────────────────────────────
  { id: "babyshower-floral", occasionId: "baby-shower", name: "Floral Baby Shower", tagline: "Pastel florals", kitId: "botanicalFloral", paletteId: "blush-pink-gold", fontPairId: "script-elegant", layoutId: "centered-stack", accentIcon: "pastelFloral" },
  { id: "babyshower-little-miracle", occasionId: "baby-shower", name: "Little Miracle", tagline: "Soft neutral colours", kitId: "pastelClouds", paletteId: "sky-cloud", fontPairId: "script-casual", layoutId: "splitRibbon", accentIcon: "miracle" },
  { id: "babyshower-safari", occasionId: "baby-shower", name: "Safari Baby Shower", tagline: "Cute animal illustrations", kitId: "safariAnimal", paletteId: "safari-earth", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "safari" },
  { id: "babyshower-royal", occasionId: "baby-shower", name: "Royal Baby Shower", tagline: "Elegant royal detailing", kitId: "royalFrame", paletteId: "navy-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "royalBaby" },
  { id: "babyshower-modern", occasionId: "baby-shower", name: "Modern Baby Shower", tagline: "Contemporary minimal design", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "modernBaby" },

  // ── Newborn Welcome ───────────────────────────────────────────────────
  { id: "newborn-welcome-little-one", occasionId: "newborn-welcome", name: "Welcome Little One", tagline: "Soft pastel design", kitId: "pastelClouds", paletteId: "pastel-teddy-brown", fontPairId: "script-casual", layoutId: "centered-stack", accentIcon: "clouds" },
  { id: "newborn-little-star", occasionId: "newborn-welcome", name: "Little Star", tagline: "Celestial illustrations", kitId: "celestialStars", paletteId: "midnight-purple", fontPairId: "serif-display", layoutId: "splitRibbon", accentIcon: "star" },
  { id: "newborn-baby-blessings", occasionId: "newborn-welcome", name: "Baby Blessings", tagline: "Traditional elegant design", kitId: "heritageOrnate", paletteId: "terracotta-heritage", fontPairId: "serif-heritage", layoutId: "cornerFramed", accentIcon: "blessings" },
  { id: "newborn-dreamy-clouds", occasionId: "newborn-welcome", name: "Dreamy Clouds", tagline: "Soft clouds and stars", kitId: "pastelClouds", paletteId: "sky-cloud", fontPairId: "script-casual", layoutId: "badgeGridRows", accentIcon: "clouds" },
  { id: "newborn-minimal", occasionId: "newborn-welcome", name: "Minimal Newborn Welcome", tagline: "Neutral premium design", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "minimalBaby" },

  // ── Gender Reveal ─────────────────────────────────────────────────────
  { id: "genderreveal-pink-or-blue", occasionId: "gender-reveal", name: "Pink or Blue", tagline: "Classic reveal design", kitId: "pastelClouds", paletteId: "blush-pink-gold", fontPairId: "script-casual", layoutId: "centered-stack", accentIcon: "pinkBlue" },
  { id: "genderreveal-what-will-baby-be", occasionId: "gender-reveal", name: "What Will Baby Be?", tagline: "Playful typography", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "topBarEditorial", accentIcon: "question" },
  { id: "genderreveal-big-reveal", occasionId: "gender-reveal", name: "The Big Reveal", tagline: "Bold modern composition", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "condensed-bold", layoutId: "splitRibbon", accentIcon: "bigReveal" },
  { id: "genderreveal-twinkle-star", occasionId: "gender-reveal", name: "Twinkle Little Star", tagline: "Celestial theme", kitId: "celestialStars", paletteId: "sky-cloud", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "twinkle" },
  { id: "genderreveal-surprise", occasionId: "gender-reveal", name: "Surprise Reveal", tagline: "Confetti and mystery concept", kitId: "celestialStars", paletteId: "midnight-purple", fontPairId: "script-casual", layoutId: "badgeGridRows", accentIcon: "surprise" },

  // ── Naming Ceremony ───────────────────────────────────────────────────
  { id: "naming-traditional-blessings", occasionId: "naming-ceremony", name: "Traditional Blessings", tagline: "Traditional Indian motifs", kitId: "traditionalIndian", paletteId: "terracotta-heritage", fontPairId: "display-festive", layoutId: "centered-stack", accentIcon: "diya" },
  { id: "naming-royal-ceremony", occasionId: "naming-ceremony", name: "Royal Naming Ceremony", tagline: "Premium royal design", kitId: "royalFrame", paletteId: "royal-maroon-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "crown" },
  { id: "naming-floral-celebration", occasionId: "naming-ceremony", name: "Floral Celebration", tagline: "Floral composition", kitId: "botanicalFloral", paletteId: "sage-botanical", fontPairId: "script-elegant", layoutId: "splitRibbon", accentIcon: "pastelFloral" },
  { id: "naming-little-name-big-blessings", occasionId: "naming-ceremony", name: "Little Name, Big Blessings", tagline: "Modern typography", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "nameplate" },
  { id: "naming-heritage-celebration", occasionId: "naming-ceremony", name: "Heritage Celebration", tagline: "Indian-inspired elegant design", kitId: "heritageOrnate", paletteId: "terracotta-heritage", fontPairId: "serif-heritage", layoutId: "badgeGridRows", accentIcon: "heritage" },

  // ── Housewarming ──────────────────────────────────────────────────────
  { id: "housewarming-new-beginnings", occasionId: "housewarming", name: "New Beginnings", tagline: "Elegant minimal home illustration", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "serif-display", layoutId: "centered-stack", accentIcon: "home" },
  { id: "housewarming-griha-pravesh", occasionId: "housewarming", name: "Griha Pravesh", tagline: "Traditional Indian motifs", kitId: "traditionalIndian", paletteId: "terracotta-heritage", fontPairId: "display-festive", layoutId: "cornerFramed", accentIcon: "grihaPravesh" },
  { id: "housewarming-new-nest", occasionId: "housewarming", name: "Our New Nest", tagline: "Warm and welcoming design", kitId: "natureOrganic", paletteId: "forest-home", fontPairId: "serif-display", layoutId: "splitRibbon", accentIcon: "nest" },
  { id: "housewarming-modern-home", occasionId: "housewarming", name: "Modern Home Celebration", tagline: "Contemporary architecture-inspired layout", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "architecture" },
  { id: "housewarming-golden-welcome", occasionId: "housewarming", name: "Golden Welcome", tagline: "Premium gold and ivory design", kitId: "elegantSerif", paletteId: "wedding-ivory-gold", fontPairId: "classic-serif-formal", layoutId: "badgeGridRows", accentIcon: "goldenWelcome" },

  // ── Get-Together / House Party ────────────────────────────────────────
  { id: "gettogether-house-party", occasionId: "get-together", name: "The House Party", tagline: "Bold contemporary graphics", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "condensed-bold", layoutId: "centered-stack", accentIcon: "party" },
  { id: "gettogether-weekend-vibes", occasionId: "get-together", name: "Weekend Vibes", tagline: "Fun and casual design", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "weekend" },
  { id: "gettogether-lets-get-together", occasionId: "get-together", name: "Let's Get Together", tagline: "Minimal typography", kitId: "corporateMinimal", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "flourish" },
  { id: "gettogether-terrace-nights", occasionId: "get-together", name: "Terrace Nights", tagline: "Night-sky and party elements", kitId: "celestialStars", paletteId: "terrace-nightsky", fontPairId: "condensed-bold", layoutId: "cornerFramed", accentIcon: "terrace" },
  { id: "gettogether-social-club", occasionId: "get-together", name: "The Social Club", tagline: "Premium editorial design", kitId: "modernEditorial", paletteId: "corporate-navy", fontPairId: "fraunces-editorial", layoutId: "badgeGridRows", accentIcon: "socialClub" },

  // ── Kitty Party ───────────────────────────────────────────────────────
  { id: "kitty-ladies-afternoon", occasionId: "kitty-party", name: "Ladies' Afternoon", tagline: "Elegant floral design", kitId: "botanicalFloral", paletteId: "blush-pink-gold", fontPairId: "script-elegant", layoutId: "centered-stack", accentIcon: "pastelFloral" },
  { id: "kitty-glam-gather", occasionId: "kitty-party", name: "Glam & Gather", tagline: "Luxury pink and gold", kitId: "luxuryDarkGold", paletteId: "royal-maroon-gold", fontPairId: "serif-display", layoutId: "splitRibbon", accentIcon: "glam" },
  { id: "kitty-tea-party", occasionId: "kitty-party", name: "Tea Party", tagline: "Soft vintage illustrations", kitId: "teaVintage", paletteId: "pastel-teddy-brown", fontPairId: "script-casual", layoutId: "topBarEditorial", accentIcon: "tea" },
  { id: "kitty-themed", occasionId: "kitty-party", name: "Themed Kitty Party", tagline: "Colourful playful graphics", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "kitty" },
  { id: "kitty-chic-social-club", occasionId: "kitty-party", name: "Chic Social Club", tagline: "Modern editorial design", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "fraunces-editorial", layoutId: "cornerFramed", accentIcon: "socialClub" },

  // ── Office Party ──────────────────────────────────────────────────────
  { id: "office-corporate-celebration", occasionId: "office-party", name: "Corporate Celebration", tagline: "Professional minimal design", kitId: "corporateMinimal", paletteId: "corporate-navy", fontPairId: "modern-sans", layoutId: "centered-stack", accentIcon: "corporate" },
  { id: "office-team-together", occasionId: "office-party", name: "Team Together", tagline: "Modern colourful composition", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "modern-sans", layoutId: "splitRibbon", accentIcon: "team" },
  { id: "office-annual-celebration", occasionId: "office-party", name: "Annual Celebration", tagline: "Premium corporate design", kitId: "achievementBadge", paletteId: "academic-gold-navy", fontPairId: "classic-serif-formal", layoutId: "cornerFramed", accentIcon: "medal" },
  { id: "office-social", occasionId: "office-party", name: "Office Social", tagline: "Contemporary typography", kitId: "modernEditorial", paletteId: "corporate-navy", fontPairId: "condensed-bold", layoutId: "topBarEditorial", accentIcon: "team" },
  { id: "office-grand-gathering", occasionId: "office-party", name: "The Grand Gathering", tagline: "Elegant formal invitation", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "serif-display", layoutId: "badgeGridRows", accentIcon: "flourish" },

  // ── Graduation Celebration ────────────────────────────────────────────
  { id: "graduation-achievement", occasionId: "graduation", name: "The Achievement", tagline: "Classic graduation design", kitId: "achievementBadge", paletteId: "academic-gold-navy", fontPairId: "classic-serif-formal", layoutId: "centered-stack", accentIcon: "medal" },
  { id: "graduation-next-chapter", occasionId: "graduation", name: "The Next Chapter", tagline: "Modern editorial typography", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "fraunces-editorial", layoutId: "topBarEditorial", accentIcon: "nextChapter" },
  { id: "graduation-golden-milestone", occasionId: "graduation", name: "Golden Milestone", tagline: "Premium gold design", kitId: "luxuryDarkGold", paletteId: "royal-maroon-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "gold" },
  { id: "graduation-grad-party", occasionId: "graduation", name: "Grad Party", tagline: "Colourful youthful graphics", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "gradCap" },
  { id: "graduation-proud-moment", occasionId: "graduation", name: "A Proud Moment", tagline: "Elegant minimal composition", kitId: "elegantSerif", paletteId: "cream-gold", fontPairId: "fraunces-editorial", layoutId: "badgeGridRows", accentIcon: "flourish" },

  // ── Bachelorette / Bachelor Party ─────────────────────────────────────
  { id: "bachelorette-last-night-out", occasionId: "bachelorette", name: "Last Night Out", tagline: "Bold party graphics", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "condensed-bold", layoutId: "centered-stack", accentIcon: "party" },
  { id: "bachelorette-bride-tribe", occasionId: "bachelorette", name: "Bride Tribe", tagline: "Feminine celebratory design", kitId: "illustratedPlayful", paletteId: "blush-pink-gold", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "glam" },
  { id: "bachelorette-groom-squad", occasionId: "bachelorette", name: "The Groom Squad", tagline: "Modern masculine-inspired party design", kitId: "neonVipDark", paletteId: "vip-black-gold", fontPairId: "condensed-bold", layoutId: "topBarEditorial", accentIcon: "vip" },
  { id: "bachelorette-vip-night", occasionId: "bachelorette", name: "VIP Night", tagline: "Luxury dark invitation", kitId: "neonVipDark", paletteId: "vip-black-gold", fontPairId: "classic-serif-formal", layoutId: "cornerFramed", accentIcon: "vip" },
  { id: "bachelorette-wild-celebration", occasionId: "bachelorette", name: "Wild Celebration", tagline: "Colourful playful design", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "wildCeleb" },

  // ── Farewell Party ────────────────────────────────────────────────────
  { id: "farewell-until-we-meet-again", occasionId: "farewell", name: "Until We Meet Again", tagline: "Emotional elegant design", kitId: "elegantSerif", paletteId: "dusty-blue-emotion", fontPairId: "serif-display", layoutId: "centered-stack", accentIcon: "farewellDove" },
  { id: "farewell-last-chapter", occasionId: "farewell", name: "The Last Chapter", tagline: "Editorial typography", kitId: "modernEditorial", paletteId: "charcoal-editorial", fontPairId: "fraunces-editorial", layoutId: "topBarEditorial", accentIcon: "chapter" },
  { id: "farewell-good-times-forever", occasionId: "farewell", name: "Good Times Forever", tagline: "Playful colourful design", kitId: "illustratedPlayful", paletteId: "confetti-coral", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "party" },
  { id: "farewell-grand-goodbye", occasionId: "farewell", name: "A Grand Goodbye", tagline: "Premium formal design", kitId: "achievementBadge", paletteId: "academic-gold-navy", fontPairId: "classic-serif-formal", layoutId: "cornerFramed", accentIcon: "ribbon" },
  { id: "farewell-memories-together", occasionId: "farewell", name: "Memories Together", tagline: "Photo-inspired graphic composition", kitId: "natureOrganic", paletteId: "dusty-blue-emotion", fontPairId: "serif-display", layoutId: "badgeGridRows", accentIcon: "memories" },

  // ── Retirement Party ──────────────────────────────────────────────────
  { id: "retirement-new-beginning", occasionId: "retirement", name: "A New Beginning", tagline: "Elegant minimal design", kitId: "elegantSerif", paletteId: "amber-retirement", fontPairId: "serif-display", layoutId: "centered-stack", accentIcon: "flourish" },
  { id: "retirement-years-of-excellence", occasionId: "retirement", name: "Years of Excellence", tagline: "Formal premium design", kitId: "achievementBadge", paletteId: "academic-gold-navy", fontPairId: "classic-serif-formal", layoutId: "topBarEditorial", accentIcon: "medal" },
  { id: "retirement-grand-farewell", occasionId: "retirement", name: "The Grand Farewell", tagline: "Gold and sophisticated typography", kitId: "luxuryDarkGold", paletteId: "royal-maroon-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "gold" },
  { id: "retirement-time-to-celebrate", occasionId: "retirement", name: "Time to Celebrate", tagline: "Warm celebratory composition", kitId: "natureOrganic", paletteId: "amber-retirement", fontPairId: "fraunces-editorial", layoutId: "splitRibbon", accentIcon: "cheers" },
  { id: "retirement-cheers", occasionId: "retirement", name: "Cheers to Retirement", tagline: "Fun and contemporary design", kitId: "modernEditorial", paletteId: "amber-retirement", fontPairId: "modern-sans", layoutId: "badgeGridRows", accentIcon: "cheers" },

  // ── Diwali Party ──────────────────────────────────────────────────────
  { id: "diwali-royal", occasionId: "diwali-party", name: "Royal Diwali", tagline: "Traditional gold and maroon", kitId: "traditionalIndian", paletteId: "diwali-maroon-gold", fontPairId: "display-festive", layoutId: "centered-stack", accentIcon: "diya" },
  { id: "diwali-festival-of-lights", occasionId: "diwali-party", name: "Festival of Lights", tagline: "Diyas and glowing elements", kitId: "traditionalIndian", paletteId: "diwali-maroon-gold", fontPairId: "serif-heritage", layoutId: "splitRibbon", accentIcon: "diyaRow" },
  { id: "diwali-modern", occasionId: "diwali-party", name: "Modern Diwali", tagline: "Minimal contemporary composition", kitId: "modernEditorial", paletteId: "terracotta-heritage", fontPairId: "modern-sans", layoutId: "topBarEditorial", accentIcon: "diya" },
  { id: "diwali-rangoli-celebration", occasionId: "diwali-party", name: "Rangoli Celebration", tagline: "Rangoli-inspired graphics", kitId: "traditionalIndian", paletteId: "rangoli-multicolor", fontPairId: "display-festive", layoutId: "badgeGridRows", accentIcon: "rangoli" },
  { id: "diwali-night", occasionId: "diwali-party", name: "Diwali Night", tagline: "Youthful dark festive design", kitId: "neonVipDark", paletteId: "diwali-maroon-gold", fontPairId: "condensed-bold", layoutId: "cornerFramed", accentIcon: "diya" },

  // ── Holi Party ────────────────────────────────────────────────────────
  { id: "holi-rang-barse", occasionId: "holi-party", name: "Rang Barse", tagline: "Colourful traditional design", kitId: "traditionalIndian", paletteId: "holi-rainbow", fontPairId: "display-festive", layoutId: "centered-stack", accentIcon: "splash" },
  { id: "holi-splash", occasionId: "holi-party", name: "Holi Splash", tagline: "Bold colour splashes", kitId: "illustratedPlayful", paletteId: "holi-rainbow", fontPairId: "rounded-playful", layoutId: "splitRibbon", accentIcon: "splash" },
  { id: "holi-organic", occasionId: "holi-party", name: "Organic Holi", tagline: "Nature-inspired colours", kitId: "natureOrganic", paletteId: "holi-rainbow", fontPairId: "serif-display", layoutId: "topBarEditorial", accentIcon: "leaf" },
  { id: "holi-beats", occasionId: "holi-party", name: "Holi Beats", tagline: "Music and party graphics", kitId: "modernEditorial", paletteId: "holi-rainbow", fontPairId: "condensed-bold", layoutId: "cornerFramed", accentIcon: "party" },
  { id: "holi-colour-festival", occasionId: "holi-party", name: "The Colour Festival", tagline: "Modern playful composition", kitId: "illustratedPlayful", paletteId: "holi-rainbow", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "splash" },

  // ── Navratri / Garba Night ────────────────────────────────────────────
  { id: "navratri-traditional-garba", occasionId: "navratri-garba", name: "Traditional Garba", tagline: "Traditional Gujarati motifs", kitId: "traditionalIndian", paletteId: "garba-vibrant", fontPairId: "display-festive", layoutId: "centered-stack", accentIcon: "garba" },
  { id: "navratri-royal", occasionId: "navratri-garba", name: "Royal Navratri", tagline: "Premium traditional design", kitId: "heritageOrnate", paletteId: "royal-maroon-gold", fontPairId: "serif-heritage", layoutId: "cornerFramed", accentIcon: "crown" },
  { id: "navratri-dandiya-nights", occasionId: "navratri-garba", name: "Dandiya Nights", tagline: "Bold energetic composition", kitId: "modernEditorial", paletteId: "garba-vibrant", fontPairId: "condensed-bold", layoutId: "splitRibbon", accentIcon: "dandiya" },
  { id: "navratri-colourful-garba", occasionId: "navratri-garba", name: "Colourful Garba", tagline: "Vibrant festive graphics", kitId: "illustratedPlayful", paletteId: "rangoli-multicolor", fontPairId: "rounded-playful", layoutId: "badgeGridRows", accentIcon: "garba" },
  { id: "navratri-modern", occasionId: "navratri-garba", name: "Modern Navratri", tagline: "Contemporary editorial design", kitId: "modernEditorial", paletteId: "garba-vibrant", fontPairId: "fraunces-editorial", layoutId: "topBarEditorial", accentIcon: "dandiya" },

  // ── Wedding (separate sub-app entry point) ───────────────────────────
  { id: "wedding-traditional-indian", occasionId: "wedding", name: "Traditional Indian Wedding", tagline: "Heritage-inspired design", kitId: "heritageOrnate", paletteId: "wedding-ivory-gold", fontPairId: "serif-heritage", layoutId: "centered-stack", accentIcon: "diya" },
  { id: "wedding-royal", occasionId: "wedding", name: "Royal Wedding", tagline: "Luxury and ornamental design", kitId: "luxuryDarkGold", paletteId: "royal-maroon-gold", fontPairId: "serif-display", layoutId: "cornerFramed", accentIcon: "crown" },
  { id: "wedding-modern", occasionId: "wedding", name: "Modern Wedding", tagline: "Contemporary minimal composition", kitId: "modernEditorial", paletteId: "wedding-blush-modern", fontPairId: "fraunces-editorial", layoutId: "topBarEditorial", accentIcon: "flourish" },
  { id: "wedding-floral", occasionId: "wedding", name: "Floral Wedding", tagline: "Elegant botanical design", kitId: "botanicalFloral", paletteId: "wedding-blush-modern", fontPairId: "script-elegant", layoutId: "splitRibbon", accentIcon: "pastelFloral" },
  { id: "wedding-functions", occasionId: "wedding", name: "Wedding Functions", tagline: "Multi-function invitation design", kitId: "elegantSerif", paletteId: "wedding-ivory-gold", fontPairId: "classic-serif-formal", layoutId: "badgeGridRows", accentIcon: "flourish" },
];

export function getStudioTemplate(id) {
  return INVITATION_STUDIO_TEMPLATES.find(t => t.id === id) || null;
}
export function getStudioTemplatesForOccasion(occasionId) {
  return INVITATION_STUDIO_TEMPLATES.filter(t => t.occasionId === occasionId);
}
export const WEDDING_STUDIO_TEMPLATES = INVITATION_STUDIO_TEMPLATES.filter(t => t.occasionId === "wedding");
