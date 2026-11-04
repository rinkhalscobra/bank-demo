# Website imagery refresh — 4 November 2026

Created with the built-in image-generation tool. All photographs are illustrative generated scenes, not photographs of actual bank premises, employees, or customers. Testimonial avatars use initials rather than unrelated portraits. Existing brand marks, country flags, currency icons, and functional graphics are preserved.

Final photographs live in `public/images/refresh-20261104/`. Each has a full-resolution JPEG and a `-768.jpg` responsive version. `src/data/sitePhotos.ts` is the asset catalog; `SitePhoto` provides responsive loading and translated descriptions. Original assets remain available for rollback.

Validation: TypeScript, production build, all 28 JPEG files and dimensions, and translation parity passed. Offline rendering checked 72 page/language combinations, including login and PIN entry, and validated 208 rendered photo references. The generated photographs were visually reviewed; live browser layout testing was not available in this session. No theme, CRM, dashboard, or brand-logo source files were changed for this refresh.

## Prompt set

### banking-atrium

Saved: `public/images/refresh-20261104/banking-atrium.jpg` and `banking-atrium-768.jpg` (1672×941 full size).

Use case: photorealistic-natural. Asset type: wide 16:9 homepage hero photo for a modern banking website. Primary request: a completely new, premium architectural photograph of an inviting contemporary financial-services atrium. Scene: a double-height calm interior, sculptural pale limestone staircase and curved glass on the right, tall windows looking toward a quiet waterfront, discreet greenery, cool natural morning daylight. Composition: architectural interest in the right two thirds, a quiet softly lit left third suitable for an existing dark headline overlay. Realistic stone grain, crisp window reflections, tasteful understated furniture, sophisticated editorial photography, 24mm lens. Neutral silver, pale stone and soft natural blue, adaptable to many website themes. No people close to camera, no signage, no readable text, no logos, no trademarks, no watermark. Single uninterrupted photograph, not a webpage or collage.

### financial-advisory

Saved: `public/images/refresh-20261104/financial-advisory.jpg` and `financial-advisory-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 section photograph for a banking and wealth website. Scene: a financial adviser and a couple in their 30s having a relaxed, thoughtful planning conversation around a pale oak table in a bright modern meeting room, notebook and closed folio, laptop angled away with no readable screen. Candid natural gestures, believable hands and facial proportions, authentic fabric and skin texture. Medium-wide composition, subjects in the middle, usable for both square and landscape crops. Editorial 50mm photograph, soft window daylight, quiet neutral ivory, slate and oak palette, understated and reassuring. No identifiable actual clients, no visible documents or financial figures, no readable text, no logos, no watermarks, no image borders or collage.

### digital-banking

Saved: `public/images/refresh-20261104/digital-banking.jpg` and `digital-banking-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 editorial photograph illustrating secure everyday digital banking. Subject: a person comfortably seated at a tidy contemporary home desk using a smartphone with one hand, a closed slim laptop and notebook nearby; focus on the phone and natural hands, person mostly cropped above the shoulders. Screen turned slightly away with a soft, abstract neutral screen, no rendered words or financial numbers. Side window daylight, gentle shadows, realistic metal, fabric and skin textures, modern understated apartment, muted white, gray and light oak colors. Fresh clean composition, focus centrally and toward the right, suitable for landscape and square crops. No padlock graphics, no floating interfaces, no readable text, no brand logos, no watermark.

### business-collaboration

Saved: `public/images/refresh-20261104/business-collaboration.jpg` and `business-collaboration-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: business banking hero and business-finance section photograph. Subject: three small-business owners reviewing plans at a workshop studio table, a professional woman standing at the center, colleagues seated nearby, realistic samples and an open laptop whose screen is not readable. Bright contemporary creative business workspace with tall industrial windows, pale oak and neutral gray, soft natural daylight, candid purposeful collaboration rather than a staged handshake. Wide 3:2 editorial photograph, people framed waist-up in central part so a narrow hero crop is possible, crisp natural texture, no exaggerated smiles. No readable text, logos, slogans, stock watermarks, fake charts, borders, or collage.

### banking-lounge

Saved: `public/images/refresh-20261104/banking-lounge.jpg` and `banking-lounge-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 about-page hero photograph for a contemporary financial-services website. Scene: a welcoming modern banking lounge with beautifully crafted walnut shelving, pale textured walls, low upholstered lounge chairs, a discreet reception desk, generous floor-to-ceiling windows and a small courtyard garden beyond. A quiet, authentic professional environment, no people, natural imperfections in wood and stone. Editorial architectural photography, 28mm lens, soft daylight, neutral stone, walnut, ivory and cool gray. Composition: balanced central room, interesting details in right half, useful for landscape and narrow crops. No signs, visible company names, text, logos, watermarks, lettering, borders or collage.

### global-waterfront

Saved: `public/images/refresh-20261104/global-waterfront.jpg` and `global-waterfront-768.jpg` (1672×941 full size).

Use case: photorealistic-natural. Asset type: wide 16:9 hero photo for international banking. Primary request: a fresh elegant photograph of a contemporary European waterfront financial district at early blue hour, from across the river. Modern mid-rise glass offices and softly glowing windows reflected in calm water, pedestrian promenade and a graceful footbridge, realistic atmospheric perspective. Refined editorial travel and architecture photography, neutral blue-gray buildings, soft natural warm window light, no saturated color effects. Skyline in middle-right, enough calm sky and water for flexible web cropping. Generic illustrative location, not a recognizable branded bank headquarters. No billboards, readable signage, text, logos, boats with brand names, watermarks or collage.

### home-ownership

Saved: `public/images/refresh-20261104/home-ownership.jpg` and `home-ownership-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 home-loan and refinancing website photograph. Scene: the sunlit entrance and front garden of a welcoming contemporary family house, clean light stone facade, natural timber front door, tall windows, tasteful low landscaping, a simple front path and a mature shade tree. Architecture and lifestyle editorial photography, eye-level medium-wide shot, authentic surfaces and lived-in details, calm optimistic morning, no people needed. Neutral ivory, light oak, soft greens and gray, all photo elements central so landscape and card crops work. No for-sale signs, company logos, lettering, text, house numbers, watermark, borders or collage.

### car-ownership

Saved: `public/images/refresh-20261104/car-ownership.jpg` and `car-ownership-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 car-loan lifestyle photograph. Subject: an adult standing beside an elegant modern unbranded compact electric car in a quiet residential driveway, holding a simple car key fob naturally, framing waist-to-shoulder height without a close-up face. Eye-level editorial photograph with the hand, keys and car in focus; no staged handshake. Soft morning light, real reflections, textured dark jacket and slate-gray car, neutral contemporary house softly blurred behind. Central subject suitable for cropping into a square loan card. No readable license plates, badges, text, logos, brand marks, watermarks or collage.

### student-life

Saved: `public/images/refresh-20261104/student-life.jpg` and `student-life-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 education-loan section photograph. Subject: two university students studying together at an oak table in a bright contemporary campus library, one focused on a notebook and one at a laptop, books and tall windows in background. Candid medium-wide editorial photography, authentic gestures and anatomy, natural daylight, neutral gray, ivory and wood with soft greenery outside. Central framing that also works as a square crop, inviting and aspirational without staged celebration. Notebook and screen contain no readable text or financial data. No logos, lettering, branded clothing, watermark, border or collage.

### trade-logistics

Saved: `public/images/refresh-20261104/trade-logistics.jpg` and `trade-logistics-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 international trade-finance website photo. Scene: a modern maritime container terminal seen from an elevated viewpoint, an ocean-going cargo vessel alongside orderly stacks of containers and elegant gantry cranes, calm water and a distant working harbor at sunrise. Crisp realistic editorial industrial photography with atmospheric depth, subtle natural colors, no oversaturation. Horizontally composed but main vessel and cranes in center for flexible cropping. Containers and ship are unbranded without readable company names, labels or lettering. No text overlays, logos, watermarks, generated charts or collage.

### airport-lounge

Saved: `public/images/refresh-20261104/airport-lounge.jpg` and `airport-lounge-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 travel and international banking website photograph. Subject: an adult business traveler seen from behind and in three-quarter side view standing with a small suitcase by huge airport lounge windows; a commercial aircraft is visible outside in soft focus. Spacious elegant terminal, soft early-morning light, glass, pale stone and understated navy fabric. Editorial travel photography, candid, realistic natural anatomy and textures, central subject for portrait and landscape web crops. No visible passport data, airline logos, readable departure boards, ticket text, brand marks or watermark. No collage.

### investment-landscape

Saved: `public/images/refresh-20261104/investment-landscape.jpg` and `investment-landscape-768.jpg` (1672×941 full size).

Use case: photorealistic-natural. Asset type: wide 16:9 investment and long-term-planning website hero photograph. Scene: a peaceful aerial view across a broad river valley with terraced vineyards and a distant modern town on the horizon, gentle morning mist and clean natural light. A winding river leads from foreground into the distance, expressing a long-term perspective without charts or finance symbols. Sophisticated realistic landscape photography, rich detail, restrained natural greens, silver-blue water and soft neutral sky. Broad uncluttered composition works behind an existing white headline and colored translucent overlay. No people close-up, artificial golden glow, logos, lettering, investment symbols, watermark or collage.

### community-partnership

Saved: `public/images/refresh-20261104/community-partnership.jpg` and `community-partnership-768.jpg` (1536×1024 full size).

Use case: photorealistic-natural. Asset type: wide 3:2 community and small-business partnership website photograph. Scene: a small group of adult volunteers and local business owners planting herbs and tending raised garden beds in a clean urban community courtyard. Candid collaborative activity, relaxed everyday clothes, natural hands and proportions, soft daylight, realistic soil and wood textures. Medium-wide editorial photography, subjects centered and comfortably spaced so image can be cropped to landscape or square, welcoming and grounded. Anonymous illustrative people, no claim of actual customers. No campaign signs, slogans, logos, readable text, branded clothing, watermarks or collage.

### payment-cards

Saved: `public/images/refresh-20261104/payment-cards.jpg` and `payment-cards-768.jpg` (1672×941 full size).

Use case: product-mockup. Asset type: wide 16:9 editorial background photograph for a payment-card website hero. Subject: three unbranded contactless payment cards in brushed silver, graphite and warm ivory arranged in a restrained fan on pale architectural stone, realistic small metallic EMV chips and subtly embossed contactless symbol. Cards sit mostly in the right two thirds with quiet shadowed tabletop to the left for an existing headline. Physically plausible card proportions, precise edges, sophisticated studio product photography with soft daylight and gentle reflections, no dramatic neon. No account numbers, cardholder names, expiry text, bank or payment-network logos, brands, lettering, watermark, borders or collage. Single realistic photograph.


